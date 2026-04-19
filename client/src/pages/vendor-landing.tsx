import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ChefHat, Truck, ArrowRight, DollarSign, TrendingUp, Users,
  Sparkles, Zap, Globe, Image, BarChart3, Calendar, Star, Bell, Map,
  CheckCircle, Clock, Shield, Package, Building2, MapPin, Phone,
  Camera, Palette, CreditCard, Printer, Share2, ExternalLink,
  ChevronDown, Play, Award, Flame, Target, Megaphone, Eye,
  FileText, UtensilsCrossed, Store, ShoppingBag, Coffee,
  Sunrise, Sun, Sunset, ArrowDown, Mail, LogIn, UserPlus, ClipboardList
} from "lucide-react";

import foodtruckExteriorImg from "@/assets/images/foodtruck-exterior.jpg";
import foodtruckInteriorImg from "@/assets/images/foodtruck-interior.jpg";
import foodTruckVendorImg from "@/assets/images/food-truck-vendor.jpg";
import foodTruckBusyImg from "@/assets/images/food-truck-busy.jpg";
import vendorCookingImg from "@/assets/images/vendor-cooking.jpg";
import vendorBbqImg from "@/assets/images/vendor-bbq.jpg";
import vendorTacosImg from "@/assets/images/vendor-tacos.jpg";

/* ───── Styles ───── */
const GLASS = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

/* ───── Ken Burns Slideshow Data ───── */
const HERO_SLIDES = [
  { img: foodtruckExteriorImg, headline: "Your Truck.", sub: "Your menu. Your prices. Your brand." },
  { img: vendorCookingImg, headline: "Our Platform.", sub: "Orders, delivery, payments — handled." },
  { img: foodTruckBusyImg, headline: "Zero Risk.", sub: "$0 to join. You keep 80% of every sale." },
  { img: vendorBbqImg, headline: "We Deliver.", sub: "Batch delivery to businesses, truck stops, and more." },
  { img: foodTruckVendorImg, headline: "You Cook.", sub: "We bring the customers. You bring the flavor." },
];

/* ───── Value Comparison ───── */
const VALUE_COMPARISON = [
  { feature: "Custom Ordering Website", market: "$50–200/mo", happyEats: "Free", icon: Globe },
  { feature: "Online Menu Builder", market: "$30–80/mo", happyEats: "Free", icon: UtensilsCrossed },
  { feature: "AI Menu Digitizer (OCR)", market: "$20–50/mo", happyEats: "Free", icon: Eye },
  { feature: "Video & Media Editing Suite", market: "$20–50/mo", happyEats: "Free", icon: Camera },
  { feature: "AI Flyer & Poster Generator", market: "$15–40/mo", happyEats: "Free", icon: Sparkles },
  { feature: "Business Card Designer", market: "$10–30/mo", happyEats: "Free", icon: CreditCard },
  { feature: "Print Studio (12 templates)", market: "$15–30/mo", happyEats: "Free", icon: Printer },
  { feature: "QR Code Marketing Kit", market: "$10–25/mo", happyEats: "Free", icon: Target },
  { feature: "Receipt Scanner (OCR)", market: "$20–50/mo", happyEats: "Free", icon: FileText },
  { feature: "Order Management Dashboard", market: "$100–300/mo", happyEats: "Free", icon: BarChart3 },
  { feature: "Real-time SMS Notifications", market: "$30–80/mo", happyEats: "Free", icon: Bell },
  { feature: "Payment Processing", market: "2.9% + $0.30", happyEats: "Included", icon: DollarSign },
  { feature: "Delivery Logistics & Drivers", market: "$500+/mo", happyEats: "Included", icon: Truck },
];

