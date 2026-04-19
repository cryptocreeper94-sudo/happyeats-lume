import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Check, X, ChevronLeft, ChevronRight,
  Zap, Clock, CalendarCheck, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ZoneInfo {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  isActive: boolean | null;
  exits?: Array<{ exit: number; name: string }> | null;
  cutoffTime?: string | null;
}

interface ZoneCarouselProps {
  zones: ZoneInfo[];
  scheduledZoneIds: number[];
  mode: "owner" | "vendor";
  vendorZoneIds?: number[];
  confirmedZoneIds?: number[];
  onToggle?: (zoneId: number) => void;
  onConfirm?: (zoneId: number) => void;
  isPublishing?: boolean;
  isConfirming?: boolean;
  published?: boolean;
  dateLabel?: string;
}

const GRADIENT_PRESETS = [
  "from-emerald-500/40 via-teal-500/20 to-cyan-500/40",
  "from-violet-500/40 via-purple-500/20 to-fuchsia-500/40",
  "from-orange-500/40 via-amber-500/20 to-yellow-500/40",
  "from-cyan-500/40 via-blue-500/20 to-indigo-500/40",
  "from-rose-500/40 via-pink-500/20 to-red-500/40",
  "from-lime-500/40 via-green-500/20 to-emerald-500/40",
  "from-sky-500/40 via-cyan-500/20 to-teal-500/40",
  "from-amber-500/40 via-orange-500/20 to-red-500/40",
  "from-indigo-500/40 via-violet-500/20 to-purple-500/40",
  "from-teal-500/40 via-emerald-500/20 to-green-500/40",
  "from-fuchsia-500/40 via-pink-500/20 to-rose-500/40",
];

