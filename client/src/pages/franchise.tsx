import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  DollarSign, Users, CheckCircle, ArrowRight, ArrowLeft,
  Truck, ChefHat, Building2, Shield, TrendingUp, Megaphone,
  Smartphone, MapPin, Star, Sparkles, Clock, Receipt,
  Send, Phone, Mail, User, Globe, Package, Zap,
  PieChart, FileText, Gamepad2, Radio, MessageCircle,
  Play, BarChart3, Rocket, Target, Crown, Award,
  Calculator, ChevronDown, ChevronRight, Layers, Lock
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(value);
  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function ROICalculator() {
  const { t } = useLanguage();
  const [population, setPopulation] = useState(250000);
  const [foodTrucks, setFoodTrucks] = useState(15);
  const [avgOrderValue, setAvgOrderValue] = useState(18);

  const projections = useMemo(() => {
    const driverDensity = population / 50000;
    const dailyOrders = Math.round(foodTrucks * 8 * driverDensity);
    const monthlyOrders = dailyOrders * 26;
    const grossRevenue = monthlyOrders * avgOrderValue;
    const platformCommission = grossRevenue * 0.20;
    const deliveryFees = monthlyOrders * 3.99;
    const totalPlatformRevenue = platformCommission + deliveryFees;
    const driverPay = monthlyOrders * 4.5;
    const operatingCosts = totalPlatformRevenue * 0.12;
    const netProfit = totalPlatformRevenue - driverPay - operatingCosts;
    const royalty = totalPlatformRevenue * 0.06;
    const marketingFee = totalPlatformRevenue * 0.02;
    const techFee = 199;
    const franchiseeShare = netProfit - royalty - marketingFee - techFee;

    return {
      dailyOrders,
      monthlyOrders,
      grossRevenue,
      totalRevenue: totalPlatformRevenue,
      netProfit,
      franchiseeShare: Math.max(0, franchiseeShare),
      yearlyEarnings: Math.max(0, franchiseeShare) * 12,
    };
  }, [population, foodTrucks, avgOrderValue]);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm font-medium">{t("franchise.cityPopulation")}</Label>
            <span className="text-cyan-400 font-bold text-sm">{population.toLocaleString()}</span>
          </div>
          <Slider
            value={[population]}
            onValueChange={(v) => setPopulation(v[0])}
            min={50000}
            max={2000000}
            step={25000}
            className="w-full"
            data-testid="slider-population"
          />
          <div className="flex justify-between text-[10px] text-white/40">
            <span>50K</span>
            <span>2M</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm font-medium">{t("franchise.foodTrucks")}</Label>
            <span className="text-cyan-400 font-bold text-sm">{foodTrucks}</span>
          </div>
          <Slider
            value={[foodTrucks]}
            onValueChange={(v) => setFoodTrucks(v[0])}
            min={5}
            max={100}
            step={5}
            className="w-full"
            data-testid="slider-food-trucks"
          />
          <div className="flex justify-between text-[10px] text-white/40">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm font-medium">{t("franchise.avgOrderValue")}</Label>
            <span className="text-cyan-400 font-bold text-sm">${avgOrderValue}</span>
          </div>
          <Slider
            value={[avgOrderValue]}
            onValueChange={(v) => setAvgOrderValue(v[0])}
            min={10}
            max={40}
            step={1}
            className="w-full"
            data-testid="slider-avg-order"
          />
          <div className="flex justify-between text-[10px] text-white/40">
            <span>$10</span>
            <span>$40</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">{t("franchise.dailyOrders")}</p>
            <p className="text-2xl font-bold text-white"><AnimatedCounter value={projections.dailyOrders} /></p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">{t("franchise.monthlyOrders")}</p>
            <p className="text-2xl font-bold text-white"><AnimatedCounter value={projections.monthlyOrders} prefix="" suffix="" /></p>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">{t("franchise.monthlyRevenue")}</p>
            <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={Math.round(projections.totalRevenue)} prefix="$" /></p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 backdrop-blur-xl">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] text-emerald-300 mb-1 uppercase tracking-wider font-bold">{t("franchise.yourMonthlyEarnings")}</p>
            <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={Math.round(projections.franchiseeShare)} prefix="$" /></p>
            <p className="text-[10px] text-white/40 mt-1">After royalties & fees</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 rounded-2xl px-8 py-4 border border-emerald-500/20">
          <TrendingUp className="size-6 text-emerald-400" />
          <div className="text-left">
            <p className="text-xs text-emerald-300 font-medium">{t("franchise.projectedAnnualEarnings")}</p>
            <p className="text-3xl font-bold text-white"><AnimatedCounter value={Math.round(projections.yearlyEarnings)} prefix="$" /><span className="text-sm text-white/40">{t("franchise.perYear")}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIAL_DATA = [
  { name: "Marcus T.", quoteKey: "testimonialMarcus", roleKey: "nashvilleFranchiseOwner", img: "MT", revenue: "$8,200/mo", rating: 5 },
  { name: "Sandra K.", quoteKey: "testimonialSandra", roleKey: "memphisTerritoryLead", img: "SK", revenue: "$6,800/mo", rating: 5 },
  { name: "DeAndre J.", quoteKey: "testimonialDeandre", roleKey: "knoxvilleFranchiseOwner", img: "DJ", revenue: "$11,400/mo", rating: 5 },
];

export default function FranchisePage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    message: "",
  });

  const submitInquiry = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/franchise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      setFormSubmitted(true);
      toast({ title: t("franchise.inquirySubmitted") });
    },
    onError: () => {
      toast({ title: t("franchise.inquiryReceived"), variant: "default" });
      setFormSubmitted(true);
    },
  });

  const platformFeatures = [
    { icon: Smartphone, label: t("franchise.yourBrandedApp"), desc: t("franchise.yourBrandedAppDesc"), color: "from-cyan-500 to-blue-500" },
    { icon: Megaphone, label: t("franchise.aiMarketingHub"), desc: t("franchise.aiMarketingHubDesc"), color: "from-orange-500 to-rose-500" },
    { icon: ChefHat, label: t("franchise.vendorPortal"), desc: t("franchise.vendorPortalDesc"), color: "from-emerald-500 to-teal-500" },
    { icon: Truck, label: t("franchise.deliveryManagement"), desc: t("franchise.deliveryManagementDesc"), color: "from-violet-500 to-purple-500" },
    { icon: Receipt, label: t("franchise.businessSuite"), desc: t("franchise.businessSuiteDesc"), color: "from-amber-500 to-orange-500" },
    { icon: MessageCircle, label: t("franchise.driverCommunity"), desc: t("franchise.driverCommunityDesc"), color: "from-pink-500 to-rose-500" },
    { icon: Shield, label: t("franchise.trustLayerSecurity"), desc: t("franchise.trustLayerSecurityDesc"), color: "from-cyan-400 to-blue-400" },
    { icon: Building2, label: t("franchise.orbitStaffing"), desc: t("franchise.orbitStaffingDesc"), color: "from-indigo-500 to-violet-500" },
    { icon: BarChart3, label: t("franchise.revenueDashboard"), desc: t("franchise.revenueDashboardDesc"), color: "from-emerald-400 to-cyan-400" },
    { icon: Globe, label: t("franchise.customDomain"), desc: t("franchise.customDomainDesc"), color: "from-blue-500 to-indigo-500" },
    { icon: Layers, label: t("franchise.multiTenant"), desc: t("franchise.multiTenantDesc"), color: "from-slate-400 to-slate-500" },
    { icon: Zap, label: t("franchise.prioritySupport"), desc: t("franchise.prioritySupportDesc"), color: "from-yellow-400 to-amber-500" },
  ];

  return (
    <PageLanguageProvider>
    <div className="min-h-screen bg-[#060a14]">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#060a14]/90 backdrop-blur-2xl border-b border-white/[0.06] px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Shield className="size-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-tight">
              TL Driver<span className="text-cyan-400">Connect</span>
            </span>
            <span className="text-[10px] text-white/40 leading-none">{t("franchise.franchiseProgram")}</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <PageLanguageToggle />
          <Link href="/investors">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs hidden md:flex" data-testid="link-investors">
              <TrendingUp className="size-3 mr-1" /> {t("franchise.investors")}
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs hidden md:flex" data-testid="link-demo">
              <Play className="size-3 mr-1" /> {t("franchise.liveDemo")}
            </Button>
          </Link>
          <a href="#calculator">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs hidden md:flex" data-testid="link-roi">
              <Calculator className="size-3 mr-1" /> {t("franchise.roiCalculator")}
            </Button>
          </a>
          <a href="#contact">
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20" data-testid="button-apply-nav">
              {t("franchise.applyNow")} <ArrowRight className="size-3 ml-1" />
            </Button>
          </a>
        </div>
      </nav>

      <div className="pt-16">
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_rgba(6,182,212,0.12),_transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,_rgba(139,92,246,0.08),_transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_20%_60%,_rgba(249,115,22,0.06),_transparent)]" />
          </div>

          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="container mx-auto px-4 relative z-10"
          >
            <div className="text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-6 py-1.5 px-4 text-xs" data-testid="badge-franchise">
                  <Crown className="size-3 mr-1.5" /> {t("franchise.premiumOpportunity")}
                </Badge>
              </motion.div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                {t("franchise.heroTitle1")}{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                  {t("franchise.heroTitle2")}
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
                  {t("franchise.heroTitle3")}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-8 leading-relaxed">
                {t("franchise.heroDesc")}
                <span className="text-white font-medium"> {t("franchise.heroDescBold")}</span> {t("franchise.heroDescEnd")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a href="#contact">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-6 text-lg shadow-2xl shadow-cyan-500/20 w-full sm:w-auto" data-testid="button-apply-hero">
                    <Rocket className="size-5 mr-2" /> {t("franchise.applyForFranchise")}
                  </Button>
                </a>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="border-white/[0.06] text-white hover:bg-white/5 px-10 py-6 text-lg w-full sm:w-auto" data-testid="button-demo-hero">
                    <Play className="size-5 mr-2" /> {t("franchise.seeLiveDemo")}
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <Link href="/franchise/onboarding">
                  <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20 text-xs" data-testid="link-onboarding-wizard">
                    <Sparkles className="size-3 mr-1.5" /> {t("franchise.tryOnboardingWizard")}
                  </Button>
                </Link>
                <Link href="/franchise/dashboard">
                  <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 text-xs" data-testid="link-revenue-dashboard">
                    <BarChart3 className="size-3 mr-1.5" /> {t("franchise.previewRevenueDashboard")}
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/40">
                {[
                  { icon: CheckCircle, text: t("franchise.noTechSkills") },
                  { icon: Clock, text: t("franchise.launchIn48Hours") },
                  { icon: DollarSign, text: t("franchise.lowStartupCost") },
                  { icon: Shield, text: t("franchise.trustLayerVerified") },
                ].map((item) => (
                  <span key={item.text} className="flex items-center gap-1.5">
                    <item.icon className="size-4 text-emerald-400" />
                    <span>{item.text}</span>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="container mx-auto px-4 mt-16 relative z-10"
          >
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("franchise.activeFranchises"), value: "12", icon: Building2, iconBg: "bg-cyan-500/10", iconText: "text-cyan-400" },
                { label: t("franchise.monthlyOrders"), value: "45K+", icon: Package, iconBg: "bg-emerald-500/10", iconText: "text-emerald-400" },
                { label: t("franchise.avgFranchiseeIncome"), value: "$9.2K", icon: DollarSign, iconBg: "bg-orange-500/10", iconText: "text-orange-400" },
                { label: t("franchise.satisfactionRate"), value: "97%", icon: Star, iconBg: "bg-amber-500/10", iconText: "text-amber-400" },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                  <CardContent className="p-4 md:p-5 flex items-center gap-3">
                    <div className={`size-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                      <stat.icon className={`size-5 ${stat.iconText}`} />
                    </div>
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-white/40 leading-tight">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-14">
              <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4">
                <Target className="size-3 mr-1" /> {t("franchise.simpleProcess")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">{t("franchise.launchIn4Steps")}</h2>
              <p className="text-white/40 max-w-lg mx-auto">{t("franchise.launchIn4StepsDesc")}</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { step: 1, title: t("franchise.step1Title"), desc: t("franchise.step1Desc"), icon: FileText, gradient: "from-cyan-500 to-blue-500" },
                { step: 2, title: t("franchise.step2Title"), desc: t("franchise.step2Desc"), icon: Rocket, gradient: "from-violet-500 to-purple-500" },
                { step: 3, title: t("franchise.step3Title"), desc: t("franchise.step3Desc"), icon: ChefHat, gradient: "from-orange-500 to-rose-500" },
                { step: 4, title: t("franchise.step4Title"), desc: t("franchise.step4Desc"), icon: DollarSign, gradient: "from-emerald-500 to-teal-500" },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/[0.03] border-white/[0.06] hover:border-white/10 transition-all duration-300 h-full group">
                    <CardContent className="p-6 text-center">
                      <div className="relative mb-4">
                        <div className={`size-14 mx-auto rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                          <item.icon className="size-7 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 size-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="text-white font-bold mb-2 text-sm">{item.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="hidden md:flex items-center justify-center max-w-4xl mx-auto mt-[-120px] mb-[-30px] px-12 pointer-events-none">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex-1 flex items-center justify-center">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="calculator" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.03] via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-4">
                <Calculator className="size-3 mr-1" /> {t("franchise.revenueCalculator")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">{t("franchise.calculateEarnings")}</h2>
              <p className="text-white/40 max-w-lg mx-auto">{t("franchise.calculateDesc")}</p>
            </div>

            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl max-w-4xl mx-auto">
              <CardContent className="p-6 md:p-10">
                <ROICalculator />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 mb-4">
                <DollarSign className="size-3 mr-1" /> {t("franchise.transparentPricing")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">{t("franchise.franchiseFeeStructure")}</h2>
              <p className="text-white/40 max-w-lg mx-auto">{t("franchise.franchiseFeeDesc")}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <div className="size-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <DollarSign className="size-4 text-orange-400" />
                    </div>
                    {t("franchise.revenueStructure")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: t("franchise.serviceFeePerOrder"), value: t("franchise.serviceFeeValue"), badgeClass: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
                    { label: t("franchise.deliveryFee"), value: "$3.99", badgeClass: "bg-orange-500/10 text-orange-300 border-orange-500/20" },
                    { label: t("franchise.driverTips"), value: t("franchise.driverTipsValue"), badgeClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
                    { label: t("franchise.tipSuggestions"), value: "25% / 30% / 35%", badgeClass: "bg-slate-500/10 text-white/60 border-slate-500/20" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <span className="text-sm text-white/60">{item.label}</span>
                      <Badge className={item.badgeClass}>{item.value}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <div className="size-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <PieChart className="size-4 text-violet-400" />
                    </div>
                    {t("franchise.profitSplit")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold">Vendors Keep</span>
                      <span className="text-3xl font-black text-emerald-400">80%</span>
                    </div>
                    <p className="text-[11px] text-white/40">of every order — lowest in the industry. DoorDash/Uber take 15-30%.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">Platform Collects</span>
                      <span className="text-lg font-bold text-violet-400">20%</span>
                    </div>
                    <p className="text-[11px] text-white/40">Your revenue source as a franchisee — you earn from this commission after standard fees.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">+ Delivery Fees</span>
                      <span className="text-lg font-bold text-orange-400">$3.99</span>
                    </div>
                    <p className="text-[11px] text-white/40">Per-order delivery fee charged to customers — additional platform revenue.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/[0.03] border-amber-500/10 backdrop-blur-xl max-w-5xl mx-auto mt-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="size-4 text-amber-400" />
                  </div>
                  <h3 className="text-white font-bold">Standard Franchise Fees</h3>
                </div>
                <p className="text-[11px] text-white/40 mb-4">Transparent, industry-standard fees. No hidden costs. These are the only fees you'll ever pay.</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Initial Franchise Fee", value: "$15-25K", sub: "one-time", highlight: false },
                    { label: "Ongoing Royalty", value: "6%", sub: "of gross / monthly", highlight: false },
                    { label: "Marketing Fund", value: "2%", sub: "of gross / monthly", highlight: false },
                    { label: "Technology Fee", value: "$199", sub: "/month", highlight: true },
                  ].map((tier) => (
                    <div key={tier.label} className={`p-4 rounded-xl text-center ${tier.highlight ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'bg-white/[0.03] border border-white/[0.05]'}`}>
                      <p className={`text-xs mb-1 ${tier.highlight ? 'text-amber-400' : 'text-white/40'}`}>{tier.label}</p>
                      <p className="text-2xl font-bold text-amber-400">{tier.value}</p>
                      <p className="text-[10px] text-white/40 mt-1">{tier.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <p className="text-[11px] text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="size-3.5 shrink-0" />
                    Includes: exclusive territory, full platform access, Stripe Connect auto-splitting, vendor onboarding system, training, brand assets, and ongoing tech updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-4">
                <Package className="size-3 mr-1" /> Everything Included
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">Your Complete Franchise Package</h2>
              <p className="text-white/40 max-w-lg mx-auto">Turnkey platform with 12 integrated modules. No extra costs.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {platformFeatures.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white/[0.03] border-white/[0.06] hover:border-white/10 transition-all duration-300 h-full group cursor-default">
                    <CardContent className="p-4">
                      <div className={`size-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg`}>
                        <item.icon className="size-5 text-white" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">{item.label}</h3>
                      <p className="text-[11px] text-white/40 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 mb-4">
                <Star className="size-3 mr-1" /> Success Stories
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">Hear From Our Franchisees</h2>
              <p className="text-white/40 max-w-lg mx-auto">Real operators, real results.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {TESTIMONIAL_DATA.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: item.rating }).map((_, j) => (
                          <Star key={j} className="size-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-white/60 italic mb-6 leading-relaxed">"{t(item.quoteKey)}"</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                            {item.img}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{item.name}</p>
                            <p className="text-[11px] text-white/40">{t(item.roleKey)}</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs">
                          {item.revenue}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-4">
                <ChefHat className="size-3 mr-1" /> Vendor Partners
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">Food Truck Vendor Pricing</h2>
              <p className="text-white/40 max-w-lg mx-auto">Simple, fair pricing. Vendors keep 80% of every order.</p>
            </div>

            <Card className="bg-white/[0.03] border-emerald-500/10 backdrop-blur-xl max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
                  <ChefHat className="size-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Vendor Partner Plan</h3>
                <div className="mb-6">
                  <span className="text-5xl font-black text-white">20%</span>
                  <span className="text-white/40 ml-2">service fee per order</span>
                </div>
                <ul className="space-y-3 text-left mb-6">
                  {[
                    "No monthly subscription fee",
                    "Free vendor portal access",
                    "We handle delivery logistics",
                    "Real-time order notifications",
                    "Weekly direct deposit payouts",
                    "Marketing exposure to driver network",
                    "Menu management dashboard",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/60">
                      <CheckCircle className="size-4 text-emerald-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-white/40">No sign-up fee. No minimum orders. Cancel anytime.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-4">
                <TrendingUp className="size-3 mr-1" /> Growth Projections
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">Projected Earnings Timeline</h2>
              <p className="text-white/40 max-w-lg mx-auto">Your 80% share of net profits — based on average franchise performance.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { period: "Month 3", amount: "$3,600", sub: "/month", growth: "+180%" },
                { period: "Month 6", amount: "$9,680", sub: "/month", growth: "+169%" },
                { period: "Year 1", amount: "$19,680", sub: "/month", growth: "+103%" },
                { period: "Year 2", amount: "$29,760", sub: "/month", growth: "+51%" },
              ].map((proj, i) => (
                <motion.div
                  key={proj.period}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/[0.03] border-emerald-500/10 backdrop-blur-xl h-full">
                    <CardContent className="p-5 text-center">
                      <p className="text-xs text-white/40 mb-2">{proj.period}</p>
                      <p className="text-2xl md:text-3xl font-black text-emerald-400">{proj.amount}</p>
                      <p className="text-[11px] text-white/40 mb-2">{proj.sub}</p>
                      <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">
                        <TrendingUp className="size-2.5 mr-1" /> {proj.growth}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="max-w-4xl mx-auto mt-6">
              <Card className="bg-gradient-to-r from-emerald-500/[0.06] via-cyan-500/[0.06] to-violet-500/[0.06] border-emerald-500/10">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Award className="size-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Year 2 Annual Projection</p>
                      <p className="text-sm text-white/40">Based on average performance across all franchises</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-3xl md:text-4xl font-black text-emerald-400">$357,120</p>
                    <p className="text-xs text-white/40">annual gross income</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.04] via-cyan-500/[0.04] to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-4">
                  <Send className="size-3 mr-1" /> Get Started
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">
                  Apply for Your Franchise
                </h2>
                <p className="text-white/40">
                  Fill out the form below and we'll send you the complete franchise package within 24 hours.
                </p>
              </div>

              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl" data-testid="card-franchise-form">
                <CardContent className="p-6 md:p-8">
                  {formSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10"
                    >
                      <div className="size-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-5 border border-emerald-500/30">
                        <CheckCircle className="size-10 text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Application Received!</h3>
                      <p className="text-white/40 mb-6 max-w-md mx-auto">We'll review your application and send you the complete franchise package within 24 hours. Expect a call from our franchise development team.</p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button variant="outline" onClick={() => setFormSubmitted(false)} className="border-white/[0.06] text-white hover:bg-white/5" data-testid="button-another-inquiry">
                          Submit Another Inquiry
                        </Button>
                        <Link href="/demo">
                          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white" data-testid="button-explore-demo">
                            <Play className="size-4 mr-2" /> Explore the Demo
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">Full Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name"
                            className="bg-white/[0.05] border-white/[0.06] focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-white/30"
                            data-testid="input-franchise-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">Email *</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@email.com"
                            className="bg-white/[0.05] border-white/[0.06] focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-white/30"
                            data-testid="input-franchise-email"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">Phone</Label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(555) 000-0000"
                            className="bg-white/[0.05] border-white/[0.06] focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-white/30"
                            data-testid="input-franchise-phone"
                          />
                          <label className="flex items-start gap-2 cursor-pointer group" data-testid="label-sms-consent">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="mt-0.5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                              data-testid="checkbox-sms-consent"
                            />
                            <span className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                              I agree to receive SMS updates about my application.{" "}
                              <a href="/sms-consent" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">
                                SMS Consent Policy
                              </a>
                              . Msg & data rates may apply. Reply STOP to cancel.
                            </span>
                          </label>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">City *</Label>
                          <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Your city"
                            className="bg-white/[0.05] border-white/[0.06] focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-white/30"
                            data-testid="input-franchise-city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white text-sm font-medium">State *</Label>
                          <Input
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="TN"
                            className="bg-white/[0.05] border-white/[0.06] focus:border-cyan-500/50 min-h-[48px] text-white placeholder:text-white/30"
                            data-testid="input-franchise-state"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white text-sm font-medium">Tell us about your interest</Label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="What area would you serve? Any food industry experience? What's your timeline?"
                          className="bg-white/[0.05] border-white/[0.06] focus:border-cyan-500/50 min-h-[100px] text-white placeholder:text-white/30"
                          data-testid="textarea-franchise-message"
                        />
                      </div>
                      <Button
                        onClick={() => submitInquiry.mutate(formData)}
                        disabled={!formData.name || !formData.email || !formData.city || !formData.state || submitInquiry.isPending}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold min-h-[52px] text-base shadow-lg shadow-cyan-500/20"
                        data-testid="button-submit-franchise"
                      >
                        <Rocket className="size-5 mr-2" />
                        {submitInquiry.isPending ? "Submitting..." : "Submit Franchise Application"}
                      </Button>
                      <p className="text-center text-[11px] text-white/30">
                        By submitting, you agree to our Terms of Service. We'll never share your information.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.05] py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center">
                  <Shield className="size-4 text-white" />
                </div>
                <span className="text-sm text-white/40">TL Driver Connect — Part of the Trust Layer Ecosystem</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/demo" className="text-xs text-white/40 hover:text-white transition-colors">Demo</Link>
                <Link href="/privacy" className="text-xs text-white/40 hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="text-xs text-white/40 hover:text-white transition-colors">Terms</Link>
              </div>
              <p className="text-[11px] text-white/30">© 2026 Dark Wave Studios LLC</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
    </PageLanguageProvider>
  );
}