/* ───── Tools Showcase ───── */
const TOOLS = [
  { title: "Your Own Ordering Website", desc: "Customers browse your menu and order at vendorname.happy-eats.app. You control everything from your dashboard.", icon: Globe, color: "from-cyan-500 to-blue-500", badge: "Live" },
  { title: "AI Menu Digitizer", desc: "Snap a photo of your menu board — our AI reads it and builds your digital menu in seconds. Edit anytime.", icon: Eye, color: "from-teal-500 to-emerald-500", badge: "AI-Powered" },
  { title: "AI Flyer Creator", desc: "Tell it what you want, and our AI writes the copy and designs the flyer. Print-ready in 30 seconds.", icon: Sparkles, color: "from-purple-500 to-pink-500", badge: "AI-Powered" },
  { title: "Media Editor Pro", desc: "Full video, photo, and audio editing suite — filters, cropping, text overlays. Professional results, zero cost.", icon: Camera, color: "from-blue-500 to-indigo-500", badge: "Free" },
  { title: "Business Card & Print Studio", desc: "12 professional templates for cards, menus, and materials. Customize and download as high-res PNG or PDF.", icon: Printer, color: "from-amber-500 to-orange-500", badge: "Free" },
  { title: "Order Dashboard", desc: "Track every order in real-time. Accept, prepare, mark ready. See your daily revenue, customer reviews, and trends.", icon: BarChart3, color: "from-emerald-500 to-teal-500", badge: "Live" },
  { title: "Receipt Scanner", desc: "Snap a photo of any receipt — AI extracts merchant, items, totals, and tax. Great for expense tracking.", icon: FileText, color: "from-rose-500 to-red-500", badge: "AI-Powered" },
  { title: "Social Media Automation", desc: "Connect your socials through SignalCast — auto-post to Facebook, Instagram, and X. AI writes your captions.", icon: Share2, color: "from-pink-500 to-rose-500", badge: "Add-on" },
];

/* ───── FAQ ───── */
const FAQ = [
  { q: "How much does it cost to join?", a: "Absolutely free. We charge a 20% commission only on completed orders. No signup fees, no monthly fees, no hidden charges." },
  { q: "When and how do I get paid?", a: "Earnings are deposited directly into your bank account via Stripe Connect. Payments process daily and typically arrive within 2 business days. Simple, reliable, and automatic — no invoicing needed." },
  { q: "Where is the food truck hub?", a: "Our launch hub sits where Hwy 109 meets I-840 in the Lebanon area — a rotating food truck park where up to 20 vendors serve each day. You park at the hub, customers order through the app, and our drivers deliver." },
  { q: "What area do you deliver to?", a: "We cover the full 840/109/I-24 corridor. Batch deliveries reach Smyrna, LaVergne, and the surrounding Hwy 40 area. Local one-off deliveries serve Lebanon and the 840/109 area near the hub." },
  { q: "How do the batch delivery windows work?", a: "Lunch: orders close 10:30 AM, delivered by noon. Dinner: orders close 5:00 PM, delivered by 6:00 PM. Plus, local customers can order anytime for individual delivery." },
  { q: "Can I set my own prices?", a: "Yes, you have full control over your menu items and pricing. Set your prices, update them anytime through your dashboard." },
  { q: "What about health inspections?", a: "We require a valid health inspection certificate during signup. It's a one-time upload during registration. This protects you and builds customer trust." },
  { q: "What if I need to close for a day?", a: "Simply don't check in. No penalties, no questions asked. The rotating hub model means other vendors fill naturally." },
  { q: "Do I need special equipment?", a: "No. Just prepare food at the hub. We handle delivery logistics, payment processing, and customer service. You focus on cooking." },
  { q: "Will this expand to other areas?", a: "Yes. The hub-and-corridor model is designed to be replicated. As we grow, we'll add new hubs and delivery corridors. Early vendors get first access to new zones." },
];

