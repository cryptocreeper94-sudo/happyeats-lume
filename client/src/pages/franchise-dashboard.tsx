import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, ArrowLeft, DollarSign, TrendingUp,
  ShoppingBag, Truck, ChefHat, BarChart3,
  ArrowUp, MapPin, Star, Target,
  Activity, Zap, Package, Eye
} from "lucide-react";
import { motion } from "framer-motion";

const revenueData = [
  { month: "Sep", orders: 820, revenue: 12400, profit: 4960 },
  { month: "Oct", orders: 1140, revenue: 17800, profit: 7120 },
  { month: "Nov", orders: 1380, revenue: 22100, profit: 8840 },
  { month: "Dec", orders: 1650, revenue: 28500, profit: 11400 },
  { month: "Jan", orders: 1890, revenue: 32600, profit: 13040 },
  { month: "Feb", orders: 2240, revenue: 38900, profit: 15560 },
];

const topVendors = [
  { name: "Big Mike's BBQ", orders: 342, revenue: 6840, rating: 4.9 },
  { name: "Taco Loco Express", orders: 298, revenue: 4470, rating: 4.8 },
  { name: "Seoul Kitchen", orders: 256, revenue: 5120, rating: 4.7 },
  { name: "Coastal Catch", orders: 224, revenue: 5600, rating: 4.6 },
  { name: "Green Machine", orders: 189, revenue: 3780, rating: 4.5 },
];

const recentOrders = [
  { id: "#4821", vendor: "Big Mike's BBQ", amount: 24.50, status: "delivered", time: "12 min ago" },
  { id: "#4820", vendor: "Taco Loco Express", amount: 18.75, status: "in_transit", time: "18 min ago" },
  { id: "#4819", vendor: "Seoul Kitchen", amount: 32.00, status: "delivered", time: "25 min ago" },
  { id: "#4818", vendor: "Coastal Catch", amount: 28.50, status: "preparing", time: "30 min ago" },
  { id: "#4817", vendor: "Green Machine", amount: 15.25, status: "delivered", time: "45 min ago" },
];

