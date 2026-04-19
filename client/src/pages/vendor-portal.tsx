import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  ChefHat, Truck, Users, TrendingUp, ArrowRight,
  CheckCircle, DollarSign, Clock, Sparkles, Zap,
  FileText, CreditCard, MapPin, Star, Copy, KeyRound,
  Store, UtensilsCrossed, Building2, Fuel, ShoppingBag, Loader2,
  Upload, Image, Shield, AlertTriangle, ArrowLeft,
  Globe, Bell, BarChart3, Calendar, Megaphone, Map,
  HelpCircle, ArrowDown, Mail, Coffee, Sunrise, Sun, Sunset, Package, Phone,
  ExternalLink, Share2, Hash, BadgeCheck, Ticket, Gift, Wrench
} from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";
import { InfoBubble } from "@/components/info-bubble";

import foodtruckExteriorImg from "@/assets/images/foodtruck-exterior.jpg";
import foodtruckInteriorImg from "@/assets/images/foodtruck-interior.jpg";
import foodTruckVendorImg from "@/assets/images/food-truck-vendor.jpg";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

interface SignupResult {
  id: number;
  name: string;
  pin: string;
  slug: string;
  trustLayerId?: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
  })
};

const WHAT_YOU_GET = [
  { icon: Globe, title: "Free Online Menu Page", desc: "Your own ordering URL where customers can browse and order directly" },
  { icon: Image, title: "Logo & Branding Display", desc: "Your logo featured prominently on our platform" },
  { icon: BarChart3, title: "Order Management Dashboard", desc: "Track incoming orders and manage fulfillment in real-time" },
  { icon: Calendar, title: "Daily Availability Controls", desc: "Check in each morning to confirm you're serving that day" },
  { icon: Star, title: "Customer Reviews & Ratings", desc: "Build your reputation with verified customer feedback" },
  { icon: Bell, title: "Real-time Order Notifications", desc: "Never miss an order with instant alerts" },
  { icon: Megaphone, title: "Marketing & Promotion", desc: "Get featured in our campaigns and vendor directory" },
  { icon: Map, title: "Hub & Zone Coverage", desc: "Serve from the food truck hub — we handle delivery to surrounding zones" },
];

const FAQ_ITEMS = [
  { q: "How much does it cost to join?", a: "Absolutely free. We charge a 20% commission only on completed orders. No signup fees, no monthly fees, no hidden charges." },
  { q: "When and how do I get paid?", a: "Earnings are deposited directly into your bank account. Payments process daily and typically arrive within 2 business days. Simple, reliable, and automatic — no invoicing needed." },
  { q: "Where is the food truck hub?", a: "Our launch hub sits where Hwy 109 meets I-840 in the Lebanon area — a rotating food truck park where up to 20 vendors serve each day. You park at the hub, customers order through the app, and our drivers deliver to businesses, truck stops, logistics hubs, and anyone along the corridor. This hub model is designed to expand to new locations and regions over time." },
  { q: "What area do you deliver to?", a: "We cover the full 840/109/I-24 corridor. Batch deliveries go along the I-24 corridor to Smyrna, LaVergne, and the surrounding Hwy 40 area — reaching businesses, truck stops, logistics hubs, and warehouse workers. Local one-off deliveries serve Lebanon and the 840/109 area near the hub. We deliver to anyone who orders — not just one type of customer." },
  { q: "What are the batch delivery windows?", a: "We run two daily batches. Lunch: customers order by 10:30 AM, food is delivered by noon along the I-24 corridor (~20 min from hub). Dinner: customers order by 5:00 PM, delivered by 6:00 PM. Orders are grouped by zone so one driver picks up from multiple trucks at once." },
  { q: "What about one-off (individual) orders?", a: "Customers along the 840/109 corridor near the hub can place individual orders anytime during operating hours (8 AM – 8 PM). These are delivered one at a time, outside the batch windows — great for local businesses, truck stops, or anyone nearby who wants food right away." },
  { q: "What is the daily availability check-in?", a: "Each morning, you confirm through the app that you're at the hub and ready to serve. This lets customers know which trucks are available that day. It takes 10 seconds — just tap 'I'm here today.' If you're not serving, simply don't check in. No penalties." },
  { q: "How does batch pickup work?", a: "When the lunch cutoff hits at 10:30 AM, our admin coordinator groups all orders by vendor. You prepare the food, mark each order as 'Ready,' and our driver swings by the hub to pick up from all vendors at once. Same process for the dinner batch at 5:00 PM." },
  { q: "Who are the customers?", a: "Everyone! Our biggest customers are businesses, truck stops, logistics hubs, and warehouse workers along the I-24 and Hwy 40 corridors. But we deliver to anyone — office teams ordering lunch, families near Lebanon, drivers at truck stops, or event organizers. If they're in the delivery zone, we bring them your food." },
  { q: "Will this expand to other areas?", a: "Yes. The hub-and-corridor model is designed to be replicated. As we grow, we'll add new food truck hubs and delivery corridors in other regions. Vendors who join early get first access to new zones as they open up." },
  { q: "How does zone-based delivery work?", a: "The corridor is divided into delivery zones. Batch delivery covers the I-24 corridor (Smyrna, LaVergne, Hwy 40 area). One-off delivery covers Lebanon and the 840/109 area near the hub. Our drivers handle all deliveries — you never leave the hub." },
  { q: "How do orders get to the right truck?", a: "When you upload your menu, customers can browse and order from your specific truck. Every order is tagged with your vendor ID and goes directly to your dashboard. No shared queues, no mix-ups — your menu means your orders. Your Trust Layer ID ensures everything is linked correctly." },
  { q: "What is Trust Layer and do I need it?", a: "Trust Layer is our vendor verification and identity system. Every vendor gets a Trust Layer ID that links your truck to the platform. Visit dwtl.io to set up your full Trust Layer membership — it verifies your identity, connects you to the ordering system, and gives you access to the full ecosystem. You can enter your ID during signup or add it later from your dashboard." },
  { q: "Can I help promote Happy Eats?", a: "Absolutely — and we encourage it! The more customers who know about the app, the more orders you get. Tell businesses, truck stops, and logistics hubs: 'Order lunch from your favorite food trucks at Happy Eats. Place your order by 10:30 AM and we deliver by noon.' Share your menu page URL, post on social media, leave flyers at truck stops — every customer you bring benefits your truck directly." },
  { q: "Do I need any special equipment?", a: "No. Just prepare the food at the hub. We handle delivery logistics and payment processing. You focus on what you do best — cooking." },
  { q: "Can I set my own prices?", a: "Yes, you have full control over your menu items and pricing. Set your prices, update them anytime through your dashboard." },
  { q: "What if I need to close for a day?", a: "Simply don't check in for the day. No penalties, no questions asked. The rotating hub model means other vendors fill the slots naturally." },
  { q: "How do customers find me?", a: "Customers find you through the Happy Eats app — they browse available trucks, see your menu, and order directly. You also get your own menu page URL you can share anywhere. When you check in for the day, you show up on the zone ordering page automatically." },
  { q: "What about health inspections?", a: "We require a valid health inspection certificate during signup. This protects you and builds customer trust. It's a one-time upload during registration." },
  { q: "What does a typical day look like?", a: "Arrive at the hub by 8 AM → Check in on the app → Receive lunch batch orders by 10:30 AM → Prepare and mark orders ready → Driver picks up around 11 AM → Receive dinner orders by 5 PM → Prepare and mark ready → Driver picks up at 5:15 PM → Handle any one-off orders during the day → Pack up when you're done." },
];

