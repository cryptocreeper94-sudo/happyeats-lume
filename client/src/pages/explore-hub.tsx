import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, ShoppingCart, Store, ChefHat, MapPin, Truck, Navigation,
  Handshake, Radio, CloudSun, Award, Lock, Home, Map, BookOpen,
  TrendingUp, Briefcase, ChevronRight, Sparkles, Info, X, Search,
  Globe, ExternalLink, Rocket, Wrench, Volume2, VolumeX, Gamepad2, ShoppingBag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer, EcosystemCarousel } from "@/components/layout/footer";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

import flyoverFoodTrucks from "@/assets/videos/flyover-food-trucks.mp4";
import flyoverCommercial from "@/assets/videos/flyover-commercial.mp4";
import flyoverDelivery from "@/assets/videos/flyover-delivery.mp4";
import flyoverOffice from "@/assets/videos/flyover-office.mp4";
import flyoverHub from "@/assets/videos/flyover-hub.mp4";

const HERO_VIDEOS = [
  { src: flyoverFoodTrucks, label: "Food Trucks" },
  { src: flyoverCommercial, label: "Commercial Fleet" },
  { src: flyoverDelivery, label: "Local Delivery" },
  { src: flyoverOffice, label: "Office Services" },
  { src: flyoverHub, label: "Delivery Hub" },
];

import imgFoodOrder from "@/assets/images/uc/food_ordering.png";
import imgKitchen from "@/assets/images/uc/kitchen_menu.png";
import imgVendors from "@/assets/images/uc/browse_vendors.png";
import imgBecomeVendor from "@/assets/images/uc/become_vendor.png";
import imgTrack from "@/assets/images/uc/track_order.png";
import imgAffiliate from "@/assets/images/uc/affiliate.png";
import imgTruckerTalk from "@/assets/images/uc/trucker_talk.png";
import imgWeather from "@/assets/images/uc/weather.png";
import imgCDL from "@/assets/images/uc/cdl_training.png";
import imgTeamLogin from "@/assets/images/uc/team_login.png";
import imgHomepage from "@/assets/images/uc/homepage.png";
import imgGPS from "@/assets/images/uc/gps_finder.png";
import imgConcierge from "@/assets/images/uc/concierge.png";
import imgZoneMap from "@/assets/images/uc/zone_map.png";
import imgBlog from "@/assets/images/uc/blog.png";
import imgInvestors from "@/assets/images/uc/investors.png";
import imgGames from "@/assets/images/uc/games_arcade.png";

interface ExploreCard {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  image: string;
  glowColor: string;
  badge?: string;
  featured?: boolean;
}

interface ExploreCategory {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
  cards: ExploreCard[];
}

