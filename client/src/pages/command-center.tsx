import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import DriverWidget from "@/components/driver-widget";
import {
  LayoutGrid, ShoppingCart, BarChart3, Megaphone, Users, FileText,
  MessageCircle, Settings, Code, ArrowLeft, LogOut, ChefHat,
  MapPin, Truck, Store, ClipboardList, Target, Palette,
  FileImage, BookOpen, Ticket,
  DollarSign, Building, Briefcase, Calculator, Route,
  Radio, MessageSquare, Shield, Map, Globe,
  Rocket, Handshake, User, Award, Server,
  Zap, Navigation, Receipt, Eye, Printer, ChevronRight, Sparkles, Info, X,
  Cloud, Compass, Bell, TrendingUp, Presentation, PenTool, Search, Wrench, ShoppingBag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserGreeting } from "@/components/user-greeting";
import { Button } from "@/components/ui/button";
import { SandboxRoleModal } from "@/components/sandbox-role-modal";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import RevenueDashboard from "@/components/revenue-dashboard";

import inviteCodesImg from "@/assets/images/cc/invite_codes.png";
import opsManualImg from "@/assets/images/cc/operations_manual.png";
import ops1 from "@/assets/images/cc/operations_1.jpg";
import ops2 from "@/assets/images/cc/operations_2.jpg";
import ops3 from "@/assets/images/cc/operations_3.jpg";
import ops4 from "@/assets/images/cc/operations_4.jpg";
import ops5 from "@/assets/images/cc/operations_5.jpg";
import vend1 from "@/assets/images/cc/vendors_1.jpg";
import vend2 from "@/assets/images/cc/vendors_2.jpg";
import vend3 from "@/assets/images/cc/vendors_3.jpg";
import ord1 from "@/assets/images/cc/orders_1.jpg";
import ord2 from "@/assets/images/cc/orders_2.jpg";
import ord3 from "@/assets/images/cc/orders_3.jpg";
import mkt1 from "@/assets/images/cc/marketing_1.jpg";
import mkt2 from "@/assets/images/cc/marketing_2.jpg";
import mkt3 from "@/assets/images/cc/marketing_3.jpg";
import mkt4 from "@/assets/images/cc/marketing_4.jpg";
import mkt5 from "@/assets/images/cc/marketing_5.jpg";
import ana1 from "@/assets/images/cc/analytics_1.jpg";
import ana2 from "@/assets/images/cc/analytics_2.jpg";
import fran1 from "@/assets/images/cc/franchise_1.jpg";
import fran2 from "@/assets/images/cc/franchise_2.jpg";
import fran3 from "@/assets/images/cc/franchise_3.jpg";
import fran4 from "@/assets/images/cc/franchise_4.jpg";
import fran5 from "@/assets/images/cc/franchise_5.jpg";
import fran6 from "@/assets/images/cc/franchise_6.jpg";
import comm1 from "@/assets/images/cc/communication_1.jpg";
import comm2 from "@/assets/images/cc/communication_2.jpg";
import acct1 from "@/assets/images/cc/account_1.jpg";
import acct2 from "@/assets/images/cc/account_2.jpg";
import acct3 from "@/assets/images/cc/account_3.jpg";
import acct4 from "@/assets/images/cc/account_4.jpg";
import dev1 from "@/assets/images/cc/developer_1.jpg";
import dev2 from "@/assets/images/cc/developer_2.jpg";
import dev3 from "@/assets/images/cc/developer_3.jpg";
import dev4 from "@/assets/images/cc/developer_4.jpg";
import dev5 from "@/assets/images/cc/developer_5.jpg";
import ops6 from "@/assets/images/cc/operations_6.jpg";
import ops7 from "@/assets/images/cc/operations_7.jpg";
import ops8 from "@/assets/images/cc/operations_8.jpg";
import ops9 from "@/assets/images/cc/operations_9.jpg";
import mkt6 from "@/assets/images/cc/marketing_6.jpg";
import mkt7 from "@/assets/images/cc/marketing_7.jpg";
import fran7 from "@/assets/images/cc/franchise_7.jpg";
import fran8 from "@/assets/images/cc/franchise_8.jpg";
import acct5 from "@/assets/images/cc/account_5.jpg";

