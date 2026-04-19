import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Package, DollarSign, TrendingUp, Truck, Clock,
  ChevronLeft, ChevronRight, Filter, Search, X,
  CheckCircle, AlertCircle, XCircle, MapPin, Phone, User,
  ArrowUpDown, FileDown, ShoppingBag, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const GLASS =
  "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  all:         { label: "All",          color: "bg-white/10 text-white/60 border-white/20",                       icon: Package },
  pending:     { label: "Pending",      color: "bg-amber-500/15 text-amber-400 border-amber-500/30",              icon: Clock },
  confirmed:   { label: "Confirmed",    color: "bg-sky-500/15 text-sky-400 border-sky-500/30",                    icon: CheckCircle },
  in_progress: { label: "In Progress",  color: "bg-blue-500/15 text-blue-400 border-blue-500/30",                 icon: Truck },
  picked_up:   { label: "Picked Up",    color: "bg-violet-500/15 text-violet-400 border-violet-500/30",           icon: Package },
  delivered:   { label: "Delivered",     color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",        icon: CheckCircle },
  cancelled:   { label: "Cancelled",    color: "bg-red-500/15 text-red-400 border-red-500/30",                    icon: XCircle },
};

function getPresetRange(preset: string): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  let start: Date;

  switch (preset) {
    case "today":
      return { start: end, end };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const ys = y.toISOString().split("T")[0];
      return { start: ys, end: ys };
    }
    case "7d":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split("T")[0], end };
    case "30d":
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split("T")[0], end };
    case "this_month":
      return { start: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`, end };
    case "all":
    default:
      return { start: "", end: "" };
  }
}

export default function OrderHistoryManager() {
  const [datePreset, setDatePreset] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const dateRange = useMemo(() => {
    if (datePreset === "custom") return { start: customStart, end: customEnd };
    return getPresetRange(datePreset);
  }, [datePreset, customStart, customEnd]);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/orders/history", dateRange.start, dateRange.end, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.start) params.set("startDate", dateRange.start);
      if (dateRange.end) params.set("endDate", dateRange.end);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "25");
      const res = await fetch(`/api/orders/history?${params}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const filteredOrders = useMemo(() => {
    if (!data?.orders) return [];
    if (!searchQuery) return data.orders;
    const q = searchQuery.toLowerCase();
    return data.orders.filter(
      (o: any) =>
        String(o.id).includes(q) ||
        (o.customerName || "").toLowerCase().includes(q) ||
        (o.customerPhone || "").includes(q) ||
        (o.locationName || "").toLowerCase().includes(q) ||
        (o.deliveryAddress || "").toLowerCase().includes(q)
    );
  }, [data?.orders, searchQuery]);

  const stats = data?.stats;
  const pagination = data?.pagination;

  const presets = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "7d", label: "7 Days" },
    { key: "30d", label: "30 Days" },
    { key: "this_month", label: "This Month" },
    { key: "all", label: "All Time" },
    { key: "custom", label: "Custom" },
  ];

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.all;
    return (
      <Badge className={`${cfg.color} text-[10px] font-medium border`}>
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30">
            <Calendar className="size-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Order History</h2>
            <p className="text-xs text-white/40">Browse all orders by date</p>
          </div>
        </div>
        {stats && (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
            {stats.totalOrders} orders found
          </Badge>
        )}
      </div>

      {/* Date Presets */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button
            key={p.key}
            onClick={() => { setDatePreset(p.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              datePreset === p.key
                ? "bg-gradient-to-r from-orange-500/25 to-rose-500/25 text-orange-300 border border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/15"
            }`}
            data-testid={`button-preset-${p.key}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      <AnimatePresence>
        {datePreset === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 items-end p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">From</label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => { setCustomStart(e.target.value); setPage(1); }}
                  className="bg-white/[0.03] border-white/[0.08] h-9 text-xs"
                  data-testid="input-date-start"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">To</label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => { setCustomEnd(e.target.value); setPage(1); }}
                  className="bg-white/[0.03] border-white/[0.08] h-9 text-xs"
                  data-testid="input-date-end"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card className={`${GLASS} overflow-hidden`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Revenue</p>
                  <p className="text-lg font-bold text-white mt-0.5">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="size-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <DollarSign className="size-4 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${GLASS} overflow-hidden`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Tips</p>
                  <p className="text-lg font-bold text-white mt-0.5">${stats.totalTips.toLocaleString()}</p>
                </div>
                <div className="size-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                  <TrendingUp className="size-4 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${GLASS} overflow-hidden`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Delivered</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{stats.deliveredCount}</p>
                </div>
                <div className="size-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <CheckCircle className="size-4 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`${GLASS} overflow-hidden`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Avg Order</p>
                  <p className="text-lg font-bold text-white mt-0.5">${stats.avgOrderValue}</p>
                </div>
                <div className="size-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <ShoppingBag className="size-4 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border ${
                statusFilter === key ? cfg.color : "bg-white/[0.03] text-white/30 border-white/[0.06] hover:text-white/50"
              }`}
              data-testid={`button-status-${key}`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
          <Input
            placeholder="Search name, phone, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-white/[0.03] border-white/[0.08]"
            data-testid="input-search-orders"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className={GLASS}>
          <CardContent className="py-12 text-center">
            <Package className="size-12 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/40">No orders found for this period</p>
            <p className="text-xs text-white/25 mt-1">Try expanding the date range or changing filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order: any, i: number) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className={`${GLASS} cursor-pointer transition-all duration-200 ${
                    isExpanded ? "border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "hover:border-white/20"
                  }`}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  data-testid={`card-order-${order.id}`}
                >
                  <CardContent className="p-3">
                    {/* Order Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="shrink-0 size-9 rounded-lg bg-gradient-to-br from-orange-500/15 to-rose-500/15 flex items-center justify-center border border-orange-500/20">
                          <span className="text-[10px] font-bold text-orange-400">#{order.id}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white truncate">
                              {order.customerName || "Walk-in"}
                            </p>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1.5">
                            <Clock className="size-2.5" />
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(order.createdAt).toLocaleTimeString("en-US", {
                              hour: "numeric", minute: "2-digit",
                            })}
                            {order.locationName && (
                              <>
                                <span className="text-white/15">•</span>
                                <MapPin className="size-2.5" />
                                {order.locationName}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">${parseFloat(order.total || "0").toFixed(2)}</p>
                          {order.tipAmount && parseFloat(order.tipAmount) > 0 && (
                            <p className="text-[10px] text-emerald-400">+${parseFloat(order.tipAmount).toFixed(2)} tip</p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-white/30" />
                        ) : (
                          <ChevronDown className="size-4 text-white/30" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2.5">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {order.customerPhone && (
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                  <Phone className="size-3 text-cyan-400" />
                                  <a href={`tel:${order.customerPhone}`} className="hover:text-cyan-400 transition-colors">
                                    {order.customerPhone}
                                  </a>
                                </div>
                              )}
                              {order.deliveryAddress && (
                                <div className="flex items-start gap-2 text-xs text-white/50">
                                  <MapPin className="size-3 text-orange-400 shrink-0 mt-0.5" />
                                  <span>{order.deliveryAddress}</span>
                                </div>
                              )}
                            </div>
                            {/* Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-1.5">Items</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {order.items.map((item: any, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60">
                                      <span className="text-orange-400 font-bold">{item.qty}×</span> {item.name}
                                      {item.price && <span className="text-white/30 ml-1">${item.price}</span>}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Order description */}
                            {order.orderDescription && (
                              <p className="text-xs text-white/40 italic">"{order.orderDescription}"</p>
                            )}
                            {order.deliveryInstructions && (
                              <p className="text-xs text-sky-400/70 flex items-start gap-1">
                                <span className="shrink-0">📋</span> {order.deliveryInstructions}
                              </p>
                            )}
                            {/* Financial Breakdown */}
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              <div className="p-1.5 rounded bg-white/[0.02] text-center">
                                <p className="text-white/30">Subtotal</p>
                                <p className="text-white font-medium">${parseFloat(order.subtotal || "0").toFixed(2)}</p>
                              </div>
                              <div className="p-1.5 rounded bg-white/[0.02] text-center">
                                <p className="text-white/30">Delivery</p>
                                <p className="text-white font-medium">${parseFloat(order.deliveryFee || "0").toFixed(2)}</p>
                              </div>
                              <div className="p-1.5 rounded bg-white/[0.02] text-center">
                                <p className="text-white/30">Type</p>
                                <p className="text-white font-medium capitalize">{order.orderType || "—"}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-white/30">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 text-xs border-white/10 text-white/50 hover:bg-white/5"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="size-3 mr-1" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2.5 text-xs border-white/10 text-white/50 hover:bg-white/5"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="size-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
