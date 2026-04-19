import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Store, ShoppingCart, ChefHat, Package, Truck, CheckCircle2,
  XCircle, Clock, Activity, Users, TrendingUp, AlertTriangle,
  ChevronDown, ChevronRight, RefreshCw, Zap, Radio, Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

interface PipelineData {
  pending: number;
  accepted: number;
  preparing: number;
  ready: number;
  picked_up: number;
  in_progress: number;
  delivered: number;
  cancelled: number;
}

interface OrderData {
  id: number;
  customerName: string | null;
  status: string | null;
  vendorStatus: string | null;
  total: string;
  items: any[] | null;
  createdAt: string;
  updatedAt: string;
}

interface VendorData {
  id: number;
  name: string;
  cuisine: string | null;
  logoUrl: string | null;
  isActive: boolean | null;
  isApproved: boolean | null;
  isTestVendor: boolean | null;
  pipeline: PipelineData;
  totalOrders: number;
  activeOrders: number;
  recentOrders: OrderData[];
}

interface EventData {
  orderId: number;
  vendorName: string;
  customerName: string | null;
  status: string | null;
  vendorStatus: string | null;
  total: string;
  timestamp: string;
}

interface LiveOpsData {
  zoneId: number;
  vendors: VendorData[];
  totals: PipelineData;
  eventFeed: EventData[];
  vendorCount: number;
  activeVendors: number;
  lastUpdated: string;
}

interface ZoneData {
  id: number;
  name: string;
  slug: string;
  isActive: boolean | null;
}

