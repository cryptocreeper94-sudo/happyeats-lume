import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, ArrowLeft, Building2, Users, DollarSign, FileText,
  CheckCircle, Clock, Globe, Truck, ChefHat, Zap, Layers,
  Eye, BarChart3, TrendingUp, Lock, Briefcase, Scale,
  ChevronDown, ChevronRight, Copy, Download, Calendar,
  MapPin, Smartphone, MessageCircle, CreditCard, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function Section({ title, icon: Icon, badge, children, defaultOpen = true }: {
  title: string;
  icon: React.ElementType;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl overflow-hidden" data-testid={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
        style={{ minHeight: '56px' }}
        data-testid={`toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
            <Icon className="size-4 text-cyan-400" />
          </div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          {badge && (
            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[10px]">{badge}</Badge>
          )}
        </div>
        {open ? <ChevronDown className="size-4 text-white/30" /> : <ChevronRight className="size-4 text-white/30" />}
      </button>
      {open && <CardContent className="px-5 pb-5 pt-0">{children}</CardContent>}
    </Card>
  );
}

function InfoRow({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className={`text-xs text-right ml-4 ${highlight ? 'text-cyan-400 font-bold' : 'text-white/70'} ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function OrbitStaffingHandoff() {
  const { toast } = useToast();
  const documentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const copyToClipboard = () => {
    const text = `OrbitStaffing Handoff Document — ${documentDate}

OWNERSHIP STRUCTURE
==================
Happy Eats (Food Delivery Platform)
- Kathy Grater: 60% equity (managing partner)
- Jason (Platform Developer): 40% equity
- Transition: Moves to 70% Kathy / 30% Jason at the appointed time
- Kathy holds operational control of Happy Eats Nashville franchise

TL Driver Connect (Driver Services Platform)
- Jason (Platform Developer): 100% equity
- Full ownership of all driver tools, subscriptions, and partnerships

PLATFORM STATUS: Pre-Launch (April 6, 2026)
- 120+ API endpoints live
- 35+ database tables
- 53+ pages and views
- 2 brands (Happy Eats + TL Driver Connect)
- 2 WebSocket servers (Trucker Talk + Signal Chat)
- Stripe payments integrated
- Nashville / Middle TN launch market

REVENUE MODEL
- Transaction fees: 20% service fee on orders
- Delivery fees: $3.99 per delivery
- Subscriptions: $5/mo ad-free, $15/mo Media Studio Pro
- Add-ons: SignalCast automated social media
- Franchise licensing (future)

For questions, contact OrbitStaffing or the platform team.`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#050810]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          <Link href="/command-center" className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Shield className="size-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-tight">OrbitStaffing</span>
              <span className="text-[10px] text-white/30 leading-none">Handoff Document</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="text-white/40 hover:text-white text-xs gap-1.5"
              data-testid="button-copy-summary"
            >
              <Copy className="size-3" /> Copy Summary
            </Button>
            <Link href="/command-center">
              <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs gap-1.5" data-testid="link-back">
                <ArrowLeft className="size-3" /> Back
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center mb-12">
          <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-4">
            <FileText className="size-3 mr-1" /> Confidential
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">
            OrbitStaffing Handoff
          </h1>
          <p className="text-white/40 max-w-xl mx-auto">
            Formal record of ownership, equity structure, platform status, and operational details for Happy Eats and TL Driver Connect.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge className="bg-white/[0.05] text-white/50 border-white/[0.08] text-xs">
              <Calendar className="size-3 mr-1" /> {documentDate}
            </Badge>
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-xs">
              <Lock className="size-3 mr-1" /> Owner Access Only
            </Badge>
          </div>
        </div>

        <Section title="Ownership & Equity Structure" icon={Scale} badge="Critical">
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/[0.08] to-rose-500/[0.05] border border-orange-500/20">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="size-5 text-orange-400" />
                <h3 className="text-base font-bold text-white">Happy Eats</h3>
                <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/20 text-[10px] ml-auto">Food Delivery Platform</Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Current Structure</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Kathy Grater</span>
                      <span className="text-lg font-black text-orange-400">60%</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Jason (Developer)</span>
                      <span className="text-lg font-black text-cyan-400">40%</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '40%' }} />
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Future Structure (at appointed time)</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Kathy Grater</span>
                      <span className="text-lg font-black text-orange-400">70%</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" style={{ width: '70%' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Jason (Developer)</span>
                      <span className="text-lg font-black text-cyan-400">30%</span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <InfoRow label="Managing Partner" value="Kathy Grater" highlight />
                <InfoRow label="Role" value="Nashville franchise operations, vendor recruitment, local partnerships" />
                <InfoRow label="Equity Transition" value="60/40 → 70/30 at the appointed time" highlight />
                <InfoRow label="Launch Market" value="Nashville / Middle TN (Hwy 109 & I-840 corridor)" />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/[0.08] to-violet-500/[0.05] border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="size-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">TL Driver Connect</h3>
                <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/20 text-[10px] ml-auto">Driver Services Platform</Badge>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-4">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Ownership</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Jason (Developer)</span>
                  <span className="text-lg font-black text-cyan-400">100%</span>
                </div>
                <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div className="space-y-1">
                <InfoRow label="Sole Owner" value="Jason (Platform Developer)" highlight />
                <InfoRow label="Scope" value="All driver tools, subscriptions, partnerships, and expansion" />
                <InfoRow label="Revenue Streams" value="Subscriptions, franchise licensing, partnerships" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Platform Overview" icon={Globe} badge="Live in Beta">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { value: "120+", label: "API Endpoints", icon: Zap, color: "text-cyan-400" },
              { value: "35+", label: "Database Tables", icon: Layers, color: "text-violet-400" },
              { value: "53+", label: "Pages & Views", icon: Eye, color: "text-amber-400" },
              { value: "2", label: "Brands / PWAs", icon: Smartphone, color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <s.icon className="size-4 mx-auto mb-1.5 text-white/20" />
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Technology Stack</h4>
              <div className="space-y-1">
                <InfoRow label="Frontend" value="React 19, TypeScript, Tailwind CSS v4, Vite 7" />
                <InfoRow label="Backend" value="Express 5, Node.js" />
                <InfoRow label="Database" value="PostgreSQL (Neon-backed), Drizzle ORM" />
                <InfoRow label="Payments" value="Stripe (checkout, webhooks, subscriptions)" />
                <InfoRow label="AI/ML" value="OpenAI API integration" />
                <InfoRow label="Real-time" value="2 WebSocket servers (Trucker Talk, Signal Chat)" />
                <InfoRow label="Storage" value="Render Object Storage" />
                <InfoRow label="Text-to-Speech" value="ElevenLabs API" />
                <InfoRow label="Hosting" value="Render (development + production)" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Core Features (Built & Working)</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Batch ordering system", "Zone-based delivery", "Vendor self-service",
                  "Signal Chat (encrypted)", "Bilingual EN/ES", "Interactive zone map",
                  "Operations manual", "Marketing hub", "AI content generation",
                  "Trucker Talk community", "Business suite", "CDL directory",
                  "Franchise onboarding", "Admin command center", "Blog platform",
                  "Flyer builder", "Customer accounts", "Rewards & referrals",
                  "Media Studio Pro", "Vendor marketing toolkit", "Fuel finder",
                  "Food truck map", "Order sandbox", "Invite code system",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-[10px] text-white/50 py-0.5">
                    <CheckCircle className="size-2.5 text-emerald-400/60 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Revenue Model" icon={DollarSign}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Active Revenue Streams</h4>
              <div className="space-y-3">
                {[
                  { stream: "Transaction Fees", detail: "20% service fee on all food orders", icon: CreditCard, color: "text-emerald-400" },
                  { stream: "Delivery Fees", detail: "$3.99 per delivery to customers", icon: Truck, color: "text-cyan-400" },
                  { stream: "Ad-Free Subscription", detail: "$5/month — removes all platform ads", icon: Star, color: "text-amber-400" },
                  { stream: "Media Studio Pro", detail: "$15/month — advanced marketing tools", icon: Zap, color: "text-violet-400" },
                  { stream: "SignalCast Add-On", detail: "Automated social media posting for vendors", icon: Globe, color: "text-rose-400" },
                ].map((r) => (
                  <div key={r.stream} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <r.icon className={`size-4 ${r.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-xs font-bold text-white/80">{r.stream}</p>
                      <p className="text-[10px] text-white/30">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Future Revenue</h4>
              <div className="space-y-3">
                {[
                  { stream: "Franchise Licensing", detail: "Monthly licensing fees per market/territory" },
                  { stream: "Premium Vendor Placement", detail: "Featured listings and priority placement" },
                  { stream: "Fleet Management", detail: "Enterprise tools for fleet operators" },
                  { stream: "Advertising", detail: "Sponsored listings and in-app promotions" },
                ].map((r) => (
                  <div key={r.stream} className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <Clock className="size-3 text-white/20 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-white/50">{r.stream}</p>
                      <p className="text-[10px] text-white/25">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Nashville Launch Operations" icon={MapPin} badge="Coming Soon">
          <div className="space-y-1">
            <InfoRow label="Launch Market" value="Nashville / Middle Tennessee" highlight />
            <InfoRow label="Primary Corridor" value="Hwy 109 & I-840 (Lebanon, Mt. Juliet, Wilson County)" />
            <InfoRow label="Food Truck Hub" value="Zone-based batch ordering centered on Hwy 109 & I-840" />
            <InfoRow label="Franchise Operator" value="Kathy Grater (Happy Eats Nashville)" highlight />
            <InfoRow label="Launch Status" value="April 6, 2026" />
            <InfoRow label="Delivery Zones" value="11 zones configured" />
            <InfoRow label="Vendor Onboarding" value="Portal live, ready for recruitment" />
          </div>
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/[0.06] to-rose-500/[0.04] border border-orange-500/15">
            <h4 className="text-xs font-bold text-white/60 mb-2">Pre-Launch Checklist</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { task: "End-to-end order flow testing", status: "In Progress" },
                { task: "Stripe webhook hardening", status: "In Progress" },
                { task: "Driver assignment system", status: "Planned" },
                { task: "Vendor recruitment (first 5–10)", status: "Ready" },
                { task: "Load & stress testing", status: "Planned" },
                { task: "Final QA pass", status: "Planned" },
              ].map((t) => (
                <div key={t.task} className="flex items-center justify-between text-xs py-1">
                  <span className="text-white/40">{t.task}</span>
                  <Badge className={`text-[9px] ${
                    t.status === 'In Progress' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                    t.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                    'bg-white/[0.05] text-white/30 border-white/[0.06]'
                  }`}>{t.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Platform Valuation" icon={TrendingUp} badge="Pre-Launch">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { value: "$1.5M–$3.5M", label: "Pre-Launch Valuation", color: "text-emerald-400" },
              { value: "$750K–$1.4M", label: "Rebuild Cost (US)", color: "text-cyan-400" },
              { value: "6–8", label: "Team Members Needed", color: "text-amber-400" },
              { value: "10–14 mo", label: "Build Timeline", color: "text-violet-400" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <InfoRow label="Monthly Burn Rate (US Team)" value="$70K–$100K/month" />
            <InfoRow label="Offshore Alternative" value="$300K–$600K total" />
            <InfoRow label="Key Valuation Drivers" value="120+ endpoints, dual-brand PWA, franchise model, no direct competitors" />
          </div>
        </Section>

        <Section title="Key Contacts & Roles" icon={Users}>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center">
                  <Building2 className="size-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Kathy Grater</p>
                  <p className="text-[10px] text-white/30">Managing Partner — Happy Eats</p>
                </div>
              </div>
              <div className="space-y-1">
                <InfoRow label="Equity (Current)" value="60% Happy Eats" highlight />
                <InfoRow label="Equity (Future)" value="70% Happy Eats" />
                <InfoRow label="Responsibilities" value="Nashville operations, vendor recruitment, local partnerships, franchise management" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30 flex items-center justify-center">
                  <Zap className="size-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Jason</p>
                  <p className="text-[10px] text-white/30">Platform Developer & Owner</p>
                </div>
              </div>
              <div className="space-y-1">
                <InfoRow label="Equity" value="40% Happy Eats + 100% TL Driver Connect" highlight />
                <InfoRow label="Equity (Future)" value="30% Happy Eats + 100% TL Driver Connect" />
                <InfoRow label="Responsibilities" value="Platform development, technical architecture, system admin, all technology decisions" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="External Dependencies & Integrations" icon={Layers} defaultOpen={false}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Production Services</h4>
              <div className="space-y-1">
                <InfoRow label="Database" value="PostgreSQL (Neon-backed)" />
                <InfoRow label="ORM" value="Drizzle ORM" />
                <InfoRow label="Payments" value="Stripe" />
                <InfoRow label="AI/ML" value="OpenAI API" />
                <InfoRow label="Object Storage" value="Render Object Storage" />
                <InfoRow label="Text-to-Speech" value="ElevenLabs API" />
                <InfoRow label="Social Media" value="Facebook, Instagram, X (Twitter)" />
                <InfoRow label="Automated Posting" value="SignalCast" />
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Ecosystem & Infrastructure</h4>
              <div className="space-y-1">
                <InfoRow label="Trust Layer Hub" value="API integration (dwtl.io)" />
                <InfoRow label="Orbit Financial Hub" value="Client integration" />
                <InfoRow label="DarkWave Shared Components" value="Footer, announcement bar, trust badge" />
                <InfoRow label="Ecosystem Widget" value="dwtl.io widget loader" />
                <InfoRow label="Blockchain" value="Solana (planned)" />
                <InfoRow label="Hosting" value="Render" />
                <InfoRow label="Domain" value="dwtl.io ecosystem" />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Subscription Tiers" icon={CreditCard} defaultOpen={false}>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Free Tier",
                price: "$0/mo",
                color: "from-white/[0.05] to-white/[0.02]",
                border: "border-white/[0.08]",
                features: ["Basic food ordering", "Browse vendors & menus", "Community access (Trucker Talk)", "Basic business tools"],
              },
              {
                name: "Ad-Free",
                price: "$5/mo",
                color: "from-cyan-500/[0.08] to-blue-500/[0.05]",
                border: "border-cyan-500/20",
                features: ["Everything in Free", "No ads across platform", "Priority support", "Enhanced profile"],
              },
              {
                name: "Media Studio Pro",
                price: "$15/mo",
                color: "from-violet-500/[0.08] to-purple-500/[0.05]",
                border: "border-violet-500/20",
                features: ["Everything in Ad-Free", "AI Flyer Creator", "Media Editor Pro", "Print Studio", "Social media templates"],
              },
            ].map((tier) => (
              <div key={tier.name} className={`p-4 rounded-xl bg-gradient-to-br ${tier.color} border ${tier.border}`}>
                <p className="text-xs text-white/40 mb-1">{tier.name}</p>
                <p className="text-xl font-black text-white mb-3">{tier.price}</p>
                <div className="space-y-1.5">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-[10px] text-white/50">
                      <CheckCircle className="size-2.5 text-emerald-400/60 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Globe className="size-3 text-rose-400" />
              <p className="text-xs text-white/50"><span className="font-bold text-white/70">SignalCast Add-On:</span> Automated social media posting — separate subscription for vendors</p>
            </div>
          </div>
        </Section>

        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/[0.06] to-violet-500/[0.04] border border-cyan-500/15 text-center">
          <Lock className="size-6 text-cyan-400/60 mx-auto mb-3" />
          <p className="text-sm text-white/60 mb-1">This document is for internal use by OrbitStaffing and platform ownership only.</p>
          <p className="text-[10px] text-white/25">Generated {documentDate} — TL Driver Connect / Happy Eats Platform</p>
        </div>
      </div>
    </div>
  );
}