function MiniChart({ data, height = 60, color = "#06b6d4" }: { data: number[]; height?: number; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100 / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * w;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} 100,${height}`;

  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/80 to-cyan-400/40 min-h-[4px]"
          />
          <span className="text-[9px] text-slate-600">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function FranchiseDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  const currentData = revenueData[revenueData.length - 1];
  const prevData = revenueData[revenueData.length - 2];

  const orderGrowth = ((currentData.orders - prevData.orders) / prevData.orders * 100).toFixed(1);
  const revenueGrowth = ((currentData.revenue - prevData.revenue) / prevData.revenue * 100).toFixed(1);
  const profitGrowth = ((currentData.profit - prevData.profit) / prevData.profit * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#060a14]">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#060a14]/90 backdrop-blur-2xl border-b border-white/[0.06] px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Shield className="size-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-tight">
              Franchise<span className="text-emerald-400">Dashboard</span>
            </span>
            <span className="text-[10px] text-slate-500 leading-none">Nashville Territory — Happy Eats</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] rounded-lg border border-white/[0.06] p-1">
            {(["week", "month", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  period === p ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'
                }`}
                data-testid={`button-period-${p}`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <Link href="/franchise">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs" data-testid="button-back">
              <ArrowLeft className="size-3 mr-1" /> Franchise Info
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-20 pb-12 container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue", value: `$${currentData.revenue.toLocaleString()}`, change: `+${revenueGrowth}%`, icon: DollarSign, iconBg: "bg-emerald-500/10", iconText: "text-emerald-400", chartData: revenueData.map(d => d.revenue), chartColor: "#10b981" },
            { label: "Total Orders", value: currentData.orders.toLocaleString(), change: `+${orderGrowth}%`, icon: ShoppingBag, iconBg: "bg-cyan-500/10", iconText: "text-cyan-400", chartData: revenueData.map(d => d.orders), chartColor: "#06b6d4" },
            { label: "Net Profit (80%)", value: `$${currentData.profit.toLocaleString()}`, change: `+${profitGrowth}%`, icon: TrendingUp, iconBg: "bg-amber-500/10", iconText: "text-amber-400", chartData: revenueData.map(d => d.profit), chartColor: "#f59e0b" },
            { label: "Active Vendors", value: "18", change: "+3", icon: ChefHat, iconBg: "bg-violet-500/10", iconText: "text-violet-400", chartData: [8, 10, 12, 14, 16, 18], chartColor: "#8b5cf6" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl overflow-hidden">
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`size-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                      <stat.icon className={`size-4 ${stat.iconText}`} />
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">
                      <ArrowUp className="size-2.5 mr-0.5" />{stat.change}
                    </Badge>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 mb-2">{stat.label}</p>
                  <div className="h-10 -mx-4 -mb-4">
                    <MiniChart data={stat.chartData} height={40} color={stat.chartColor} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-base">
                    <BarChart3 className="size-4 text-cyan-400" /> Revenue Trend
                  </CardTitle>
                  <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[10px]">Last 6 Months</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <BarChart data={revenueData.map(d => ({ month: d.month, value: d.revenue }))} />
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/[0.05]">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Avg Order Value</p>
                    <p className="text-lg font-bold text-white">$17.38</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Avg Delivery Time</p>
                    <p className="text-lg font-bold text-white">24 min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Customer Satisfaction</p>
                    <p className="text-lg font-bold text-white">4.8/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Activity className="size-4 text-emerald-400" /> Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10">
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <p className="text-sm text-white font-medium">System Online</p>
                  <p className="text-[10px] text-slate-500">All services operational</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Active Drivers</span>
                  <span className="text-sm text-white font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Pending Orders</span>
                  <span className="text-sm text-orange-400 font-bold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">In Transit</span>
                  <span className="text-sm text-cyan-400 font-bold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Delivered Today</span>
                  <span className="text-sm text-emerald-400 font-bold">47</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Today's Revenue</span>
                  <span className="text-sm text-emerald-400 font-bold">$1,247</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <ChefHat className="size-4 text-orange-400" /> Top Vendors
                </CardTitle>
                <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-[10px]">This Month</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {topVendors.map((vendor, i) => (
                <div key={vendor.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                  <div className="size-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center text-xs font-bold text-orange-400">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{vendor.name}</p>
                    <p className="text-[10px] text-slate-500">{vendor.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-400 font-bold">${vendor.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-0.5 justify-end">
                      <Star className="size-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-slate-400">{vendor.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Package className="size-4 text-cyan-400" /> Recent Orders
                </CardTitle>
                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[10px]">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="size-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                    <ShoppingBag className="size-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-medium">{order.id}</p>
                      <Badge className={`text-[9px] ${
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                        order.status === 'in_transit' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                        'bg-orange-500/10 text-orange-300 border-orange-500/20'
                      }`}>
                        {order.status === 'in_transit' ? 'In Transit' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500">{order.vendor} · {order.time}</p>
                  </div>
                  <span className="text-sm text-white font-medium">${order.amount.toFixed(2)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Target className="size-4 text-violet-400" /> Monthly Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Revenue Target", current: 38900, goal: 45000, barClass: "bg-gradient-to-r from-emerald-500 to-emerald-400" },
                { label: "Order Volume", current: 2240, goal: 2500, barClass: "bg-gradient-to-r from-cyan-500 to-cyan-400" },
                { label: "New Vendors", current: 3, goal: 5, barClass: "bg-gradient-to-r from-violet-500 to-violet-400" },
                { label: "Driver Retention", current: 92, goal: 95, barClass: "bg-gradient-to-r from-amber-500 to-amber-400", suffix: "%" },
              ].map((goal) => {
                const pct = Math.min((goal.current / goal.goal) * 100, 100);
                return (
                  <div key={goal.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-400">{goal.label}</span>
                      <span className="text-xs text-white font-medium">
                        {goal.suffix ? `${goal.current}${goal.suffix}` : goal.current.toLocaleString()} / {goal.suffix ? `${goal.goal}${goal.suffix}` : goal.goal.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={`h-full rounded-full ${goal.barClass}`}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Truck className="size-4 text-blue-400" /> Driver Fleet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-[10px] text-slate-500">Total Drivers</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 text-center">
                  <p className="text-2xl font-bold text-emerald-400">8</p>
                  <p className="text-[10px] text-emerald-300/70">Active Now</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-slate-400">Avg Deliveries/Driver/Day</span>
                  <span className="text-xs text-white font-bold">8.3</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-slate-400">Avg Rating</span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    4.7 <Star className="size-2.5 fill-amber-400" />
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-xs text-slate-400">Driver Pay This Month</span>
                  <span className="text-xs text-white font-bold">$8,420</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/[0.06] via-violet-500/[0.06] to-emerald-500/[0.06] border-white/[0.06] backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Zap className="size-4 text-cyan-400" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Add New Vendor", icon: ChefHat, desc: "Onboard a food truck", href: "/franchise/onboarding" },
                { label: "View Analytics", icon: BarChart3, desc: "Deep dive into metrics", href: "#" },
                { label: "Marketing Hub", icon: Eye, desc: "Create flyers & posts", href: "/franchise" },
                { label: "Driver Management", icon: Truck, desc: "Manage your fleet", href: "#" },
                { label: "Support Center", icon: MapPin, desc: "Get help from HQ", href: "/franchise" },
              ].map((action) => (
                <Link key={action.label} href={action.href}>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all text-left group" data-testid={`button-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <action.icon className="size-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{action.label}</p>
                      <p className="text-[10px] text-slate-500">{action.desc}</p>
                    </div>
                  </button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}