const PIPELINE_STAGES = [
  { key: "pending", label: "Pending", icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", glow: "shadow-amber-500/20" },
  { key: "accepted", label: "Accepted", icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30", glow: "shadow-blue-500/20" },
  { key: "preparing", label: "Preparing", icon: ChefHat, color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30", glow: "shadow-orange-500/20" },
  { key: "ready", label: "Ready", icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  { key: "picked_up", label: "Picked Up", icon: Truck, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/30", glow: "shadow-cyan-500/20" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30", glow: "shadow-violet-500/20" },
] as const;

function getStatusIcon(status: string | null) {
  switch (status) {
    case "pending": return <ShoppingCart className="size-3" />;
    case "accepted": return <CheckCircle2 className="size-3" />;
    case "preparing": return <ChefHat className="size-3" />;
    case "ready": return <Package className="size-3" />;
    case "picked_up": case "in_progress": return <Truck className="size-3" />;
    case "delivered": return <CheckCircle2 className="size-3" />;
    case "cancelled": return <XCircle className="size-3" />;
    default: return <Clock className="size-3" />;
  }
}

function getStatusColor(status: string | null) {
  switch (status) {
    case "pending": return "text-amber-400 bg-amber-500/15 border-amber-500/30";
    case "accepted": return "text-blue-400 bg-blue-500/15 border-blue-500/30";
    case "preparing": return "text-orange-400 bg-orange-500/15 border-orange-500/30";
    case "ready": return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
    case "picked_up": case "in_progress": return "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
    case "delivered": return "text-violet-400 bg-violet-500/15 border-violet-500/30";
    case "cancelled": return "text-red-400 bg-red-500/15 border-red-500/30";
    default: return "text-slate-400 bg-slate-500/15 border-slate-500/30";
  }
}

function getEventVerb(status: string | null) {
  switch (status) {
    case "pending": return "placed";
    case "accepted": return "accepted";
    case "preparing": return "being prepared";
    case "ready": return "ready for pickup";
    case "picked_up": return "picked up";
    case "in_progress": return "in transit";
    case "delivered": return "delivered";
    case "cancelled": return "cancelled";
    default: return "updated";
  }
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span className="text-xs font-mono text-white/40 tabular-nums">
      {time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}
    </span>
  );
}

function PulsingDot() {
  return (
    <span className="relative flex size-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
    </span>
  );
}

function StatCard({ label, count, icon: Icon, color, bgColor }: {
  label: string; count: number; icon: any; color: string; bgColor: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
      <Card className={`${GLASS_CARD} hover:border-white/20 transition-all duration-300`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
              <motion.p key={count} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`text-xl font-bold ${color}`}>{count}</motion.p>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgColor}`}>
              <Icon className={`size-4 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function VendorPipelineCard({ vendor, index }: { vendor: VendorData; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasActiveOrders = vendor.activeOrders > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className={`${GLASS_CARD} overflow-hidden transition-all duration-300 ${
        hasActiveOrders ? "border-emerald-500/20 hover:border-emerald-500/30" : "hover:border-white/20"
      }`} data-testid={`card-vendor-${vendor.id}`}>
        <CardContent className="p-0">
          {/* Vendor Header */}
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/20 shrink-0">
                {vendor.logoUrl ? (
                  <img src={vendor.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Store className="size-5 text-orange-400" />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{vendor.name}</h3>
                  {vendor.isTestVendor && (
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[8px]">Demo</Badge>
                  )}
                  {hasActiveOrders && <PulsingDot />}
                </div>
                <p className="text-[10px] text-slate-500 truncate">{vendor.cuisine || "Food Vendor"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-lg font-bold text-white">{vendor.activeOrders}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">active</p>
              </div>
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="size-4 text-slate-400" />
              </motion.div>
            </div>
          </button>

          {/* Pipeline Bar */}
          <div className="px-4 pb-3">
            <div className="flex gap-1.5">
              {PIPELINE_STAGES.map(stage => {
                const count = vendor.pipeline[stage.key as keyof PipelineData] || 0;
                return (
                  <div key={stage.key} className="flex-1 text-center group" title={`${stage.label}: ${count}`}>
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${
                      count > 0
                        ? `${stage.bg} ${stage.border} border shadow-sm ${stage.glow}`
                        : "bg-white/5"
                    }`} />
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      <span className={`text-[9px] font-bold tabular-nums ${count > 0 ? stage.color : "text-white/15"}`}>
                        {count}
                      </span>
                    </div>
                    <p className={`text-[7px] uppercase tracking-wider ${count > 0 ? "text-white/40" : "text-white/10"}`}>
                      {stage.label.slice(0, 4)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expanded Order List */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <Separator className="bg-white/5" />
                <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
                  {vendor.recentOrders.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No orders yet</p>
                  ) : (
                    vendor.recentOrders.map((order, oi) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: oi * 0.03 }}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f172a]/60 border border-white/5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Badge className={`text-[8px] px-1.5 py-0.5 ${getStatusColor(order.status)}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status || "pending"}
                            </span>
                          </Badge>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white">#{order.id}</span>
                            {order.customerName && (
                              <span className="text-[10px] text-slate-400 ml-1.5">{order.customerName}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-orange-400">${parseFloat(order.total).toFixed(2)}</span>
                          <span className="text-[9px] text-slate-500">{timeAgo(order.createdAt)}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EventFeed({ events }: { events: EventData[] }) {
  return (
    <Card className={`${GLASS_CARD} overflow-hidden`} data-testid="card-event-feed">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Live Activity</h3>
            <PulsingDot />
          </div>
          <Badge className="bg-white/5 text-slate-400 border-white/10 text-[9px]">
            {events.length} events
          </Badge>
        </div>
        <Separator className="bg-white/5" />
        <div className="max-h-[400px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="size-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {events.map((event, i) => (
                <motion.div
                  key={`${event.orderId}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 p-1 rounded-md ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/80">
                        <span className="font-semibold text-white">#{event.orderId}</span>
                        {" "}{getEventVerb(event.status)}{" "}
                        {event.vendorName !== "Unknown" && (
                          <span className="text-orange-300">@ {event.vendorName}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {event.customerName && (
                          <span className="text-[10px] text-slate-500">{event.customerName}</span>
                        )}
                        <span className="text-[10px] text-orange-400 font-semibold">
                          ${parseFloat(event.total).toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-600">{timeAgo(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="h-4 w-32 bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LiveOps() {
  const [selectedZoneId, setSelectedZoneId] = useState<number>(1);

  // Fetch available zones
  const { data: zones = [] } = useQuery<ZoneData[]>({
    queryKey: ["/api/zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Fetch live ops data with 10s polling
  const { data: liveOps, isLoading, dataUpdatedAt } = useQuery<LiveOpsData>({
    queryKey: ["/api/live-ops", selectedZoneId],
    queryFn: async () => {
      const res = await fetch(`/api/live-ops/${selectedZoneId}`);
      if (!res.ok) throw new Error("Failed to load live ops");
      return res.json();
    },
    refetchInterval: 10000,
    enabled: !!selectedZoneId,
  });

  const activeZone = useMemo(() => zones.find(z => z.id === selectedZoneId), [zones, selectedZoneId]);
  const totalActiveOrders = liveOps ? Object.entries(liveOps.totals)
    .filter(([k]) => k !== "delivered" && k !== "cancelled")
    .reduce((sum, [, v]) => sum + v, 0) : 0;

  if (isLoading) return <SkeletonLoading />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0f172a]"
      data-testid="live-ops-page"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/command-center">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                <Activity className="size-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white">Live Operations</h1>
                  <PulsingDot />
                </div>
                <div className="flex items-center gap-2">
                  <LiveClock />
                  {dataUpdatedAt && (
                    <span className="text-[9px] text-slate-600 flex items-center gap-1">
                      <RefreshCw className="size-2.5" /> 10s
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-2">
            {zones.length > 0 && (
              <Select
                value={String(selectedZoneId)}
                onValueChange={(v) => setSelectedZoneId(parseInt(v))}
              >
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white text-xs h-9">
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2744] border-white/10">
                  {zones.map(zone => (
                    <SelectItem key={zone.id} value={String(zone.id)} className="text-white text-xs">
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="summary-stats">
          <StatCard label="Vendors" count={liveOps?.vendorCount || 0} icon={Store} color="text-orange-400" bgColor="bg-orange-500/10" />
          <StatCard label="Active" count={totalActiveOrders} icon={Zap} color="text-emerald-400" bgColor="bg-emerald-500/10" />
          <StatCard label="Pending" count={liveOps?.totals.pending || 0} icon={ShoppingCart} color="text-amber-400" bgColor="bg-amber-500/10" />
          <StatCard label="Preparing" count={(liveOps?.totals.accepted || 0) + (liveOps?.totals.preparing || 0)} icon={ChefHat} color="text-orange-400" bgColor="bg-orange-500/10" />
          <StatCard label="In Transit" count={(liveOps?.totals.picked_up || 0) + (liveOps?.totals.in_progress || 0)} icon={Truck} color="text-cyan-400" bgColor="bg-cyan-500/10" />
          <StatCard label="Delivered" count={liveOps?.totals.delivered || 0} icon={CheckCircle2} color="text-violet-400" bgColor="bg-violet-500/10" />
        </div>

        {/* Main Grid: Vendors + Event Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendor Pipeline Cards */}
          <div className="lg:col-span-2 space-y-4" data-testid="vendor-grid">
            <div className="flex items-center gap-2">
              <Store className="size-4 text-orange-400" />
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Vendor Pipeline</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-orange-500/15 to-transparent" />
              <span className="text-[10px] text-white/20 tabular-nums">{liveOps?.vendorCount || 0} vendors</span>
            </div>

            {liveOps?.vendors.length === 0 ? (
              <Card className={GLASS_CARD}>
                <CardContent className="p-8 text-center">
                  <Store className="size-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">No vendors in this zone</p>
                  <p className="text-xs text-slate-500 mt-1">Vendors will appear here when they're registered in {activeZone?.name || "this zone"}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveOps?.vendors.map((vendor, i) => (
                  <VendorPipelineCard key={vendor.id} vendor={vendor} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Event Feed Sidebar */}
          <div className="space-y-4" data-testid="event-feed">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Live Feed</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/15 to-transparent" />
            </div>
            <EventFeed events={liveOps?.eventFeed || []} />
          </div>
        </div>

        {/* Pipeline Legend */}
        <Card className={`${GLASS_CARD} mt-4`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {PIPELINE_STAGES.map(stage => {
                const Icon = stage.icon;
                return (
                  <div key={stage.key} className="flex items-center gap-1.5">
                    <div className={`p-1 rounded ${stage.bg} ${stage.border} border`}>
                      <Icon className={`size-2.5 ${stage.color}`} />
                    </div>
                    <span className="text-[10px] text-slate-500">{stage.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
