import { Truck, MapPin, Utensils, Zap, Shield, Star, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/context";

export function PromoTicker() {
  const { t } = useLanguage();

  return (
    <div 
      data-testid="promo-ticker"
      className="w-full bg-black border-y border-cyan-500/30 overflow-hidden h-8"
    >
      <div className="relative h-full flex items-center animate-marquee whitespace-nowrap">
        <div className="flex items-center gap-8 px-4">
          <span className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="size-4 text-cyan-400" />
            <span className="text-fuchsia-400">{t("ticker.nowLive")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.nashvilleZone")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold bg-orange-500/20 px-3 py-0.5 rounded-full border border-orange-500/50">
            <Clock className="size-4 text-orange-400 animate-pulse" />
            <span className="text-orange-400">🚨 BATCH CUTOFFS:</span>
            <span className="text-white">9:30 AM</span>
            <span className="text-orange-300 text-xs">(11:30 AM Delivery)</span>
            <span className="text-white ml-2">11:30 AM</span>
            <span className="text-orange-300 text-xs">(1:30 PM Delivery)</span>
            <span className="text-white ml-2">5:00 PM</span>
            <span className="text-orange-300 text-xs">(8:00 PM Delivery)</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Utensils className="size-4 text-lime-400" />
            <span className="text-lime-400">{t("ticker.vendorsJoinFree")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.vendorPricing")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Truck className="size-4 text-fuchsia-400" />
            <span className="text-fuchsia-400">{t("ticker.middleTnZones")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.batchDeliveries")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Zap className="size-4 text-lime-400" />
            <span className="text-lime-400">{t("ticker.happyEatsKitchen")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.mobileCommissary")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Shield className="size-4 text-fuchsia-400" />
            <span className="text-fuchsia-400">{t("ticker.franchiseOpps")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.nationwide")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Star className="size-4 text-lime-400" />
            <span className="text-lime-400">{t("ticker.driverServices")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.driverServicesList")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <MapPin className="size-4 text-cyan-400" />
            <span className="text-fuchsia-400">{t("ticker.nowLive")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.nashvilleZone")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold bg-orange-500/20 px-3 py-0.5 rounded-full border border-orange-500/50">
            <Clock className="size-4 text-orange-400 animate-pulse" />
            <span className="text-orange-400">🚨 BATCH CUTOFFS:</span>
            <span className="text-white">9:30 AM</span>
            <span className="text-orange-300 text-xs">(11:30 AM Delivery)</span>
            <span className="text-white ml-2">11:30 AM</span>
            <span className="text-orange-300 text-xs">(1:30 PM Delivery)</span>
            <span className="text-white ml-2">5:00 PM</span>
            <span className="text-orange-300 text-xs">(8:00 PM Delivery)</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Utensils className="size-4 text-lime-400" />
            <span className="text-lime-400">{t("ticker.vendorsJoinFree")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.vendorPricing")}</span>
          </span>
          <span className="text-cyan-500">•</span>
          <span className="flex items-center gap-2 text-sm font-bold">
            <Truck className="size-4 text-fuchsia-400" />
            <span className="text-fuchsia-400">{t("ticker.middleTnZones")}</span>
            <span className="text-white">—</span>
            <span className="text-cyan-400">{t("ticker.batchDeliveries")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
