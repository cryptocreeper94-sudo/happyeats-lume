import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowLeft, Flame, Snowflake, Clock, MapPin, Truck,
  Star, ChevronDown, ChevronUp, ShoppingBag, Utensils,
  Thermometer, ThermometerSnowflake, Sparkles, Lock, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

interface KitchenItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
  section: string;
  imageUrl: string | null;
  isAvailable: boolean | null;
  sortOrder: number | null;
  tags: string[] | null;
}

function CategorySection({ title, items, icon: Icon, accentColor, t }: {
  title: string;
  items: KitchenItem[];
  icon: React.ElementType;
  accentColor: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}) {
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, KitchenItem[]>);

  const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]" },
    cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]" },
  };
  const colors = colorMap[accentColor] || colorMap.orange;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.border} border ${colors.glow}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">{title}</h2>
        <Badge className={`${colors.bg} ${colors.text} ${colors.border} border text-xs`}>
          {items.length} {t('kitchen.items')}
        </Badge>
      </div>

      {Object.entries(grouped).map(([category, categoryItems], catIndex) => (
        <div key={category} className="mb-8">
          <h3 className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-3 ml-1">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 + i * 0.05, duration: 0.4 }}
              >
                <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden group hover:border-white/[0.12] transition-all duration-300 hover:scale-[1.02] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  {item.imageUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                      {item.tags && item.tags.includes("popular") && (
                        <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white border-0 text-xs shadow-[0_0_10px_rgba(249,115,22,0.3)]">
                          <Star className="w-3 h-3 mr-1" /> {t('kitchen.popular')}
                        </Badge>
                      )}
                      {item.tags && item.tags.includes("spicy") && (
                        <Badge className="absolute top-2 left-2 bg-red-500/90 text-white border-0 text-xs shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                          <Flame className="w-3 h-3 mr-1" /> {t('kitchen.spicy')}
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-white text-base leading-tight" data-testid={`text-kitchen-item-${item.id}`}>
                        {item.name}
                      </h4>
                      <span className={`font-bold ${colors.text} text-lg ml-2 whitespace-nowrap`}>
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-white/40 text-sm leading-relaxed mt-1">
                        {item.description}
                      </p>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.filter(tg => tg !== "popular" && tg !== "spicy").map(tag => (
                          <span key={tag} className="text-[10px] text-white/30 bg-white/[0.03] border border-white/[0.04] px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-white/[0.04]">
                      <Button
                        disabled
                        className="w-full bg-white/[0.03] text-white/25 border border-white/[0.06] cursor-not-allowed"
                        data-testid={`button-add-kitchen-${item.id}`}
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        {t('common.comingSoon')}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

export default function HappyEatsKitchen() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<"all" | "hot" | "cold">("all");

  const { data: items, isLoading } = useQuery<KitchenItem[]>({
    queryKey: ["kitchen-items"],
    queryFn: async () => {
      const res = await fetch("/api/kitchen-items");
      if (!res.ok) throw new Error("Failed to fetch menu");
      return res.json();
    },
  });

  const hotItems = items?.filter(i => i.section === "hot" && i.isAvailable) || [];
  const coldItems = items?.filter(i => i.section === "cold" && i.isAvailable) || [];
  const displayHot = activeSection === "all" || activeSection === "hot";
  const displayCold = activeSection === "all" || activeSection === "cold";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1d32] to-[#0a1628]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=1600&h=600&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-[#0a1628]/80 to-[#0a1628]" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.06] via-transparent to-amber-500/[0.06]" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-12">
          <Link href="/sandbox">
            <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/[0.06] mb-4 -ml-2 rounded-xl" data-testid="button-back-sandbox">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t('kitchen.backToSandbox')}
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <Utensils className="w-8 h-8 text-orange-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">Happy Eats </span>
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Kitchen</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-4">
              {t('kitchen.freshPreMadeMeals')}
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/[0.12] to-orange-500/[0.12] border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-amber-300 font-medium text-sm">{t('kitchen.launchingSoon')}</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-2 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {[
            { icon: Truck, label: t('kitchen.mobileDeliveryTruck'), desc: t('kitchen.hotColdCompartments') },
            { icon: Clock, label: t('kitchen.zeroWaitTime'), desc: t('kitchen.preMadeMealsGrabGo') },
            { icon: MapPin, label: t('kitchen.i24Corridor'), desc: t('kitchen.exitRange') },
          ].map(({ icon: FIcon, label, desc }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl hover:border-orange-500/20 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/15">
                  <FIcon className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-white/30 text-xs">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { key: "all", label: t('kitchen.allItems'), icon: Utensils },
            { key: "hot", label: t('kitchen.hotSide'), icon: Flame },
            { key: "cold", label: t('kitchen.coldSide'), icon: Snowflake },
          ].map(({ key, label, icon: TabIcon }) => (
            <Button
              key={key}
              variant={activeSection === key ? "default" : "ghost"}
              onClick={() => setActiveSection(key as "all" | "hot" | "cold")}
              className={activeSection === key
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-[0_0_15px_rgba(249,115,22,0.25)]"
                : "text-white/40 hover:text-white hover:bg-white/[0.06]"
              }
              data-testid={`button-filter-${key}`}
            >
              <TabIcon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
                <Skeleton className="h-40 w-full bg-white/[0.03]" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 bg-white/[0.03] mb-2" />
                  <Skeleton className="h-4 w-full bg-white/[0.03] mb-1" />
                  <Skeleton className="h-4 w-2/3 bg-white/[0.03]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            <AnimatePresence mode="wait">
              {displayHot && hotItems.length > 0 && (
                <CategorySection
                  key="hot"
                  title={t('kitchen.hotSide')}
                  items={hotItems}
                  icon={Flame}
                  accentColor="orange"
                  t={t}
                />
              )}
              {displayCold && coldItems.length > 0 && (
                <CategorySection
                  key="cold"
                  title={t('kitchen.coldSide')}
                  items={coldItems}
                  icon={Snowflake}
                  accentColor="cyan"
                  t={t}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="bg-white/[0.03] border border-orange-500/15 backdrop-blur-xl rounded-2xl overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.03] via-transparent to-amber-500/[0.03]" />
            <div className="relative p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                  <Bell className="w-7 h-7 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent mb-2">{t('kitchen.beFirstToKnow')}</h3>
              <p className="text-white/40 max-w-md mx-auto mb-6">
                {t('kitchen.kitchenGearingUp')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button disabled className="bg-gradient-to-r from-orange-500/25 to-amber-500/25 text-white/40 border border-orange-500/15 cursor-not-allowed" data-testid="button-notify-me">
                  <Bell className="w-4 h-4 mr-2" /> {t('kitchen.notifyMeAtLaunch')}
                </Button>
                <Link href="/zones">
                  <Button variant="outline" className="border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]" data-testid="button-order-zone">
                    <ShoppingBag className="w-4 h-4 mr-2" /> {t('kitchen.orderFromVendorsNow')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 text-center">
          <Separator className="bg-white/[0.04] mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { icon: Thermometer, label: t('kitchen.hotCompartment'), desc: t('kitchen.soupMainsSides') },
              { icon: ThermometerSnowflake, label: t('kitchen.coldCompartment'), desc: t('kitchen.wrapsSaladsDrinks') },
              { icon: Truck, label: t('kitchen.dailyRoutes'), desc: t('kitchen.i24CorridorDelivery') },
              { icon: Clock, label: t('kitchen.grabAndGo'), desc: t('kitchen.noWaitingPreMade') },
            ].map(({ icon: FeatIcon, label, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="text-center"
              >
                <FeatIcon className="w-6 h-6 text-orange-400/50 mx-auto mb-2" />
                <p className="text-white/50 text-xs font-medium">{label}</p>
                <p className="text-white/20 text-[10px]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
