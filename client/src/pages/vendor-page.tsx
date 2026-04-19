import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Mail, Globe, Clock, Star, ChefHat, Shield, ExternalLink,
  ArrowRight, Share2, Copy, Check, ChevronDown, ChevronUp, Utensils,
  Award, Truck, Store, UtensilsCrossed, Flame, Sparkles,
  QrCode, AlertCircle, Heart, Leaf, Megaphone, FileText, ImageIcon, Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import type { MenuItemType, VendorPageContent } from "@shared/schema";

/* ───── Bundled showcase assets ───── */
import shellsHeroImg from "@/assets/images/shells-kitchen-hero.png";
import shellsEmblemImg from "@/assets/images/shells-kitchen-emblem.png";
import smokyRidgeHeroImg from "@/assets/images/smoky-ridge-hero.png";
import smokyRidgeEmblemImg from "@/assets/images/smoky-ridge-emblem.png";

/* ───── Constants ───── */
const GLASS = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const BUSINESS_ICONS: Record<string, React.ReactNode> = {
  "food-truck":   <Truck className="size-5" />,
  "restaurant":   <Store className="size-5" />,
  "catering":     <UtensilsCrossed className="size-5" />,
  "bakery":       <ChefHat className="size-5" />,
  "cafe":         <Flame className="size-5" />,
};

const CUISINE_COLORS: Record<string, string> = {
  "Mexican": "from-amber-600 to-orange-600",
  "BBQ": "from-red-700 to-orange-700",
  "Asian": "from-rose-600 to-pink-600",
  "Italian": "from-emerald-700 to-green-700",
  "American": "from-blue-700 to-indigo-700",
  "Southern": "from-amber-700 to-yellow-700",
  "Fusion": "from-violet-600 to-purple-600",
  "Mediterranean": "from-cyan-700 to-teal-700",
  "Indian": "from-orange-700 to-red-700",
  "Vegan": "from-emerald-600 to-lime-600",
};

/* Showcase vendor assets keyed by slug */
const VENDOR_ASSETS: Record<string, { hero: string; emblem: string }> = {
  "shells-kitchen": { hero: shellsHeroImg, emblem: shellsEmblemImg },
  "smoky-ridge-bbq": { hero: smokyRidgeHeroImg, emblem: smokyRidgeEmblemImg },
};