/* ═══════════════════════════════════════════════ */
export default function VendorLanding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const scrollToJoin = () => {
    window.location.href = "/vendor/join";
  };

  return (
    <div className="min-h-screen bg-[#070b16] relative overflow-hidden">
      {/* ═══════ HERO — KEN BURNS SLIDESHOW ═══════ */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden" data-testid="hero-section">
        {/* Slides */}
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, i) => i === currentSlide && (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <motion.img
                src={slide.img}
                alt=""
                initial={{ scale: 1.0 }}
                animate={{ scale: 1.15 }}
                transition={{ duration: 6, ease: "linear" }}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#070b16]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-5 py-1.5 mb-6">
              <Flame className="size-4 mr-2" /> Now Accepting Vendors — Lebanon, TN
            </Badge>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white tracking-tight drop-shadow-2xl">
                {HERO_SLIDES[currentSlide].headline}
              </h1>
              <p className="text-xl md:text-2xl text-white/70 mt-3 font-light max-w-xl mx-auto">
                {HERO_SLIDES[currentSlide].sub}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col items-center gap-5 mt-4"
          >
            <Button
              onClick={scrollToJoin}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-lg px-10 py-7 rounded-2xl shadow-2xl shadow-orange-500/30 font-bold min-h-[56px] group"
              data-testid="hero-cta"
            >
              Join for Free <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-white/40 text-sm">No credit card required. Set up in under 5 minutes.</p>
          </motion.div>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-8">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-10 bg-orange-400" : "w-4 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown className="size-6 text-white/30" />
        </motion.div>
      </section>

      {/* ═══════ STATS RIBBON ═══════ */}
      <section className="relative z-10 -mt-12 px-4" data-testid="stats-ribbon">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-3">
          {[
            { value: "$0", label: "To Join", icon: DollarSign, color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30", textColor: "text-emerald-400" },
            { value: "80%", label: "You Keep", icon: TrendingUp, color: "from-violet-500/20 to-purple-500/20 border-violet-500/30", textColor: "text-violet-400" },
            { value: "20%", label: "Only Per Sale", icon: Users, color: "from-orange-500/20 to-amber-500/20 border-orange-500/30", textColor: "text-orange-400" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`${GLASS} bg-gradient-to-br ${stat.color}`}>
                  <CardContent className="p-5 text-center">
                    <div className="size-11 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
                      <Icon className={`size-5 ${stat.textColor}`} />
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                    <p className={`text-[11px] uppercase tracking-widest font-bold ${stat.textColor}`}>{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══════ VENDOR HUB — UNIFIED ENTRY POINT ═══════ */}
      <section className="relative z-10 px-4 mt-10 mb-6" data-testid="vendor-hub">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-heading font-bold text-white">Vendor Hub</h2>
            <p className="text-sm text-white/40 mt-1">Everything you need in one place</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sign Up */}
            <Link href="/vendor-portal">
              <div className={`${GLASS} border-orange-500/20 hover:border-orange-500/40 rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] h-full`}>
                <div className="size-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus className="size-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Sign Up Free</h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">Create your vendor account, upload your menu, and start receiving orders. Takes under 5 minutes.</p>
                <span className="text-xs text-orange-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get Started <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
            {/* Login */}
            <Link href="/vendor/login">
              <div className={`${GLASS} border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] h-full`}>
                <div className="size-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
                  <LogIn className="size-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Vendor Login</h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">Access your dashboard, manage your menu, view orders, and track your earnings.</p>
                <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Log In <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
            {/* Browse */}
            <Link href="/vendors">
              <div className={`${GLASS} border-violet-500/20 hover:border-violet-500/40 rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] h-full`}>
                <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform">
                  <Store className="size-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Browse Vendors</h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-3">See who's serving today. Browse menus, check ratings, and place an order from local food trucks.</p>
                <span className="text-xs text-violet-400 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Directory <ArrowRight className="size-3" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-24 relative z-10">
        {/* Ambient orbs */}
        <div className="absolute top-40 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[60%] right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* ═══════ THE OPPORTUNITY ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-opportunity"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg text-white">
              <Target className="size-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">The Opportunity You're Missing</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { stat: "4,200+", label: "Businesses Along the I-24 Corridor", desc: "Offices, warehouses, logistics hubs, and distribution centers — all with employees who need lunch delivered.", color: "border-orange-500/20", accent: "text-orange-400", icon: Building2 },
              { stat: "850+", label: "Truck Stops & Rest Areas", desc: "Drivers spending $15–25 per meal on overpriced gas station food. They want real food — and they'll pay for it.", color: "border-violet-500/20", accent: "text-violet-400", icon: Truck },
              { stat: "12,000+", label: "Warehouse & Logistics Workers", desc: "Shift workers at Amazon, FedEx, UPS, and regional distributors with limited food access during their breaks.", color: "border-emerald-500/20", accent: "text-emerald-400", icon: Package },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className={`${GLASS} ${item.color} h-full`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Icon className={`size-5 ${item.accent}`} />
                        </div>
                        <p className={`text-3xl font-black text-white`}>{item.stat}</p>
                      </div>
                      <p className={`text-sm font-bold ${item.accent} mb-1`}>{item.label}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className={`${GLASS} border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Zap className="size-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">That's Where We Come In</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    The Lebanon–Nashville I-24 corridor has <span className="text-orange-300 font-semibold">17,000+ potential daily customers</span> with
                    limited food options — and <span className="text-orange-300 font-semibold">zero organized food delivery infrastructure</span>. Happy Eats
                    fills that gap. You park at the hub and cook. We handle ordering, payment, and delivery to every business,
                    truck stop, warehouse, and office in the corridor. <span className="text-white font-semibold">Every meal you serve is revenue you're
                    currently leaving on the table.</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════ VALUE COMPARISON TABLE ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-value"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg text-white">
              <DollarSign className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">$1,000+/mo in Tools. Free.</h2>
              <p className="text-sm text-white/40">Here's what you'd pay elsewhere — and what you get with us</p>
            </div>
          </div>

          <Card className={`${GLASS} border-emerald-500/20 overflow-hidden`}>
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_140px_140px] border-b border-white/10 bg-white/5">
                <div className="p-4 text-xs font-bold text-white/60 uppercase tracking-wider">Feature</div>
                <div className="p-4 text-xs font-bold text-red-400/80 uppercase tracking-wider text-center">Market Rate</div>
                <div className="p-4 text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">Happy Eats</div>
              </div>
              {/* Rows */}
              {VALUE_COMPARISON.map((row, i) => {
                const Icon = row.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_140px_140px] ${i < VALUE_COMPARISON.length - 1 ? "border-b border-white/5" : ""} hover:bg-white/[0.03] transition-colors`}
                  >
                    <div className="p-3 flex items-center gap-2.5">
                      <Icon className="size-4 text-white/40 shrink-0" />
                      <span className="text-xs text-white/80 font-medium">{row.feature}</span>
                    </div>
                    <div className="p-3 flex items-center justify-center">
                      <span className="text-xs text-red-400/70 line-through">{row.market}</span>
                    </div>
                    <div className="p-3 flex items-center justify-center">
                      <Badge className={`text-[10px] ${row.happyEats === "Free" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : row.happyEats === "Included" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-violet-500/20 text-violet-300 border-violet-500/30"}`}>
                        {row.happyEats === "Free" && <CheckCircle className="size-3 mr-1" />}
                        {row.happyEats}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
              {/* Total row */}
              <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_140px_140px] bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-t border-emerald-500/20">
                <div className="p-4 flex items-center gap-2">
                  <Award className="size-5 text-emerald-400" />
                  <span className="text-sm font-black text-white">Total Value</span>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <span className="text-sm font-bold text-red-400 line-through">$820–1,135/mo</span>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <span className="text-xl font-black text-emerald-400">$0/mo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════ TOOLS SHOWCASE ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-tools"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">Your Business Toolkit</h2>
              <p className="text-sm text-white/40">Everything you need to run and grow your food business — built in</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card className={`${GLASS} h-full group hover:border-white/20 transition-all duration-300`}>
                    <CardContent className="p-5">
                      <div className={`size-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-white">{tool.title}</h3>
                      </div>
                      <Badge className={`text-[9px] mb-2 ${tool.badge === "AI-Powered" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : tool.badge === "Add-on" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"}`}>
                        {tool.badge}
                      </Badge>
                      <p className="text-[11px] text-white/50 leading-relaxed">{tool.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════ HOW IT WORKS ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-how-it-works"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg text-white">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">How It Works</h2>
              <p className="text-sm text-white/40">From sign-up to your first payout — in 4 simple steps</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Sign Up", time: "5 minutes", desc: "Fill out your business info, upload your logo and health cert, accept the vendor agreement. That's it.", icon: FileText, color: "from-orange-500 to-rose-500" },
              { step: "2", title: "Build Your Menu", time: "2 minutes", desc: "Upload a photo of your menu board — our AI digitizes it instantly. Or add items manually. Edit prices anytime.", icon: Camera, color: "from-violet-500 to-purple-500" },
              { step: "3", title: "Park & Check In", time: "Every morning", desc: "Drive to the Hwy 109/840 hub. Tap 'I'm here today' in the app. Customers see you're serving and start ordering.", icon: MapPin, color: "from-cyan-500 to-blue-500" },
              { step: "4", title: "Cook & Get Paid", time: "Same day", desc: "Accept orders, prepare food, mark it ready. Our driver picks up and delivers. You get paid daily to your bank account.", icon: DollarSign, color: "from-emerald-500 to-teal-500" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`${GLASS} h-full relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
                    <CardContent className="p-5 relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`size-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg text-white font-black text-lg`}>
                          {item.step}
                        </div>
                        <Badge className="bg-white/10 text-white/60 border-white/20 text-[9px]">
                          <Clock className="size-2.5 mr-1" />{item.time}
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════ YOUR DAY AS A VENDOR ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-daily"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg text-white">
              <Sunrise className="size-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">A Typical Day</h2>
          </div>

          <Card className={`${GLASS} border-amber-500/20`}>
            <CardContent className="p-6 space-y-0">
              {[
                { time: "8:00 AM", label: "Arrive & Check In", desc: "Park at the hub. Tap 'I'm here' in the app.", icon: Sunrise, color: "text-amber-400 bg-amber-500/20 border-amber-500/30", line: true },
                { time: "8–10:30", label: "Lunch Orders Roll In", desc: "Businesses and truck stops along I-24 place orders through the app.", icon: ShoppingBag, color: "text-orange-400 bg-orange-500/20 border-orange-500/30", line: true },
                { time: "10:30 AM", label: "Lunch Cutoff → Prepare", desc: "Cutoff hits. Start cooking. Accept and mark each order.", icon: Bell, color: "text-rose-400 bg-rose-500/20 border-rose-500/30", line: true },
                { time: "~11:00", label: "Driver Picks Up", desc: "Our driver picks up from all vendors at once. Delivered by noon.", icon: Truck, color: "text-violet-400 bg-violet-500/20 border-violet-500/30", line: true },
                { time: "All Day", label: "One-Off Local Orders", desc: "Anyone near the hub can order anytime for individual delivery.", icon: Sun, color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30", line: true },
                { time: "5:00 PM", label: "Dinner Batch", desc: "Same process. Dinner orders delivered by 6:00 PM.", icon: Sunset, color: "text-rose-400 bg-rose-500/20 border-rose-500/30", line: false },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex flex-col items-center shrink-0 w-10">
                      <div className={`size-10 rounded-xl flex items-center justify-center border ${step.color}`}>
                        <Icon className="size-4" />
                      </div>
                      {step.line && <div className="w-px h-full min-h-[24px] bg-white/10" />}
                    </div>
                    <div className={`flex-1 min-w-0 ${step.line ? "pb-4" : "pb-1"}`}>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider shrink-0">{step.time}</span>
                        <span className="text-sm font-bold text-white">{step.label}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════ REVENUE CALCULATOR ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-revenue"
        >
          <Card className={`${GLASS} border-emerald-500/20 overflow-hidden`}>
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6 border-b border-emerald-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="size-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Revenue Potential</h2>
              </div>
              <p className="text-xs text-emerald-300/60">Conservative estimates for a single food truck at the hub</p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Avg Order Size", value: "$12.50", detail: "Based on typical food truck pricing" },
                  { label: "Orders/Day", value: "40–80", detail: "Lunch batch + dinner batch + one-offs" },
                  { label: "Daily Revenue", value: "$500–1,000", detail: "Before platform commission" },
                  { label: "Your Take Home", value: "$400–800/day", detail: "After 20% platform fee" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                  >
                    <p className="text-2xl md:text-3xl font-black text-emerald-400">{item.value}</p>
                    <p className="text-xs font-bold text-white mt-1">{item.label}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{item.detail}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 text-center">
                <p className="text-lg font-black text-white">
                  Monthly Potential: <span className="text-emerald-400">$8,000–$16,000+</span>
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Based on 20 operating days/month. Actual results depend on menu pricing, volume, and operating hours.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════ DELIVERY COVERAGE ════════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-coverage"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg text-white">
              <MapPin className="size-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">Where We Deliver</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`${GLASS} border-teal-500/20`}>
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Map className="size-4 text-teal-400" />
                  The 840 / 109 / I-24 Corridor
                </h3>
                <p className="text-[11px] text-white/50 leading-relaxed mb-4">
                  Our launch corridor stretches from <span className="text-white/80 font-medium">Lebanon</span> along Hwy 109 and I-840, connecting to the <span className="text-white/80 font-medium">I-24 corridor</span> through Smyrna, LaVergne, and the surrounding Hwy 40 area.
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Batch Delivery", desc: "I-24 corridor — Smyrna, LaVergne (~20 min from hub)", color: "text-violet-400", bg: "bg-violet-400" },
                    { label: "Local Delivery", desc: "Lebanon, Hwy 109, I-840 corridor — anytime", color: "text-cyan-400", bg: "bg-cyan-400" },
                    { label: "Expansion Zones", desc: "Murfreesboro, Gallatin, Mt. Juliet — coming soon", color: "text-amber-400", bg: "bg-amber-400" },
                  ].map((zone, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className={`size-2 rounded-full mt-1.5 shrink-0 ${zone.bg}`} />
                      <div>
                        <p className={`text-[11px] font-medium ${zone.color}`}>{zone.label}</p>
                        <p className="text-[10px] text-white/40">{zone.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/zones">
                  <span className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-3 cursor-pointer font-medium">
                    View Interactive Zone Map <ArrowRight className="size-3" />
                  </span>
                </Link>
              </CardContent>
            </Card>

            <Card className={`${GLASS} border-orange-500/20`}>
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="size-4 text-orange-400" />
                  Who Orders From You
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { icon: Building2, label: "Businesses & Offices", desc: "Lunch orders for entire teams" },
                    { icon: Truck, label: "Truck Stops & Drivers", desc: "Hot meals on the road" },
                    { icon: Package, label: "Warehouses & Hubs", desc: "Shift workers & logistics crews" },
                    { icon: Users, label: "Local Residents", desc: "Families, individuals, events" },
                  ].map((cust, i) => {
                    const CIcon = cust.icon;
                    return (
                      <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                        <CIcon className="size-4 text-orange-400 mb-1.5" />
                        <p className="text-[10px] font-medium text-white">{cust.label}</p>
                        <p className="text-[10px] text-white/40">{cust.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <p className="text-[10px] text-orange-300 flex items-start gap-1.5">
                    <Sparkles className="size-3 shrink-0 mt-0.5" />
                    <span>Early vendors get first access to new zones and delivery corridors as we expand across Tennessee and beyond.</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* ═══════ FAQ ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          data-testid="section-faq"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg text-white">
              <Shield className="size-5" />
            </div>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <Card className={`${GLASS} border-blue-500/20`}>
            <CardContent className="p-4">
              <Accordion type="multiple" className="space-y-1">
                {FAQ.map((item, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-white/5 last:border-0">
                    <AccordionTrigger className="text-sm font-medium text-white/80 hover:text-white py-3 text-left [&[data-state=open]]:text-orange-300">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-white/50 leading-relaxed pb-3">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.section>

        {/* ═══════ FINAL CTA ═══════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center py-12"
          data-testid="section-final-cta"
          ref={ctaRef}
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <img src={vendorTacosImg} alt="" className="w-full h-full object-cover brightness-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
            </div>
            <div className="relative px-6 py-20">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs mb-4 px-4 py-1">
                <CheckCircle className="size-3 mr-1.5" /> No signup fee • No monthly fee • No contract
              </Badge>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-white mb-3">
                Ready to Start Earning?
              </h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto mb-8">
                Join Happy Eats today. Set up in 5 minutes. Start receiving orders immediately.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={scrollToJoin}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-lg px-12 py-7 rounded-2xl shadow-2xl shadow-orange-500/30 font-bold min-h-[56px] group"
                  data-testid="final-cta"
                >
                  Join for Free <ArrowRight className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link href="/vendor/login">
                  <Button variant="outline" size="lg" className="border-white/20 text-white/70 hover:bg-white/10 px-8 py-7 rounded-2xl min-h-[56px]">
                    Already a vendor? Log In
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-10">
                {[
                  { icon: Shield, label: "Verified Platform" },
                  { icon: CreditCard, label: "Daily Payouts" },
                  { icon: Bell, label: "Real-time Orders" },
                ].map((badge, i) => {
                  const Icon = badge.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Icon className="size-4 text-white/60" />
                      </div>
                      <span className="text-[10px] text-white/40 font-medium">{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ═══════ STICKY BOTTOM CTA ═══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b16]/90 backdrop-blur-xl border-t border-white/10 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-3">
            <div className="size-9 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30">
              <ChefHat className="size-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Join Happy Eats</p>
              <p className="text-[10px] text-white/40">$0 to join • 80% revenue • Daily payouts</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={scrollToJoin}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-bold px-8 min-h-[44px] flex-1 sm:flex-none group"
              data-testid="sticky-cta"
            >
              Join for Free <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/vendor/login">
              <Button variant="outline" size="sm" className="border-white/20 text-white/60 hover:bg-white/10 min-h-[44px]">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom spacing for sticky bar */}
      <div className="h-20" />
    </div>
  );
}
