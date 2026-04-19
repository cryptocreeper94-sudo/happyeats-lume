import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Rocket, TrendingUp, DollarSign, Users, CheckCircle,
  Globe, Truck, MapPin, Target, Shield, Zap,
  Calendar, Package, Building2, BarChart3, CreditCard,
  Star, Crown, ArrowRight, Clock, ChefHat, Eye,
  Layers, Phone, Mail, MessageSquare, Store
} from "lucide-react";

export default function ExecutiveSummary() {
  const launchDate = "April 6, 2026";

  const platformStats = [
    { label: "API Endpoints", value: "120+", icon: Layers, color: "text-violet-400" },
    { label: "Database Tables", value: "35+", icon: Building2, color: "text-cyan-400" },
    { label: "Live Features", value: "20+", icon: CheckCircle, color: "text-emerald-400" },
    { label: "Delivery Zones", value: "10", icon: MapPin, color: "text-orange-400" },
  ];

  const scoreCategories = [
    { category: "UI/UX Design", score: 9, color: "bg-emerald-500", note: "Premium dark glassmorphic theme, mobile-first, polished animations" },
    { category: "Feature Breadth", score: 9, color: "bg-emerald-500", note: "120+ endpoints, vendor portal, ordering, admin, chat, marketing, maps" },
    { category: "Feature Depth", score: 6, color: "bg-amber-500", note: "Core flows built; edge cases and real-world testing still needed" },
    { category: "Backend & Data", score: 7, color: "bg-cyan-500", note: "Solid Drizzle ORM, 35+ tables, WebSockets, JWT auth" },
    { category: "Payments/Revenue", score: 7, color: "bg-cyan-500", note: "Stripe live checkout, subscriptions — webhook hardening in progress" },
    { category: "Production Readiness", score: 5, color: "bg-red-500", note: "Works in dev; needs monitoring, rate limiting, backup, load testing" },
    { category: "Vendor Onboarding", score: 8, color: "bg-emerald-500", note: "Beautiful signup, 22 FAQs, marketing toolkit, menu guidance" },
  ];

  const overallScore = 7.5;

  const devCostComparisons = [
    { method: "Solo Senior Full-Stack Dev", timeline: "6-8 months", cost: "$80K - $120K" },
    { method: "Small Team (2 devs + designer)", timeline: "3-4 months", cost: "$120K - $180K" },
    { method: "Agency Build", timeline: "3-5 months", cost: "$200K - $350K" },
    { method: "What We Built (AI-Assisted)", timeline: "~2 weeks", cost: "Fraction of above" },
  ];

  const valuationTimeline = [
    { timeframe: "Now (Pre-Launch)", stage: "MVP Complete", valLow: "$150K", valHigh: "$300K", note: "Tech asset, IP, market potential", color: "border-white/20" },
    { timeframe: "Month 1 (March)", stage: "Live w/ 5-10 vendors", valLow: "$250K", valHigh: "$500K", note: "Proof of concept with real transactions", color: "border-emerald-500/30" },
    { timeframe: "Month 3 (May)", stage: "20-50 vendors, MRR", valLow: "$500K", valHigh: "$1M", note: "Revenue traction + vendor network effects", color: "border-cyan-500/30" },
    { timeframe: "Month 6 (Aug)", stage: "100+ vendors, expansion", valLow: "$1M", valHigh: "$3M", note: "Proven model ready for second market", color: "border-violet-500/30" },
    { timeframe: "Year 1 (Mar 2027)", stage: "Multi-city, strong MRR", valLow: "$3M", valHigh: "$8M", note: "Platform flywheel spinning across markets", color: "border-orange-500/30" },
  ];

  const revenueStreams = [
    { stream: "Service Fee (20% per order)", potential: "Primary", icon: DollarSign },
    { stream: "Delivery Fees ($3.99/order)", potential: "Primary", icon: Package },
    { stream: "Ad-Free Subscription ($5/mo)", potential: "Recurring", icon: Star },
    { stream: "Media Studio Pro ($15/mo)", potential: "Recurring", icon: Crown },
    { stream: "SignalCast Add-On (subscription)", potential: "Recurring", icon: Zap },
    { stream: "Franchise Licensing Fees", potential: "Scale", icon: Building2 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {}
      <div className="relative text-center py-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl mb-5">
            <Rocket className="size-5 text-orange-400" />
            <span className="text-orange-300 font-semibold text-sm">Executive Summary</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent mb-3">Happy Eats / TL Driver Connect</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto mb-2">
            Nationwide driver services platform with food delivery, marketing tools, and franchise model
          </p>
          <p className="text-sm text-emerald-400 font-bold">Launching {launchDate} — Nashville, TN</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platformStats.map((stat, i) => (
          <Card key={i} className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl">
            <CardContent className="p-4 text-center">
              <stat.icon className={`size-6 ${stat.color} mx-auto mb-2`} />
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] text-white/40 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Target className="size-6 text-orange-400" />
            Mission Statement
          </h2>
        </div>
        <CardContent className="p-6">
          <blockquote className="border-l-4 border-orange-500/50 pl-5 py-2">
            <p className="text-lg text-white/80 leading-relaxed italic">
              "To empower commercial drivers, food truck vendors, and local communities by building the most accessible, technology-driven delivery and driver services platform in America — starting one corridor at a time."
            </p>
          </blockquote>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/15">
              <ChefHat className="size-5 text-orange-400 mb-2" />
              <p className="text-sm font-bold text-white mb-1">For Vendors</p>
              <p className="text-xs text-white/40">Zero-cost digital storefront, free marketing tools, automated social media, and access to a built-in customer base</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/15">
              <Truck className="size-5 text-cyan-400 mb-2" />
              <p className="text-sm font-bold text-white mb-1">For Drivers</p>
              <p className="text-xs text-white/40">One-stop hub for food, services, entertainment, expense tracking, and delivery income opportunities</p>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
              <Users className="size-5 text-violet-400 mb-2" />
              <p className="text-sm font-bold text-white mb-1">For Communities</p>
              <p className="text-xs text-white/40">Convenient food delivery from local vendors, supporting small businesses, and building local food ecosystems</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="size-6 text-cyan-400" />
              Platform Assessment
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-sm">Overall:</span>
              <span className="text-3xl font-black text-emerald-400">{overallScore}</span>
              <span className="text-white/30 text-lg">/10</span>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="space-y-3">
            {scoreCategories.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{cat.category}</p>
                  <span className="text-sm font-bold text-white">{cat.score}/10</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color} transition-all`} style={{ width: `${cat.score * 10}%` }} />
                  </div>
                </div>
                <p className="text-[11px] text-white/30">{cat.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <DollarSign className="size-6 text-emerald-400" />
            Development Cost Comparison
          </h2>
        </div>
        <CardContent className="p-6">
          <p className="text-sm text-white/50 mb-4">What it would typically cost to build a platform of this scope and quality:</p>
          <div className="space-y-2">
            {devCostComparisons.map((comp, i) => (
              <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                i === devCostComparisons.length - 1 
                  ? "bg-emerald-500/[0.08] border-emerald-500/20" 
                  : "bg-white/[0.02] border-white/[0.06]"
              }`}>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${i === devCostComparisons.length - 1 ? "text-emerald-300" : "text-white"}`}>{comp.method}</p>
                  <p className="text-xs text-white/40">{comp.timeline}</p>
                </div>
                <Badge className={`text-xs ${
                  i === devCostComparisons.length - 1 
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" 
                    : "bg-white/5 text-white/60 border-white/10"
                }`}>{comp.cost}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20">
            <p className="text-sm text-orange-300 font-medium">
              This platform compresses roughly 4-6 months of traditional development into ~2 weeks of AI-assisted building — representing $150K-$350K in equivalent development value.
            </p>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="size-6 text-violet-400" />
            Valuation Projections (Conservative)
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="space-y-3">
            {valuationTimeline.map((v, i) => (
              <div key={i} className={`p-4 rounded-xl bg-white/[0.02] border ${v.color} hover:bg-white/[0.04] transition-colors`}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div>
                    <p className="text-sm font-bold text-white">{v.timeframe}</p>
                    <p className="text-xs text-white/40">{v.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-400">{v.valLow} — {v.valHigh}</p>
                  </div>
                </div>
                <p className="text-[11px] text-white/30">{v.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <p className="text-xs text-violet-300/80">
              <strong>Note:</strong> These are conservative estimates. If product-market fit is achieved in Nashville and the franchise model proves scalable to a second city, valuation multiples increase significantly. Food delivery + driver services + SaaS subscriptions is a strong combo for investors.
            </p>
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <CreditCard className="size-6 text-amber-400" />
            Revenue Streams
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {revenueStreams.map((rs, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/20 transition-colors">
                <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <rs.icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{rs.stream}</p>
                </div>
                <Badge className={`text-[10px] shrink-0 ${
                  rs.potential === "Primary" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" :
                  rs.potential === "Recurring" ? "bg-violet-500/15 text-violet-300 border-violet-500/25" :
                  "bg-orange-500/15 text-orange-300 border-orange-500/25"
                }`}>{rs.potential}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Shield className="size-6 text-red-400" />
            Critical Path to Launch
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { priority: 1, task: "Order & Pay Flow", desc: "End-to-end: customer orders → vendor accepts → driver picks up → customer receives", status: "In Progress", color: "text-red-400 bg-red-500/10 border-red-500/20" },
              { priority: 2, task: "Stripe Webhook Hardening", desc: "Payment confirmation, refund handling, failed payment recovery", status: "Next", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { priority: 3, task: "Driver Assignment", desc: "Zone-based matching of orders to available drivers", status: "Next", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { priority: 4, task: "Production Hardening", desc: "Error monitoring, rate limiting, database backups, load testing", status: "Planned", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
              { priority: 5, task: "Vendor Recruitment", desc: "Kathy's outreach kit, training docs, 1-on-1 onboarding calls", status: "Planned", color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${item.color}`}>
                <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-sm shrink-0">
                  {item.priority}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{item.task}</p>
                    <Badge className={`text-[9px] ${item.color}`}>{item.status}</Badge>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {}
      <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-white/[0.06]">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Globe className="size-6 text-cyan-400" />
            Market Opportunity
          </h2>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/[0.06] to-rose-500/[0.06] border border-orange-500/15 text-center">
              <p className="text-3xl font-black text-orange-400 mb-1">35M+</p>
              <p className="text-sm text-white font-medium">Commercial Drivers</p>
              <p className="text-[11px] text-white/40">in the United States</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/[0.06] to-blue-500/[0.06] border border-cyan-500/15 text-center">
              <p className="text-3xl font-black text-cyan-400 mb-1">36K+</p>
              <p className="text-sm text-white font-medium">Food Trucks</p>
              <p className="text-[11px] text-white/40">operating nationwide</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/[0.06] to-purple-500/[0.06] border border-violet-500/15 text-center">
              <p className="text-3xl font-black text-violet-400 mb-1">$1.2B</p>
              <p className="text-sm text-white font-medium">Food Truck Industry</p>
              <p className="text-[11px] text-white/40">annual revenue and growing</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-sm text-white/60 leading-relaxed">
              Happy Eats targets the intersection of commercial drivers and food truck vendors — a massively underserved market. No existing platform combines food delivery, driver tools, and vendor self-service into a single franchise-ready solution. The zone-based batch ordering model is uniquely suited to highway corridors and industrial areas where traditional delivery apps don't operate.
            </p>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/investors">
          <Card className="bg-gradient-to-br from-orange-500/[0.06] to-rose-500/[0.06] border border-orange-500/20 backdrop-blur-xl cursor-pointer hover:border-orange-500/40 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-orange-500/15 flex items-center justify-center shrink-0">
                <TrendingUp className="size-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Investor Relations</p>
                <p className="text-xs text-white/40">Full pitch, ROI calculator, and contact form</p>
              </div>
              <ArrowRight className="size-5 text-orange-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/roadmap">
          <Card className="bg-gradient-to-br from-violet-500/[0.06] to-purple-500/[0.06] border border-violet-500/20 backdrop-blur-xl cursor-pointer hover:border-violet-500/40 transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-violet-500/15 flex items-center justify-center shrink-0">
                <Rocket className="size-6 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Launch Roadmap</p>
                <p className="text-xs text-white/40">4-phase plan — launch coming soon</p>
              </div>
              <ArrowRight className="size-5 text-violet-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {}
      <div className="bg-gradient-to-r from-orange-500/[0.06] via-rose-500/[0.06] to-violet-500/[0.06] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent mb-2">Ready to Launch</h3>
          <p className="text-white/40 mb-4 max-w-lg mx-auto">
            Happy Eats is entering its final pre-launch phase. The technology is built, the vendor tools are ready, and Nashville's food truck corridor is waiting.
          </p>
          <p className="text-sm text-orange-400/80">team@dwtl.io | (615) 601-2952</p>
        </div>
      </div>
    </div>
  );
}
