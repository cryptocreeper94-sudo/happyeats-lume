import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, DollarSign, TrendingUp, Package, Clock, Users,
  ChevronDown, ChevronRight, FileDown, PieChart, Wallet,
  CheckCircle, XCircle, AlertCircle, Receipt,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const GLASS =
  "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

interface DaySummary {
  date: string;
  dayLabel: string;
  orderCount: number;
  deliveredCount: number;
  cancelledCount: number;
  pendingCount: number;
  grossRevenue: number;
  totalTips: number;
  totalDeliveryFees: number;
  totalServiceFees: number;
  totalTax: number;
  platformEarnings: number;
  split: { kathy: number; jason: number; expense: number };
  vendorPayouts: number;
  orders: Array<{
    id: number;
    customerName: string | null;
    total: number;
    tipAmount: number;
    serviceFee: number;
    status: string;
    createdAt: string;
    locationName: string | null;
  }>;
}

interface SettlementData {
  days: DaySummary[];
  totals: {
    grossRevenue: number;
    totalTips: number;
    totalOrders: number;
    deliveredCount: number;
    kathyTotal: number;
    jasonTotal: number;
    expenseTotal: number;
    daysWithOrders: number;
  };
  period: string;
}

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DailySettlementReport() {
  const [period, setPeriod] = useState("30");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const { data, isLoading } = useQuery<SettlementData>({
    queryKey: ["/api/reports/daily-settlement", period],
    queryFn: async () => {
      const res = await fetch(`/api/reports/daily-settlement?days=${period}`);
      if (!res.ok) throw new Error("Failed to fetch settlement data");
      return res.json();
    },
  });

  const periods = [
    { key: "7", label: "7 Days" },
    { key: "14", label: "14 Days" },
    { key: "30", label: "30 Days" },
    { key: "90", label: "90 Days" },
    { key: "365", label: "1 Year" },
  ];

  const exportCSV = () => {
    if (!data?.days) return;
    const headers = "Date,Orders,Delivered,Revenue,Tips,Platform Earnings,Kathy (50%),Jason (40%),Expense (10%),Vendor Payouts\n";
    const rows = data.days.map(d =>
      `${d.date},${d.orderCount},${d.deliveredCount},$${fmt(d.grossRevenue)},$${fmt(d.totalTips)},$${fmt(d.platformEarnings)},$${fmt(d.split.kathy)},$${fmt(d.split.jason)},$${fmt(d.split.expense)},$${fmt(d.vendorPayouts)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlement-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = data?.totals;

  return (
    <div className="space-y-4" data-testid="daily-settlement-report">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/30">
            <Receipt className="size-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Daily Settlement Report</h2>
            <p className="text-xs text-white/40">Revenue split: 50% Kathy · 40% Jason · 10% Expense</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={exportCSV}
          disabled={!data?.days?.length}
          className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs"
          data-testid="button-export-csv"
        >
          <FileDown className="size-3 mr-1.5" /> Export CSV
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-1.5">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              period === p.key
                ? "bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/15"
            }`}
            data-testid={`button-period-${p.key}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Period Totals */}
      {totals && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`${GLASS} border-emerald-500/15 overflow-hidden`}>
            <CardContent className="p-4 space-y-4">
              {/* Top-line metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Gross Revenue</p>
                  <p className="text-lg font-bold text-white mt-0.5">${fmt(totals.grossRevenue)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Orders</p>
                  <p className="text-lg font-bold text-white mt-0.5">{totals.deliveredCount} <span className="text-xs text-white/30">delivered</span></p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Tips</p>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">${fmt(totals.totalTips)}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Active Days</p>
                  <p className="text-lg font-bold text-white mt-0.5">{totals.daysWithOrders}</p>
                </div>
              </div>

              {/* Revenue Split Summary */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-violet-500/5 border border-white/[0.06]">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <PieChart className="size-3" /> Period Revenue Split
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="size-10 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-1.5">
                      <span className="text-xs font-bold text-orange-400">50%</span>
                    </div>
                    <p className="text-sm font-bold text-orange-400">${fmt(totals.kathyTotal)}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Kathy</p>
                  </div>
                  <div className="text-center">
                    <div className="size-10 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto mb-1.5">
                      <span className="text-xs font-bold text-cyan-400">40%</span>
                    </div>
                    <p className="text-sm font-bold text-cyan-400">${fmt(totals.jasonTotal)}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Jason</p>
                  </div>
                  <div className="text-center">
                    <div className="size-10 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-1.5">
                      <span className="text-xs font-bold text-violet-400">10%</span>
                    </div>
                    <p className="text-sm font-bold text-violet-400">${fmt(totals.expenseTotal)}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Expense</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Daily Accordion */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : !data?.days?.length ? (
        <Card className={GLASS}>
          <CardContent className="py-12 text-center">
            <Calendar className="size-12 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/40">No orders found for this period</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.days.map((day, i) => {
            const isExpanded = expandedDay === day.date;
            const hasOrders = day.deliveredCount > 0;
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className={`${GLASS} cursor-pointer transition-all duration-200 ${
                    isExpanded
                      ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : hasOrders 
                        ? "hover:border-white/20" 
                        : "opacity-50 hover:opacity-70"
                  }`}
                  onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                  data-testid={`card-day-${day.date}`}
                >
                  <CardContent className="p-3">
                    {/* Day Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="shrink-0 size-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 flex items-center justify-center border border-emerald-500/20">
                          <Calendar className="size-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{day.dayLabel}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                              <Package className="size-2.5" /> {day.deliveredCount} delivered
                            </span>
                            {day.cancelledCount > 0 && (
                              <span className="text-[10px] text-red-400/60 flex items-center gap-1">
                                <XCircle className="size-2.5" /> {day.cancelledCount} cancelled
                              </span>
                            )}
                            {day.pendingCount > 0 && (
                              <span className="text-[10px] text-amber-400/60 flex items-center gap-1">
                                <Clock className="size-2.5" /> {day.pendingCount} active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {hasOrders && (
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white">${fmt(day.grossRevenue)}</p>
                            {day.totalTips > 0 && (
                              <p className="text-[10px] text-emerald-400">+${fmt(day.totalTips)} tips</p>
                            )}
                          </div>
                        )}
                        <ChevronDown
                          className={`size-4 text-white/30 transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>

                    {/* Mobile Revenue (visible on small screens) */}
                    {hasOrders && (
                      <div className="sm:hidden mt-2 flex items-center gap-3">
                        <span className="text-sm font-bold text-white">${fmt(day.grossRevenue)}</span>
                        {day.totalTips > 0 && (
                          <span className="text-[10px] text-emerald-400">+${fmt(day.totalTips)} tips</span>
                        )}
                      </div>
                    )}

                    {/* Expanded Day Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
                            {/* Revenue Split for Day */}
                            {hasOrders && (
                              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-white/[0.06]">
                                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
                                  <PieChart className="size-2.5" /> Revenue Split
                                </p>
                                <div className="grid grid-cols-4 gap-2 text-center">
                                  <div>
                                    <p className="text-[10px] text-white/30">Platform</p>
                                    <p className="text-xs font-bold text-white">${fmt(day.platformEarnings)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-orange-400/70">Kathy 50%</p>
                                    <p className="text-xs font-bold text-orange-400">${fmt(day.split.kathy)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-cyan-400/70">Jason 40%</p>
                                    <p className="text-xs font-bold text-cyan-400">${fmt(day.split.jason)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-violet-400/70">Expense 10%</p>
                                    <p className="text-xs font-bold text-violet-400">${fmt(day.split.expense)}</p>
                                  </div>
                                </div>

                                {/* Visual split bar */}
                                <div className="flex rounded-full overflow-hidden h-2 mt-2.5">
                                  <div className="bg-orange-500/60" style={{ width: '50%' }} />
                                  <div className="bg-cyan-500/60" style={{ width: '40%' }} />
                                  <div className="bg-violet-500/60" style={{ width: '10%' }} />
                                </div>
                              </div>
                            )}

                            {/* Fee Breakdown */}
                            {hasOrders && (
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[10px]">
                                <div className="p-2 rounded-lg bg-white/[0.02] text-center border border-white/[0.04]">
                                  <p className="text-white/30">Gross</p>
                                  <p className="text-white font-medium">${fmt(day.grossRevenue)}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] text-center border border-white/[0.04]">
                                  <p className="text-white/30">Service Fee</p>
                                  <p className="text-white font-medium">${fmt(day.totalServiceFees)}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] text-center border border-white/[0.04]">
                                  <p className="text-white/30">Delivery</p>
                                  <p className="text-white font-medium">${fmt(day.totalDeliveryFees)}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] text-center border border-white/[0.04]">
                                  <p className="text-white/30">Tax</p>
                                  <p className="text-white font-medium">${fmt(day.totalTax)}</p>
                                </div>
                                <div className="p-2 rounded-lg bg-white/[0.02] text-center border border-white/[0.04]">
                                  <p className="text-white/30">Vendor Share</p>
                                  <p className="text-white font-medium">${fmt(day.vendorPayouts)}</p>
                                </div>
                              </div>
                            )}

                            {/* Individual Orders */}
                            {day.orders.length > 0 && (
                              <div>
                                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold mb-2">
                                  Orders ({day.orders.length})
                                </p>
                                <div className="space-y-1">
                                  {day.orders.map((o) => (
                                    <div
                                      key={o.id}
                                      className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-orange-400 font-bold shrink-0">#{o.id}</span>
                                        <span className="text-white/60 truncate">{o.customerName || "Walk-in"}</span>
                                        {o.locationName && (
                                          <span className="text-white/25 truncate hidden sm:inline">· {o.locationName}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {o.tipAmount > 0 && (
                                          <span className="text-emerald-400 text-[10px]">+${fmt(o.tipAmount)}</span>
                                        )}
                                        <span className="text-white font-medium">${fmt(o.total)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!hasOrders && (
                              <p className="text-xs text-white/25 text-center py-2">No delivered orders this day</p>
                            )}
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
    </div>
  );
}
