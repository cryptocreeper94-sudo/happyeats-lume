import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  Wallet,
  Banknote,
  Building2,
  ChevronDown,
  ChevronUp,
  PiggyBank,
} from "lucide-react";

interface RevenueData {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  paidOrders: number;
  pendingOrders: number;
  topItems: { name: string; count: number; revenue: number }[];
  vendorPerformance: { vendorName: string; orders: number; revenue: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
}

interface SplitData {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  totalVendorShare: number;
  totalPlatformFee: number;
  totalOwnerVendorRevenue: number;
  totalJasonShare: number;
  totalKathyShare: number;
  totalExpenseReserve: number;
  orderSplits: {
    orderId: number;
    date: string;
    vendorName: string;
    total: number;
    vendorShare: number;
    platformFee: number;
    isOwnVendor: boolean;
    hasConnect: boolean;
    jasonShare: number;
    kathyShare: number;
    expenseReserve: number;
  }[];
}

const periods = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
] as const;

function fmt(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtOrderDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RevenueDashboard({ adminPin }: { adminPin: string }) {
  const [period, setPeriod] = useState<string>("week");
  const [showSplitDetails, setShowSplitDetails] = useState(false);

  const { data, isLoading, isError } = useQuery<RevenueData>({
    queryKey: ["revenue-analytics", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/revenue?period=${period}`, {
        headers: { "x-admin-pin": adminPin },
      });
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      return res.json();
    },
    enabled: !!adminPin,
  });

  const { data: splitData } = useQuery<SplitData>({
    queryKey: ["revenue-split", period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/revenue-split?period=${period}`, {
        headers: { "x-admin-pin": adminPin },
      });
      if (!res.ok) throw new Error("Failed to fetch split data");
      return res.json();
    },
    enabled: !!adminPin,
  });

  const summaryCards = [
    { title: "Total Revenue", value: data ? fmt(data.totalRevenue) : "—", icon: <DollarSign className="size-5" />, accent: true },
    { title: "Total Orders", value: data ? data.totalOrders.toLocaleString() : "—", icon: <ShoppingCart className="size-5" /> },
    { title: "Avg Order", value: data ? fmt(data.avgOrderValue) : "—", icon: <TrendingUp className="size-5" /> },
    { title: "Paid / Pending", value: data ? `${data.paidOrders} / ${data.pendingOrders}` : "—", icon: <BarChart3 className="size-5" /> },
  ];

  return (
    <div className="space-y-6" data-testid="revenue-dashboard">
      {/* Header + Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <DollarSign className="size-5 text-[#FF7849]" />
          Revenue Dashboard
        </h2>
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                period === p.value
                  ? "bg-[#FF7849] text-white shadow-lg shadow-[#FF7849]/25"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
      )}
      {isError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-300 text-sm">
          Failed to load revenue data. Check your admin PIN and try again.
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryCards.map((card) => (
              <div
                key={card.title}
                className={`rounded-xl border backdrop-blur-xl p-4 transition-all hover:scale-[1.02] ${
                  card.accent
                    ? "bg-[#FF7849]/10 border-[#FF7849]/20 hover:border-[#FF7849]/40"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{card.title}</span>
                  <div className={card.accent ? "text-[#FF7849]" : "text-white/30"}>{card.icon}</div>
                </div>
                <p className={`text-xl font-bold ${card.accent ? "text-[#FF7849]" : "text-white"}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* ═══════════ REVENUE SPLIT PANEL ═══════════ */}
          {splitData && (
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 border border-emerald-500/20 backdrop-blur-xl p-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
                <Wallet className="size-5 text-emerald-400" />
                Revenue Split — Full Breakdown
              </h3>

              {/* Split Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
                {/* Gross */}
                <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] p-3">
                  <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-1">Gross Revenue</p>
                  <p className="text-lg font-bold text-white">{fmt(splitData.totalRevenue)}</p>
                  <p className="text-[10px] text-white/30">{splitData.totalOrders} paid</p>
                </div>

                {/* Vendor Payouts */}
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                  <p className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Banknote className="size-3" /> Vendor Payouts
                  </p>
                  <p className="text-lg font-bold text-emerald-400">{fmt(splitData.totalVendorShare)}</p>
                  <p className="text-[10px] text-emerald-400/40">80% → external vendors</p>
                </div>

                {/* Platform */}
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                  <p className="text-[10px] font-medium text-orange-400/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building2 className="size-3" /> Platform
                  </p>
                  <p className="text-lg font-bold text-orange-400">{fmt(splitData.totalPlatformFee)}</p>
                  <p className="text-[10px] text-orange-400/40">20% fee + own vendors</p>
                </div>

                {/* Kathy */}
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                  <p className="text-[10px] font-medium text-violet-400/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <PiggyBank className="size-3" /> Kathy (50%)
                  </p>
                  <p className="text-lg font-bold text-violet-400">{fmt(splitData.totalKathyShare)}</p>
                  <p className="text-[10px] text-violet-400/40">Stripe Connect payout</p>
                </div>

                {/* Jason */}
                <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3">
                  <p className="text-[10px] font-medium text-cyan-400/60 uppercase tracking-wider mb-1">Jason (40%)</p>
                  <p className="text-lg font-bold text-cyan-400">{fmt(splitData.totalJasonShare)}</p>
                  <p className="text-[10px] text-cyan-400/40">Platform account</p>
                </div>

                {/* Expense */}
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-[10px] font-medium text-amber-400/60 uppercase tracking-wider mb-1">Expense (10%)</p>
                  <p className="text-lg font-bold text-amber-400">{fmt(splitData.totalExpenseReserve)}</p>
                  <p className="text-[10px] text-amber-400/40">Reserve fund</p>
                </div>
              </div>

              {/* Per-Order Detail Toggle */}
              {splitData.orderSplits.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowSplitDetails(!showSplitDetails)}
                    className="flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors mb-3"
                  >
                    {showSplitDetails ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    {showSplitDetails ? "Hide" : "Show"} Order Details ({splitData.orderSplits.length})
                  </button>

                  {showSplitDetails && (
                    <div className="overflow-x-auto -mx-2 px-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-2 text-white/40 font-medium">Order</th>
                            <th className="text-left py-2 px-2 text-white/40 font-medium">Date</th>
                            <th className="text-left py-2 px-2 text-white/40 font-medium">Vendor</th>
                            <th className="text-right py-2 px-2 text-white/40 font-medium">Total</th>
                            <th className="text-right py-2 px-2 text-emerald-400/50 font-medium">Vendor 80%</th>
                            <th className="text-right py-2 px-2 text-orange-400/50 font-medium">Platform</th>
                            <th className="text-right py-2 px-2 text-violet-400/50 font-medium">Kathy</th>
                            <th className="text-right py-2 px-2 text-cyan-400/50 font-medium">Jason</th>
                            <th className="text-right py-2 px-2 text-amber-400/50 font-medium">Expense</th>
                          </tr>
                        </thead>
                        <tbody>
                          {splitData.orderSplits.map((o) => (
                            <tr key={o.orderId} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                              <td className="py-2 px-2 text-white/70">#{o.orderId}</td>
                              <td className="py-2 px-2 text-white/50 whitespace-nowrap">{fmtOrderDate(o.date)}</td>
                              <td className="py-2 px-2 text-white/70 max-w-[120px] truncate">
                                {o.vendorName}
                                {o.isOwnVendor && <span className="ml-1 px-1 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[9px]">OWN</span>}
                              </td>
                              <td className="py-2 px-2 text-right text-white font-medium">{fmt(o.total)}</td>
                              <td className="py-2 px-2 text-right text-emerald-400">{o.vendorShare > 0 ? fmt(o.vendorShare) : "—"}</td>
                              <td className="py-2 px-2 text-right text-orange-400">{fmt(o.platformFee)}</td>
                              <td className="py-2 px-2 text-right text-violet-400">{fmt(o.kathyShare)}</td>
                              <td className="py-2 px-2 text-right text-cyan-400">{fmt(o.jasonShare)}</td>
                              <td className="py-2 px-2 text-right text-amber-400">{fmt(o.expenseReserve)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Revenue Chart */}
          <div className="rounded-xl bg-slate-800/50 border border-white/10 backdrop-blur-xl p-4">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Revenue Over Time</h3>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueByDay}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF7849" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#FF7849" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                    labelFormatter={formatDate}
                    formatter={(value: number) => [fmt(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF7849" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Items + Vendor Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <TrendingUp className="size-4 text-[#FF7849]" /> Top Items
              </h3>
              <div className="space-y-2">
                {data.topItems.slice(0, 5).map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all">
                    <span className="text-xs font-bold text-[#FF7849] w-5 text-center">#{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-white/40">{item.count} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-white/80">{fmt(item.revenue)}</span>
                  </div>
                ))}
                {data.topItems.length === 0 && <p className="text-xs text-white/30 text-center py-4">No item data yet</p>}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Users className="size-4 text-[#FF7849]" /> Vendor Performance
              </h3>
              <div className="space-y-2">
                {data.vendorPerformance.map((vendor, idx) => (
                  <div key={vendor.vendorName} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all">
                    <div className="size-8 rounded-lg bg-[#FF7849]/10 flex items-center justify-center text-[#FF7849] text-xs font-bold shrink-0">
                      {vendor.vendorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{vendor.vendorName}</p>
                      <p className="text-[11px] text-white/40">{vendor.orders} orders</p>
                    </div>
                    <span className="text-sm font-semibold text-white/80">{fmt(vendor.revenue)}</span>
                  </div>
                ))}
                {data.vendorPerformance.length === 0 && <p className="text-xs text-white/30 text-center py-4">No vendor data yet</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