export default function ZoneCarousel({
  zones,
  scheduledZoneIds,
  mode,
  vendorZoneIds = [],
  confirmedZoneIds = [],
  onToggle,
  onConfirm,
  isPublishing,
  isConfirming,
  published,
  dateLabel,
}: ZoneCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
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
  }, [zones.length]);

  const scrollTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    if (!cards[idx]) return;
    const card = cards[idx];
    const scrollPos = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({ left: scrollPos, behavior: "smooth" });
  };

  const scroll = (dir: "left" | "right") => {
    const next = dir === "left" ? Math.max(0, activeIndex - 1) : Math.min(zones.length - 1, activeIndex + 1);
    scrollTo(next);
  };

  const scheduledCount = scheduledZoneIds.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CalendarCheck className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Tomorrow's Zones
            </h3>
            <p className="text-[10px] text-white/30">
              {dateLabel || "Select zones for tomorrow's delivery"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {published ? (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
              <Check className="size-2.5" /> Published
            </Badge>
          ) : (
            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] gap-1">
              <Clock className="size-2.5" /> Draft
            </Badge>
          )}
          <Badge className="bg-white/5 text-white/50 border-white/10 text-[10px] tabular-nums">
            {scheduledCount}/{zones.length}
          </Badge>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: "8%", paddingRight: "8%" }}
        >
          {zones.map((zone, i) => {
            const isScheduled = scheduledZoneIds.includes(zone.id);
            const isVendorZone = mode === "vendor" ? vendorZoneIds.includes(zone.id) : true;
            const isConfirmed = confirmedZoneIds.includes(zone.id);
            const isCenter = i === activeIndex;
            const gradientClass = GRADIENT_PRESETS[i % GRADIENT_PRESETS.length];
            const zoneColor = zone.color || "#22c55e";
            const exitCount = zone.exits?.length || 0;

            return (
              <div
                key={zone.id}
                className="shrink-0 snap-center"
                style={{ width: "75vw", minWidth: "75vw", maxWidth: "340px" }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: isCenter ? 1 : 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`
                    relative h-[180px] rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group
                    ${isScheduled
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/15"
                      : "border-white/[0.08] opacity-70"
                    }
                    ${!isCenter ? "opacity-60" : ""}
                  `}
                  onClick={() => {
                    if (mode === "owner" && onToggle) onToggle(zone.id);
                    if (mode === "vendor" && isVendorZone && isScheduled && !isConfirmed && onConfirm) onConfirm(zone.id);
                  }}
                  data-testid={`zone-card-${zone.slug}`}
                >
                  {/* Animated gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-30`} />
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(ellipse at 30% 20%, ${zoneColor}40, transparent 60%), radial-gradient(ellipse at 70% 80%, ${zoneColor}30, transparent 50%)`,
                    }}
                  />
                  {/* Animated mesh overlay */}
                  <div className="absolute inset-0 bg-[#070b16]/50" />

                  {/* Animated glow border for scheduled zones */}
                  {isScheduled && (
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        boxShadow: `inset 0 0 30px ${zoneColor}15, 0 0 20px ${zoneColor}10`,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-4">
                    {/* Top: Zone number + status */}
                    <div className="flex items-start justify-between">
                      <div
                        className="size-11 rounded-xl flex items-center justify-center text-lg font-black border"
                        style={{
                          background: isScheduled ? `${zoneColor}25` : "rgba(255,255,255,0.05)",
                          borderColor: isScheduled ? `${zoneColor}50` : "rgba(255,255,255,0.1)",
                          color: isScheduled ? zoneColor : "rgba(255,255,255,0.3)",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isScheduled ? (
                          <Badge className="bg-emerald-500/25 text-emerald-200 border-emerald-500/40 text-[9px] font-bold tracking-wider px-2 py-0.5 gap-1">
                            <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            ACTIVE
                          </Badge>
                        ) : (
                          <Badge className="bg-white/[0.05] text-white/30 border-white/[0.1] text-[9px] font-bold tracking-wider px-2 py-0.5">
                            OFF
                          </Badge>
                        )}
                        {mode === "vendor" && isConfirmed && (
                          <Badge className="bg-cyan-500/25 text-cyan-200 border-cyan-500/40 text-[9px] font-bold gap-1 px-2 py-0.5">
                            <Check className="size-2.5" /> CONFIRMED
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Zone info */}
                    <div>
                      <p className={`text-base font-bold leading-tight mb-1 ${isScheduled ? "text-white" : "text-white/50"}`}>
                        {zone.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`flex items-center gap-1 ${isScheduled ? "text-emerald-400/70" : "text-white/25"}`}>
                          <MapPin className="size-2.5" /> {exitCount} stops
                        </span>
                        {zone.cutoffTime && (
                          <span className={isScheduled ? "text-emerald-400/50" : "text-white/20"}>
                            · {zone.cutoffTime}
                          </span>
                        )}
                      </div>

                      {/* Vendor-specific: opt-in badge */}
                      {mode === "vendor" && !isVendorZone && isScheduled && (
                        <p className="text-[9px] text-white/20 mt-1 italic">Not assigned to this zone</p>
                      )}
                    </div>

                    {/* Hover overlay */}
                    {mode === "owner" && (
                      <div className={`
                        absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        ${isScheduled ? "bg-red-950/40" : "bg-emerald-950/40"} backdrop-blur-[2px] rounded-2xl
                      `}>
                        <div className={`
                          size-12 rounded-xl flex items-center justify-center
                          ${isScheduled
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }
                        `}>
                          {isScheduled ? <X className="size-5" /> : <Check className="size-5" />}
                        </div>
                      </div>
                    )}

                    {mode === "vendor" && isVendorZone && isScheduled && !isConfirmed && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-emerald-950/40 backdrop-blur-[2px] rounded-2xl">
                        <Button
                          className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-lg"
                          disabled={isConfirming}
                          onClick={(e) => {
                            e.stopPropagation();
                            onConfirm?.(zone.id);
                          }}
                        >
                          {isConfirming ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Check className="size-3.5 mr-1" />}
                          Confirm Available
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Bottom color bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        background: isScheduled
                          ? `linear-gradient(90deg, ${zoneColor}, ${zoneColor}88)`
                          : "linear-gradient(90deg, rgba(255,255,255,0.05), transparent)",
                        boxShadow: isScheduled ? `0 0 12px ${zoneColor}40` : "none",
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => scroll("left")}
          disabled={activeIndex === 0}
          className="size-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/30 disabled:opacity-20 disabled:cursor-default transition-all"
          aria-label="Previous"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <div className="flex items-center gap-1.5">
          {zones.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Zone ${i + 1}`}
              style={{
                width: i === activeIndex ? 20 : 8,
                height: 8,
                minHeight: 8,
                maxHeight: 8,
                borderRadius: 9999,
                padding: 0,
                border: "none",
                background: i === activeIndex
                  ? scheduledZoneIds.includes(zones[i]?.id) ? "#22d3ee" : "rgba(255,255,255,0.4)"
                  : scheduledZoneIds.includes(zones[i]?.id) ? "rgba(34,211,238,0.3)" : "rgba(255,255,255,0.15)",
                boxShadow: i === activeIndex ? "0 4px 6px rgba(34,211,238,0.3)" : "none",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          disabled={activeIndex === zones.length - 1}
          className="size-7 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/30 disabled:opacity-20 disabled:cursor-default transition-all"
          aria-label="Next"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