const getGradient = (cuisine?: string | null) => {
  if (!cuisine) return "from-slate-700 to-slate-800";
  for (const [key, val] of Object.entries(CUISINE_COLORS)) {
    if (cuisine.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "from-orange-700 to-rose-700";
};

interface VendorData {
  id: number; name: string; slug: string; businessType: string; cuisine: string;
  description: string; contactName: string; phone: string; email: string;
  address: string; website: string; rating: string; isApproved: boolean;
  isActive: boolean; locationType: string; menu: MenuItemType[];
  logoUrl?: string | null; imageUrl?: string | null;
  healthInspectionScore?: string | null; healthInspectionGrade?: string | null;
  healthInspectionCertUrl?: string | null; healthInspectionDate?: string | null;
  operatingHoursStart?: string | null; operatingHoursEnd?: string | null;
  pageContent?: VendorPageContent | null;
}

/* ───── Menu section ───── */
function MenuSection({ menu, vendorId, vendorName }: { menu: MenuItemType[]; vendorId: number; vendorName: string }) {
  const available = menu.filter(i => i.isAvailable);
  const byCategory: Record<string, MenuItemType[]> = {};
  available.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  });
  const categories = Object.keys(byCategory);
  const [expanded, setExpanded] = useState<string | null>(categories[0] || null);

  if (available.length === 0) {
    return (
      <Card className={GLASS}>
        <CardContent className="p-8 text-center">
          <Utensils className="size-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">Menu coming soon</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((cat, ci) => (
        <motion.div
          key={cat}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + ci * 0.05 }}
        >
          <Card className={`${GLASS} overflow-hidden`}>
            <button
              onClick={() => setExpanded(expanded === cat ? null : cat)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.03] transition-colors"
              data-testid={`menu-cat-${cat.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/20">
                  <Utensils className="size-3.5 text-orange-400" />
                </div>
                <span className="text-sm font-bold text-white">{cat}</span>
                <Badge variant="secondary" className="text-[9px] bg-white/10 text-white/60 border-0">{byCategory[cat].length}</Badge>
              </div>
              {expanded === cat ? <ChevronUp className="size-4 text-white/30" /> : <ChevronDown className="size-4 text-white/30" />}
            </button>

            <AnimatePresence>
              {expanded === cat && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2">
                    {byCategory[cat].map((item, ii) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ii * 0.03 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:border-orange-500/15 transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{item.name}</p>
                            {item.customizations && (item.customizations.addOns?.length || item.customizations.removals?.length) && (
                              <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/20 text-[8px] px-1.5">Customizable</Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-[11px] text-white/35 mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <p className="text-sm font-bold text-emerald-400 shrink-0">${item.price.toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}

      {/* Order CTA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Link href={`/menu/${vendorId}`}>
          <Card className="cursor-pointer overflow-hidden group">
            <div className="relative bg-gradient-to-r from-orange-500 to-rose-500 p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-base">Order from {vendorName}</p>
                <p className="text-white/70 text-xs mt-0.5">Browse menu & place your order</p>
              </div>
              <ArrowRight className="size-6 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
}

/* ───── Share / QR ───── */
function ShareSection({ slug, vendorName }: { slug: string; vendorName: string }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const pageUrl = typeof window !== "undefined" ? `${window.location.origin}/v/${slug}` : `/v/${slug}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(pageUrl);
    setCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: vendorName, text: `Check out ${vendorName} on Happy Eats!`, url: pageUrl });
    } else {
      copyLink();
    }
  };

  return (
    <Card className={GLASS}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Share2 className="size-4 text-sky-400" />
          <p className="text-sm font-bold text-white">Share This Page</p>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
          <code className="flex-1 text-[11px] text-white/50 truncate">{pageUrl}</code>
          <Button size="sm" variant="ghost" onClick={copyLink} className="h-7 px-2.5 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10">
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={shareNative} className="flex-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/20 text-xs h-9">
            <Share2 className="size-3 mr-1.5" /> Share
          </Button>
          <Button onClick={() => setShowQR(!showQR)} variant="outline" className="border-white/10 text-white/60 hover:text-white text-xs h-9">
            <QrCode className="size-3 mr-1.5" /> QR Code
          </Button>
        </div>

        <AnimatePresence>
          {showQR && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex justify-center pt-3">
                <div className="p-4 bg-white rounded-2xl shadow-2xl">
                  <QRCodeSVG value={pageUrl} size={160} bgColor="#ffffff" fgColor="#0a1628" level="M" />
                </div>
              </div>
              <p className="text-[10px] text-center text-white/30 mt-3">Scan to visit this page</p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function VendorPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: vendor, isLoading, error } = useQuery<VendorData>({
    queryKey: ["vendor-page", slug],
    queryFn: async () => {
      const res = await fetch(`/api/food-trucks/slug/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  /* ──── Loading ──── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628]">
        <div className="h-80 bg-gradient-to-b from-slate-700/30 to-transparent animate-pulse" />
        <div className="max-w-2xl mx-auto px-4 -mt-28 space-y-4">
          <div className="flex flex-col items-center">
            <Skeleton className="size-28 rounded-3xl mb-4" />
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-3 gap-2.5 pt-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  /* ──── Not found ──── */
  if (!vendor || error) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className={`${GLASS} max-w-md w-full`}>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-14 text-red-400/60 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">Vendor Not Found</h2>
            <p className="text-sm text-white/40 mb-6">This business page doesn't exist or has been deactivated.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600">
                Back to Happy Eats
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assets = VENDOR_ASSETS[vendor.slug];
  const businessLabel = vendor.businessType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Vendor";
  const gradient = getGradient(vendor.cuisine);
  const menuItems = vendor.menu || [];
  const availableCount = menuItems.filter(i => i.isAvailable).length;
  const hasHours = vendor.operatingHoursStart && vendor.operatingHoursEnd;

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const cuisineTags = vendor.cuisine ? vendor.cuisine.split(',').map(c => c.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* SEO */}
      <title>{vendor.name} | Happy Eats</title>
      <meta name="description" content={vendor.description || `Order from ${vendor.name} on Happy Eats`} />

      {/* ──── Full-bleed Hero with image ──── */}
      <div className="relative overflow-hidden">
        {/* Hero image or gradient */}
        {assets?.hero ? (
          <div className="absolute inset-0">
            <img
              src={assets.hero}
              alt=""
              className="w-full h-full object-cover scale-105"
              data-testid="img-vendor-hero"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-[#0a1628]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
          </div>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-40`} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1628]" />
          </>
        )}

        {/* Ambient glow orbs */}
        <motion.div
          className="absolute top-10 left-[10%] w-40 h-40 rounded-full blur-3xl"
          style={{ background: "rgba(249,115,22,0.15)" }}
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-16 right-[15%] w-32 h-32 rounded-full blur-3xl"
          style={{ background: "rgba(236,72,153,0.12)" }}
          animate={{ y: [0, -15, 0], scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, delay: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-16 pb-28 text-center">
          {/* Emblem / Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative inline-block mb-6"
          >
            {(assets?.emblem || vendor.logoUrl) ? (
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-orange-500/30 via-rose-500/20 to-violet-500/30 blur-xl animate-pulse" />
                <div className="relative size-32 rounded-3xl border-2 border-white/25 overflow-hidden bg-[#0a1628]/60 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                  <img
                    src={assets?.emblem || vendor.logoUrl!}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                    data-testid="img-vendor-emblem"
                  />
                </div>
                {/* Verified checkmark */}
                {vendor.isApproved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-2 -right-2 size-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center border-2 border-[#0a1628] shadow-lg"
                  >
                    <Check className="size-4 text-white" />
                  </motion.div>
                )}
              </div>
            ) : (
              <div className={`size-32 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center border-2 border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)]`}>
                {BUSINESS_ICONS[vendor.businessType] || <ChefHat className="size-14 text-white/80" />}
              </div>
            )}
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 drop-shadow-lg"
            data-testid="heading-vendor-name"
          >
            {vendor.name}
          </motion.h1>

          {/* Cuisine tags — animated pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center justify-center gap-2 flex-wrap mb-4"
          >
            <Badge className="bg-white/10 text-white/80 border-white/15 text-xs gap-1.5 backdrop-blur-sm">
              {BUSINESS_ICONS[vendor.businessType] || <Store className="size-3" />}
              {businessLabel}
            </Badge>
            {cuisineTags.map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/20 text-xs backdrop-blur-sm">
                  {tag}
                </Badge>
              </motion.div>
            ))}
            {vendor.rating && parseFloat(vendor.rating) > 0 && (
              <Badge className="bg-yellow-500/15 text-yellow-300 border-yellow-500/20 text-xs gap-1 backdrop-blur-sm">
                <Star className="size-3 fill-current" /> {parseFloat(vendor.rating).toFixed(1)}
              </Badge>
            )}
          </motion.div>

          {/* Description */}
          {vendor.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-white/60 max-w-md mx-auto leading-relaxed drop-shadow-md"
            >
              {vendor.description}
            </motion.p>
          )}

          {/* Health badge */}
          {(vendor.healthInspectionGrade || vendor.healthInspectionScore) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400/40 shadow-lg shadow-emerald-500/20"
            >
              <Shield className="size-4 text-white" />
              <span className="text-white font-bold text-sm">
                {vendor.healthInspectionGrade && `Grade ${vendor.healthInspectionGrade}`}
                {vendor.healthInspectionGrade && vendor.healthInspectionScore && " · "}
                {vendor.healthInspectionScore && `${parseFloat(vendor.healthInspectionScore).toFixed(0)}/100`}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ──── Main content ──── */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 pb-16 space-y-5 relative z-20">
        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-3 gap-2.5">
            <Card className={GLASS}>
              <CardContent className="p-3.5 text-center">
                <div className="size-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-2 border border-orange-500/15">
                  <Utensils className="size-4 text-orange-400" />
                </div>
                <p className="text-lg font-bold text-white">{availableCount}</p>
                <p className="text-[10px] text-white/35">Menu Items</p>
              </CardContent>
            </Card>
            <Card className={GLASS}>
              <CardContent className="p-3.5 text-center">
                <div className="size-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-2 border border-sky-500/15">
                  <Clock className="size-4 text-sky-400" />
                </div>
                {hasHours ? (
                  <>
                    <p className="text-sm font-bold text-white">{formatTime(vendor.operatingHoursStart!)}</p>
                    <p className="text-[10px] text-white/35">to {formatTime(vendor.operatingHoursEnd!)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-bold text-white">Varies</p>
                    <p className="text-[10px] text-white/35">Hours</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className={GLASS}>
              <CardContent className="p-3.5 text-center">
                <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-2 border border-emerald-500/15">
                  <Award className="size-4 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white">
                  {vendor.healthInspectionGrade || "—"}
                </p>
                <p className="text-[10px] text-white/35">Health Grade</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {vendor.isApproved && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="size-3 text-emerald-400" />
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Verified</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Heart className="size-3 text-orange-400" />
              <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Happy Eats Partner</span>
            </div>
            {vendor.locationType === 'permanent' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                <MapPin className="size-3 text-sky-400" />
                <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">Fixed Location</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contact info */}
        {(vendor.phone || vendor.email || vendor.address || vendor.website) && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className={GLASS}>
              <CardContent className="p-5 space-y-3">
                <p className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                  <Sparkles className="size-4 text-violet-400" /> Contact & Location
                </p>

                {vendor.address && (
                  <a
                    href={`https://maps.google.com/maps?q=${encodeURIComponent(vendor.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-sky-500/20 transition-all group"
                  >
                    <MapPin className="size-4 text-sky-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 group-hover:text-white/90 transition-colors">{vendor.address}</p>
                      <p className="text-[10px] text-sky-400/60 mt-0.5">Open in Maps →</p>
                    </div>
                  </a>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-emerald-500/20 transition-all group">
                      <Phone className="size-3.5 text-emerald-400" />
                      <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">{vendor.phone}</span>
                    </a>
                  )}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-violet-500/20 transition-all group">
                      <Mail className="size-3.5 text-violet-400" />
                      <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors truncate">{vendor.email}</span>
                    </a>
                  )}
                  {vendor.website && (
                    <a
                      href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-orange-500/20 transition-all group sm:col-span-2"
                    >
                      <Globe className="size-3.5 text-orange-400" />
                      <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors truncate">{vendor.website.replace(/^https?:\/\//, '')}</span>
                      <ExternalLink className="size-3 text-white/20 ml-auto" />
                    </a>
                  )}
                </div>

                {vendor.healthInspectionCertUrl && (
                  <a href={vendor.healthInspectionCertUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 hover:border-emerald-500/30 transition-all">
                    <Shield className="size-4 text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-xs text-emerald-300 font-medium">Health Inspection Certificate</p>
                      {vendor.healthInspectionDate && (
                        <p className="text-[10px] text-emerald-400/50">Last inspected: {vendor.healthInspectionDate}</p>
                      )}
                    </div>
                    <ExternalLink className="size-3 text-emerald-400/40" />
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ──── Vendor Custom Content ──── */}
        {vendor.pageContent && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="space-y-4">
            {/* Announcement Banner */}
            {vendor.pageContent.announcement && (
              <Card className={`${GLASS} border-amber-500/20 overflow-hidden`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20 shrink-0 mt-0.5">
                      <Megaphone className="size-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider mb-1">Announcement</p>
                      <p className="text-sm text-white/80 leading-relaxed">{vendor.pageContent.announcement}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mission Statement */}
            {vendor.pageContent.missionStatement && (
              <Card className={GLASS}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="size-7 rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center border border-sky-500/15">
                      <FileText className="size-3.5 text-sky-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Our Story</h3>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{vendor.pageContent.missionStatement}</p>
                </CardContent>
              </Card>
            )}

            {/* Daily Special */}
            {vendor.pageContent.dailySpecial && vendor.pageContent.dailySpecial.title && (
              <Card className={`${GLASS} border-orange-500/20 overflow-hidden`}>
                <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center border border-orange-500/30 shrink-0">
                        <Sparkles className="size-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-0.5">Today's Special</p>
                        <h4 className="text-base font-bold text-white">{vendor.pageContent.dailySpecial.title}</h4>
                        {vendor.pageContent.dailySpecial.description && (
                          <p className="text-xs text-white/50 mt-1 leading-relaxed">{vendor.pageContent.dailySpecial.description}</p>
                        )}
                      </div>
                    </div>
                    {vendor.pageContent.dailySpecial.price != null && (
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-xl font-black text-orange-400">${vendor.pageContent.dailySpecial.price.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Photo Gallery */}
            {vendor.pageContent.photoAlbum && vendor.pageContent.photoAlbum.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center border border-emerald-500/20">
                    <Camera className="size-3.5 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Gallery</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/15 to-transparent" />
                </div>
                <div className={`grid gap-2 ${vendor.pageContent.photoAlbum.length === 1 ? 'grid-cols-1' : vendor.pageContent.photoAlbum.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                  {vendor.pageContent.photoAlbum.map((photo, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className={`rounded-xl overflow-hidden border border-white/10 ${idx === 0 && vendor.pageContent!.photoAlbum!.length > 2 ? 'col-span-2 row-span-2' : ''}`}
                    >
                      <img
                        src={photo}
                        alt={`${vendor.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Menu */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="size-7 rounded-lg bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center border border-orange-500/20">
              <Flame className="size-3.5 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Menu</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-orange-500/15 to-transparent" />
          </div>
          <MenuSection menu={menuItems} vendorId={vendor.id} vendorName={vendor.name} />
        </motion.div>

        {/* Share */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <ShareSection slug={vendor.slug} vendorName={vendor.name} />
        </motion.div>

        {/* Powered by */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="text-center pt-8 pb-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/10" />
              <Sparkles className="size-3 text-orange-400/40" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/10" />
            </div>
            <Link href="/">
              <p className="text-[11px] text-white/25 hover:text-white/45 transition-colors cursor-pointer">
                Free business page by <span className="font-bold text-orange-400/50 hover:text-orange-400/70">Happy Eats</span>
              </p>
            </Link>
            <p className="text-[9px] text-white/15">Want a page like this? <Link href="/vendor-portal" className="text-orange-400/40 hover:text-orange-400/60 underline">Sign up free</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
