import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Shield, MapPin,
  ChevronRight, ChevronLeft, Truck, ShoppingCart,
  Globe, Heart, Zap
} from "lucide-react";
import { useLanguage } from "@/i18n/context";

import ecoTLDC from "@/assets/images/eco/tl-driver-connect.png";
import ecoHE from "@/assets/images/eco/happy-eats.png";
import ecoGB from "@/assets/images/eco/garagebot.png";
import ecoDW from "@/assets/images/eco/darkwave-studios.png";
import ecoTS from "@/assets/images/eco/trustshield.png";
import ecoTLID from "@/assets/images/eco/tlid.png";
import ecoTV from "@/assets/images/eco/trustvault.png";
import ecoTL from "@/assets/images/eco/trustlayer.png";
import ecoSignal from "@/assets/images/eco/signal.png";
import ecoOS from "@/assets/images/eco/orbit-staffing.png";

const platformLinks = [
  { label: "Order Food", href: "/order/i24-corridor", icon: ShoppingCart },
  { label: "Browse Vendors", href: "/vendors", icon: Truck },
  { label: "Kitchen Menu", href: "/kitchen", icon: ShoppingCart },
  { label: "Track Order", href: "/tracking", icon: MapPin },
  { label: "Zone Map", href: "/zones", icon: MapPin },
  { label: "Affiliate Program", href: "/affiliate", icon: Heart },
];

