import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Store, ChevronRight, Star, Clock,
  Shield, Filter, X, Utensils, CheckCircle2, AlertCircle,
  ChefHat, Phone, Mail, Globe, Sparkles, Eye, Truck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdUnit } from "@/components/ad-unit";
import { useLanguage } from "@/i18n/context";

interface FoodTruck {
  id: number;
  name: string;
  slug: string;
  businessType: string | null;
  cuisine: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  description: string | null;
  logoUrl: string | null;
  isApproved: boolean | null;
  isActive: boolean | null;
  isTestVendor: boolean | null;
  trustLayerId: string | null;
  zoneIds: number[] | null;
  operatingHoursStart: string | null;
  operatingHoursEnd: string | null;
  healthInspectionGrade: string | null;
  menu: any[] | null;
}

interface Zone {
  id: number;
  name: string;
  slug: string;
  isActive: boolean | null;
}

const CUISINE_OPTIONS = [
  "All", "American", "BBQ", "Mexican", "Asian", "Italian",
  "Southern", "Seafood", "Pizza", "Burgers", "Breakfast", "Other"
];

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  "food-truck": "Food Truck",
  "restaurant": "Restaurant",
  "catering": "Catering",
  "ghost-kitchen": "Ghost Kitchen",
  "pop-up": "Pop-Up",
};