export default function VendorPortal() {
  const { t } = useLanguage();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const BUSINESS_TYPES = [
    { value: "food-truck", label: t("vendor.foodTruck"), icon: Truck },
    { value: "restaurant", label: t("vendor.restaurant"), icon: UtensilsCrossed },
    { value: "bar-grill", label: t("vendor.barGrill"), icon: Store },
    { value: "mom-and-pop", label: t("vendor.momAndPop"), icon: Building2 },
    { value: "gas-station", label: t("vendor.gasStation"), icon: Fuel },
    { value: "catering", label: t("vendor.catering"), icon: ChefHat },
    { value: "bakery-deli", label: t("vendor.bakeryDeli"), icon: ShoppingBag },
  ];

  const [signupResult, setSignupResult] = useState<SignupResult | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [certFileName, setCertFileName] = useState<string | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodePerk, setInviteCodePerk] = useState<{ valid: boolean; perkType?: string; perkValue?: string; perkDescription?: string; label?: string } | null>(null);
  const [inviteCodeChecking, setInviteCodeChecking] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [vendorAgreementAccepted, setVendorAgreementAccepted] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    businessType: "food-truck",
    cuisine: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    description: "",
    logoUrl: "",
    healthInspectionScore: "",
    healthInspectionGrade: "",
    healthInspectionCertUrl: "",
    healthInspectionDate: "",
    referralCode: "",
    operatingHoursStart: "",
    operatingHoursEnd: "",
  });

  // Hidden test mode: Ctrl+Shift+T
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setIsTestMode(prev => {
          const next = !prev;
          if (next) {
            // Auto-fill test vendor data
            setFormData({
              name: "Smoky Ridge BBQ",
              businessType: "food-truck",
              cuisine: "BBQ, Smoked Meats, Southern Comfort",
              contactName: "Test Vendor",
              phone: "6155550199",
              email: "smokyridge@happyeats.test",
              address: "100 Food Truck Hub, Lebanon TN 37090",
              website: "",
              description: "Award-winning smoked meats and Southern sides, served fresh from our custom-built smoker truck at the Hwy 109 & I-840 hub. Low and slow is the only way we know.",
              logoUrl: "",
              healthInspectionScore: "96",
              healthInspectionGrade: "A",
              healthInspectionCertUrl: "/sample-health-cert.png",
              healthInspectionDate: "2026-03-15",
              referralCode: "",
              operatingHoursStart: "08:00",
              operatingHoursEnd: "20:00",
            });
            setTosAccepted(true);
            setPrivacyAccepted(true);
            setVendorAgreementAccepted(true);
            toast({ title: "🔧 Test Mode Activated", description: "Form pre-filled with Smoky Ridge BBQ test data. Health cert auto-set." });
          } else {
            toast({ title: "Test Mode Deactivated" });
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const uploadFile = async (file: File, fileType: "logo" | "health-cert") => {
    const slug = formData.name ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'new-vendor';
    const urlRes = await fetch("/api/food-trucks/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType, fileName: file.name, vendorSlug: slug }),
    });
    if (!urlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadURL, readURL } = await urlRes.json();
    const uploadRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error("Upload failed");
    return readURL;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setLogoUploading(true);
    try {
      const readURL = await uploadFile(file, "logo");
      setFormData(d => ({ ...d, logoUrl: readURL }));
      toast({ title: t("vendor.logoUploaded") });
    } catch {
      toast({ title: t("vendor.logoFailed"), variant: "destructive" });
      setLogoPreview(null);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertFileName(file.name);
    setCertUploading(true);
    try {
      const readURL = await uploadFile(file, "health-cert");
      setFormData(d => ({ ...d, healthInspectionCertUrl: readURL }));
      toast({ title: t("vendor.healthCertUploaded") });
    } catch {
      toast({ title: t("vendor.healthCertFailed"), variant: "destructive" });
      setCertFileName(null);
    } finally {
      setCertUploading(false);
    }
  };

  const validateInviteCode = async (code: string) => {
    if (!code.trim()) {
      setInviteCodePerk(null);
      return;
    }
    setInviteCodeChecking(true);
    try {
      const res = await fetch("/api/invite-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setInviteCodePerk(data);
    } catch {
      setInviteCodePerk(null);
    } finally {
      setInviteCodeChecking(false);
    }
  };

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData & { tosAccepted: boolean; privacyAccepted: boolean; vendorAgreementAccepted: boolean; isTestVendor?: boolean }) => {
      const res = await fetch("/api/food-trucks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Signup failed" }));
        throw new Error(err.error || "Signup failed");
      }
      return res.json();
    },
    onSuccess: async (data) => {
      setSignupResult(data);
      toast({ title: t("vendor.welcomeToHappyEats"), description: t("vendor.accountSetup") });
      // Auto-seed sample menu for test vendors
      if (isTestMode && data.id) {
        try {
          await fetch(`/api/seed/sample-menu/${data.id}`, { method: "POST" });
          toast({ title: "🍖 Sample BBQ menu auto-loaded!", description: `${data.name} now has 15 menu items ready for ordering.` });
        } catch {}
      }
      if (formData.referralCode?.trim()) {
        try {
          await fetch("/api/referrals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              affiliateId: formData.referralCode.trim().toLowerCase(),
              referredType: "vendor",
              referredName: formData.name,
              referredEmail: formData.email,
            }),
          });
        } catch {}
      }
      if (inviteCode.trim() && inviteCodePerk?.valid) {
        try {
          await fetch("/api/invite-codes/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: inviteCode.trim() }),
          });
        } catch {}
      }
    },
    onError: () => {
      toast({ title: t("common.failed"), description: t("common.retry"), variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Test mode bypasses the health cert requirement
    if (!isTestMode && !formData.healthInspectionCertUrl) {
      toast({ title: t("vendor.healthCertRequired"), variant: "destructive" });
      return;
    }
    if (!tosAccepted || !privacyAccepted || !vendorAgreementAccepted) {
      toast({ title: "You must accept all agreements to register.", description: "Please review and check all three boxes below the form.", variant: "destructive" });
      return;
    }
    if (!isTestMode && (!formData.operatingHoursStart || !formData.operatingHoursEnd)) {
      toast({ title: "Operating hours are required", description: "Please set your open and close times. Vendors must be available at their stated opening time.", variant: "destructive" });
      return;
    }
    signupMutation.mutate({ ...formData, tosAccepted, privacyAccepted, vendorAgreementAccepted, isTestVendor: isTestMode });
  };

  const copyPin = () => {
    if (signupResult?.pin) {
      navigator.clipboard.writeText(signupResult.pin);
      toast({ title: t("vendor.pinCopied") });
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetForm = () => {
    setSignupResult(null);
    setLogoPreview(null);
    setCertFileName(null);
    setInviteCode("");
    setInviteCodePerk(null);
    setFormData({ name: "", businessType: "food-truck", cuisine: "", contactName: "", phone: "", email: "", address: "", website: "", description: "", logoUrl: "", healthInspectionScore: "", healthInspectionGrade: "", healthInspectionCertUrl: "", healthInspectionDate: "", referralCode: "", operatingHoursStart: "", operatingHoursEnd: "" });
  };

  return (
    <PageLanguageProvider>
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] relative overflow-hidden">
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[60%] right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sticky top-14 z-40 bg-[#070b16]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5" data-testid="button-back-home">
                <ArrowLeft className="size-4 mr-1" /> Back
              </Button>
            </Link>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30">
                <ChefHat className="size-4 text-orange-400" />
              </div>
              <span className="text-sm font-bold text-white hidden sm:inline">Vendor Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PageLanguageToggle />
            <Link href="/vendor/login">
              <Button variant="outline" size="sm" className="text-xs min-h-[36px] border-white/10 hover:border-white/20" data-testid="link-vendor-login">
                <KeyRound className="size-3 mr-1" /> {t("vendor.vendorLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-16 relative z-10">

        <motion.section
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-center pt-8 pb-4"
          data-testid="section-hero"
        >
          <Badge className="bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-300 border-orange-500/30 text-xs mb-4 px-4 py-1">
            <Sparkles className="size-3 mr-1" /> {t("vendor.signup").toUpperCase()}
          </Badge>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-6 max-w-xl mx-auto"
            data-testid="banner-launch-date"
          >
            <div className={`${GLASS_CARD} border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none" />
              <div className="relative flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Zap className="size-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-emerald-300">🟢 We're Live — Sign Up & Start Earning Today</p>
                  <p className="text-[11px] text-white/50 leading-relaxed flex items-start gap-1">
                    <Mail className="size-3 text-emerald-400/60 shrink-0 mt-0.5" />
                    Register now, set up your menu, and start receiving orders immediately. Real customers, real orders, real revenue.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                      <Phone className="size-3" /> SMS order notifications active
                    </span>
                    <a href="https://shellskitchen.happy-eats.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 hover:bg-violet-500/20 transition-colors cursor-pointer">
                      <ExternalLink className="size-3" /> See a live vendor page: sHell's Kitchen →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-3">
            {t("vendor.joinNetwork")}
          </h1>
          <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-8">
            Zero upfront cost. We only earn when you earn. Delivering to businesses, truck stops, logistics hubs, and more across the 840/109/I-24 corridor.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            <Card className={`${GLASS_CARD} border-emerald-500/20`} data-testid="stat-zero-cost">
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="size-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">$0</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">{t("vendor.toJoin")}</p>
              </CardContent>
            </Card>
            <Card className={`${GLASS_CARD} border-violet-500/20`} data-testid="stat-you-keep">
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="size-5 text-violet-400" />
                </div>
                <p className="text-2xl font-bold text-white">80%</p>
                <p className="text-[10px] text-violet-400 uppercase tracking-wider">{t("vendor.youKeep")}</p>
              </CardContent>
            </Card>
            <Card className={`${GLASS_CARD} border-orange-500/20`} data-testid="stat-per-sale">
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-2">
                  <Users className="size-5 text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-white">20%</p>
                <p className="text-[10px] text-orange-400 uppercase tracking-wider">{t("vendor.onlyPerSale")}</p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-how-we-operate"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg text-white">
              <Zap className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">How We Operate</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500 to-amber-500 opacity-15" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                img: foodtruckExteriorImg,
                title: "Food Truck Hub — Hwy 109 & 840",
                desc: "Park at our rotating hub where Hwy 109 meets I-840 in Lebanon. Up to 20 vendors serve each day. Check in on the app each morning to confirm you're open. You cook — we deliver to businesses, truck stops, logistics hubs, and anyone in the corridor.",
                link: "/zones",
                linkText: "View Zone Map",
                accent: "orange",
              },
              {
                img: foodtruckInteriorImg,
                title: "Two Batch Windows + One-Off Orders",
                desc: "Lunch batch: orders close 10:30 AM, delivered by noon along the I-24 corridor (Smyrna, LaVergne, and beyond). Dinner batch: orders close 5:00 PM, delivered by 6:00 PM. Plus, local customers along 840/109 can order anytime for individual delivery.",
                accent: "violet",
              },
              {
                img: foodTruckVendorImg,
                title: "Payment & Revenue",
                desc: "You keep 80% of every order. Daily direct deposits to your bank — typically arrives within 2 business days. No monthly fees, no hidden charges, no equipment to buy. Zero risk.",
                accent: "emerald",
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className={`relative group overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 min-h-[320px]`}
                data-testid={`card-operate-${i}`}
              >
                <div className="absolute inset-0">
                  <img
                    src={card.img}
                    alt=""
                    className="w-full h-full object-cover brightness-110 group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50" />
                </div>
                <div className="relative p-6 flex flex-col h-full justify-end">
                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">{card.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed mb-3">{card.desc}</p>
                  {card.link && (
                    <Link href={card.link}>
                      <span className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium cursor-pointer" data-testid="link-view-zones">
                        {card.linkText} <ArrowRight className="size-3" />
                      </span>
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          custom={2}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-delivery-area"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg text-white">
              <MapPin className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">Where We Deliver</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 opacity-15" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`${GLASS_CARD} border-teal-500/20`} data-testid="card-corridor-map">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Map className="size-4 text-teal-400" />
                  The 840 / 109 / I-24 Corridor
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  Our launch corridor stretches from <span className="text-white/80 font-medium">Lebanon</span> along Hwy 109 and I-840, connecting to the <span className="text-white/80 font-medium">I-24 corridor</span> through Smyrna, LaVergne, and the surrounding Hwy 40 area. The food truck hub sits at the <span className="text-white/80 font-medium">Hwy 109 & I-840 intersection</span> — a central point where these routes converge.
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Batch Delivery Zone", desc: "I-24 corridor — Smyrna, LaVergne, and surrounding areas (~20 min from hub)", color: "text-violet-400" },
                    { label: "Local Delivery Zone", desc: "Lebanon, Hwy 109, I-840 corridor — individual orders anytime", color: "text-cyan-400" },
                    { label: "Future Expansion", desc: "This model is built to expand — new hubs and corridors can be added for any region", color: "text-amber-400" },
                  ].map((zone, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className={`size-2 rounded-full mt-1.5 shrink-0 ${zone.color.replace('text-', 'bg-')}`} />
                      <div>
                        <p className={`text-[11px] font-medium ${zone.color}`}>{zone.label}</p>
                        <p className="text-[10px] text-white/40">{zone.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/zones">
                  <span className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-3 cursor-pointer font-medium" data-testid="link-view-corridor-map">
                    View Interactive Zone Map <ArrowRight className="size-3" />
                  </span>
                </Link>
              </CardContent>
            </Card>

            <Card className={`${GLASS_CARD} border-orange-500/20`} data-testid="card-who-we-serve">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="size-4 text-orange-400" />
                  Who Orders From You
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  We deliver to <span className="text-white/80 font-medium">anyone</span> in the corridor — but our biggest customers are the businesses and workers along these routes. Your food reaches people who need it most.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Building2, label: "Businesses & Offices", desc: "Lunch and dinner for teams" },
                    { icon: Truck, label: "Truck Stops & Drivers", desc: "Hot meals on the go" },
                    { icon: Package, label: "Logistics Hubs & Warehouses", desc: "Shift workers & crews" },
                    { icon: Users, label: "Local Residents & Anyone", desc: "Families, individuals, events" },
                  ].map((cust, i) => {
                    const CIcon = cust.icon;
                    return (
                      <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5" data-testid={`customer-type-${i}`}>
                        <CIcon className="size-4 text-orange-400 mb-1.5" />
                        <p className="text-[10px] font-medium text-white">{cust.label}</p>
                        <p className="text-[10px] text-white/40">{cust.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] text-amber-300 flex items-start gap-1.5">
                    <Sparkles className="size-3 shrink-0 mt-0.5" />
                    <span>This system is designed to grow. As we expand to new regions, you'll have the opportunity to serve even more customers through additional hubs and corridors.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-your-day"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg text-white">
              <Coffee className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">Your Day as a Vendor</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-15" />
          </div>

          <Card className={`${GLASS_CARD} border-cyan-500/20`} data-testid="card-daily-routine">
            <CardContent className="p-5 md:p-6">
              <div className="space-y-0">
                {[
                  { time: "8:00 AM", icon: Sunrise, label: "Arrive & Check In", desc: "Park at the Hwy 109/840 hub. Tap 'I'm here today' in the app so customers see you're available.", color: "amber", line: true },
                  { time: "8:00 – 10:30", icon: ShoppingBag, label: "Lunch Orders Roll In", desc: "Businesses, truck stops, and logistics hubs along I-24 place lunch orders. You see them live in your dashboard.", color: "orange", line: true },
                  { time: "10:30 AM", icon: Bell, label: "Lunch Cutoff", desc: "No more lunch batch orders. Start preparing everything that came in. Accept each order and mark it 'Preparing.'", color: "rose", line: true },
                  { time: "~11:00 AM", icon: Package, label: "Mark Ready → Driver Picks Up", desc: "As each order is done, tap 'Ready.' Our driver swings by the hub and picks up from all vendors at once.", color: "violet", line: true },
                  { time: "By Noon", icon: Truck, label: "Lunch Delivered", desc: "Batch delivery reaches businesses, truck stops, and logistics hubs along the I-24 corridor. You're already prepping for afternoon.", color: "emerald", line: true },
                  { time: "All Day", icon: Sun, label: "One-Off Orders (Local)", desc: "Anyone along the 840/109 corridor can order anytime — businesses, truck stops, local residents. Individual delivery, no batch needed.", color: "cyan", line: true },
                  { time: "1:00 – 5:00 PM", icon: ShoppingBag, label: "Dinner Orders Roll In", desc: "Same process — corridor customers order for the dinner batch. You see them live and plan your prep.", color: "orange", line: true },
                  { time: "5:00 PM", icon: Sunset, label: "Dinner Cutoff → Prep → Pickup", desc: "Dinner orders close. Prepare, mark ready, driver picks up. Delivered to customers by 6:00 PM.", color: "rose", line: false },
                ].map((step, i) => {
                  const Icon = step.icon;
                  const colorMap: Record<string, string> = {
                    amber: "from-amber-500/20 to-amber-500/10 border-amber-500/30 text-amber-400",
                    orange: "from-orange-500/20 to-orange-500/10 border-orange-500/30 text-orange-400",
                    rose: "from-rose-500/20 to-rose-500/10 border-rose-500/30 text-rose-400",
                    violet: "from-violet-500/20 to-violet-500/10 border-violet-500/30 text-violet-400",
                    emerald: "from-emerald-500/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400",
                    cyan: "from-cyan-500/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400",
                  };
                  const cm = colorMap[step.color];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      className="flex gap-3 items-start"
                      data-testid={`daily-step-${i}`}
                    >
                      <div className="flex flex-col items-center shrink-0 w-10">
                        <div className={`size-10 rounded-xl bg-gradient-to-br ${cm} flex items-center justify-center border`}>
                          <Icon className="size-4" />
                        </div>
                        {step.line && <div className="w-px h-full min-h-[24px] bg-white/10" />}
                      </div>
                      <div className={`flex-1 min-w-0 ${step.line ? 'pb-4' : 'pb-1'}`}>
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider shrink-0">{step.time}</span>
                          <span className="text-xs font-bold text-white">{step.label}</span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          custom={3}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-spread-word"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg text-white">
              <Megaphone className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">Help Spread the Word</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-rose-500 to-pink-500 opacity-15" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`${GLASS_CARD} border-rose-500/20`} data-testid="card-promote-cutoff">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Share2 className="size-4 text-rose-400" />
                  You're Our Best Marketer
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  The more customers who know about Happy Eats, the more orders you get. Help us spread the word to <span className="text-white/80 font-medium">businesses, truck stops, and logistics hubs</span> in the corridor.
                </p>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20">
                    <p className="text-xs font-bold text-orange-300 mb-1 flex items-center gap-1.5">
                      <Clock className="size-3.5" /> The Key Message
                    </p>
                    <p className="text-[11px] text-white/70 leading-relaxed">
                      "Order lunch from your favorite food trucks at <span className="text-orange-300 font-medium">Happy Eats</span> — place your order by <span className="text-orange-300 font-bold">10:30 AM</span> and we'll have it delivered by noon!"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Post on your socials", desc: "Share the app with your followers" },
                      { label: "Tell truck stop managers", desc: "Leave flyers or QR codes" },
                      { label: "Talk to logistics offices", desc: "Offer catering-style lunch orders" },
                      { label: "Word of mouth", desc: "Tell every customer about the app" },
                    ].map((tip, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <p className="text-[10px] font-medium text-white">{tip.label}</p>
                        <p className="text-[10px] text-white/40">{tip.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${GLASS_CARD} border-violet-500/20`} data-testid="card-order-routing">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Truck className="size-4 text-violet-400" />
                  How Orders Find Your Truck
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  When you sign up and upload your menu, customers can browse and order directly from <span className="text-white/80 font-medium">your specific truck</span>. Every order goes straight to your dashboard — no confusion, no mix-ups.
                </p>
                <div className="space-y-2">
                  {[
                    { step: "1", label: "You upload your menu", desc: "Your items, your prices, your truck's name and logo", color: "text-orange-400", bg: "bg-orange-500/20" },
                    { step: "2", label: "Customer browses your menu", desc: "They see your truck on the app and pick what they want", color: "text-violet-400", bg: "bg-violet-500/20" },
                    { step: "3", label: "Order goes directly to you", desc: "It lands in your vendor dashboard instantly — tagged with your truck", color: "text-cyan-400", bg: "bg-cyan-500/20" },
                    { step: "4", label: "You prepare, we deliver", desc: "Accept → Prepare → Mark Ready → Our driver picks it up", color: "text-emerald-400", bg: "bg-emerald-500/20" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${item.bg} ${item.color}`}>{item.step}</span>
                      <div>
                        <p className={`text-[11px] font-medium ${item.color}`}>{item.label}</p>
                        <p className="text-[10px] text-white/40">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <p className="text-[10px] text-violet-300 flex items-start gap-1.5">
                    <BadgeCheck className="size-3 shrink-0 mt-0.5" />
                    <span>Each vendor gets a unique Trust Layer ID that links your truck to the system. Orders are always routed to exactly the right vendor.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        <motion.section
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-what-you-get"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg text-white">
              <Sparkles className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">What You Get</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-15" />
          </div>

          <Carousel opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3">
              {WHAT_YOU_GET.map((item, i) => {
                const Icon = item.icon;
                return (
                  <CarouselItem key={i} className="pl-3 basis-[280px] md:basis-[300px]">
                    <Card className={`${GLASS_CARD} h-full`} data-testid={`card-benefit-${i}`}>
                      <CardContent className="p-5">
                        <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-3 border border-emerald-500/20">
                          <Icon className="size-5 text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-white/5 border-white/10 text-white hover:bg-white/10" data-testid="button-carousel-prev" />
            <CarouselNext className="hidden md:flex -right-4 bg-white/5 border-white/10 text-white hover:bg-white/10" data-testid="button-carousel-next" />
          </Carousel>
        </motion.section>

        <motion.section
          ref={formRef}
          custom={4}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-signup"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg text-white">
              <FileText className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em] flex items-center gap-2">
              Sign Up Free
              <InfoBubble
                title={{ en: "Vendor Signup", es: "Registro de Vendedor" }}
                content={{ en: "Signing up is completely free — no monthly fees, no hidden charges.\n\nWe take just 20% of completed orders. You keep 80% of everything you sell.\n\nAfter signing up you'll get:\n• A unique PIN to log into your dashboard\n• Your own ordering page URL\n• Access to all free vendor tools\n• A slug for your food truck page\n\nYou'll also want to get your Trust Layer ID at dwtl.io for full verification.", es: "Registrarse es completamente gratis — sin tarifas mensuales, sin cargos ocultos.\n\nSolo tomamos el 20% de los pedidos completados. Te quedas con el 80% de todo lo que vendes.\n\nDespués de registrarte obtendrás:\n• Un PIN único para acceder a tu panel\n• Tu propia URL de página de pedidos\n• Acceso a todas las herramientas gratuitas\n• Un slug para tu página de food truck\n\nTambién querrás obtener tu ID de Trust Layer en dwtl.io para verificación completa." }}
                manualSection="vendor-management"
                size="md"
              />
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500 to-rose-500 opacity-15" />
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <Card className={`${GLASS_CARD} lg:col-span-3 border-orange-500/20`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="size-6 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center text-orange-400 text-xs font-bold border border-orange-500/30">
                    <FileText className="size-3" />
                  </span>
                  {t("vendor.signUpFree")}
                  {isTestMode && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] animate-pulse">
                      <Wrench className="size-3 mr-1" /> Test Mode
                    </Badge>
                  )}
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] ml-auto">
                    <Sparkles className="size-3 mr-1" /> {t("vendor.noFees")}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AnimatePresence mode="wait">
                  {signupResult ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 space-y-6"
                    >
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                          className="size-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/30 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 relative"
                        >
                          <CheckCircle className="size-10 text-emerald-400" />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: 2 }}
                            className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                          />
                        </motion.div>
                        <h3 className="text-xl font-heading font-bold text-white mb-1">
                          {t("vendor.welcomeToHappyEats")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("vendor.accountSetup")}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                        <Card className={`${GLASS_CARD} border-orange-500/30`}>
                          <CardContent className="p-5">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">{t("vendor.yourPin")}</p>
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-3xl font-mono font-bold text-orange-400 tracking-[0.3em]" data-testid="text-vendor-pin">
                                {signupResult.pin}
                              </span>
                              <Button variant="ghost" size="sm" onClick={copyPin} className="text-muted-foreground hover:text-white" data-testid="button-copy-pin">
                                <Copy className="size-4" />
                              </Button>
                            </div>
                            <p className="text-[10px] text-rose-400 mt-2 font-medium text-center">
                              {t("vendor.writeDownPin")}
                            </p>
                          </CardContent>
                        </Card>
                        {signupResult.trustLayerId && (
                          <Card className={`${GLASS_CARD} border-cyan-500/30`}>
                            <CardContent className="p-5">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Your Trust Layer ID</p>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-mono font-bold text-cyan-400 tracking-wide" data-testid="text-trust-layer-id">
                                  {signupResult.trustLayerId}
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(signupResult.trustLayerId!); toast({ title: "Trust Layer ID copied!" }); }} className="text-muted-foreground hover:text-white" data-testid="button-copy-tlid">
                                  <Copy className="size-4" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-cyan-400/60 mt-2 font-medium text-center">
                                This links your business to the ecosystem
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <div className={`${GLASS_CARD} rounded-xl p-5`}>
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <CheckCircle className="size-4 text-emerald-400" /> Your Next Steps
                        </h4>
                        <div className="space-y-3">
                          {[
                            { step: "1", title: "Save your PIN", desc: "Screenshot or write down your PIN shown above", icon: KeyRound, color: "orange" },
                            { step: "2", title: "Set up your menu", desc: "Add your items, prices, and descriptions — this is how customers find you", icon: UtensilsCrossed, color: "rose", link: "/vendor/login" },
                            { step: "3", title: "Connect your bank account", desc: "Go to the Earnings tab in your dashboard to link your bank. Payments process daily, arriving within 2 business days — no invoicing needed", icon: CreditCard, color: "emerald", link: "/vendor/login" },
                            { step: "4", title: "Trust Layer ID assigned ✓", desc: `Your Trust Layer ID (${signupResult.trustLayerId || 'pending'}) has been auto-assigned. Visit dwtl.io to upgrade to full membership`, icon: BadgeCheck, color: "violet", externalLink: "https://dwtl.io" },
                            { step: "5", title: "Spread the word!", desc: "Tell customers: order by 10:30 AM at Happy Eats for lunch delivery by noon", icon: Megaphone, color: "rose" },
                            { step: "6", title: "Get Notified When We Go Live", desc: "Coming soon! We'll keep you informed and notify you the moment orders begin", icon: Mail, color: "emerald" },
                          ].map((item, i) => {
                            const Icon = item.icon;
                            const colorMap: Record<string, string> = { orange: "bg-orange-500/20 text-orange-400", rose: "bg-rose-500/20 text-rose-400", violet: "bg-violet-500/20 text-violet-400", emerald: "bg-emerald-500/20 text-emerald-400" };
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                                data-testid={`next-step-${i}`}
                              >
                                <span className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorMap[item.color]}`}>
                                  <Icon className="size-4" />
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-white">{item.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                                </div>
                                {item.link && (
                                  <Link href={item.link}>
                                    <ArrowRight className="size-4 text-white/30 hover:text-white cursor-pointer" />
                                  </Link>
                                )}
                                {(item as any).externalLink && (
                                  <a href={(item as any).externalLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="size-4 text-white/30 hover:text-white cursor-pointer" />
                                  </a>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Card className={`${GLASS_CARD} border-cyan-500/20`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="size-4 text-cyan-400" />
                              <p className="text-xs font-bold text-white">Your Delivery Area</p>
                            </div>
                            <p className="text-[11px] text-white/50 mb-2">
                              Batch delivery along the I-24 corridor (businesses, truck stops, logistics hubs) + one-off delivery for the 840/109 area. All from the food truck hub.
                            </p>
                            <Link href="/zones">
                              <span className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer" data-testid="link-delivery-zones">
                                View Zone Map <ArrowRight className="size-3" />
                              </span>
                            </Link>
                          </CardContent>
                        </Card>
                        <Card className={`${GLASS_CARD} border-emerald-500/20`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="size-4 text-emerald-400" />
                              <p className="text-xs font-bold text-white">How You'll Get Paid</p>
                            </div>
                            <p className="text-[11px] text-white/50">
                              Daily direct deposits to your bank, typically within 2 business days. You keep 80% of every completed order. No invoices, no chasing payments.
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                        <Link href="/vendor/login">
                          <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[44px] w-full sm:w-auto" data-testid="button-goto-menu-manager">
                            {t("vendor.setUpMenu")} <ArrowRight className="size-4 ml-2" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={resetForm} className="text-xs min-h-[44px] border-white/10" data-testid="button-register-another">
                          {t("vendor.registerAnother")}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      className="space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="businessName" className="text-xs">{t("vendor.businessName")} *</Label>
                          <Input 
                            id="businessName" 
                            placeholder="e.g., Taqueria El Sol"
                            required
                            value={formData.name}
                            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                            className="h-11 text-sm"
                            data-testid="input-business-name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="businessType" className="text-xs">{t("vendor.businessType")} *</Label>
                          <select 
                            id="businessType"
                            value={formData.businessType}
                            onChange={e => setFormData(d => ({ ...d, businessType: e.target.value }))}
                            className="w-full h-11 px-3 rounded-md bg-background border border-input text-sm"
                            data-testid="select-business-type"
                          >
                            {BUSINESS_TYPES.map(bt => (
                              <option key={bt.value} value={bt.value}>{bt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="cuisine" className="text-xs">{t("vendor.whatDoYouServe")} *</Label>
                        <Input 
                          id="cuisine" 
                          placeholder="e.g., Mexican, BBQ, Southern comfort food, Wings & burgers"
                          required
                          value={formData.cuisine}
                          onChange={e => setFormData(d => ({ ...d, cuisine: e.target.value }))}
                          className="h-11 text-sm"
                          data-testid="input-cuisine"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="contactName" className="text-xs">{t("vendor.yourName")} *</Label>
                          <Input 
                            id="contactName" 
                            placeholder="Your name"
                            required
                            value={formData.contactName}
                            onChange={e => setFormData(d => ({ ...d, contactName: e.target.value }))}
                            className="h-11 text-sm"
                            data-testid="input-contact-name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="phone" className="text-xs">{t("common.phone")} *</Label>
                          <Input 
                            id="phone" 
                            type="tel"
                            placeholder="(615) 555-0123"
                            required
                            value={formData.phone}
                            onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                            className="h-11 text-sm"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-2.5 cursor-pointer group" data-testid="label-sms-consent">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5 size-4 accent-emerald-500 shrink-0"
                          data-testid="checkbox-sms-consent"
                        />
                        <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                          I agree to receive SMS order alerts & vendor notifications.{" "}
                          <a href="/sms-consent" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                            SMS Consent Policy
                          </a>
                          . Msg & data rates may apply. Reply STOP to cancel.
                        </span>
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="email" className="text-xs">{t("common.email")} *</Label>
                          <Input 
                            id="email" 
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={formData.email}
                            onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                            className="h-11 text-sm"
                            data-testid="input-email"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="address" className="text-xs">{t("vendor.businessAddress")}</Label>
                          <Input 
                            id="address" 
                            placeholder="123 Main St, Nashville TN"
                            value={formData.address}
                            onChange={e => setFormData(d => ({ ...d, address: e.target.value }))}
                            className="h-11 text-sm"
                            data-testid="input-address"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="description" className="text-xs">{t("vendor.tellAboutBusiness")}</Label>
                        <Textarea 
                          id="description" 
                          placeholder="What makes your food special? Any popular dishes?"
                          rows={2}
                          value={formData.description}
                          onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                          className="text-sm"
                          data-testid="textarea-description"
                        />
                      </div>

                      <div className="border-t border-orange-500/20 pt-3 mt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="size-4 text-orange-400" />
                          <Label className="text-xs font-bold text-white">Operating Hours</Label>
                          <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/30 text-[9px]">Required</Badge>
                        </div>
                        <p className="text-[10px] text-orange-300/70 mb-2">
                          Vendors must be available at their stated opening time. These hours will appear on your free vendor page.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor="operatingHoursStart" className="text-[10px]">Open Time</Label>
                            <select
                              id="operatingHoursStart"
                              value={formData.operatingHoursStart}
                              onChange={e => setFormData(d => ({ ...d, operatingHoursStart: e.target.value }))}
                              className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
                              data-testid="select-operating-hours-start"
                            >
                              <option value="">Select...</option>
                              <option value="05:00">5:00 AM</option>
                              <option value="06:00">6:00 AM</option>
                              <option value="07:00">7:00 AM</option>
                              <option value="08:00">8:00 AM</option>
                              <option value="09:00">9:00 AM</option>
                              <option value="10:00">10:00 AM</option>
                              <option value="11:00">11:00 AM</option>
                              <option value="12:00">12:00 PM</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="operatingHoursEnd" className="text-[10px]">Close Time</Label>
                            <select
                              id="operatingHoursEnd"
                              value={formData.operatingHoursEnd}
                              onChange={e => setFormData(d => ({ ...d, operatingHoursEnd: e.target.value }))}
                              className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
                              data-testid="select-operating-hours-end"
                            >
                              <option value="">Select...</option>
                              <option value="14:00">2:00 PM</option>
                              <option value="15:00">3:00 PM</option>
                              <option value="16:00">4:00 PM</option>
                              <option value="17:00">5:00 PM</option>
                              <option value="18:00">6:00 PM</option>
                              <option value="19:00">7:00 PM</option>
                              <option value="20:00">8:00 PM</option>
                              <option value="21:00">9:00 PM</option>
                              <option value="22:00">10:00 PM</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Image className="size-4 text-orange-400" />
                          <Label className="text-xs font-bold text-white">{t("vendor.logoUpload")}</Label>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">{t("vendor.logoUploadDesc")}</p>
                        <div className="flex items-center gap-3">
                          {logoPreview && (
                            <div className="size-16 rounded-lg border border-white/20 overflow-hidden bg-white/5 flex-shrink-0">
                              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <input
                              ref={logoInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                              data-testid="input-logo-upload"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={logoUploading}
                              className="text-xs min-h-[36px]"
                              data-testid="button-upload-logo"
                            >
                              {logoUploading ? (
                                <><Loader2 className="size-3 mr-1 animate-spin" /> {t("vendor.logoUploading")}</>
                              ) : (
                                <><Upload className="size-3 mr-1" /> {logoPreview ? t("vendor.changeLogo") : t("vendor.chooseLogo")}</>
                              )}
                            </Button>
                            {formData.logoUrl && (
                              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                                <CheckCircle className="size-3" /> {t("vendor.logoUploaded")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="size-4 text-emerald-400" />
                          <Label className="text-xs font-bold text-white">{t("vendor.healthInspection")} *</Label>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-3">{t("vendor.healthInspectionDesc")}</p>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="space-y-1">
                            <Label htmlFor="healthScore" className="text-[10px]">{t("vendor.healthScore")}</Label>
                            <Input 
                              id="healthScore"
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              placeholder={t("vendor.healthScorePlaceholder")}
                              value={formData.healthInspectionScore}
                              onChange={e => setFormData(d => ({ ...d, healthInspectionScore: e.target.value }))}
                              className="h-10 text-sm"
                              data-testid="input-health-score"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="healthGrade" className="text-[10px]">{t("vendor.healthGrade")}</Label>
                            <select 
                              id="healthGrade"
                              value={formData.healthInspectionGrade}
                              onChange={e => setFormData(d => ({ ...d, healthInspectionGrade: e.target.value }))}
                              className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
                              data-testid="select-health-grade"
                            >
                              <option value="">--</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="inspectionDate" className="text-[10px]">{t("vendor.inspectionDate")}</Label>
                            <Input 
                              id="inspectionDate"
                              type="date"
                              value={formData.healthInspectionDate}
                              onChange={e => setFormData(d => ({ ...d, healthInspectionDate: e.target.value }))}
                              className="h-10 text-sm"
                              data-testid="input-inspection-date"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            ref={certInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                            className="hidden"
                            onChange={handleCertUpload}
                            data-testid="input-cert-upload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => certInputRef.current?.click()}
                            disabled={certUploading}
                            className="text-xs min-h-[36px]"
                            data-testid="button-upload-cert"
                          >
                            {certUploading ? (
                              <><Loader2 className="size-3 mr-1 animate-spin" /> {t("vendor.healthCertUploading")}</>
                            ) : (
                              <><Upload className="size-3 mr-1" /> {certFileName ? t("vendor.changeFile") : t("vendor.healthCertUpload")}</>
                            )}
                          </Button>
                          {certFileName && (
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                              <CheckCircle className="size-3 shrink-0" /> {certFileName}
                            </p>
                          )}
                        </div>
                        {!certFileName && (
                          <p className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
                            <AlertTriangle className="size-3 shrink-0" /> {t("vendor.healthCertRequired")}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket className="size-4 text-violet-400" />
                          <Label className="text-xs font-bold text-white">Have an Invite Code?</Label>
                          <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 text-[9px]">Optional</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                          If you received an invite code from our team, enter it below to unlock your signup perk.
                        </p>
                        <div className="flex gap-2">
                          <Input
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            onBlur={() => validateInviteCode(inviteCode)}
                            placeholder="e.g. HE-ABC123"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/30 text-sm font-mono uppercase"
                            data-testid="input-invite-code"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => validateInviteCode(inviteCode)}
                            disabled={!inviteCode.trim() || inviteCodeChecking}
                            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 shrink-0"
                            data-testid="button-check-invite"
                          >
                            {inviteCodeChecking ? <Loader2 className="size-3 animate-spin" /> : "Apply"}
                          </Button>
                        </div>
                        {inviteCodePerk && (
                          <div className={`mt-2 p-2.5 rounded-lg border ${
                            inviteCodePerk.valid
                              ? "bg-emerald-500/10 border-emerald-500/20"
                              : "bg-red-500/10 border-red-500/20"
                          }`}>
                            {inviteCodePerk.valid ? (
                              <div className="flex items-start gap-2">
                                <Gift className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-emerald-300">Perk unlocked!</p>
                                  <p className="text-[11px] text-emerald-400/70 mt-0.5">{inviteCodePerk.perkDescription}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-red-300">Invalid or expired invite code</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-3 mt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeCheck className="size-4 text-cyan-400" />
                          <Label className="text-xs font-bold text-white">Trust Layer Membership</Label>
                          <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[9px]">Auto-assigned</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-3">
                          A Trust Layer ID will be automatically generated for your business when you register. If you already have one from{" "}
                          <a href="https://dwtl.io" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 inline-flex items-center gap-0.5">
                            dwtl.io <ExternalLink className="size-2.5" />
                          </a>
                          , enter it below to link your existing membership.
                        </p>
                        <Input
                          value={formData.referralCode}
                          onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                          placeholder="Leave blank for auto-generated ID"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/30 text-sm"
                          data-testid="input-referral-code"
                        />
                        <p className="text-[10px] text-white/30 mt-1">Optional — enter an existing Trust Layer ID or referral code. A new one will be created if left blank.</p>
                      </div>

                      <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="size-4 text-emerald-400" />
                          <Label className="text-xs font-bold text-white">Legal Agreements</Label>
                          <Badge className="bg-red-500/10 text-red-300 border-red-500/20 text-[9px]">Required</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          You must review and accept all three agreements before registering. Your acceptance is recorded with a timestamp, IP address, and agreement version for your protection and ours.
                        </p>

                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-emerald-500/30 transition-colors min-h-[44px]" data-testid="label-tos-agreement">
                          <input
                            type="checkbox"
                            checked={tosAccepted}
                            onChange={(e) => setTosAccepted(e.target.checked)}
                            className="mt-0.5 size-4 accent-emerald-500 shrink-0"
                            data-testid="checkbox-tos"
                          />
                          <span className="text-xs text-white/70 leading-relaxed">
                            I have read and agree to the{" "}
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium">
                              Terms of Service
                            </a>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-emerald-500/30 transition-colors min-h-[44px]" data-testid="label-privacy-agreement">
                          <input
                            type="checkbox"
                            checked={privacyAccepted}
                            onChange={(e) => setPrivacyAccepted(e.target.checked)}
                            className="mt-0.5 size-4 accent-emerald-500 shrink-0"
                            data-testid="checkbox-privacy"
                          />
                          <span className="text-xs text-white/70 leading-relaxed">
                            I have read and agree to the{" "}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium">
                              Privacy Policy
                            </a>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-emerald-500/30 transition-colors min-h-[44px]" data-testid="label-vendor-agreement">
                          <input
                            type="checkbox"
                            checked={vendorAgreementAccepted}
                            onChange={(e) => setVendorAgreementAccepted(e.target.checked)}
                            className="mt-0.5 size-4 accent-emerald-500 shrink-0"
                            data-testid="checkbox-vendor-agreement"
                          />
                          <span className="text-xs text-white/70 leading-relaxed">
                            I have read and agree to the{" "}
                            <a href="/vendor-agreement" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium">
                              Vendor Agreement
                            </a>
                            {" "}including the 20% commission structure, vendor responsibilities, and liability terms
                          </span>
                        </label>

                        {(!tosAccepted || !privacyAccepted || !vendorAgreementAccepted) && (
                          <p className="text-[10px] text-amber-400/80 flex items-center gap-1">
                            <AlertTriangle className="size-3 shrink-0" /> All three agreements must be accepted to register
                          </p>
                        )}
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-2">
                          <CheckCircle className="size-3.5 shrink-0" />
                          {t("vendor.freeJoinNote")}
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={signupMutation.isPending || !tosAccepted || !privacyAccepted || !vendorAgreementAccepted}
                        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[44px] disabled:opacity-50"
                        data-testid="button-submit-signup"
                      >
                        {signupMutation.isPending ? (
                          <><Loader2 className="size-4 mr-2 animate-spin" /> {t("vendor.creatingAccount")}</>
                        ) : (
                          <>{t("vendor.joinHappyEatsFree")} <ArrowRight className="size-4 ml-2" /></>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-3">
              <Card className={`${GLASS_CARD} border-violet-500/20`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-6 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold border border-violet-500/30">
                      <Zap className="size-3" />
                    </span>
                    {t("vendor.howItWorks")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {[
                    { step: "1", title: t("vendor.signUpFreeStep"), desc: t("vendor.takesTwoMin"), color: "orange" },
                    { step: "2", title: t("vendor.addYourMenu"), desc: "Orders go directly to your truck based on your menu", color: "rose" },
                    { step: "3", title: "Get Trust Layer ID", desc: "Visit dwtl.io to link your truck to the system", color: "violet" },
                    { step: "4", title: "Check In & Get Paid", desc: "Daily check-in at the hub — you keep 80%", color: "emerald" }
                  ].map((item, i) => {
                    const colorMap2: Record<string, string> = { orange: "bg-orange-500/20 text-orange-400", rose: "bg-rose-500/20 text-rose-400", violet: "bg-violet-500/20 text-violet-400", emerald: "bg-emerald-500/20 text-emerald-400" };
                    return (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5" data-testid={`how-it-works-step-${i}`}>
                      <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${colorMap2[item.color]}`}>
                        {item.step}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className={`${GLASS_CARD} border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <Star className="size-3" />
                    </span>
                    {t("vendor.whyJoin")}?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5" data-testid="why-join-zero-risk">
                      <DollarSign className="size-4 text-emerald-400 mb-1" />
                      <p className="text-[10px] text-white font-medium">{t("vendor.zeroRisk")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("vendor.payNothingUnlessSales")}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5" data-testid="why-join-delivery">
                      <Truck className="size-4 text-violet-400 mb-1" />
                      <p className="text-[10px] text-white font-medium">{t("vendor.weDeliver")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("vendor.noDeliveryHassle")}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5" data-testid="why-join-batch">
                      <Clock className="size-4 text-orange-400 mb-1" />
                      <p className="text-[10px] text-white font-medium">Batch + One-Off</p>
                      <p className="text-[10px] text-muted-foreground">Two daily batch windows + anytime local orders</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5" data-testid="why-join-payouts">
                      <CreditCard className="size-4 text-rose-400 mb-1" />
                      <p className="text-[10px] text-white font-medium">{t("vendor.dailyPayouts")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("vendor.directDeposit")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`${GLASS_CARD} bg-gradient-to-r from-orange-500/10 to-rose-500/10 border-orange-500/20`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                      <MapPin className="size-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm mb-1">Food Truck Hub — Hwy 109 & I-840</p>
                      <p className="text-[11px] text-muted-foreground">
                        Rotating hub serving the 840/109/I-24 corridor. Delivering to businesses, truck stops, logistics hubs, and anyone in the area. Built to expand to new regions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        <motion.section
          custom={5}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          data-testid="section-faq"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="size-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg text-white">
              <HelpCircle className="size-4" />
            </div>
            <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">Vendor FAQ</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-violet-500 to-purple-500 opacity-15" />
          </div>

          <Card className={`${GLASS_CARD}`}>
            <CardContent className="p-4 md:p-6">
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-white/10" data-testid={`faq-item-${i}`}>
                    <AccordionTrigger className="text-white/90 hover:text-white text-left text-sm hover:no-underline" data-testid={`faq-trigger-${i}`}>
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/50 text-sm leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section
          custom={6}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={sectionVariants}
          className="text-center py-12"
          data-testid="section-footer-cta"
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
            Ready to grow your business?
          </h2>
          <p className="text-sm text-white/50 mb-6 max-w-lg mx-auto">
            Join our food truck hub and reach businesses, truck stops, and logistics hubs across the corridor. Zero upfront cost, zero risk — we deliver for you.
          </p>
          <Button
            onClick={scrollToForm}
            className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[48px] px-8 text-base"
            data-testid="button-footer-signup"
          >
            Sign Up Free <ArrowDown className="size-4 ml-2" />
          </Button>
        </motion.section>

      </div>
    </div>
    </PageLanguageProvider>
  );
}
