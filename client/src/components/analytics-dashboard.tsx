import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from "recharts";
import {
  Activity, Globe, Monitor, Smartphone, Tablet, HelpCircle, TrendingUp,
  Eye, Users, Clock, ArrowUp, ArrowDown, BarChart3, Zap, Search, Link2,
  MapPin, Layers, ChevronRight, Signal, Wifi, Settings, ExternalLink,
  RefreshCw, Filter, Calendar
} from "lucide-react";

interface AnalyticsDashboardProps {
  tenantId?: number;
  variant?: "owner" | "developer";
}

interface DashboardData {
  todayViews: number;
  todayUnique: number;
  weekViews: number;
  weekUnique: number;
  monthViews: number;
  monthUnique: number;
  allTimeViews: number;
  allTimeUnique: number;
  hourlyTraffic: Array<{ hour: number; views: number }>;
  dailyTraffic: Array<{ date: string; views: number; visitors: number }>;
  topPages: Array<{ page: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
}

interface LiveData {
  activeVisitors: number;
  byDevice: Record<string, number>;
  byPage: Array<{ page: string; count: number }>;
}

interface GeoRow {
  country: string;
  city: string;
  views: number;
  uniqueVisitors: number;
  unique_visitors?: number;
}

const DEVICE_COLORS = ["#f59e0b", "#3b82f6", "#0ea5e9"];
const GRADIENT_COLORS = {
  blue: "from-blue-500/20 to-blue-600/5",
  violet: "from-violet-500/20 to-violet-600/5",
  amber: "from-amber-500/20 to-amber-600/5",
  emerald: "from-emerald-500/20 to-emerald-600/5",
  rose: "from-rose-500/20 to-rose-600/5",
  cyan: "from-cyan-500/20 to-cyan-600/5",
  fuchsia: "from-fuchsia-500/20 to-fuchsia-600/5",
};

function MetricHelpDialog({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-white/30 hover:text-white/60 transition-colors" data-testid={`button-help-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <HelpCircle className="size-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-white/60 leading-relaxed">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function formatNumber(n: number | undefined | null): string {
  if (n == null) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function GlassCard({ children, className = "", gradient = "", testId = "" }: {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
  testId?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] ${gradient ? `bg-gradient-to-br ${gradient}` : ''} ${className}`}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export default function AnalyticsDashboard({ tenantId, variant = "owner" }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "all">("week");
  const basePath = tenantId ? `/api/tenants/${tenantId}/analytics` : "/api/analytics";

  const { data: dashboard, isLoading: dashLoading } = useQuery<DashboardData>({
    queryKey: ["analytics-dashboard", tenantId],
    queryFn: async () => {
      const res = await fetch(`${basePath}/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard analytics");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const { data: live } = useQuery<LiveData>({
    queryKey: ["analytics-live", tenantId],
    queryFn: async () => {
      const res = await fetch(`${basePath}/live`);
      if (!res.ok) throw new Error("Failed to fetch live analytics");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: geography = [] } = useQuery<GeoRow[]>({
    queryKey: ["analytics-geography", tenantId],
    queryFn: async () => {
      const res = await fetch(`${basePath}/geography`);
      if (!res.ok) throw new Error("Failed to fetch geography analytics");
      const data = await res.json();
      return data.rows || data;
    },
    refetchInterval: 30000,
  });

  const deviceData = dashboard?.deviceBreakdown
    ? [
        { name: "Desktop", value: dashboard.deviceBreakdown.desktop, icon: Monitor },
        { name: "Mobile", value: dashboard.deviceBreakdown.mobile, icon: Smartphone },
        { name: "Tablet", value: dashboard.deviceBreakdown.tablet, icon: Tablet },
      ]
    : [];

  const totalDevices = deviceData.reduce((s, d) => s + d.value, 0) || 1;

  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: "#1e293b",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    },
    labelStyle: { color: "#94a3b8" },
  };

  const getTimeRangeData = () => {
    switch (timeRange) {
      case "today": return { views: dashboard?.todayViews ?? 0, unique: dashboard?.todayUnique ?? 0 };
      case "week": return { views: dashboard?.weekViews ?? 0, unique: dashboard?.weekUnique ?? 0 };
      case "month": return { views: dashboard?.monthViews ?? 0, unique: dashboard?.monthUnique ?? 0 };
      case "all": return { views: dashboard?.allTimeViews ?? 0, unique: dashboard?.allTimeUnique ?? 0 };
    }
  };

  const currentRange = getTimeRangeData();

  return (
    <div className="space-y-3 pb-4" data-testid="analytics-dashboard">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-8 sm:size-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <BarChart3 className="size-4 sm:size-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white truncate">
              {variant === "developer" ? "Platform Analytics" : "Site Analytics"}
            </h2>
            <p className="text-[11px] text-white/40">Real-time visitor tracking & insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="absolute inset-0 size-2.5 rounded-full bg-emerald-400 animate-ping opacity-30" />
          </div>
          <span className="text-xs text-emerald-400 font-medium">Live</span>
        </div>
      </div>

      {/* === ROW 1: Live Pulse + Time Range Selector === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Live Visitors - Span 1 */}
        <GlassCard gradient={GRADIENT_COLORS.emerald} testId="card-live-pulse" className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <Signal className="size-4 text-emerald-400" />
            <span className="text-xs font-medium text-white/60">Right Now</span>
            <MetricHelpDialog title="Live Visitors">
              <p>This shows how many people are on your site right now, at this very moment. It updates every 15 seconds.</p>
            </MetricHelpDialog>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white tabular-nums" data-testid="text-live-visitors">
              {live?.activeVisitors ?? 0}
            </span>
            <span className="text-sm text-emerald-400 mb-1">active</span>
          </div>
          {live?.byPage && live.byPage.length > 0 && (
            <div className="mt-3 space-y-1">
              {live.byPage.slice(0, 3).map((p) => (
                <div key={p.page} className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40 truncate flex-1 mr-2">{p.page}</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0">{p.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Selected Time Range Stats - Span 2 */}
        <GlassCard gradient={GRADIENT_COLORS.blue} testId="card-time-range" className="p-3 sm:p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-blue-400" />
              <span className="text-xs font-medium text-white/60">Traffic Overview</span>
            </div>
            <div className="flex gap-1">
              {(["today", "week", "month", "all"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    timeRange === range
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "text-white/40 hover:text-white/60 hover:bg-white/5"
                  }`}
                  data-testid={`button-range-${range}`}
                >
                  {range === "all" ? "All" : range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Page Views</p>
              <p className="text-xl sm:text-2xl font-black text-white tabular-nums">{formatNumber(currentRange.views)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Unique Visitors</p>
              <p className="text-xl sm:text-2xl font-black text-white tabular-nums">{formatNumber(currentRange.unique)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Pages/Visitor</p>
              <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                {currentRange.unique > 0 ? (currentRange.views / currentRange.unique).toFixed(1) : "0"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Bounce Est.</p>
              <p className="text-xl sm:text-2xl font-black text-white tabular-nums">
                {currentRange.views > 0 ? `${Math.max(20, Math.round(100 - (currentRange.unique / currentRange.views) * 50))}%` : "—"}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* === ROW 2: Metric Cards Carousel (mobile swipeable) === */}
      <div className="relative">
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-2">
            {[
              { label: "Today", views: dashboard?.todayViews ?? 0, unique: dashboard?.todayUnique ?? 0, icon: Clock, color: "blue", accent: "text-blue-400", border: "border-blue-500/30", bg: GRADIENT_COLORS.blue },
              { label: "This Week", views: dashboard?.weekViews ?? 0, unique: dashboard?.weekUnique ?? 0, icon: TrendingUp, color: "violet", accent: "text-violet-400", border: "border-violet-500/30", bg: GRADIENT_COLORS.violet },
              { label: "This Month", views: dashboard?.monthViews ?? 0, unique: dashboard?.monthUnique ?? 0, icon: Eye, color: "amber", accent: "text-amber-400", border: "border-amber-500/30", bg: GRADIENT_COLORS.amber },
              { label: "All Time", views: dashboard?.allTimeViews ?? 0, unique: dashboard?.allTimeUnique ?? 0, icon: Users, color: "emerald", accent: "text-emerald-400", border: "border-emerald-500/30", bg: GRADIENT_COLORS.emerald },
            ].map((metric) => (
              <CarouselItem key={metric.label} className="pl-2 basis-1/2 sm:basis-1/4">
                <GlassCard gradient={metric.bg} className={`p-3 border ${metric.border}`} testId={`card-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <metric.icon className={`size-3.5 ${metric.accent}`} />
                    <span className="text-[10px] font-medium text-white/50">{metric.label}</span>
                    <MetricHelpDialog title={metric.label}>
                      <p>{metric.label === "Today" ? "Page views and unique visitors since midnight today." :
                          metric.label === "This Week" ? "Your traffic over the last 7 days." :
                          metric.label === "This Month" ? "All traffic for the last 30 days." :
                          "Every view and visitor your site has ever received."}</p>
                    </MetricHelpDialog>
                  </div>
                  <p className="text-xl font-black text-white tabular-nums">{formatNumber(metric.views)}</p>
                  <p className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                    <Users className="size-2.5" /> {formatNumber(metric.unique)} unique
                  </p>
                </GlassCard>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* === ROW 3: Bento Grid - Charts === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Hourly Traffic - Span 2 */}
        <GlassCard gradient={GRADIENT_COLORS.blue} className="p-3 sm:p-4 md:col-span-2" testId="card-hourly">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-blue-400" />
              <span className="text-sm font-bold text-white">Hourly Traffic</span>
            </div>
            <MetricHelpDialog title="Hourly Traffic">
              <p>Shows page views per hour today. Helps you see your busiest times so you know when customers visit most.</p>
            </MetricHelpDialog>
          </div>
          <div className="h-36 sm:h-52" data-testid="chart-hourly-traffic">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard?.hourlyTraffic ?? []}>
                <defs>
                  <linearGradient id="hourlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" stroke="#475569" tick={{ fontSize: 9, fill: "#64748b" }} tickFormatter={(h) => `${h}:00`} interval={2} />
                <YAxis stroke="#475569" tick={{ fontSize: 9, fill: "#64748b" }} width={30} />
                <Tooltip {...chartTooltipStyle} />
                <Area type="monotone" dataKey="views" fill="url(#hourlyGrad)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Device Breakdown - Span 1 */}
        <GlassCard gradient={GRADIENT_COLORS.amber} className="p-3 sm:p-4" testId="card-devices">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Monitor className="size-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Devices</span>
            </div>
            <MetricHelpDialog title="Device Breakdown">
              <p>Shows what devices visitors use. If most are on mobile, your site needs to look great on phones!</p>
            </MetricHelpDialog>
          </div>
          <div className="h-28 sm:h-36" data-testid="chart-device-breakdown">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={30} outerRadius={48} paddingAngle={4} dataKey="value">
                  {deviceData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={DEVICE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-1">
            {deviceData.map((d, i) => {
              const pct = Math.round((d.value / totalDevices) * 100);
              const Icon = d.icon;
              return (
                <div key={d.name} className="flex items-center gap-2 text-[11px]">
                  <Icon className="size-3" style={{ color: DEVICE_COLORS[i] }} />
                  <span className="text-white/60 flex-1">{d.name}</span>
                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: DEVICE_COLORS[i] }} />
                  </div>
                  <span className="text-white/40 w-8 text-right tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* === ROW 4: Daily Trend (full width) === */}
      <GlassCard gradient={GRADIENT_COLORS.violet} className="p-3 sm:p-4" testId="card-daily-trend">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-violet-400" />
            <span className="text-sm font-bold text-white">30-Day Trend</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-blue-400" />
              <span className="text-[10px] text-white/40">Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-white/40">Visitors</span>
            </div>
            <MetricHelpDialog title="30-Day Trend">
              <p>Daily views and unique visitors over the last 30 days. Blue is total views, green is unique visitors. Watch for upward trends!</p>
            </MetricHelpDialog>
          </div>
        </div>
        <div className="h-36 sm:h-56" data-testid="chart-daily-traffic">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dashboard?.dailyTraffic ?? []}>
              <defs>
                <linearGradient id="dailyViewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dailyVisitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 9, fill: "#64748b" }} />
              <YAxis stroke="#475569" tick={{ fontSize: 9, fill: "#64748b" }} width={30} />
              <Tooltip {...chartTooltipStyle} />
              <Area type="monotone" dataKey="views" name="Views" fill="url(#dailyViewsGrad)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="visitors" name="Visitors" fill="url(#dailyVisitorsGrad)" stroke="#10b981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* === ROW 5: Bento Grid - Tables === */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Top Pages - Span 1 */}
        <GlassCard gradient={GRADIENT_COLORS.cyan} className="p-3 sm:p-4" testId="card-top-pages">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-cyan-400" />
              <span className="text-sm font-bold text-white">Top Pages</span>
            </div>
            <MetricHelpDialog title="Top Pages">
              <p>The most visited pages on your site. Shows what content your customers look at the most.</p>
            </MetricHelpDialog>
          </div>
          <div className="space-y-1" data-testid="table-top-pages">
            {(dashboard?.topPages ?? []).slice(0, 8).map((page, i) => {
              const maxViews = Math.max(...(dashboard?.topPages ?? []).map(p => p.views), 1);
              return (
                <div key={page.page} className="group relative" data-testid={`row-page-${i}`}>
                  <div className="absolute inset-0 rounded-lg bg-cyan-400/5 origin-left transition-transform" style={{ transform: `scaleX(${page.views / maxViews})` }} />
                  <div className="relative flex items-center text-xs py-1.5 px-2">
                    <span className="text-white/25 w-4 text-[10px] tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-white/70 truncate ml-1">{page.page}</span>
                    <span className="text-white/50 font-mono text-[11px] tabular-nums">{formatNumber(page.views)}</span>
                  </div>
                </div>
              );
            })}
            {(!dashboard?.topPages || dashboard.topPages.length === 0) && (
              <div className="text-center text-xs text-white/30 py-6">Collecting page data...</div>
            )}
          </div>
        </GlassCard>

        {/* Top Referrers - Span 1 */}
        <GlassCard gradient={GRADIENT_COLORS.rose} className="p-3 sm:p-4" testId="card-top-referrers">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-rose-400" />
              <span className="text-sm font-bold text-white">Referrers</span>
            </div>
            <MetricHelpDialog title="Top Referrers">
              <p>Websites that sent visitors to you. Shows where your traffic comes from — Google, Facebook, direct visits, etc.</p>
            </MetricHelpDialog>
          </div>
          <div className="space-y-1" data-testid="table-top-referrers">
            {(dashboard?.topReferrers ?? []).slice(0, 8).map((ref, i) => {
              const maxCount = Math.max(...(dashboard?.topReferrers ?? []).map(r => r.count), 1);
              return (
                <div key={ref.referrer} className="group relative" data-testid={`row-referrer-${i}`}>
                  <div className="absolute inset-0 rounded-lg bg-rose-400/5 origin-left transition-transform" style={{ transform: `scaleX(${ref.count / maxCount})` }} />
                  <div className="relative flex items-center text-xs py-1.5 px-2">
                    <span className="text-white/25 w-4 text-[10px] tabular-nums">{i + 1}</span>
                    <span className="flex-1 text-white/70 truncate ml-1">{ref.referrer}</span>
                    <span className="text-white/50 font-mono text-[11px] tabular-nums">{formatNumber(ref.count)}</span>
                  </div>
                </div>
              );
            })}
            {(!dashboard?.topReferrers || dashboard.topReferrers.length === 0) && (
              <div className="text-center text-xs text-white/30 py-6">No referrer data yet</div>
            )}
          </div>
        </GlassCard>

        {/* Geographic Breakdown - Span 1 */}
        <GlassCard gradient={GRADIENT_COLORS.fuchsia} className="p-3 sm:p-4" testId="card-geography">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-fuchsia-400" />
              <span className="text-sm font-bold text-white">Locations</span>
            </div>
            <MetricHelpDialog title="Geographic Breakdown">
              <p>Where your visitors are located. Helps you understand your reach and see if customers from your target area are finding you.</p>
            </MetricHelpDialog>
          </div>
          <div className="space-y-1" data-testid="table-geography">
            {geography.slice(0, 8).map((row, i) => (
              <div key={`${row.country}-${row.city}-${i}`} className="flex items-center text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors" data-testid={`row-geo-${i}`}>
                <Globe className="size-3 text-white/20 mr-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 truncate text-[11px]">{row.city}</p>
                  <p className="text-white/30 text-[9px]">{row.country}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-white/50 font-mono text-[11px] tabular-nums">{formatNumber(row.views)}</p>
                  <p className="text-white/30 text-[9px]">{formatNumber(row.uniqueVisitors ?? row.unique_visitors)} uniq</p>
                </div>
              </div>
            ))}
            {geography.length === 0 && (
              <div className="text-center text-xs text-white/30 py-6">Collecting location data...</div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* === ROW 6: Expandable Sections (Accordion) === */}
      <Accordion type="multiple" defaultValue={["google-analytics"]} className="space-y-1.5">
        {/* Google Analytics Integration */}
        <AccordionItem value="google-analytics" className="border-0">
          <GlassCard gradient={GRADIENT_COLORS.amber} className="overflow-hidden">
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-90" data-testid="accordion-google-analytics">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Search className="size-3.5 sm:size-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Google Analytics Integration</p>
                  <p className="text-[10px] text-white/40">Connect GA4 for advanced tracking</p>
                </div>
                <ChevronRight className="size-4 text-white/30 ml-auto transition-transform chevron" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/[0.06]">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center border border-white/10">
                      <Globe className="size-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">Google Analytics 4 (GA4)</p>
                      <p className="text-xs text-white/50 leading-relaxed">
                        Connect your Google Analytics account for advanced features like conversion tracking, 
                        audience segments, ad campaign performance, and detailed user behavior flows.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">Ready to Connect</span>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Setup</p>
                    <p className="text-xs text-white/60">Add GA4 Measurement ID</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-3 border border-amber-500/20">
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    <strong className="text-amber-400">How to connect:</strong> Go to Google Analytics, create a GA4 property, 
                    copy your Measurement ID (starts with G-), and add it as a secret named <code className="bg-white/10 px-1 py-0.5 rounded text-[10px]">GA_MEASUREMENT_ID</code>.
                    The tracking code will activate automatically.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Advanced Metrics */}
        <AccordionItem value="advanced-metrics" className="border-0">
          <GlassCard gradient={GRADIENT_COLORS.violet} className="overflow-hidden">
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-90" data-testid="accordion-advanced-metrics">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Zap className="size-3.5 sm:size-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Advanced Metrics</p>
                  <p className="text-[10px] text-white/40">Deeper traffic analysis & patterns</p>
                </div>
                <ChevronRight className="size-4 text-white/30 ml-auto transition-transform chevron" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Avg. Session", value: currentRange.unique > 0 ? `${(currentRange.views / currentRange.unique).toFixed(1)} pg` : "—", icon: Clock, accent: "text-blue-400" },
                  { label: "New vs Return", value: `${Math.round((currentRange.unique / Math.max(currentRange.views, 1)) * 100)}% new`, icon: Users, accent: "text-emerald-400" },
                  { label: "Peak Hour", value: (() => { const h = dashboard?.hourlyTraffic ?? []; const peak = h.reduce((max, c) => c.views > max.views ? c : max, { hour: 0, views: 0 }); return peak.views > 0 ? `${peak.hour}:00` : "—"; })(), icon: TrendingUp, accent: "text-amber-400" },
                  { label: "Mobile %", value: `${Math.round((deviceData.find(d => d.name === "Mobile")?.value ?? 0) / totalDevices * 100)}%`, icon: Smartphone, accent: "text-fuchsia-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-3 border border-white/[0.06]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <stat.icon className={`size-3 ${stat.accent}`} />
                      <span className="text-[9px] text-white/40 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white tabular-nums">{stat.value}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* SEO & Performance */}
        <AccordionItem value="seo-performance" className="border-0">
          <GlassCard gradient={GRADIENT_COLORS.emerald} className="overflow-hidden">
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-90" data-testid="accordion-seo">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Search className="size-3.5 sm:size-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">SEO & Performance</p>
                  <p className="text-[10px] text-white/40">Search engine & site speed insights</p>
                </div>
                <ChevronRight className="size-4 text-white/30 ml-auto transition-transform chevron" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: "Search Traffic", value: (dashboard?.topReferrers ?? []).filter(r => r.referrer.includes("google") || r.referrer.includes("bing")).reduce((s, r) => s + r.count, 0), desc: "From search engines" },
                    { label: "Direct Traffic", value: (dashboard?.topReferrers ?? []).filter(r => r.referrer === "Direct").reduce((s, r) => s + r.count, 0), desc: "Typed your URL" },
                    { label: "Social Traffic", value: (dashboard?.topReferrers ?? []).filter(r => ["facebook", "instagram", "twitter", "tiktok"].some(s => r.referrer.toLowerCase().includes(s))).reduce((s, r) => s + r.count, 0), desc: "From social media" },
                  ].map((ch) => (
                    <div key={ch.label} className="bg-white/5 rounded-xl p-3 border border-white/[0.06]">
                      <p className="text-[9px] text-white/40 uppercase tracking-wider">{ch.label}</p>
                      <p className="text-xl font-bold text-white tabular-nums">{formatNumber(ch.value)}</p>
                      <p className="text-[9px] text-white/30">{ch.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    <strong className="text-emerald-400">Tip:</strong> Connect Google Search Console to see which keywords people use to find your site.
                    Add your sitemap URL to improve search engine indexing.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>

        {/* Privacy & Compliance */}
        <AccordionItem value="privacy" className="border-0">
          <GlassCard gradient={GRADIENT_COLORS.blue} className="overflow-hidden">
            <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-90" data-testid="accordion-privacy">
              <div className="flex items-center gap-3 flex-1">
                <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Settings className="size-3.5 sm:size-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Privacy & Data</p>
                  <p className="text-[10px] text-white/40">How your data is protected</p>
                </div>
                <ChevronRight className="size-4 text-white/30 ml-auto transition-transform chevron" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-2">
                {[
                  { label: "IP Addresses", desc: "Hashed for privacy — we never store real IPs", status: "Protected" },
                  { label: "Bot Filtering", desc: "Automated bots and crawlers are excluded from stats", status: "Active" },
                  { label: "Session Tracking", desc: "Anonymous session IDs, no personal data stored", status: "Anonymous" },
                  { label: "Data Retention", desc: "Analytics data stored securely in your database", status: "Secure" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/[0.06]">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white">{item.label}</p>
                      <p className="text-[10px] text-white/40">{item.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[9px]">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </GlassCard>
        </AccordionItem>
      </Accordion>

      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-[10px] text-white/20">
          Analytics refreshes every 30 seconds · Privacy-first tracking · No cookies required
        </p>
      </div>
    </div>
  );
}
