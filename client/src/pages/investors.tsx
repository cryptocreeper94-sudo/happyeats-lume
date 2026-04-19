import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Shield, ArrowRight, TrendingUp, DollarSign, Users, CheckCircle,
  Globe, Truck, ChefHat, MapPin, Star, Sparkles, Building2,
  BarChart3, Target, Rocket, Crown, Award, Zap, Play,
  PieChart, Receipt, Layers, Lock, ArrowUp, Phone, Mail,
  Send, Clock, Package, Smartphone, MessageCircle,
  ChevronDown, ChevronRight, Eye
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/context";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";

import investorHero from "@/assets/images/investor-hero.jpg";
import driverEating from "@/assets/images/driver-eating.jpg";
import foodTruckBusy from "@/assets/images/food-truck-busy.jpg";
import franchiseOwner from "@/assets/images/franchise-owner.jpg";
import deliveryDriver from "@/assets/images/delivery-driver.jpg";
import citySkyline from "@/assets/images/city-skyline.jpg";

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, value]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function ROICalculator() {
  const { t } = useLanguage();
  const [cities, setCities] = useState(5);
  const [trucksPerCity, setTrucksPerCity] = useState(20);
  const [avgOrderValue, setAvgOrderValue] = useState(18);

  const projections = useMemo(() => {
    const totalTrucks = cities * trucksPerCity;
    const dailyOrdersPerTruck = 12;
    const dailyOrders = totalTrucks * dailyOrdersPerTruck;
    const monthlyOrders = dailyOrders * 26;
    const grossRevenue = monthlyOrders * avgOrderValue;
    const serviceFee = grossRevenue * 0.20;
    const deliveryFees = monthlyOrders * 3.99;
    const totalRevenue = serviceFee + deliveryFees;
    const operatingCosts = totalRevenue * 0.30;
    const platformShare = (totalRevenue - operatingCosts) * 0.20;
    const annualPlatformRevenue = platformShare * 12;
    return { totalTrucks, dailyOrders, monthlyOrders, grossRevenue, totalRevenue, platformShare, annualPlatformRevenue };
  }, [cities, trucksPerCity, avgOrderValue]);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: t("investors.activeCities"), value: cities, setter: setCities, min: 1, max: 50, step: 1, display: `${cities}` },
          { label: t("investors.trucksPerCity"), value: trucksPerCity, setter: setTrucksPerCity, min: 5, max: 100, step: 5, display: `${trucksPerCity}` },
          { label: t("investors.avgOrderValue"), value: avgOrderValue, setter: setAvgOrderValue, min: 10, max: 40, step: 1, display: `$${avgOrderValue}` },
        ].map((s) => (
          <div key={s.label} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white/70 text-sm">{s.label}</Label>
              <span className="text-cyan-400 font-bold text-sm tabular-nums">{s.display}</span>
            </div>
            <Slider value={[s.value]} onValueChange={(v) => s.setter(v[0])} min={s.min} max={s.max} step={s.step} className="w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t("investors.totalTrucks"), value: projections.totalTrucks.toLocaleString(), color: "text-white" },
          { label: t("investors.monthlyOrders"), value: projections.monthlyOrders.toLocaleString(), color: "text-white" },
          { label: t("investors.monthlyGMV"), value: `$${(projections.grossRevenue / 1000).toFixed(0)}K`, color: "text-emerald-400" },
          { label: t("investors.platformRevYear"), value: `$${(projections.annualPlatformRevenue / 1000000).toFixed(1)}M`, color: "text-cyan-400", highlight: true },
        ].map((m) => (
          <div key={m.label} className={`p-4 rounded-xl text-center ${m.highlight ? 'bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/20' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{m.label}</p>
            <p className={`text-xl md:text-2xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InvestorsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const submitContact = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const res = await fetch("/api/franchise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "investor" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { setSubmitted(true); toast({ title: t("investors.thankYouToast") }); },
    onError: () => { setSubmitted(true); toast({ title: t("investors.receivedToast") }); },
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", firm: "", message: "" });

  const marketStats = [
    { value: 3800000, prefix: "", suffix: "+", label: t("investors.commercialTrucks"), icon: Truck },
    { value: 35000, prefix: "", suffix: "+", label: t("investors.foodTrucksNationwide"), icon: ChefHat },
    { value: 1200000000, prefix: "$", suffix: "", label: t("investors.marketOpportunity"), icon: Target },
    { value: 0, prefix: "", suffix: "ZERO", label: t("investors.directCompetitors"), icon: Shield },
  ];

  return (
    <PageLanguageProvider>
    <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050810]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Shield className="size-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-tight">
                TL Driver<span className="text-cyan-400">Connect</span>
              </span>
              <span className="text-[10px] text-white/30 leading-none">{t("investors.title")}</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <PageLanguageToggle />
            <Link href="/demo">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs hidden md:flex gap-1.5" data-testid="link-demo">
                <Play className="size-3" /> {t("investors.liveDemo")}
              </Button>
            </Link>
            <Link href="/franchise">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs hidden md:flex" data-testid="link-franchise">
                {t("investors.franchiseInfo")}
              </Button>
            </Link>
            <a href="#contact">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20" data-testid="button-contact-nav">
                {t("investors.getInTouch")} <ArrowRight className="size-3 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </nav>

      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-[95vh] flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={investorHero} alt="" className="w-full h-full object-cover opacity-20 brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/60 via-[#050810]/80 to-[#050810]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,_rgba(6,182,212,0.08),_transparent)]" />
        </div>

        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center max-w-5xl mx-auto px-4"
        >
          <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-6 py-1.5 px-5 text-xs backdrop-blur-md" data-testid="badge-investor">
            <Crown className="size-3 mr-1.5" /> {t("investors.investmentOpportunity")}
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            {t("investors.heroTitle1")}{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {t("investors.heroTitle2")}
            </span>{" "}
            {t("investors.heroTitle3")}
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              {t("investors.heroTitle4")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("investors.heroDesc")}
            <span className="text-white/80 font-medium"> {t("investors.heroDescBold")}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#opportunity">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-6 text-base shadow-2xl shadow-cyan-500/20 w-full sm:w-auto" data-testid="button-view-opportunity">
                {t("investors.viewOpportunity")} <ArrowRight className="size-5 ml-2" />
              </Button>
            </a>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="border-white/[0.06] text-white/70 hover:text-white hover:bg-white/5 px-10 py-6 text-base w-full sm:w-auto" data-testid="button-try-demo">
                <Play className="size-5 mr-2" /> {t("investors.liveDemo")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {marketStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl hover:border-white/10 transition-colors">
                  <CardContent className="p-4 text-center">
                    <stat.icon className="size-5 text-cyan-400/60 mx-auto mb-2" />
                    <p className="text-xl md:text-2xl font-black text-white tabular-nums">
                      {stat.suffix === "ZERO" ? "ZERO" : <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />}
                    </p>
                    <p className="text-[10px] text-white/30 leading-tight mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="size-6 text-white/20" />
        </motion.div>
      </motion.section>

      <section id="opportunity" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-4">
              <Target className="size-3 mr-1" /> {t("investors.marketOpportunity")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">{t("investors.whiteSpace")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">{t("investors.whiteSpaceDesc")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden h-80 group">
              <img src={driverEating} alt="" className="w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 mb-3">{t("investors.theProblem")}</Badge>
                <h3 className="text-xl font-bold text-white mb-2">{t("investors.problemTitle")}</h3>
                <p className="text-sm text-white/60">{t("investors.problemDesc")}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden h-80 group">
              <img src={foodTruckBusy} alt="" className="w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">{t("investors.theSolution")}</Badge>
                <h3 className="text-xl font-bold text-white mb-2">{t("investors.solutionTitle")}</h3>
                <p className="text-sm text-white/60">{t("investors.solutionDesc")}</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "TAM", value: t("investors.tamValue"), desc: t("investors.tamDesc"), gradient: "from-cyan-500/10 to-blue-500/10", border: "border-cyan-500/15" },
              { title: "SAM", value: t("investors.samValue"), desc: t("investors.samDesc"), gradient: "from-violet-500/10 to-purple-500/10", border: "border-violet-500/15" },
              { title: "SOM", value: t("investors.somValue"), desc: t("investors.somDesc"), gradient: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-500/15" },
            ].map((m, i) => (
              <motion.div key={m.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`bg-gradient-to-br ${m.gradient} ${m.border} backdrop-blur-xl h-full`}>
                  <CardContent className="p-6">
                    <p className="text-xs text-white/40 uppercase tracking-[0.2em] mb-2">{m.title}</p>
                    <p className="text-3xl md:text-4xl font-black text-white mb-3">{m.value}</p>
                    <p className="text-xs text-white/50 leading-relaxed">{m.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4">
              <Layers className="size-3 mr-1" /> {t("investors.businessModel")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">{t("investors.threeRevenueEngines")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">{t("investors.threeRevenueDesc")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { title: t("investors.orderCommissions"), value: "20%", desc: t("investors.orderCommissionsDesc"), icon: Receipt, gradient: "from-orange-500 to-rose-500", glow: "shadow-orange-500/20" },
              { title: t("investors.deliveryFees"), value: "$3.99–5.99", desc: t("investors.deliveryFeesDesc"), icon: Truck, gradient: "from-cyan-500 to-blue-500", glow: "shadow-cyan-500/20" },
              { title: t("investors.franchiseLicensing"), value: "20%", desc: t("investors.franchiseLicensingDesc"), icon: Building2, gradient: "from-violet-500 to-purple-500", glow: "shadow-violet-500/20" },
            ].map((r, i) => (
              <motion.div key={r.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`bg-white/[0.03] border-white/[0.06] hover:border-white/10 transition-all h-full group hover:shadow-xl ${r.glow}`}>
                  <CardContent className="p-6">
                    <div className={`size-14 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                      <r.icon className="size-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{r.title}</h3>
                    <p className="text-3xl font-black text-white mb-3">{r.value}</p>
                    <p className="text-sm text-white/40 leading-relaxed">{r.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="size-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white">{t("investors.unitEconomics")}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: t("investors.avgOrder"), value: "$18", color: "text-white" },
                  { label: t("investors.dailyOrders"), value: "180+", color: "text-white" },
                  { label: t("investors.monthlyGMV"), value: "$84K", color: "text-emerald-400" },
                  { label: t("investors.platformTake"), value: "$2.5K/mo", color: "text-cyan-400" },
                  { label: t("investors.paybackPeriod"), value: "<6 months", color: "text-amber-400" },
                ].map((u) => (
                  <div key={u.label} className="text-center p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{u.label}</p>
                    <p className={`text-xl font-bold ${u.color}`}>{u.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-4">
              <Shield className="size-3 mr-1" /> {t("investors.competitiveMoat")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">{t("investors.whyUsWhyNow")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">{t("investors.whyUsDesc")}</p>
          </div>

          <div className="space-y-4">
            {[
              { title: t("investors.firstMover"), desc: t("investors.firstMoverDesc"), icon: Crown, color: "from-amber-500 to-orange-500" },
              { title: t("investors.franchisePowered"), desc: t("investors.franchisePoweredDesc"), icon: Building2, color: "from-violet-500 to-purple-500" },
              { title: t("investors.networkEffects"), desc: t("investors.networkEffectsDesc"), icon: Zap, color: "from-cyan-500 to-blue-500" },
              { title: t("investors.trustLayerVerification"), desc: t("investors.trustLayerDesc"), icon: Shield, color: "from-emerald-500 to-teal-500" },
              { title: t("investors.fullStackPlatform"), desc: t("investors.fullStackDesc"), icon: Layers, color: "from-rose-500 to-pink-500" },
            ].map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="bg-white/[0.03] border-white/[0.06] hover:border-white/10 transition-all group">
                  <CardContent className="p-6 flex items-start gap-5">
                    <div className={`size-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                      <a.icon className="size-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{a.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0">
          <img src={citySkyline} alt="" className="w-full h-full object-cover opacity-10 brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#050810]/80 to-[#050810]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 mb-4">
              <Rocket className="size-3 mr-1" /> {t("investors.growthRoadmap")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">{t("investors.scalePlan")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">{t("investors.scalePlanDesc")}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { phase: "Q1 2026", title: t("investors.nashvilleLaunch"), desc: t("investors.nashvilleLaunchDesc"), badge: "ACTIVE", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: MapPin, gradient: "from-emerald-500 to-teal-500" },
              { phase: "Q2 2026", title: t("investors.publicLaunch"), desc: t("investors.publicLaunchDesc"), badge: "NEXT", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30", icon: Target, gradient: "from-cyan-500 to-blue-500" },
              { phase: "Q3 2026", title: t("investors.franchiseExpansion"), desc: t("investors.franchiseExpansionDesc"), badge: "PLANNED", badgeColor: "bg-violet-500/20 text-violet-300 border-violet-500/30", icon: TrendingUp, gradient: "from-violet-500 to-purple-500" },
              { phase: "Q4 2026", title: t("investors.nativeAppsScale"), desc: t("investors.nativeAppsScaleDesc"), badge: "VISION", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: Globe, gradient: "from-amber-500 to-orange-500" },
            ].map((p, i) => (
              <motion.div key={p.phase} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl h-full hover:border-white/10 transition-all">
                  <CardContent className="p-5">
                    <Badge className={`${p.badgeColor} text-[10px] mb-3`}>{p.badge}</Badge>
                    <div className={`size-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                      <p.icon className="size-5 text-white" />
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{p.phase}</p>
                    <h3 className="text-sm font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-4">
              <Package className="size-3 mr-1" /> {t("investors.platformDemo")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-rose-200 bg-clip-text text-transparent">{t("investors.seeItInAction")}</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">{t("investors.seeItDesc")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { title: t("investors.customerOrders"), desc: t("investors.customerOrdersDesc"), href: "/zones", image: foodTruckBusy, cta: t("investors.tryOrdering") },
              { title: t("investors.vendorDashboard"), desc: t("investors.vendorDashboardDesc"), href: "/vendor-portal", image: franchiseOwner, cta: t("investors.seeVendorView") },
              { title: t("investors.driverDelivery"), desc: t("investors.driverDeliveryDesc"), href: "/sandbox", image: deliveryDriver, cta: t("investors.seeDriverView") },
            ].map((d, i) => (
              <motion.div key={d.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link href={d.href}>
                  <Card className="bg-white/[0.03] border-white/[0.06] hover:border-white/10 transition-all cursor-pointer group overflow-hidden h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img src={d.image} alt="" className="w-full h-full object-cover brightness-110 group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-base font-bold text-white">{d.title}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-white/40 mb-3">{d.desc}</p>
                      <div className="flex items-center gap-1 text-cyan-400 text-xs font-medium group-hover:gap-2 transition-all">
                        {d.cta} <ChevronRight className="size-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/demo">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 shadow-lg shadow-cyan-500/20" data-testid="button-full-demo">
                <Play className="size-5 mr-2" /> {t("investors.interactiveDemo")}
              </Button>
            </Link>
            <Link href="/franchise">
              <Button size="lg" variant="outline" className="border-white/[0.06] text-white/60 hover:text-white px-8" data-testid="button-franchise-details">
                {t("investors.franchiseDetails")} <ArrowRight className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-4">
              <BarChart3 className="size-3 mr-1" /> Financial Projections
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">Revenue Model Calculator</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Adjust the levers to see platform-level revenue projections at scale.</p>
          </div>

          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl max-w-4xl mx-auto">
            <CardContent className="p-6 md:p-10">
              <ROICalculator />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 mb-4">
              <Sparkles className="size-3 mr-1" /> Traction
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">What's Already Built</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">This isn't a pitch deck. The platform is live in beta — public launch coming soon.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { value: "120+", label: "API Endpoints", icon: Zap },
              { value: "41", label: "Database Tables", icon: Layers },
              { value: "53+", label: "Pages & Views", icon: Eye },
              { value: "2", label: "Languages (EN/ES)", icon: Globe },
            ].map((t) => (
              <Card key={t.label} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                <CardContent className="p-4 text-center">
                  <t.icon className="size-5 text-amber-400/60 mx-auto mb-2" />
                  <p className="text-2xl font-black text-white">{t.value}</p>
                  <p className="text-[10px] text-white/30 mt-1">{t.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="size-4 text-emerald-400" /> Built & Working
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Batch ordering system", "Zone-based delivery", "Vendor self-service portal",
                    "Signal Chat (encrypted)", "Bilingual English/Spanish", "Interactive zone map",
                    "Operations manual", "Marketing hub", "AI content generation",
                    "Trucker Talk (community)", "Business suite", "CDL directory",
                    "Franchise onboarding wizard", "Admin command center", "Blog platform",
                    "Flyer builder", "Real-time WebSocket comms", "Trust Layer ecosystem",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-white/50 py-1">
                      <CheckCircle className="size-3 text-emerald-400/60 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Rocket className="size-4 text-cyan-400" /> Coming Next
                </h3>
                <div className="space-y-3">
                  {[
                    { item: "Stripe payments live", timeline: "Q2 2026", status: "In progress" },
                    { item: "SMS order notifications", timeline: "Q2 2026", status: "In progress" },
                    { item: "Public launch", timeline: "Coming Soon", status: "Planned" },
                    { item: "Franchise portal", timeline: "Q3 2026", status: "Planned" },
                    { item: "Second market expansion", timeline: "Q3 2026", status: "Planned" },
                    { item: "Native mobile apps", timeline: "Q4 2026", status: "Planned" },
                    { item: "Nationwide scaling", timeline: "Q4 2026", status: "Planned" },
                    { item: "Fleet management integration", timeline: "Q4 2026", status: "Research" },
                  ].map((r) => (
                    <div key={r.item} className="flex items-center justify-between text-xs">
                      <span className="text-white/50">{r.item}</span>
                      <Badge className="bg-white/[0.05] text-white/30 border-white/[0.06] text-[9px]">{r.timeline}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 relative" id="valuation">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4">
              <DollarSign className="size-3 mr-1" /> Pre-Launch Analysis
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent">Platform Valuation & Build Cost</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">What this platform is worth, what it would cost to rebuild, and the team required.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { value: "$1.5M–$3.5M", label: "Pre-Launch Valuation", color: "text-emerald-400", icon: TrendingUp },
              { value: "$750K–$1.4M", label: "Rebuild Cost (US)", color: "text-cyan-400", icon: DollarSign },
              { value: "6–8", label: "Team Members Needed", color: "text-amber-400", icon: Users },
              { value: "10–14 mo", label: "Build Timeline", color: "text-violet-400", icon: Clock },
            ].map((s) => (
              <Card key={s.label} className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl" data-testid={`valuation-stat-${s.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-4 text-center">
                  <s.icon className="size-5 text-white/30 mx-auto mb-2" />
                  <p className={`text-xl md:text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-white/30 mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-400" /> Valuation Drivers
                </h3>
                <div className="space-y-3">
                  {[
                    { factor: "120+ production API endpoints", detail: "Not a prototype — production-grade backend" },
                    { factor: "Dual-brand PWA architecture", detail: "Two apps sharing one codebase — strong IP" },
                    { factor: "Multi-tenant franchise model", detail: "Scalable beyond Nashville without rebuilding" },
                    { factor: "Revenue infrastructure live", detail: "Stripe payments, 2-tier subscriptions, add-on upsells" },
                    { factor: "AI + real-time features", detail: "OpenAI integration, dual WebSocket chat systems" },
                    { factor: "Vendor self-service portal", detail: "Reduces onboarding costs significantly" },
                    { factor: "Zone-based delivery system", detail: "Scalable logistics infrastructure built-in" },
                    { factor: "No direct competitors", detail: "First mover in driver-focused food delivery niche" },
                  ].map((v) => (
                    <div key={v.factor} className="group">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="size-3 text-emerald-400/60 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-white/70 font-medium">{v.factor}</p>
                          <p className="text-[10px] text-white/30">{v.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardContent className="p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="size-4 text-cyan-400" /> Development Cost Breakdown
                </h3>
                <div className="space-y-2">
                  {[
                    { role: "Senior Full-Stack Lead", count: "1", rate: "$14K–$18K/mo", months: "10–14" },
                    { role: "Frontend Developer", count: "2", rate: "$10K–$14K/mo each", months: "10–14" },
                    { role: "Backend Developer", count: "1–2", rate: "$12K–$16K/mo each", months: "10–14" },
                    { role: "UI/UX Designer", count: "1", rate: "$8K–$12K/mo", months: "6–8" },
                    { role: "DevOps / QA", count: "1", rate: "$10K–$14K/mo", months: "8–10" },
                    { role: "Project Manager", count: "1", rate: "$8K–$12K/mo", months: "10–14" },
                  ].map((r) => (
                    <div key={r.role} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex-1">
                        <p className="text-xs text-white/70 font-medium">{r.role}</p>
                        <p className="text-[10px] text-white/30">{r.count} person(s) · {r.months} months</p>
                      </div>
                      <span className="text-xs text-cyan-400/80 font-mono tabular-nums">{r.rate}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">Monthly burn rate (US team)</span>
                    <span className="text-sm font-bold text-white">$70K–$100K</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/50">Offshore alternative</span>
                    <span className="text-sm font-bold text-emerald-400">$300K–$600K total</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-violet-500/[0.08] to-cyan-500/[0.05] border-violet-500/20 backdrop-blur-xl">
            <CardContent className="p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="size-4 text-violet-400" /> What Makes This Platform Expensive to Build
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: "Dual-Brand System", desc: "Two separate PWAs with distinct navigation, theming, and identity sharing one codebase" },
                  { title: "Real-Time Infra", desc: "Two WebSocket servers powering Trucker Talk community and Signal Chat with 8 channels" },
                  { title: "Vendor Ecosystem", desc: "Self-service portal, menu management, marketing toolkit with 8 sections, invite codes" },
                  { title: "Payment Stack", desc: "Stripe checkout, webhook handling, tiered subscriptions, add-on upsells, receipt generation" },
                  { title: "Zone-Based Delivery", desc: "Interactive maps, driver assignment logic, multi-truck ordering, batch processing" },
                  { title: "Admin Suite", desc: "Command center with 9 categories, revenue analytics, franchise management tools" },
                  { title: "Marketing Tools", desc: "Flyer editors, AI creator, media studio, social media automation, QR codes" },
                  { title: "Customer System", desc: "Registration, rewards, referrals, order history, reordering, phone/password auth" },
                ].map((c) => (
                  <div key={c.title} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs font-bold text-white mb-1">{c.title}</p>
                    <p className="text-[10px] text-white/30 leading-relaxed">{c.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/[0.02] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 mb-4">
              <Users className="size-3 mr-1" /> Leadership
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">The Team</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl overflow-hidden group">
              <div className="relative h-56 overflow-hidden">
                <img src={franchiseOwner} alt="" className="w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] mb-1">Founder & CEO</Badge>
                  <h3 className="text-lg font-bold text-white">Kathy</h3>
                  <p className="text-xs text-white/50">Nashville Operations</p>
                </div>
              </div>
              <CardContent className="p-5">
                <p className="text-xs text-white/40 leading-relaxed">First franchisee-operator. Built the Nashville I-24 Corridor territory from zero. Deep knowledge of driver communities and food truck vendor relationships.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl overflow-hidden group">
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-violet-500/20 via-cyan-500/10 to-blue-500/20 flex items-center justify-center">
                <div className="size-24 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white group-hover:scale-105 transition-transform">
                  J
                </div>
                <div className="absolute bottom-4 left-5">
                  <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] mb-1">CTO</Badge>
                  <h3 className="text-lg font-bold text-white">Jason</h3>
                  <p className="text-xs text-white/50">Orbit Staffing</p>
                </div>
              </div>
              <CardContent className="p-5">
                <p className="text-xs text-white/40 leading-relaxed">Full-stack architect. Built the entire platform — 120+ API endpoints, 41 database tables, 53+ pages, real-time WebSockets, AI integrations, and the franchise replication engine.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent" />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-4">
              <Send className="size-3 mr-1" /> {t("investors.getInTouch")}
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">{t("investors.connectWithTeam")}</h2>
            <p className="text-white/40 max-w-xl mx-auto text-lg">{t("investors.connectDesc")}</p>
          </div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                <div className="size-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                  <CheckCircle className="size-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{t("investors.thankYouTitle")}</h3>
                <p className="text-white/40 mb-8">{t("investors.thankYouDesc")}</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/demo">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold">
                      <Play className="size-4 mr-2" /> {t("investors.explorePlatform")}
                    </Button>
                  </Link>
                  <Link href="/franchise">
                    <Button variant="outline" className="border-white/[0.06] text-white/60">
                      {t("investors.franchiseDetails")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                  <CardContent className="p-6 md:p-8">
                    <form onSubmit={(e) => { e.preventDefault(); submitContact.mutate(form); }} className="space-y-5">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/60 text-xs">{t("investors.fullName")} *</Label>
                          <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required className="bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20" placeholder="Your name" data-testid="input-name" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/60 text-xs">{t("investors.firmOrg")}</Label>
                          <Input value={form.firm} onChange={(e) => setForm(p => ({ ...p, firm: e.target.value }))} className="bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20" placeholder="Company name" data-testid="input-firm" />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white/60 text-xs">Email *</Label>
                          <Input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required className="bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20" placeholder="you@firm.com" data-testid="input-email" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/60 text-xs">Phone</Label>
                          <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20" placeholder="(555) 000-0000" data-testid="input-phone" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60 text-xs">{t("investors.messageOptional")}</Label>
                        <Textarea value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} rows={4} className="bg-white/[0.05] border-white/[0.06] text-white placeholder:text-white/20 resize-none" placeholder="Tell us about your interest..." data-testid="input-message" />
                      </div>
                      <Button type="submit" size="lg" disabled={submitContact.isPending} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 shadow-xl shadow-cyan-500/20" data-testid="button-submit-contact">
                        {submitContact.isPending ? t("investors.sending") : t("investors.sendRequest")} <Send className="size-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer className="border-t border-white/[0.04] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white">
                <Shield className="size-4" />
              </div>
              <span className="font-bold text-white/60">TL Driver<span className="text-cyan-400/60">Connect</span></span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-white/30">
              <Link href="/franchise" className="hover:text-white/60 transition-colors">{t("franchise.title")}</Link>
              <Link href="/demo" className="hover:text-white/60 transition-colors">{t("demo.title")}</Link>
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 text-xs text-white/30 justify-end mb-1">
                <a href="mailto:team@dwtl.io" className="hover:text-white/60 transition-colors flex items-center gap-1"><Mail className="size-3" /> team@dwtl.io</a>
                <a href="tel:+16156012952" className="hover:text-white/60 transition-colors flex items-center gap-1"><Phone className="size-3" /> (615) 601-2952</a>
              </div>
              <p className="text-[10px] text-white/20">2026 TL Driver Connect. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </PageLanguageProvider>
  );
}