interface LaunchCard {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  image: string;
  glowColor: string;
  badge?: string;
  featured?: boolean;
}

interface Category {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  cards: LaunchCard[];
}

const categories: Category[] = [
  {
    title: "Operations",
    icon: <LayoutGrid className="size-4" />,
    gradient: "from-orange-500 to-amber-500",
    description: "Core day-to-day tools for running food delivery operations. Test order flows in the Sandbox, manage the Happy Eats Kitchen menu, view the interactive zone map with all Middle Tennessee delivery zones, customer ordering pages, driver assignments, GPS truck stop finder, live weather and road conditions, and concierge driver services.",
    cards: [
      { label: "Operations Manual", description: "Complete A-Z platform guide", href: "/operations-manual", icon: <BookOpen className="size-5" />, image: opsManualImg, glowColor: "shadow-orange-500/30", badge: "Guide", featured: true },
      { label: "Zone Control", description: "Toggle zones live/off instantly", href: "/zone-control", icon: <Zap className="size-5" />, image: ops6, glowColor: "shadow-emerald-500/30", badge: "New" },
      { label: "Live Ops", description: "Real-time vendor pipeline & order feed", href: "/live-ops", icon: <Radio className="size-5" />, image: ops1, glowColor: "shadow-emerald-500/30", badge: "Live" },
      { label: "Sandbox Hub", description: "Order flow testing & zone controls", href: "/sandbox", icon: <LayoutGrid className="size-5" />, image: ops1, glowColor: "shadow-orange-500/30", badge: "Live" },
      { label: "Kitchen Manager", description: "HE Kitchen menu & items", href: "/kitchen/manage", icon: <ChefHat className="size-5" />, image: ops2, glowColor: "shadow-amber-500/20" },
      { label: "Kitchen Menu", description: "Customer-facing kitchen page", href: "/kitchen", icon: <Eye className="size-5" />, image: ops3, glowColor: "shadow-amber-400/20" },
      { label: "Zone Orders", description: "Customer ordering by zone", href: "/zones", icon: <MapPin className="size-5" />, image: ops4, glowColor: "shadow-emerald-500/20" },
      { label: "Driver Orders", description: "Driver pickup & delivery view", href: "/zones", icon: <Truck className="size-5" />, image: ops5, glowColor: "shadow-blue-500/20" },
      { label: "Zone Map", description: "Interactive delivery zone map", href: "/zones", icon: <MapPin className="size-5" />, image: ops6, glowColor: "shadow-cyan-500/20", badge: "New" },
      { label: "GPS Finder", description: "Find nearby truck stops & services", href: "/gps", icon: <Compass className="size-5" />, image: ops7, glowColor: "shadow-blue-400/20" },
      { label: "Weather", description: "Road conditions & forecasts", href: "/weather", icon: <Cloud className="size-5" />, image: ops8, glowColor: "shadow-sky-400/20" },
      { label: "Concierge", description: "Driver services & support", href: "/concierge", icon: <Bell className="size-5" />, image: ops9, glowColor: "shadow-amber-400/20" },
      { label: "Shop a Store", description: "Walmart grocery shopping & delivery", href: "/store", icon: <ShoppingBag className="size-5" />, image: ops3, glowColor: "shadow-blue-500/20", badge: "New" },
    ]
  },
  {
    title: "Vendors",
    icon: <Store className="size-4" />,
    gradient: "from-emerald-500 to-teal-500",
    description: "Everything vendor-related — from signing up new food trucks and restaurants to managing their menus and browsing the full vendor directory. Vendors self-serve here with no upfront fees, just 20% when we bring them business.",
    cards: [
      { label: "Vendor Portal", description: "Vendor signup & onboarding", href: "/vendor-portal", icon: <Store className="size-5" />, image: vend1, glowColor: "shadow-emerald-500/20", featured: true },
      { label: "Invite Codes", description: "Generate vendor invite codes with perks", href: "/invite-codes", icon: <Ticket className="size-5" />, image: inviteCodesImg, glowColor: "shadow-violet-500/20", badge: "New" },
      { label: "Vendor Login", description: "Vendor menu management", href: "/vendor/login", icon: <ClipboardList className="size-5" />, image: vend2, glowColor: "shadow-teal-500/20" },
      { label: "Vendor Directory", description: "Browse all vendors", href: "/vendors", icon: <Users className="size-5" />, image: vend3, glowColor: "shadow-green-500/20" },
    ]
  },
  {
    title: "Orders",
    icon: <ShoppingCart className="size-4" />,
    gradient: "from-blue-500 to-indigo-500",
    description: "Track, manage, and test all customer orders. View the full order pipeline, follow real-time order tracking, and place test orders through the customer-facing order page.",
    cards: [
      { label: "Order Management", description: "View & manage all orders", href: "/owner?tab=orders", icon: <ShoppingCart className="size-5" />, image: ord1, glowColor: "shadow-blue-500/20", featured: true },
      { label: "Order Tracking", description: "Real-time order tracking", href: "/tracking", icon: <Navigation className="size-5" />, image: ord2, glowColor: "shadow-sky-500/20" },
      { label: "Customer Order Page", description: "Place test orders", href: "/order", icon: <Receipt className="size-5" />, image: ord3, glowColor: "shadow-indigo-500/20" },
    ]
  },
  {
    title: "Marketing",
    icon: <Megaphone className="size-4" />,
    gradient: "from-fuchsia-500 to-pink-500",
    description: "Create and manage all marketing materials. The Marketing Hub is your full command center for campaigns. Build printable flyers, design business cards and marketing materials with 12+ templates, create vendor outreach materials, publish blog posts, run interactive demos, and access brand guidelines and assets.",
    cards: [
      { label: "Marketing Hub", description: "Full marketing command center", href: "/marketing", icon: <Megaphone className="size-5" />, image: mkt1, glowColor: "shadow-fuchsia-500/20", featured: true },
      { label: "AI Flyer Creator", description: "Say it, AI designs it", href: "/ai-flyer", icon: <Sparkles className="size-5" />, image: mkt2, glowColor: "shadow-orange-500/20", featured: true },
      { label: "Flyer Builder", description: "Create & print flyers", href: "/flyer", icon: <FileImage className="size-5" />, image: mkt3, glowColor: "shadow-pink-500/20" },
      { label: "Food Truck Flyers", description: "Vendor outreach materials", href: "/food-truck-flyer", icon: <Printer className="size-5" />, image: mkt3, glowColor: "shadow-rose-500/20" },
      { label: "Blog", description: "Blog posts & content", href: "/blog", icon: <BookOpen className="size-5" />, image: mkt4, glowColor: "shadow-violet-500/20" },
      { label: "Brand Assets", description: "Logos, colors & guidelines", href: "/marketing?tab=brand", icon: <Palette className="size-5" />, image: mkt5, glowColor: "shadow-purple-500/20" },
      { label: "Marketing Materials", description: "12-template card & flyer editor", href: "/marketing-materials", icon: <PenTool className="size-5" />, image: mkt6, glowColor: "shadow-amber-500/20" },
      { label: "Marketing Demo", description: "Interactive campaign showcase", href: "/marketing-demo", icon: <Presentation className="size-5" />, image: mkt7, glowColor: "shadow-cyan-500/20" },
      { label: "Media Studio", description: "TrustVault editors for photo, video & audio", href: "/media-editor", icon: <Sparkles className="size-5" />, image: mkt2, glowColor: "shadow-amber-500/20" },
    ]
  },
  {
    title: "Analytics",
    icon: <BarChart3 className="size-4" />,
    gradient: "from-cyan-500 to-sky-500",
    description: "Data dashboards for tracking platform performance. View web traffic analytics, user engagement metrics, revenue breakdowns, earnings projections, and franchise income splits.",
    cards: [
      { label: "Analytics Dashboard", description: "Web traffic & engagement", href: "/owner?tab=analytics", icon: <BarChart3 className="size-5" />, image: ana1, glowColor: "shadow-cyan-500/20", featured: true },
      { label: "Revenue & Earnings", description: "Income projections & splits", href: "/owner?tab=home", icon: <DollarSign className="size-5" />, image: ana2, glowColor: "shadow-emerald-500/20" },
    ]
  },
  {
    title: "Business & Franchise",
    icon: <Building className="size-4" />,
    gradient: "from-violet-500 to-purple-500",
    description: "Business management, franchise tools, and growth. Track expenses and mileage, manage office operations, explore franchise opportunities, onboard new territories, monitor franchise performance, review partner agreements, access investor relations materials, and connect to Orbit Staffing for payroll, HR, and bookkeeping services.",
    cards: [
      { label: "Business Suite", description: "Expense & mileage tracking", href: "/business", icon: <Briefcase className="size-5" />, image: fran1, glowColor: "shadow-violet-500/20", featured: true },
      { label: "Office Dashboard", description: "Office operations view", href: "/office", icon: <Building className="size-5" />, image: fran2, glowColor: "shadow-purple-500/20" },
      { label: "Franchise Info", description: "Franchise opportunities", href: "/franchise", icon: <Globe className="size-5" />, image: fran3, glowColor: "shadow-indigo-500/20" },
      { label: "Franchise Onboarding", description: "New franchise setup", href: "/franchise/onboarding", icon: <Rocket className="size-5" />, image: fran4, glowColor: "shadow-sky-500/20" },
      { label: "Franchise Dashboard", description: "Franchise management", href: "/franchise/dashboard", icon: <Target className="size-5" />, image: fran5, glowColor: "shadow-blue-500/20" },
      { label: "Partner Agreement", description: "Kathy's partner docs", href: "/partner/kathy", icon: <Handshake className="size-5" />, image: fran6, glowColor: "shadow-teal-500/20" },
      { label: "Investor Relations", description: "Pitch deck, market data & roadmap", href: "/investors", icon: <TrendingUp className="size-5" />, image: fran7, glowColor: "shadow-emerald-500/20", badge: "Pitch" },
      { label: "Orbit Payroll & HR", description: "Staffing, bookkeeping & 1099s", href: "https://orbitstaffing.io", icon: <DollarSign className="size-5" />, image: fran8, glowColor: "shadow-teal-400/20", badge: "Partner" },
      { label: "OrbitStaffing Handoff", description: "Ownership, equity & project status", href: "/orbit-staffing", icon: <FileText className="size-5" />, image: fran7, glowColor: "shadow-cyan-400/20", badge: "Handoff" },
      { label: "GarageBot", description: "AI vehicle maintenance & diagnostics", href: "https://garagebot.io", icon: <Wrench className="size-5" />, image: fran7, glowColor: "shadow-emerald-400/20", badge: "Partner" },
    ]
  },
  {
    title: "Communication",
    icon: <MessageCircle className="size-4" />,
    gradient: "from-sky-500 to-blue-500",
    description: "Real-time messaging and community tools. Signal Chat provides encrypted team messaging for staff and operations. Trucker Talk is the open driver community chat where drivers connect, share tips, and build relationships.",
    cards: [
      { label: "Signal Chat", description: "Encrypted team messaging", href: "/signal-chat", icon: <MessageSquare className="size-5" />, image: comm1, glowColor: "shadow-sky-500/20", featured: true },
      { label: "Trucker Talk", description: "Driver community chat", href: "/trucker-talk", icon: <Radio className="size-5" />, image: comm2, glowColor: "shadow-amber-500/20" },
    ]
  },
  {
    title: "Account & Team",
    icon: <Shield className="size-4" />,
    gradient: "from-slate-400 to-zinc-500",
    description: "Account settings, team management, and growth tools. Manage the affiliate referral program to earn passive income, update your profile and security settings, access the operations panel, view the product roadmap, browse the CDL training directory, and explore the full platform feature hub.",
    cards: [
      { label: "Affiliate Program", description: "Referral dashboard & revenue share", href: "/affiliate", icon: <Handshake className="size-5" />, image: fran6, glowColor: "shadow-orange-500/20", featured: true, badge: "Earn" },
      { label: "Account Settings", description: "Profile, password & security", href: "/owner?tab=account", icon: <User className="size-5" />, image: acct1, glowColor: "shadow-slate-400/20" },
      { label: "Operations Panel", description: "Deep operations management", href: "/owner?tab=operations", icon: <Settings className="size-5" />, image: acct2, glowColor: "shadow-gray-400/20" },
      { label: "Roadmap", description: "Product roadmap & planned features", href: "/roadmap", icon: <Map className="size-5" />, image: acct3, glowColor: "shadow-indigo-500/20" },
      { label: "CDL Directory", description: "CDL training programs", href: "/cdl-directory", icon: <Award className="size-5" />, image: acct4, glowColor: "shadow-yellow-500/20" },
      { label: "Explore Hub", description: "Browse all platform features", href: "/explore", icon: <Search className="size-5" />, image: acct5, glowColor: "shadow-cyan-400/20" },
    ]
  },
  {
    title: "Developer Tools",
    icon: <Code className="size-4" />,
    gradient: "from-green-500 to-emerald-500",
    description: "Technical tools and developer resources. Access system health monitoring, explore driver feature dashboards, test mileage and expense tracking, walk through interactive platform demos, view detailed system information, and monitor Lume-V AI governance.",
    cards: [
      { label: "Developer Portal", description: "System health & ecosystem", href: "/developer", icon: <Server className="size-5" />, image: dev1, glowColor: "shadow-green-500/20", featured: true },
      { label: "Lume-V Governance", description: "AI safety decisions & trust certs", href: "/developer", icon: <Shield className="size-5" />, image: dev1, glowColor: "shadow-cyan-500/20", badge: "Live" },
      { label: "Driver Hub", description: "Driver features dashboard", href: "/driver", icon: <Route className="size-5" />, image: dev2, glowColor: "shadow-orange-500/20" },
      { label: "Everyday Driver", description: "Mileage & expense tracker", href: "/everyday", icon: <Calculator className="size-5" />, image: dev3, glowColor: "shadow-sky-500/20" },
      { label: "Demo Page", description: "Feature demonstrations", href: "/demo", icon: <Zap className="size-5" />, image: dev4, glowColor: "shadow-yellow-500/20" },
      { label: "Platform Info", description: "System information page", href: "/info", icon: <FileText className="size-5" />, image: dev5, glowColor: "shadow-slate-400/20" },
    ]
  },
];

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16]">
      <div className="sticky top-0 z-50 bg-[#070b16]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 rounded-lg bg-white/5 animate-pulse" />
              <div className="h-3 w-28 rounded-md bg-white/5 animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-4 w-32 rounded-lg bg-white/5 animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="row-span-2 rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <div className="h-56 bg-gradient-to-br from-white/[0.04] to-white/[0.01] animate-pulse" />
              </div>
              {[1, 2, 3, 4].map((c) => (
                <div key={c} className="rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-white/[0.04] to-white/[0.01] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BentoCard({ card, size = "normal" }: { card: LaunchCard; size?: "featured" | "normal" }) {
  const isFeatured = size === "featured";
  const isExternal = card.href.startsWith('http');

  const inner = (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/[0.18] active:scale-[0.97] transition-all duration-300 hover:shadow-xl ${card.glowColor} h-full ${isFeatured ? 'min-h-[180px] sm:min-h-[220px]' : 'min-h-[100px] sm:min-h-[110px]'}`}
      data-testid={`card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute inset-0">
        <img
          src={card.image}
          alt=""
          className="w-full h-full object-cover brightness-110 group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50" />
      </div>

      <div className={`relative ${isFeatured ? 'p-5' : 'p-4'} flex flex-col h-full justify-end`}>
        <div className="absolute top-3 left-3">
          <div className="size-9 rounded-xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/[0.12] group-hover:border-white/25 group-hover:bg-black/50 transition-all duration-300">
            <div className="text-white/90 group-hover:text-white transition-colors">
              {card.icon}
            </div>
          </div>
        </div>
        {card.badge && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30 text-[9px] px-2 py-0.5 backdrop-blur-md animate-pulse shadow-lg shadow-emerald-500/20">
              {card.badge}
            </Badge>
          </div>
        )}

        <div>
          <p className={`${isFeatured ? 'text-base' : 'text-sm'} font-bold text-white drop-shadow-lg group-hover:drop-shadow-xl transition-all`}>
            {card.label}
          </p>
          <p className={`${isFeatured ? 'text-xs mt-1' : 'text-[10px] mt-0.5'} text-white/60 leading-relaxed group-hover:text-white/80 transition-colors drop-shadow-md`}>
            {card.description}
          </p>
        </div>

        <div className={`flex items-center gap-1 text-white/30 group-hover:text-white/70 transition-all duration-300 ${isFeatured ? 'mt-3' : 'mt-1.5'}`}>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">{isExternal ? 'Visit' : 'Open'}</span>
          <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </motion.div>
  );

  if (isExternal) {
    return <a href={card.href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return <Link href={card.href}>{inner}</Link>;
}

function CategoryInfoModal({ category, onClose }: { category: Category; onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`About ${category.title}`}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md max-h-[85vh] bg-[#0c1222] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 w-full bg-gradient-to-r ${category.gradient} shrink-0`} />

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`size-11 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg text-white`}>
                {category.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{category.title}</h3>
                <p className="text-[11px] text-white/30">{category.cards.length} tool{category.cards.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="text-white/30 hover:text-white hover:bg-white/5 rounded-xl size-8"
              data-testid="button-close-info-modal"
            >
              <X className="size-4" />
            </Button>
          </div>

          <p className="text-sm text-white/50 leading-relaxed mb-5">{category.description}</p>

          <div className="space-y-2">
            <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] font-semibold mb-2">Included Tools</p>
            {category.cards.map((card) => {
              const isExt = card.href.startsWith('http');
              const cardContent = (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer group" data-testid={`info-tool-${card.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="size-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/60 group-hover:text-white transition-colors">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{card.label}</p>
                    <p className="text-[10px] text-white/30 truncate">{card.description}</p>
                  </div>
                  <ChevronRight className="size-3 text-white/15 group-hover:text-white/40 transition-colors" />
                </div>
              );
              return isExt ? (
                <a key={card.href + card.label} href={card.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>{cardContent}</a>
              ) : (
                <Link key={card.href + card.label} href={card.href} onClick={onClose}>{cardContent}</Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CategorySection({ category, index }: { category: Category; index: number }) {
  const [showInfo, setShowInfo] = useState(false);
  const featured = category.cards.find(c => c.featured);
  const rest = category.cards.filter(c => !c.featured);
  const hasMany = category.cards.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`size-9 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg text-white`}>
          {category.icon}
        </div>
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">{category.title}</h2>
          <button
            onClick={() => setShowInfo(true)}
            aria-label={`Info about ${category.title}`}
            className="size-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center transition-all duration-200 group"
            data-testid={`button-info-${category.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Info className="size-2.5 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
          <div className={`h-px flex-1 bg-gradient-to-r ${category.gradient} opacity-15`} />
          <span className="text-[10px] text-white/20 font-medium tabular-nums">{category.cards.length}</span>
        </div>
      </div>

      {showInfo && <CategoryInfoModal category={category} onClose={() => setShowInfo(false)} />}

      {hasMany ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
          {featured && (
            <div className="md:row-span-2">
              <BentoCard card={featured} size="featured" />
            </div>
          )}
          <div className="md:col-span-2">
            <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
              <CarouselContent className="-ml-2.5 sm:-ml-3">
                {rest.map((card) => (
                  <CarouselItem key={card.href + card.label} className="pl-2.5 sm:pl-3 basis-[45%] sm:basis-1/2 lg:basis-1/3">
                    <BentoCard card={card} size="normal" />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {rest.length > 3 && (
                <>
                  <CarouselPrevious className="hidden md:flex -left-3 size-8 bg-black/50 backdrop-blur-md border-white/10 text-white/60 hover:bg-black/70 hover:text-white" />
                  <CarouselNext className="hidden md:flex -right-3 size-8 bg-black/50 backdrop-blur-md border-white/10 text-white/60 hover:bg-black/70 hover:text-white" />
                </>
              )}
            </Carousel>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {featured && (
            <div className="col-span-2 md:col-span-1 md:row-span-2">
              <BentoCard card={featured} size="featured" />
            </div>
          )}
          {rest.map((card) => (
            <BentoCard key={card.href + card.label} card={card} size="normal" />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LumeVGovernancePanel() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/lume-v/stats");
        if (res.ok && active) {
          const data = await res.json();
          setStats(data);
        }
      } catch { /* silent */ }
      if (active) setLoading(false);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  if (loading || !stats) return null;

  const decisionColor = (d: string) => {
    if (d === "approved") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (d === "rejected") return "bg-red-500/20 text-red-300 border-red-500/30";
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg text-white">
          <Shield className="size-4" />
        </div>
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">Lume-V Governance</h2>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px] animate-pulse">Live</Badge>
          <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/15 to-transparent" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6 space-y-5">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total Decisions", value: stats.totalDecisions, color: "text-white" },
            { label: "Approved", value: stats.approved, color: "text-emerald-400" },
            { label: "Rejected", value: stats.rejected, color: "text-red-400" },
            { label: "Avg Latency", value: `${stats.avgLatencyMs}ms`, color: "text-sky-400" },
            { label: "Certificates", value: stats.certificatesIssued, color: "text-violet-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.04] rounded-xl border border-white/[0.06] p-3 text-center">
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Decisions */}
        {stats.recentDecisions && stats.recentDecisions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] font-semibold">Recent Decisions</p>
            <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {stats.recentDecisions.slice(0, 10).map((d: any) => (
                <div key={d.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] transition-all">
                  <Badge className={`${decisionColor(d.decision)} text-[9px] px-2 py-0.5 shrink-0 font-mono`}>
                    {d.decision.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{d.subsystem}</p>
                    <p className="text-[10px] text-white/30 truncate">{d.explanation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-white/40 font-mono">{d.latencyMs}ms</p>
                    <p className="text-[9px] text-white/20">{((d.confidence || 0) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.totalDecisions === 0 && (
          <div className="text-center py-6">
            <Shield className="size-8 text-cyan-500/30 mx-auto mb-2" />
            <p className="text-sm text-white/40">No AI decisions yet</p>
            <p className="text-[10px] text-white/20">Lume-V governance is active. Decisions will appear when AI subsystems are used.</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
          <p className="text-[10px] text-white/20">
            Uptime: {Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m
          </p>
          <p className="text-[10px] text-cyan-500/40 font-mono">Lume-V v1.0.0 — DarkWave Studios</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommandCenter() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/team");
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && loaded) {
      const justLoggedIn = sessionStorage.getItem("showRoleSelector");
      if (justLoggedIn === "true") {
        sessionStorage.removeItem("showRoleSelector");
        setShowRoleModal(true);
      }
    }
  }, [isAuthenticated, loaded]);

  if (!isAuthenticated) return null;

  if (!loaded) return <SkeletonLoader />;

  return (
    <AnimatePresence>
      <SandboxRoleModal open={showRoleModal} onClose={() => setShowRoleModal(false)} />
      <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.02] rounded-full blur-[150px] pointer-events-none" />

        <div className="sticky top-0 z-50 bg-[#070b16]/70 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button data-testid="back-home" variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="size-10 rounded-xl bg-gradient-to-br from-orange-500/20 via-fuchsia-500/10 to-violet-500/20 flex items-center justify-center border border-white/[0.08] shadow-lg shadow-orange-500/10"
                >
                  <Sparkles className="size-5 text-orange-300" />
                </motion.div>
                <div>
                  <motion.h1
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold text-white flex items-center gap-2"
                  >
                    Command Center
                    <Badge data-testid="badge-role" className={`${user?.role === "developer" ? "bg-violet-500/20 text-violet-300 border-violet-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"} text-[10px] font-medium`}>
                      {user?.role === "developer" ? "Developer" : "Owner"}
                    </Badge>
                  </motion.h1>
                  <UserGreeting name={user?.ownerName || user?.name || ""} userNumber={user?.id || 0} role={user?.role || "owner"} compact />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/explore">
                <Button
                  data-testid="button-to-explore"
                  variant="ghost"
                  size="sm"
                  className="text-white/30 hover:text-white hover:bg-white/5 gap-2 rounded-xl"
                >
                  <Compass className="size-4" />
                  <span className="hidden sm:inline text-xs">Explore</span>
                </Button>
              </Link>
              <Link href="/sandbox">
                <Button
                  data-testid="button-driver-mode"
                  variant="ghost"
                  size="sm"
                  className="bg-cyan-500/10 text-cyan-300 hover:text-white hover:bg-cyan-500/20 gap-2 rounded-xl border border-cyan-500/30"
                >
                  <Truck className="size-4 animate-pulse" />
                  <span className="hidden sm:inline text-xs font-bold">Driver Mode</span>
                </Button>
              </Link>
              <Button
                data-testid="button-switch-role"
                variant="ghost"
                size="sm"
                onClick={() => setShowRoleModal(true)}
                className="text-white/30 hover:text-white hover:bg-white/5 gap-2 rounded-xl"
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline text-xs">Switch Role</span>
              </Button>
              <Button
                data-testid="button-logout"
                variant="ghost"
                size="sm"
                onClick={() => { logout(); setLocation("/team"); }}
                className="text-white/30 hover:text-white hover:bg-white/5 gap-2 rounded-xl"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline text-xs">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-8 sm:space-y-10 relative z-10 pb-24 sm:pb-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-7 rounded-lg bg-gradient-to-br from-orange-500/30 to-amber-500/30 flex items-center justify-center border border-orange-500/20">
                <Zap className="size-3.5 text-orange-300" />
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-semibold">Quick Access</p>
              <div className="h-px flex-1 bg-gradient-to-r from-orange-500/15 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2">
              {[
                { label: "Sandbox", href: "/sandbox", icon: <LayoutGrid className="size-4" />, gradient: "from-orange-500/15 to-amber-500/10", border: "border-orange-500/20", text: "text-orange-300" },
                { label: "Vendor Portal", href: "/vendor-portal", icon: <Store className="size-4" />, gradient: "from-emerald-500/15 to-teal-500/10", border: "border-emerald-500/20", text: "text-emerald-300" },
                { label: "Marketing Hub", href: "/marketing", icon: <Megaphone className="size-4" />, gradient: "from-fuchsia-500/15 to-pink-500/10", border: "border-fuchsia-500/20", text: "text-fuchsia-300" },
                { label: "Zone Control", href: "/zone-control", icon: <Zap className="size-4" />, gradient: "from-emerald-500/15 to-cyan-500/10", border: "border-emerald-500/20", text: "text-emerald-300" },
                { label: "Investors", href: "/investors", icon: <TrendingUp className="size-4" />, gradient: "from-violet-500/15 to-purple-500/10", border: "border-violet-500/20", text: "text-violet-300" },
                { label: "Shop a Store", href: "/store", icon: <ShoppingBag className="size-4" />, gradient: "from-blue-500/15 to-cyan-500/10", border: "border-blue-500/20", text: "text-blue-300" },
                { label: "OrbitStaffing", href: "https://orbitstaffing.io", icon: <DollarSign className="size-4" />, gradient: "from-teal-500/15 to-blue-500/10", border: "border-teal-500/20", text: "text-teal-300", external: true },
              ].map((item) => {
                const content = (
                  <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r ${item.gradient} border ${item.border} hover:border-white/20 cursor-pointer transition-all duration-200 group`}
                    data-testid={`quick-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className={`${item.text} group-hover:text-white transition-colors`}>{item.icon}</div>
                    <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">{item.label}</span>
                    <ChevronRight className="size-3 text-white/20 group-hover:text-white/50 ml-auto transition-colors" />
                  </motion.div>
                );
                return 'external' in item && item.external ? (
                  <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">{content}</a>
                ) : (
                  <Link key={item.href} href={item.href}>{content}</Link>
                );
              })}
            </div>
          </motion.div>

          {/* Driver Widget — inline driver controls for owner/partner */}
          <DriverWidget userName={user?.ownerName || user?.name || 'Owner'} userRole={user?.role || 'owner'} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <div className="size-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="size-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-violet-300">Native Apps Coming Soon</p>
                <p className="text-[10px] text-white/40">Happy Eats will be available on Google Play and the Apple App Store</p>
              </div>
              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px] shrink-0">Planned</Badge>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF7849] to-amber-500 flex items-center justify-center shadow-lg text-white">
                <DollarSign className="size-4" />
              </div>
              <div className="flex items-center gap-3 flex-1">
                <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">Revenue & Analytics</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-[#FF7849]/15 to-transparent" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-4 sm:p-6">
              <RevenueDashboard adminPin={user?.pin || ""} />
            </div>
          </motion.div>

          {/* ═══ Lume-V Governance Panel ═══ */}
          <LumeVGovernancePanel />

          {categories.map((category, index) => (
            <CategorySection key={category.title} category={category} index={index} />
          ))}
        </div>

        <div className="h-16" />
      </div>
    </AnimatePresence>
  );
}
