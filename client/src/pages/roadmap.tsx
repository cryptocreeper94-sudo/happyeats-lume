import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Rocket, CheckCircle2, Clock, Sparkles, 
  CreditCard, MessageSquare, Navigation, MapPin,
  Truck, Package, Users, BarChart3, Bell, Store, Link2,
  Receipt, Building2, Layers, Globe, Printer, FileText, ChevronRight,
  Shield, Zap, Target, TrendingUp,
  Calendar, Eye, Share2, Camera, Headphones, AlertTriangle,
  CircleDot, FolderOpen, Image, Fuel, Map, TestTube,
  Mail, Phone, HandshakeIcon, Scale
} from "lucide-react";

export default function Roadmap() {

  const completedFeatures = [
    { icon: Truck, name: "Driver Dashboard", desc: "Full-featured hub with break timer, news feed, games & entertainment" },
    { icon: Navigation, name: "GPS Concierge", desc: "Find nearby stores, truck stops, and services with real directions" },
    { icon: Package, name: "Zone-Based Ordering", desc: "Batch delivery system for 840/109/I-24 corridor with lunch & dinner cutoffs" },
    { icon: Store, name: "Vendor Self-Service Portal", desc: "Full signup with digital agreements, menu management, daily check-in, order dashboard, FAQ, and post-signup guidance" },
    { icon: HandshakeIcon, name: "Vendor Legal Agreements", desc: "TOS, Privacy Policy, Vendor Agreement with digital signature, IP/timestamp tracking, and email confirmation" },
    { icon: Clock, name: "HOS Break Timer", desc: "DOT-compliant rest break tracking with configurable alarms" },
    { icon: MapPin, name: "11-Zone Delivery Map", desc: "Interactive Middle Tennessee zone map with real-time status and admin controls" },
    { icon: Map, name: "Food Truck Map", desc: "Visual truck pins with details, availability, and location info" },
    { icon: Users, name: "Admin Command Center", desc: "PIN-protected 9-category hub with quick access, photorealistic cards, and partner links" },
    { icon: BarChart3, name: "Marketing Hub", desc: "AI content generation, social media scheduler, weekly content calendar, brand assets" },
    { icon: Receipt, name: "Business Suite", desc: "Expense tracking, mileage logger with IRS deductions, CSV export" },
    { icon: Building2, name: "Multi-Tenant Franchise", desc: "Isolated data, branding, and config per franchise region" },
    { icon: Link2, name: "Trust Layer Ecosystem", desc: "dwtl.io integration, ORBIT Hub, Solana blockchain stamps, ecosystem directory page" },
    { icon: MessageSquare, name: "Signal Chat", desc: "8-channel real-time WebSocket communication with vendor support desk" },
    { icon: Globe, name: "Full Bilingual Support", desc: "Complete English/Spanish throughout every page and feature" },
    { icon: Sparkles, name: "Vendor Marketing Toolkit", desc: "8 sections: Business Cards, Flyers, Media Studio, Social & Brand, SignalCast, Receipt Scanner, Software, Payroll & HR" },
    { icon: FileText, name: "Operations Manual", desc: "A-Z reference guide with deep links to every app section" },
    { icon: Eye, name: "Document Scanner (OCR)", desc: "Built-in Tesseract.js — scan receipts & BOLs for free" },
    { icon: CreditCard, name: "Stripe Payments", desc: "Live checkout sessions, subscription billing, webhook handler, receipt generation" },
    { icon: Users, name: "Customer Accounts", desc: "Registration, login, profiles, order history, rewards ledger, referral program" },
    { icon: Bell, name: "Push Notifications", desc: "Web push (VAPID) for order status updates with service worker" },
    { icon: Phone, name: "SMS Notifications (Twilio)", desc: "Order confirmations, status updates, and vendor alerts via text message" },
    { icon: Mail, name: "Email Notifications (Resend)", desc: "Order confirmations, status updates, vendor welcome emails with agreement records" },
    { icon: Zap, name: "SignalCast Integration", desc: "Automated social posting for Facebook, Instagram & X — subscription add-on (Coming Soon)" },
    { icon: Image, name: "AI Flyer Creator", desc: "Describe what you want, AI generates copy and images — 4 styles, bilingual" },
    { icon: FolderOpen, name: "Flyer Catalog & Vault", desc: "3 pre-made flyer designs x 2 languages with Save to Vault, download PNG/PDF, print" },
    { icon: Printer, name: "Flyer & Business Card Editors", desc: "Customer flyers, partner recruitment flyers, business card designer with 6 templates" },
    { icon: Shield, name: "Rate Limiting & Security", desc: "API rate limits (auth: 10/15min, general: 100/min), bot prerender for SEO/AdSense" },
    { icon: Layers, name: "PWA Support", desc: "Manifest, service worker with precaching, offline fallback, push subscription" },
    { icon: Fuel, name: "Fuel Finder", desc: "Curated fuel/EV station directory with GPS sorting, search/filter, Google Maps integration" },
    { icon: TrendingUp, name: "Revenue Analytics Dashboard", desc: "Admin dashboard with charts, order metrics, and financial overview" },
    { icon: Share2, name: "Investor & Demo Pages", desc: "Dedicated investor relations page and interactive guided platform demo" },
    { icon: Store, name: "Invite Code System", desc: "Admin-managed vendor signup incentives with 5 perk types, usage tracking, expiration" },
    { icon: MessageSquare, name: "Trucker Talk", desc: "Real-time WebSocket chat for drivers with community features" },
    { icon: Scale, name: "SEO Bot Prerender", desc: "Google/AdSense bot detection with full HTML prerender, schema.org structured data, domain-aware content" },
  ];

  const preLaunchTasks = [
    { name: "End-to-End Order Flow Test", desc: "Live test: customer orders, vendor accepts, driver picks up, customer receives. Verify every status transition.", critical: true, status: "testing" },
    { name: "Stripe Webhook Verification", desc: "Confirm payment success updates order status. Test refund handling and failed payment recovery.", critical: true, status: "testing" },
    { name: "Multi-Truck Cart Test", desc: "Test orders from multiple vendors in single checkout with correct fee splitting.", critical: true, status: "testing" },
    { name: "Driver Assignment Testing", desc: "Test zone-based driver matching — manual assignment via admin, verify driver sees order.", critical: true, status: "testing" },
    { name: "Order Status Push + SMS Verification", desc: "Verify push notifications and SMS fire at each status change (accepted, preparing, ready, picked up, delivered).", critical: true, status: "testing" },
    { name: "Receipt & Confirmation Emails", desc: "Verify automated email receipts send after successful payment and vendor signup.", critical: false, status: "testing" },
  ];

  const vendorOnboardingTasks = [
    { name: "Vendor Onboarding — First 5-10 Trucks", desc: "1-on-1 setup calls with food truck owners in Zone 1 (Lebanon/Hwy 109). Get menus uploaded and verified.", critical: true, status: "upcoming" },
    { name: "Menu Quality Audit", desc: "Review every vendor menu for completeness — descriptions, photos, customizations, pricing.", critical: true, status: "upcoming" },
    { name: "Twilio OAuth Setup", desc: "Complete Twilio connector setup in environment integrations panel. A2P 10DLC campaign already approved.", critical: true, status: "upcoming" },
    { name: "Final QA Pass", desc: "Complete walkthrough of every user flow — customer, vendor, driver, admin. Fix anything broken.", critical: true, status: "upcoming" },
    { name: "Error Monitoring Setup", desc: "Add structured logging and error tracking. Set up alerts for payment failures and order errors.", critical: true, status: "upcoming" },
    { name: "Marketing Push", desc: "Social media blitz, local press outreach, Nextdoor community posts, launch promotions.", critical: false, status: "upcoming" },
    { name: "Go Live — Soft Launch Zone 1", desc: "Limited beta with real orders in Lebanon/Hwy 109 corridor. Monitor everything.", critical: true, status: "upcoming" },
  ];

  const postLaunchFeatures = [
    { icon: Headphones, name: "AI Customer Support", desc: "Automated chat support for common customer and vendor questions", status: "Month 1" },
    { icon: Navigation, name: "Turn-by-Turn Navigation", desc: "In-app routing to destinations and delivery addresses", status: "Month 1-2" },
    { icon: Zap, name: "SignalCast Full Launch", desc: "Activate SignalCast subscription add-on — automated posting goes live", status: "Month 2" },
    { icon: Layers, name: "Franchise Portal", desc: "White-label customization and onboarding for new franchise regions", status: "Month 2-3" },
    { icon: Camera, name: "Driver Dash Cam Integration", desc: "Optional dashcam streaming for delivery verification", status: "Month 3-6" },
  ];

  const futureIdeas = [
    "Nationwide expansion — any city, any corridor",
    "Real-time fuel pricing by location",
    "Load board integration",
    "Fleet management tools",
    "Driver ratings and reviews",
    "Dock scheduling integration",
    "Franchise marketplace & discovery",
  ];

  return (
    <div className="space-y-8">
      <div className="relative text-center mb-10 py-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl mb-5">
            <Rocket className="size-5 text-violet-400" />
            <span className="text-violet-300 font-semibold text-sm">Launch Roadmap</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-violet-200 bg-clip-text text-transparent mb-3" data-testid="text-roadmap-title">Happy Eats Launch Plan</h1>
          <p className="text-white/40 max-w-xl mx-auto mb-4">
            Launch: <span className="text-amber-400 font-bold">April 6, 2026</span> — Nashville / Middle Tennessee
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <Target className="size-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">Hwy 109 & I-840 Corridor — Lebanon, Mt. Juliet, Wilson County</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500/[0.08] via-teal-500/[0.06] to-cyan-500/[0.08] border border-emerald-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
              <Calendar className="size-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Platform Status</h3>
              <p className="text-sm text-emerald-300/60">MVP feature-complete — pre-launch hardening phase</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Features Built", value: `${completedFeatures.length}+`, color: "text-emerald-400" },
              { label: "API Endpoints", value: "228+", color: "text-cyan-400" },
              { label: "Pages", value: "76+", color: "text-teal-400" },
              { label: "DB Tables", value: "50", color: "text-violet-400" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-white/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-400" />
          Pre-Launch — Order & Payment Testing
        </h2>
        <p className="text-sm text-white/50 -mt-2">Critical path. Nothing launches until the full order-to-payment flow works end to end.</p>
        <div className="bg-red-500/[0.06] border border-red-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="space-y-2">
              {preLaunchTasks.map((item, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  item.critical 
                    ? "bg-red-500/[0.06] border-red-500/20 hover:border-white/20"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                }`} data-testid={`task-prelaunch-${idx}`}>
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.critical ? "bg-red-500/[0.06] text-red-300" : "bg-white/5 text-white/30"
                  }`}>
                    <CircleDot className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white text-sm">{item.name}</p>
                      {item.critical && <Badge className="bg-red-500/15 text-red-300 border-red-500/25 text-[9px]">CRITICAL</Badge>}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="size-5 text-amber-400" />
          Pre-Launch — Vendors, QA & Soft Launch
        </h2>
        <p className="text-sm text-white/50 -mt-2">Onboard real vendors, audit menus, do a full QA pass, then go live in Zone 1.</p>
        <div className="bg-amber-500/[0.06] border border-amber-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-5">
            <div className="space-y-2">
              {vendorOnboardingTasks.map((item, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  item.critical 
                    ? "bg-amber-500/[0.06] border-amber-500/20 hover:border-white/20"
                    : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                }`} data-testid={`task-onboarding-${idx}`}>
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.critical ? "bg-amber-500/[0.06] text-amber-300" : "bg-white/5 text-white/30"
                  }`}>
                    <CircleDot className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white text-sm">{item.name}</p>
                      {item.critical && <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-[9px]">CRITICAL</Badge>}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-rose-500/[0.06] via-pink-500/[0.06] to-violet-500/[0.06] border border-rose-500/20 backdrop-blur-xl rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.08)] overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center shrink-0 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
              <Printer className="size-7 text-rose-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-white">Flyer Catalog Ready for Tomorrow</p>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[10px]">READY</Badge>
              </div>
              <p className="text-sm text-white/40 mb-2">
                3 pre-made vendor recruitment flyers in English & Spanish — download, print, or save to your vault. Plus the AI Flyer Creator and business card designer.
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/flyer-catalog">
                  <Button size="sm" className="bg-emerald-500/40 hover:bg-emerald-500/50 text-white gap-1 border border-emerald-500/30" data-testid="button-go-to-flyer-catalog">
                    <FolderOpen className="size-3" /> Flyer Catalog <ChevronRight className="size-3" />
                  </Button>
                </Link>
                <Link href="/ai-flyer">
                  <Button size="sm" className="bg-orange-500/40 hover:bg-orange-500/50 text-white gap-1 border border-orange-500/30" data-testid="button-go-to-ai-flyer">
                    <Sparkles className="size-3" /> AI Flyer Creator <ChevronRight className="size-3" />
                  </Button>
                </Link>
                <Link href="/partner/kathy">
                  <Button size="sm" className="bg-rose-500/40 hover:bg-rose-500/50 text-white gap-1 border border-rose-500/30" data-testid="button-go-to-business-cards">
                    <FileText className="size-3" /> Business Cards <ChevronRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent">
              <CheckCircle2 className="size-5 text-emerald-400" />
              Built & Working ({completedFeatures.length} Features)
            </h3>
            <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[10px]">LIVE</Badge>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedFeatures.map((feature) => (
              <div 
                key={feature.name}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-colors"
                data-testid={`feature-${feature.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="size-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{feature.name}</p>
                  <p className="text-sm text-white/40">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/[0.06]">
          <h3 className="flex items-center gap-2 font-bold bg-gradient-to-r from-violet-300 to-violet-400 bg-clip-text text-transparent">
            <Sparkles className="size-5 text-violet-400" />
            Post-Launch Roadmap (Month 1-6)
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {postLaunchFeatures.map((feature) => (
              <div 
                key={feature.name}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/15 hover:border-violet-500/25 transition-colors"
              >
                <div className="size-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
                  <feature.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-white">{feature.name}</p>
                    <Badge variant="outline" className="border-violet-500/40 text-violet-300 text-[10px]">
                      {feature.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/40">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/[0.06]">
          <h3 className="flex items-center gap-2 font-bold bg-gradient-to-r from-sky-300 to-sky-400 bg-clip-text text-transparent">
            <Clock className="size-5 text-sky-400" />
            Future Ideas
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {futureIdeas.map((idea) => (
              <div 
                key={idea}
                className="p-3 rounded-xl bg-sky-500/[0.04] border border-sky-500/10 text-center hover:border-sky-500/20 transition-colors"
              >
                <p className="text-sm text-sky-200/80">{idea}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-500/[0.06] via-violet-500/[0.06] to-purple-500/[0.06] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-8 text-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent mb-2">Building the Future of Driver Services</h3>
          <p className="text-white/40 mb-4">
            Happy Eats <span className="text-amber-400 font-bold">launches April 6, 2026</span> in the Nashville/Middle Tennessee corridor. Have a feature idea or want to bring Happy Eats to your region? We'd love to hear from you.
          </p>
          <p className="text-sm text-cyan-400/80">team@dwtl.io | (615) 601-2952</p>
        </div>
      </div>
    </div>
  );
}