const driverLinks = [
  { label: "Trucker Talk", href: "/trucker-talk" },
  { label: "Weather & Roads", href: "/weather" },
  { label: "GPS Finder", href: "/gps" },
  { label: "CDL Directory", href: "/cdl-directory" },
  { label: "Mileage Tracker", href: "/business" },
  { label: "Concierge", href: "/concierge" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Investor Info", href: "/investors" },
  { label: "Contact Us", href: "/contact" },
  { label: "Support", href: "/support" },
  { label: "Team", href: "/team" },
  { label: "Trust Layer", href: "/ecosystem" },
  { label: "Report a Bug", href: "/contact" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
];

const ecosystemBrands = [
  { name: "TL Driver Connect", tagline: "Driver Services Platform", url: "https://tldriverconnect.com", image: ecoTLDC, color: "from-cyan-400 to-blue-500" },
  { name: "Happy Eats", tagline: "Food Ordering & Delivery", url: "https://happyeats.app", image: ecoHE, color: "from-orange-400 to-amber-500" },
  { name: "GarageBot", tagline: "AI Vehicle Maintenance", url: "https://garagebot.io", image: ecoGB, color: "from-emerald-400 to-green-500" },
  { name: "DarkWave Studios", tagline: "Creative Technology", url: "https://dwtl.io", image: ecoDW, color: "from-violet-400 to-purple-500" },
  { name: "TrustShield", tagline: "Security & Protection", url: "https://trustshield.tech", image: ecoTS, color: "from-cyan-400 to-teal-500" },
  { name: "SignalCast", tagline: "Social Media Automation", url: "https://signalcast.tlid.io", image: ecoTLID, color: "from-blue-400 to-indigo-500" },
  { name: "TrustVault", tagline: "Media Studio & Editor", url: "/media-editor", image: ecoTV, color: "from-amber-400 to-orange-500" },
  { name: "Trust Layer", tagline: "Layer 1 Blockchain & Ecosystem Hub", url: "/ecosystem", image: ecoTL, color: "from-cyan-400 to-amber-500" },
  { name: "Signal", tagline: "Native Ecosystem Asset — Signal Charging", url: "https://dwtl.io/signal", image: ecoSignal, color: "from-amber-400 to-cyan-500" },
  { name: "OrbitStaffing", tagline: "Payroll, HR & Staffing Solutions", url: "https://orbitstaffing.io", image: ecoOS, color: "from-teal-400 to-blue-500" },
];

const socialLinks = [
  { name: "Facebook", icon: "f", url: "https://facebook.com/tldriverconnect", bg: "from-blue-600 to-blue-700" },
  { name: "Instagram", icon: "ig", url: "https://instagram.com/tldriverconnect", bg: "from-pink-500 via-purple-500 to-orange-400" },
  { name: "X", icon: "X", url: "https://x.com/tldriverconnect", bg: "from-gray-700 to-gray-800" },
  { name: "TikTok", icon: "tk", url: "https://tiktok.com/@tldriverconnect", bg: "from-gray-900 to-gray-800" },
];

export function EcosystemCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getCards = () => {
    const el = scrollRef.current;
    if (!el) return [];
    return Array.from(el.children) as HTMLElement[];
  };

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = getCards();
    if (!cards.length) return;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(containerCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    setActiveIndex(closestIdx);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => { if (el) el.removeEventListener("scroll", checkScroll); };
  }, []);

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = getCards();
    if (!cards[idx]) return;
    const card = cards[idx];
    const scrollPos = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: scrollPos, behavior: "smooth" });
  };

  const scroll = (dir: "left" | "right") => {
    const next = dir === "left" ? Math.max(0, activeIndex - 1) : Math.min(ecosystemBrands.length - 1, activeIndex + 1);
    scrollTo(next);
  };

  return (
    <div className="relative mb-8">
      <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em] mb-4 text-center flex items-center justify-center gap-2">
        <Zap className="size-3 text-amber-400" />
        Ecosystem
        <Zap className="size-3 text-amber-400" />
      </h4>

      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: "11%", paddingRight: "11%" }}
        >
          {ecosystemBrands.map((brand, i) => {
            const isExternal = brand.url.startsWith("http");
            const isActive = i === activeIndex;
            const cardContent = (
              <div
                className={`relative h-[130px] rounded-2xl overflow-hidden border transition-all duration-400 cursor-pointer group snap-center ${
                  isActive
                    ? "border-cyan-500/30 shadow-lg shadow-cyan-500/10 scale-100"
                    : "border-white/[0.06] opacity-60 scale-95"
                }`}
                style={{ width: "78vw", minWidth: "78vw", maxWidth: "400px" }}
                data-testid={`footer-eco-${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <img src={brand.image} alt="" className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-110 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className={`absolute inset-0 bg-gradient-to-br ${brand.color} opacity-[0.08] group-hover:opacity-[0.18] transition-opacity duration-300`} />
                <div className="relative h-full flex flex-col justify-end p-4">
                  <p className="text-sm font-bold text-white drop-shadow-lg leading-tight">{brand.name}</p>
                  <p className="text-[11px] text-white/50 mt-1 leading-tight">{brand.tagline}</p>
                </div>
              </div>
            );

            return isExternal ? (
              <a key={brand.name} href={brand.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                {cardContent}
              </a>
            ) : (
              <Link key={brand.name} href={brand.url} className="shrink-0">
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => scroll("left")}
          disabled={activeIndex === 0}
          className="size-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/30 disabled:opacity-20 disabled:cursor-default transition-all"
          aria-label="Previous"
          data-testid="eco-carousel-prev"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {ecosystemBrands.map((brand, i) => (
            <button
              key={brand.name}
              onClick={() => scrollTo(i)}
              aria-label={brand.name}
              style={{
                width: i === activeIndex ? 20 : 8,
                height: 8,
                minHeight: 8,
                maxHeight: 8,
                borderRadius: 9999,
                padding: 0,
                border: "none",
                background: i === activeIndex ? "#22d3ee" : "rgba(255,255,255,0.2)",
                boxShadow: i === activeIndex ? "0 4px 6px rgba(34,211,238,0.4)" : "none",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              data-testid={`eco-dot-${i}`}
            />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          disabled={activeIndex === ecosystemBrands.length - 1}
          className="size-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/30 disabled:opacity-20 disabled:cursor-default transition-all"
          aria-label="Next"
          data-testid="eco-carousel-next"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const dwscClickRef = useRef({ count: 0, timer: null as any });
  const handleDWSCClick = () => {
    dwscClickRef.current.count++;
    if (dwscClickRef.current.count === 3) {
      dwscClickRef.current.count = 0;
      clearTimeout(dwscClickRef.current.timer);
      window.open('https://dwtl.io/#portal', '_blank');
    } else {
      clearTimeout(dwscClickRef.current.timer);
      dwscClickRef.current.timer = setTimeout(() => { dwscClickRef.current.count = 0; }, 800);
    }
  };
  return (
    <>
      <footer className="relative mt-auto pb-2 md:pb-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b16] via-[#0a0f1e] to-[#050810]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="relative">
          <div className="h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
          <div className="h-[2px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

          <div className="container mx-auto max-w-7xl px-4 pt-10 pb-6">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Truck className="size-5 text-white" />
                </div>
                <div>
                  <a href="https://tldriverconnect.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white tracking-wide hover:text-cyan-300 transition-colors">
                    TL Driver Connect
                  </a>
                  <p className="text-[10px] text-white/40">by DarkWave Studios</p>
                </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed text-center max-w-sm mb-4">
                <a href="https://tldriverconnect.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400/70 hover:text-cyan-300 transition-colors">TL Driver Connect</a> is a nationwide driver services app — white-label ready and built for the road. Happy Eats is our first tenant, powering food delivery across Middle Tennessee.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`size-8 rounded-lg bg-gradient-to-br ${s.bg} flex items-center justify-center text-white text-[10px] font-bold hover:scale-110 hover:shadow-lg transition-all duration-200 border border-white/10`}
                    title={s.name}
                    data-testid={`footer-social-${s.name.toLowerCase()}`}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h4 className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mb-4">
                  Platform
                </h4>
                <ul className="space-y-2.5">
                  {platformLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-white/40 hover:text-orange-300 transition-colors duration-200"
                        data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mb-4">
                  Driver Tools
                </h4>
                <ul className="space-y-2.5">
                  {driverLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-white/40 hover:text-cyan-300 transition-colors duration-200"
                        data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-[11px] font-bold text-white/70 uppercase tracking-[0.2em] mb-3 text-center">
                Company
              </h4>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                {companyLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/40 hover:text-violet-300 transition-colors duration-200"
                    data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-5" />

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                  data-testid={`footer-legal-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span>© 2026 DarkWave Studios, LLC</span>
                <span className="text-white/15">•</span>
                <span>All rights reserved</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/25">
                <Shield className="size-3.5 text-cyan-500/40" />
                <span>Secured by</span>
                <a href="https://trustshield.tech" target="_blank" rel="noopener noreferrer" className="text-cyan-400/50 hover:text-cyan-400 transition-colors">
                  TrustShield
                </a>
                <span className="text-white/15">|</span>
                <span>Powered by</span>
                <a href="https://dwtl.io" target="_blank" rel="noopener noreferrer" className="text-violet-400/50 hover:text-violet-400 transition-colors">
                  DarkWave
                </a>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-white/25 mt-1">
                <span>Built with</span>
                <Heart className="size-3.5 text-rose-500/50 fill-rose-500/50" />
                <span>for drivers everywhere</span>
                <span className="text-white/10 ml-1">|</span>
                <span onClick={handleDWSCClick} className="cursor-default select-none text-white/20 hover:text-cyan-400/40 transition-colors" title="◈ DWSC">◈</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