const categories: ExploreCategory[] = [
  {
    title: "Food & Ordering",
    icon: <ShoppingCart className="size-4" />,
    gradient: "from-orange-500 to-amber-500",
    description: "Order food from local vendors, browse the Happy Eats Kitchen menu, and explore zone-based delivery in the Nashville I-24 Corridor.",
    cards: [
      { label: "Order Food", description: "Order from local vendors now", href: "/zones", icon: <ShoppingCart className="size-5" />, image: imgFoodOrder, glowColor: "shadow-orange-500/30", badge: "Live", featured: true },
      { label: "Shop a Store", description: "Browse Walmart · we shop & deliver", href: "/store", icon: <ShoppingBag className="size-5" />, image: imgConcierge, glowColor: "shadow-blue-500/30", badge: "New" },
      { label: "Kitchen Menu", description: "Happy Eats pre-made meals & snacks", href: "/kitchen", icon: <ChefHat className="size-5" />, image: imgKitchen, glowColor: "shadow-amber-500/20", badge: "Coming Soon" },
      { label: "Track My Order", description: "Real-time order tracking & status", href: "/tracking", icon: <Navigation className="size-5" />, image: imgTrack, glowColor: "shadow-sky-500/20" },
    ]
  },
  {
    title: "Vendors & Partners",
    icon: <Store className="size-4" />,
    gradient: "from-emerald-500 to-teal-500",
    description: "Explore food trucks and restaurants near you, or sign up as a vendor with zero upfront costs. We only take 20% when we bring you business.",
    cards: [
      { label: "Browse Vendors", description: "Discover food trucks & restaurants", href: "/vendors", icon: <Store className="size-5" />, image: imgVendors, glowColor: "shadow-emerald-500/30", featured: true },
      { label: "Become a Vendor", description: "Sign up free — no upfront fees", href: "/vendor-portal", icon: <Truck className="size-5" />, image: imgBecomeVendor, glowColor: "shadow-teal-500/20", badge: "Free" },
      { label: "Vendor Login", description: "Manage your menu & orders", href: "/vendor/login", icon: <Store className="size-5" />, image: imgVendors, glowColor: "shadow-green-500/20" },
    ]
  },
  {
    title: "Earn & Grow",
    icon: <TrendingUp className="size-4" />,
    gradient: "from-violet-500 to-fuchsia-500",
    description: "Join our affiliate program to earn cash by referring vendors. Get $20 per qualified referral plus ongoing revenue share on every order.",
    cards: [
      { label: "Affiliate Program", description: "Earn $20+ per referral & revenue share", href: "/affiliate", icon: <Handshake className="size-5" />, image: imgAffiliate, glowColor: "shadow-violet-500/30", badge: "Earn $$$", featured: true },
      { label: "Investor Info", description: "Market opportunity & growth roadmap", href: "/investors", icon: <TrendingUp className="size-5" />, image: imgInvestors, glowColor: "shadow-fuchsia-500/20" },
      { label: "Roadmap", description: "What's live, what's next & future plans", href: "/roadmap", icon: <Rocket className="size-5" />, image: imgBlog, glowColor: "shadow-cyan-500/20" },
    ]
  },
  {
    title: "Driver Tools",
    icon: <Truck className="size-4" />,
    gradient: "from-blue-500 to-cyan-500",
    description: "Everything drivers need — weather, GPS, CDL training, mileage tracking, and community chat with fellow drivers across the nation.",
    cards: [
      { label: "Trucker Talk", description: "Connect with drivers nationwide", href: "/trucker-talk", icon: <Radio className="size-5" />, image: imgTruckerTalk, glowColor: "shadow-blue-500/30", featured: true },
      { label: "Weather", description: "Live weather & road conditions", href: "/weather", icon: <CloudSun className="size-5" />, image: imgWeather, glowColor: "shadow-cyan-500/20" },
      { label: "GPS Finder", description: "Truck stops, fuel & services nearby", href: "/gps", icon: <MapPin className="size-5" />, image: imgGPS, glowColor: "shadow-sky-500/20" },
      { label: "CDL Directory", description: "Find CDL training programs", href: "/cdl-directory", icon: <Award className="size-5" />, image: imgCDL, glowColor: "shadow-yellow-500/20" },
      { label: "Mileage Tracker", description: "Track miles & business expenses", href: "/business", icon: <Briefcase className="size-5" />, image: imgConcierge, glowColor: "shadow-indigo-500/20" },
    ]
  },
  {
    title: "Explore More",
    icon: <Compass className="size-4" />,
    gradient: "from-rose-500 to-orange-500",
    description: "Discover all the tools and resources available on the platform. From the delivery zone map to our blog and interactive demo.",
    cards: [
      { label: "Zone Map", description: "Nashville I-24 Corridor delivery zones", href: "/zones", icon: <Map className="size-5" />, image: imgZoneMap, glowColor: "shadow-rose-500/30", featured: true },
      { label: "Blog", description: "News, tips & industry stories", href: "/blog", icon: <BookOpen className="size-5" />, image: imgBlog, glowColor: "shadow-orange-500/20" },
      { label: "Concierge", description: "Premium driver services", href: "/concierge", icon: <Sparkles className="size-5" />, image: imgConcierge, glowColor: "shadow-amber-500/20" },
      { label: "Homepage", description: "Full landing page & marketing", href: "/home", icon: <Home className="size-5" />, image: imgHomepage, glowColor: "shadow-slate-400/20" },
      { label: "Team Login", description: "Staff & admin access", href: "/team", icon: <Lock className="size-5" />, image: imgTeamLogin, glowColor: "shadow-zinc-400/20" },
      { label: "GarageBot", description: "AI-powered vehicle maintenance", href: "https://garagebot.io", icon: <Wrench className="size-5" />, image: imgConcierge, glowColor: "shadow-emerald-400/20", badge: "Partner" },
      { label: "Games & Fun", description: "Solitaire, Spades & more for your break", href: "/home#games", icon: <Gamepad2 className="size-5" />, image: imgGames, glowColor: "shadow-purple-500/20" },
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

function BentoCard({ card, size = "normal" }: { card: ExploreCard; size?: "featured" | "normal" }) {
  const isFeatured = size === "featured";
  const isExternal = card.href.startsWith("http");
  const Wrapper = isExternal
    ? ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <a href={card.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
      )
    : ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <Link href={card.href} className={className}>{children}</Link>
      );

  return (
    <Wrapper className="block h-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.98 }}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] hover:border-white/[0.18] active:scale-[0.97] transition-all duration-300 hover:shadow-xl ${card.glowColor} h-full ${isFeatured ? 'min-h-[160px]' : 'min-h-[140px]'}`}
        data-testid={`explore-card-${card.label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="absolute inset-0">
          <img
            src={card.image}
            alt=""
            className="w-full h-full object-cover brightness-125 group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
        </div>

        <div className={`relative ${isFeatured ? 'p-5' : 'p-3'} flex flex-col h-full justify-end`}>
          {card.badge && (
            <div className={`absolute ${isFeatured ? 'top-3 right-3' : 'top-2 right-2'}`}>
              <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30 text-[9px] px-2 py-0.5 backdrop-blur-md animate-pulse shadow-lg shadow-emerald-500/20">
                {card.badge}
              </Badge>
            </div>
          )}

          <div className="mt-auto">
            <p className={`${isFeatured ? 'text-base' : 'text-sm'} font-bold text-white drop-shadow-lg group-hover:drop-shadow-xl transition-all leading-tight`}>
              {card.label}
            </p>
            <p className={`${isFeatured ? 'text-xs mt-1' : 'text-[10px] mt-0.5'} text-white/60 leading-snug group-hover:text-white/80 transition-colors drop-shadow-md line-clamp-2`}>
              {card.description}
            </p>
          </div>

          <div className={`flex items-center gap-1 text-white/30 group-hover:text-white/70 transition-all duration-300 ${isFeatured ? 'mt-3' : 'mt-1.5'}`}>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">Explore</span>
            <ChevronRight className="size-3 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </motion.div>
    </Wrapper>
  );
}

function CategoryInfoModal({ category, onClose }: { category: ExploreCategory; onClose: () => void }) {
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
                <p className="text-[11px] text-white/30">{category.cards.length} option{category.cards.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="text-white/30 hover:text-white hover:bg-white/5 rounded-xl size-8"
              data-testid="button-close-explore-info"
            >
              <X className="size-4" />
            </Button>
          </div>

          <p className="text-sm text-white/50 leading-relaxed mb-5">{category.description}</p>

          <div className="space-y-2">
            <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] font-semibold mb-2">Available Options</p>
            {category.cards.map((card) => {
              const isExt = card.href.startsWith("http");
              const inner = (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all cursor-pointer group" data-testid={`explore-info-${card.label.toLowerCase().replace(/\s+/g, '-')}`}>
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
                <a key={card.href + card.label} href={card.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>{inner}</a>
              ) : (
                <Link key={card.href + card.label} href={card.href} onClick={onClose}>{inner}</Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CategorySection({ category, index }: { category: ExploreCategory; index: number }) {
  const [showInfo, setShowInfo] = useState(false);
  const featured = category.cards.find(c => c.featured);
  const rest = category.cards.filter(c => !c.featured);
  const hasMultipleRows = rest.length > 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.15em]">{category.title}</h2>
          <button
            onClick={() => setShowInfo(true)}
            aria-label={`Info about ${category.title}`}
            className="size-5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] hover:border-white/[0.15] flex items-center justify-center transition-all duration-200 group"
            data-testid={`button-explore-info-${category.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Info className="size-2.5 text-white/30 group-hover:text-white/60 transition-colors" />
          </button>
          <div className={`h-px flex-1 bg-gradient-to-r ${category.gradient} opacity-15`} />
          <span className="text-[10px] text-white/20 font-medium tabular-nums">{category.cards.length}</span>
        </div>
      </div>

      {showInfo && <CategoryInfoModal category={category} onClose={() => setShowInfo(false)} />}

      <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 auto-rows-fr ${
        hasMultipleRows
          ? 'md:grid-cols-3 md:grid-rows-[minmax(140px,auto)_minmax(140px,auto)]'
          : 'md:grid-cols-3 md:grid-rows-[minmax(200px,auto)]'
      }`}>
        {featured && (
          <div className={`col-span-2 md:col-span-1 ${hasMultipleRows ? 'md:row-span-2' : ''} h-full`}>
            <BentoCard card={featured} size="featured" />
          </div>
        )}
        {rest.map((card) => (
          <div key={card.href + card.label} className="h-full">
            <BentoCard card={card} size="normal" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ExploreHub() {
  const [loaded, setLoaded] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoMuted, setVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoIndexRef = useRef(0);
  const [, navigate] = useLocation();

  // Order Now modal — show once per session
  const [showOrderModal, setShowOrderModal] = useState(() => {
    return !sessionStorage.getItem('he_order_modal_dismissed');
  });

  const dismissModal = () => {
    setShowOrderModal(false);
    sessionStorage.setItem('he_order_modal_dismissed', '1');
  };

  const handleOrderNow = () => {
    setShowOrderModal(false);
    sessionStorage.setItem('he_order_modal_dismissed', '1');
    navigate('/zones');
  };

  useEffect(() => {
    if (!loaded) return;
    const video = videoRef.current;
    if (!video) return;

    const playNext = () => {
      videoIndexRef.current = (videoIndexRef.current + 1) % HERO_VIDEOS.length;
      setCurrentVideoIndex(videoIndexRef.current);
      video.src = HERO_VIDEOS[videoIndexRef.current].src;
      video.load();
      video.play().catch(() => {});
    };

    video.muted = true;
    video.addEventListener('ended', playNext);
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('ended', playNext);
    };
  }, [loaded]);


  const allCards = categories.flatMap(c => c.cards);
  const filteredCategories = searchTerm.trim()
    ? categories.map(cat => ({
        ...cat,
        cards: cat.cards.filter(card =>
          card.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(cat => cat.cards.length > 0)
    : categories;

  if (!loaded) return <SkeletonLoader />;

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/[0.02] rounded-full blur-[150px] pointer-events-none" />

        {/* ═══ ORDER NOW MODAL ═══ */}
        <AnimatePresence>
          {showOrderModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              data-testid="order-modal-overlay"
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismissModal} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                data-testid="order-modal"
              >
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f35] via-[#162840] to-[#0d1f35]" />
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="relative p-6 text-center space-y-5">
                  {/* Emoji + Title */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 mx-auto">
                      <ShoppingCart className="size-8 text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Hungry?</h2>
                    <p className="text-sm text-white/60 leading-relaxed">
                      Order from local food trucks in the Nashville I-24 Corridor. Fresh food delivered to your door.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleOrderNow}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      data-testid="order-modal-cta"
                    >
                      🍔 Order Now
                    </button>
                    <button
                      onClick={dismissModal}
                      className="w-full py-2.5 rounded-xl text-white/40 text-sm hover:text-white/60 transition-colors"
                      data-testid="order-modal-dismiss"
                    >
                      Just browsing
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/70">
                      <Sparkles className="size-3" /> Free delivery zones
                    </span>
                    <span className="text-white/10">•</span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-violet-400/70">
                      <Lock className="size-3" /> Secure checkout
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sticky top-0 z-50 bg-[#070b16]/70 backdrop-blur-2xl border-b border-white/[0.04] safe-top">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between">
            <Link href="/">
              <Button data-testid="explore-back-home" variant="ghost" size="icon" className="size-8 text-white/40 hover:text-white hover:bg-white/5 rounded-lg">
                <Home className="size-4" />
              </Button>
            </Link>
            <div className="flex-1 text-center">
              <h1 className="text-base font-bold text-white leading-tight">Explore Happy Eats</h1>
              <p className="text-[11px] text-white/30 leading-tight">{allCards.length} features to discover</p>
            </div>
            <Link href="/command-center">
              <Button data-testid="explore-to-command" variant="ghost" size="icon" className="size-8 text-white/40 hover:text-white hover:bg-white/5 rounded-lg">
                <Wrench className="size-4" />
              </Button>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
                <input
                  type="text"
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-52 h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.06] transition-all"
                  data-testid="input-explore-search"
                />
              </div>
            </div>
          </div>
        </div>

        <ComingSoonBanner />

        <section className="relative h-[60vh] sm:h-[70vh] overflow-hidden" data-testid="video-flyover-hero">
          <div className="absolute inset-0 bg-black">
            <video
              ref={videoRef}
              src={HERO_VIDEOS[0].src}
              autoPlay
              muted={videoMuted}
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-2xl">
                Everything in one place
              </h2>
              <p className="text-base sm:text-lg text-white font-medium max-w-lg mx-auto" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)' }}>
                Food trucks, fleet services, local delivery, office catering — explore every way we serve you.
              </p>
              <p className="text-sm text-white/80 mt-3 font-semibold tracking-wide" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                {HERO_VIDEOS[currentVideoIndex].label}
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
            <div className="flex gap-2">
              {HERO_VIDEOS.map((v, idx) => (
                <button
                  key={idx}
                  data-testid={`dot-video-${idx}`}
                  onClick={() => {
                    if (idx !== currentVideoIndex && videoRef.current) {
                      videoIndexRef.current = idx;
                      setCurrentVideoIndex(idx);
                      videoRef.current.src = HERO_VIDEOS[idx].src;
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    currentVideoIndex === idx
                      ? 'bg-orange-400'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  style={{ width: 10, height: 10, minHeight: 0, minWidth: 0, padding: 0, border: 'none' }}
                  aria-label={v.label}
                />
              ))}
            </div>
            <button
              onClick={() => setVideoMuted(!videoMuted)}
              className="size-7 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
              data-testid="button-toggle-mute"
              aria-label={videoMuted ? "Unmute" : "Mute"}
            >
              {videoMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
            </button>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-8 sm:space-y-10 relative z-10 pb-24 sm:pb-10">

          <div className="sm:hidden px-1 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/[0.15] focus:bg-white/[0.06] transition-all"
                data-testid="input-explore-search-mobile"
              />
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="size-10 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No features match "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 text-xs text-orange-400/60 hover:text-orange-400 transition-colors"
                data-testid="button-clear-search"
              >
                Clear search
              </button>
            </motion.div>
          ) : (
            filteredCategories.map((category, index) => (
              <CategorySection key={category.title} category={category} index={index} />
            ))
          )}
        </div>

        <div className="px-4 mb-6">
          <EcosystemCarousel />
        </div>

        <Footer />
      </div>
    </AnimatePresence>
  );
}