export default function Vendors() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "unavailable">("all");
  const [zoneFilter, setZoneFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: trucks = [], isLoading } = useQuery<FoodTruck[]>({
    queryKey: ["/api/food-trucks"],
    queryFn: async () => {
      const res = await fetch("/api/food-trucks");
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ["/api/zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
  });

  const activeZoneCount = zones.filter(z => z.isActive).length;

  const filteredTrucks = useMemo(() => {
    return trucks.filter(truck => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = truck.name.toLowerCase().includes(q)
          || truck.cuisine?.toLowerCase().includes(q)
          || truck.description?.toLowerCase().includes(q)
          || truck.contactName?.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Cuisine
      if (cuisineFilter !== "All") {
        if (!truck.cuisine?.toLowerCase().includes(cuisineFilter.toLowerCase())) return false;
      }
      // Status
      if (statusFilter === "available") {
        if (!truck.isApproved || !truck.isActive) return false;
      } else if (statusFilter === "unavailable") {
        if (truck.isApproved && truck.isActive) return false;
      }
      // Zone
      if (zoneFilter !== null) {
        const truckZones = truck.zoneIds || [];
        if (!truckZones.includes(zoneFilter)) return false;
      }
      return true;
    });
  }, [trucks, searchQuery, cuisineFilter, statusFilter, zoneFilter]);

  const availableCount = trucks.filter(t => t.isApproved && t.isActive).length;
  const hasActiveFilters = searchQuery || cuisineFilter !== "All" || statusFilter !== "all" || zoneFilter !== null;

  const clearFilters = () => {
    setSearchQuery("");
    setCuisineFilter("All");
    setStatusFilter("all");
    setZoneFilter(null);
  };

  useEffect(() => {
    document.title = "Vendor Directory — Happy Eats";
    return () => { document.title = "Happy Eats - Delivery for Drivers"; };
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Header */}
      <div className="relative -mx-3 sm:-mx-4 md:-mx-6 2xl:-mx-8 -mt-3 sm:-mt-4 md:-mt-6 2xl:-mt-8 px-4 sm:px-6 md:px-8 pt-8 pb-10 mb-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/12 via-[#0a0f1e] to-cyan-600/8" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.1),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-bold gap-1">
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeZoneCount} zones active
              </Badge>
              <Badge className="bg-white/[0.05] text-white/40 border-white/[0.08] text-[10px]">
                {trucks.length} vendors
              </Badge>
            </div>
            <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent" data-testid="heading-vendor-directory">
              Vendor Directory
            </h1>
            <p className="text-white/40 mt-1 text-sm max-w-lg">
              Browse all registered food trucks and restaurants. Order from available vendors or discover new partners joining our network.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="size-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300 tabular-nums">{availableCount} Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search vendors by name, cuisine, or description..."
              className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 rounded-xl h-11"
              data-testid="input-vendor-search"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(v => !v)}
            className={`border-white/[0.08] text-white/50 hover:text-white rounded-xl h-11 gap-1.5 ${showFilters ? 'bg-white/[0.06] border-white/[0.15]' : ''}`}
            data-testid="button-toggle-filters"
          >
            <Filter className="size-4" />
            <span className="hidden sm:inline text-xs">Filters</span>
            {hasActiveFilters && (
              <div className="size-2 rounded-full bg-emerald-400" />
            )}
          </Button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-4">
                {/* Status Filter */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-2">Status</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["all", "available", "unavailable"] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === status
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                        data-testid={`filter-status-${status}`}
                      >
                        {status === "all" ? "All" : status === "available" ? "Available Now" : "Unavailable"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cuisine Filter */}
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-2">Cuisine</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CUISINE_OPTIONS.map(cuisine => (
                      <button
                        key={cuisine}
                        onClick={() => setCuisineFilter(cuisine)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${cuisineFilter === cuisine
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                        data-testid={`filter-cuisine-${cuisine.toLowerCase()}`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone Filter */}
                {zones.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-2">Zone</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        onClick={() => setZoneFilter(null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${zoneFilter === null
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        All Zones
                      </button>
                      {zones.map(zone => (
                        <button
                          key={zone.id}
                          onClick={() => setZoneFilter(zone.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${zoneFilter === zone.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:border-white/[0.12]'
                          }`}
                          data-testid={`filter-zone-${zone.slug}`}
                        >
                          {zone.isActive && <div className="size-1.5 rounded-full bg-emerald-400" />}
                          {zone.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                    data-testid="button-clear-filters"
                  >
                    <X className="size-3" /> Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Concierge CTA */}
      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl border-l-4 border-l-orange-500 overflow-hidden relative group cursor-pointer">
        <Link href="/concierge" data-testid="link-concierge-cta" className="block p-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.08] to-transparent group-hover:from-orange-500/[0.15] transition-all" />
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:justify-between relative z-10">
            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold border-0 text-[10px]">{t('vendor.new')}</Badge>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">{t('vendor.conciergeServiceLabel')}</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-0.5">{t('vendor.findAnyStoreNearby')}</h2>
              <p className="text-white/35 text-xs max-w-md">{t('vendor.conciergeCtaDesc')}</p>
            </div>
            <div className="size-11 rounded-full bg-orange-500/15 flex items-center justify-center text-orange-400 border border-orange-500/25 group-hover:scale-110 group-hover:bg-orange-500/25 transition-all shrink-0">
              <Search className="size-5" />
            </div>
          </div>
        </Link>
      </div>

      <AdUnit slot="vendors-top" format="horizontal" className="mb-2" />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/30">
          {filteredTrucks.length} vendor{filteredTrucks.length !== 1 ? 's' : ''}
          {hasActiveFilters ? ' matching filters' : ' registered'}
        </p>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[10px] text-emerald-400/60 hover:text-emerald-400 transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Loading / Empty / Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-white/[0.04] to-white/[0.01] animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-32 rounded-lg bg-white/[0.05] animate-pulse" />
                <div className="h-3 w-48 rounded-md bg-white/[0.03] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredTrucks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-10 text-center"
        >
          <Store className="size-12 text-white/10 mx-auto mb-4" />
          <p className="text-sm text-white/40 font-medium">
            {hasActiveFilters ? "No vendors match your filters" : "No vendors registered yet"}
          </p>
          <p className="text-xs text-white/20 mt-1">
            {hasActiveFilters ? "Try adjusting your search or filters" : "Check back soon for new partners"}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="ghost" className="mt-4 text-emerald-400/60 hover:text-emerald-400 text-xs">
              Clear Filters
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTrucks.map((truck, index) => {
            const isAvailable = truck.isApproved && truck.isActive;
            const truckZones = truck.zoneIds || [];
            const matchingZones = zones.filter(z => truckZones.includes(z.id));
            const activeMatchingZones = matchingZones.filter(z => z.isActive);
            const menuCount = truck.menu?.length || 0;
            const typeLabel = BUSINESS_TYPE_LABELS[truck.businessType || ""] || truck.businessType || "Vendor";

            return (
              <motion.div
                key={truck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.4 }}
              >
                <Link
                  href={`/menu/${truck.id}`}
                  data-testid={`card-vendor-${truck.slug}`}
                  className={`group block relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    isAvailable
                      ? 'bg-white/[0.04] border-white/[0.08] hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]'
                      : 'bg-white/[0.02] border-white/[0.05] opacity-60 hover:opacity-80 hover:border-white/[0.12]'
                  }`}
                >
                  {/* Card Header — Logo/Initials + Status */}
                  <div className={`relative h-32 sm:h-36 overflow-hidden ${isAvailable ? '' : 'grayscale-[50%]'}`}>
                    {truck.logoUrl ? (
                      <>
                        <img
                          src={truck.logoUrl}
                          alt={truck.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/60 to-transparent" />
                      </>
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${
                        isAvailable
                          ? 'bg-gradient-to-br from-emerald-500/[0.08] via-[#0e1525] to-cyan-500/[0.06]'
                          : 'bg-gradient-to-br from-white/[0.03] to-white/[0.01]'
                      }`}>
                        <div className={`size-16 rounded-2xl flex items-center justify-center text-2xl font-black ${
                          isAvailable
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                            : 'bg-white/[0.05] text-white/20 border border-white/[0.06]'
                        }`}>
                          {truck.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {isAvailable ? (
                        <Badge className="bg-emerald-500/25 text-emerald-200 border-emerald-500/40 text-[9px] font-bold gap-1 backdrop-blur-md">
                          <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-white/[0.08] text-white/40 border-white/[0.1] text-[9px] font-bold backdrop-blur-md">
                          Unavailable
                        </Badge>
                      )}
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-black/40 text-white/60 border-white/[0.08] text-[9px] backdrop-blur-md gap-1">
                        {truck.businessType === "food-truck" ? <Truck className="size-2.5" /> : <Store className="size-2.5" />}
                        {typeLabel}
                      </Badge>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-base font-bold leading-tight ${isAvailable ? 'text-white group-hover:text-emerald-300' : 'text-white/50'} transition-colors`}>
                          {truck.name}
                        </h3>
                        {truck.healthInspectionGrade && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                            <Shield className="size-2.5 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-300">{truck.healthInspectionGrade}</span>
                          </div>
                        )}
                      </div>
                      {truck.description && (
                        <p className="text-[11px] text-white/30 mt-1 line-clamp-2 leading-relaxed">{truck.description}</p>
                      )}
                    </div>

                    {/* Tags Row — cuisine, zones */}
                    <div className="flex flex-wrap gap-1.5">
                      {truck.cuisine && (
                        <span className="flex items-center gap-1 text-[10px] bg-orange-500/10 text-orange-300/80 px-2 py-0.5 rounded-lg border border-orange-500/15">
                          <Utensils className="size-2.5" /> {truck.cuisine}
                        </span>
                      )}
                      {activeMatchingZones.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-cyan-500/10 text-cyan-300/70 px-2 py-0.5 rounded-lg border border-cyan-500/15">
                          <MapPin className="size-2.5" /> {activeMatchingZones.length} zone{activeMatchingZones.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {menuCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] bg-white/[0.04] text-white/30 px-2 py-0.5 rounded-lg border border-white/[0.06]">
                          <ChefHat className="size-2.5" /> {menuCount} items
                        </span>
                      )}
                    </div>

                    {/* Trust Layer + Hours */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2 text-[10px]">
                        {truck.trustLayerId && (
                          <span className="flex items-center gap-1 text-cyan-400/50">
                            <Sparkles className="size-2.5" /> TL Verified
                          </span>
                        )}
                        {truck.operatingHoursStart && truck.operatingHoursEnd && (
                          <span className="flex items-center gap-1 text-white/25">
                            <Clock className="size-2.5" /> {truck.operatingHoursStart}–{truck.operatingHoursEnd}
                          </span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.15em] ${isAvailable ? 'text-emerald-400/40 group-hover:text-emerald-400/70' : 'text-white/15'} transition-colors`}>
                        {isAvailable ? 'Order' : 'View'}
                        <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Vendor Portal CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <Link href="/vendor-portal">
          <div className="flex items-center gap-4 px-5 py-5 rounded-2xl bg-gradient-to-r from-emerald-500/[0.06] to-cyan-500/[0.04] border border-emerald-500/15 hover:border-emerald-500/30 transition-all cursor-pointer group">
            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/15 transition-colors shrink-0">
              <Store className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Become a Vendor</p>
              <p className="text-[11px] text-white/30 mt-0.5">Register your food truck or restaurant — no upfront fees, just 20% when we bring you business</p>
            </div>
            <ChevronRight className="size-5 text-white/15 group-hover:text-white/40 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
