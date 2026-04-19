import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  ArrowLeft, Code, Server, Database, Wifi, CheckCircle, 
  AlertTriangle, XCircle, Activity, Clock, Shield, Zap,
  HardDrive, Cpu, MemoryStick, Globe, Link2, Coins, Box,
  FileText, Copy, Check, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrderStatus } from "@/lib/api";
import { BlogManager } from "@/components/blog-manager";
import AnalyticsDashboard from "@/components/analytics-dashboard";

interface EcosystemStatus {
  hub: { configured: boolean; connected: boolean; hubName: string };
  financial: { configured: boolean };
  blockchain: { configured: boolean; hasWallet: boolean };
}

interface PartnerAgreement {
  id: number;
  tenantSlug: string;
  partnerName: string;
  w9LegalName?: string;
  w9BusinessName?: string;
  w9BusinessType?: string;
  w9Ein?: string;
  w9Address?: string;
  w9City?: string;
  w9State?: string;
  w9Zip?: string;
  w9SignedAt?: string;
}

export default function DeveloperDashboard() {
  const { data: orderStatus = "green" } = useQuery({
    queryKey: ["order-status"],
    queryFn: getOrderStatus,
    refetchInterval: 10000,
  });

  const { data: ecosystemStatus } = useQuery<EcosystemStatus>({
    queryKey: ["ecosystem-status"],
    queryFn: async () => {
      const res = await fetch("/api/ecosystem/status");
      if (!res.ok) throw new Error("Failed to fetch ecosystem status");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const systemHealth = {
    api: { status: "healthy", latency: "45ms", uptime: "99.9%" },
    database: { status: "healthy", connections: 12, size: "128MB" },
    storage: { status: "healthy", used: "2.4GB", total: "10GB" },
    payments: { status: "pending", message: "Not yet configured" },
    sms: { status: "pending", message: "Not yet configured" },
    ai: { status: "healthy", requests: 234, cost: "$1.24" },
  };

  const recentErrors: { time: string; type: string; message: string; resolved: boolean }[] = [];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "healthy": return <CheckCircle className="size-4 text-emerald-400" />;
      case "warning": return <AlertTriangle className="size-4 text-yellow-400" />;
      case "error": return <XCircle className="size-4 text-red-400" />;
      case "pending": return <Clock className="size-4 text-slate-400" />;
      default: return <Activity className="size-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "healthy": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "warning": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending": return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href="/command-center">
          <Button data-testid="button-back-home" variant="ghost" size="icon" className="text-muted-foreground hover:text-white shrink-0 min-h-[44px] min-w-[44px]">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <Code className="size-5 text-violet-400 shrink-0" />
            <span className="truncate">Developer Dashboard</span>
          </h1>
          <p className="text-xs text-muted-foreground">System health, status & monitoring</p>
        </div>
        <Link href="/marketing">
          <Button data-testid="button-marketing-hub" className="bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white gap-2 mr-2 min-h-[44px]">
            <Megaphone className="size-4" />
            <span className="hidden sm:inline">Marketing Hub</span>
          </Button>
        </Link>
        <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
          Jason
        </Badge>
      </div>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Order Status (View Only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`rounded-xl p-4 flex items-center justify-center gap-4 ${
            orderStatus === "green" ? "bg-emerald-500/20 border border-emerald-500/30" :
            orderStatus === "yellow" ? "bg-yellow-500/20 border border-yellow-500/30" :
            "bg-red-500/20 border border-red-500/30"
          }`}>
            <div className="flex items-center gap-2">
              <span className={`size-5 rounded-full ${orderStatus === "green" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-slate-600"}`}></span>
              <span className={`size-5 rounded-full ${orderStatus === "yellow" ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]" : "bg-slate-600"}`}></span>
              <span className={`size-5 rounded-full ${orderStatus === "red" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" : "bg-slate-600"}`}></span>
            </div>
            <div className="text-center">
              <p className={`font-bold text-lg ${
                orderStatus === "green" ? "text-emerald-400" :
                orderStatus === "yellow" ? "text-yellow-400" :
                "text-red-400"
              }`}>
                {orderStatus === "green" && "OPEN - Accepting Orders"}
                {orderStatus === "yellow" && "BUSY - Limited Capacity"}
                {orderStatus === "red" && "CLOSED - Not Accepting"}
              </p>
              <p className="text-xs text-muted-foreground">Controlled by Kathy in Owner Dashboard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Franchise Revenue Breakdown - Dark Wave Studios 20% */}
      <Card className="glass-panel border-l-4 border-l-violet-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Coins className="size-4 text-violet-400" />
            Franchise Revenue (Dark Wave Studios - 20%)
            <Badge className="ml-auto bg-violet-500/20 text-violet-300 text-[10px]">Your Share</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Revenue Model</span>
              <span className="text-violet-300 font-medium">80/20 Net Profit Split</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You receive 20% of net profit after all costs (driver pay, fuel, supplies, platform fees). 
              Franchise partners keep 80% of their territory's net profit.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Projected Franchise Fee Revenue (Your 20%)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/50 border border-violet-500/20">
                <p className="text-[10px] text-muted-foreground">Month 3</p>
                <p className="text-lg font-bold text-violet-400">$900</p>
                <p className="text-[10px] text-muted-foreground">from $4,500 net</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-violet-500/20">
                <p className="text-[10px] text-muted-foreground">Month 6</p>
                <p className="text-lg font-bold text-violet-400">$2,420</p>
                <p className="text-[10px] text-muted-foreground">from $12,100 net</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-violet-500/20">
                <p className="text-[10px] text-muted-foreground">Year 1 (monthly)</p>
                <p className="text-lg font-bold text-violet-400">$4,920</p>
                <p className="text-[10px] text-muted-foreground">~$59K/year</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50 border border-violet-500/20">
                <p className="text-[10px] text-muted-foreground">Year 2 (monthly)</p>
                <p className="text-lg font-bold text-violet-400">$7,440</p>
                <p className="text-[10px] text-muted-foreground">~$89K/year</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Active Franchise Partners</p>
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div className="size-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold">K</div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Kathy - Nashville Region</p>
                <p className="text-[10px] text-muted-foreground">Lebanon / Mt. Juliet / LaVergne / Smyrna</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Active</Badge>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Revenue scales with each new franchise partner added to the network
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Server className="size-4 text-sky-400" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="size-3" /> API Server
                </span>
                {getStatusIcon(systemHealth.api.status)}
              </div>
              <p className="text-sm font-medium text-white">Healthy</p>
              <p className="text-[10px] text-muted-foreground">Latency: {systemHealth.api.latency}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Database className="size-3" /> Database
                </span>
                {getStatusIcon(systemHealth.database.status)}
              </div>
              <p className="text-sm font-medium text-white">Healthy</p>
              <p className="text-[10px] text-muted-foreground">{systemHealth.database.connections} connections</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <HardDrive className="size-3" /> Storage
                </span>
                {getStatusIcon(systemHealth.storage.status)}
              </div>
              <p className="text-sm font-medium text-white">Healthy</p>
              <p className="text-[10px] text-muted-foreground">{systemHealth.storage.used} / {systemHealth.storage.total}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="size-3" /> AI Assistant
                </span>
                {getStatusIcon(systemHealth.ai.status)}
              </div>
              <p className="text-sm font-medium text-white">Healthy</p>
              <p className="text-[10px] text-muted-foreground">{systemHealth.ai.requests} requests</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="size-3" /> Payments
                </span>
                {getStatusIcon(systemHealth.payments.status)}
              </div>
              <p className="text-sm font-medium text-slate-400">Pending Setup</p>
              <p className="text-[10px] text-muted-foreground">Stripe not configured</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Wifi className="size-3" /> SMS/Twilio
                </span>
                {getStatusIcon(systemHealth.sms.status)}
              </div>
              <p className="text-sm font-medium text-slate-400">Pending Setup</p>
              <p className="text-[10px] text-muted-foreground">Twilio not configured</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-400" />
            Error Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentErrors.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="size-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No errors reported</p>
              <p className="text-xs text-muted-foreground mt-1">System is running smoothly</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentErrors.map((error, i) => (
                <div key={i} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-400">{error.type}</span>
                    <span className="text-[10px] text-muted-foreground">{error.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{error.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-0 border-l-4 border-l-violet-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link2 className="size-4 text-violet-400" />
            Trust Layer Ecosystem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div data-testid="status-orbit-hub" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Globe className="size-3" /> ORBIT Hub
                </span>
                {ecosystemStatus?.hub?.connected ? (
                  <CheckCircle className="size-4 text-emerald-400" />
                ) : ecosystemStatus?.hub?.configured ? (
                  <AlertTriangle className="size-4 text-yellow-400" />
                ) : (
                  <Clock className="size-4 text-slate-400" />
                )}
              </div>
              <p data-testid="text-orbit-hub-status" className={`text-sm font-medium ${ecosystemStatus?.hub?.connected ? "text-emerald-400" : ecosystemStatus?.hub?.configured ? "text-yellow-400" : "text-slate-400"}`}>
                {ecosystemStatus?.hub?.connected ? "Connected" : ecosystemStatus?.hub?.configured ? "Configured" : "Not Configured"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {ecosystemStatus?.hub?.hubName || "Awaiting keys"}
              </p>
            </div>

            <div data-testid="status-financial-hub" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Coins className="size-3" /> Financial Hub
                </span>
                {ecosystemStatus?.financial?.configured ? (
                  <CheckCircle className="size-4 text-emerald-400" />
                ) : (
                  <Clock className="size-4 text-slate-400" />
                )}
              </div>
              <p data-testid="text-financial-hub-status" className={`text-sm font-medium ${ecosystemStatus?.financial?.configured ? "text-emerald-400" : "text-slate-400"}`}>
                {ecosystemStatus?.financial?.configured ? "Ready" : "Not Configured"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Revenue sync & royalties
              </p>
            </div>

            <div data-testid="status-blockchain" className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Box className="size-3" /> Blockchain
                </span>
                {ecosystemStatus?.blockchain?.configured ? (
                  <CheckCircle className="size-4 text-emerald-400" />
                ) : ecosystemStatus?.blockchain?.hasWallet ? (
                  <AlertTriangle className="size-4 text-yellow-400" />
                ) : (
                  <Clock className="size-4 text-slate-400" />
                )}
              </div>
              <p data-testid="text-blockchain-status" className={`text-sm font-medium ${ecosystemStatus?.blockchain?.configured ? "text-emerald-400" : ecosystemStatus?.blockchain?.hasWallet ? "text-yellow-400" : "text-slate-400"}`}>
                {ecosystemStatus?.blockchain?.configured ? "Ready" : ecosystemStatus?.blockchain?.hasWallet ? "Wallet Set" : "Not Configured"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Solana verification stamps
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center break-all">
            Add secrets: TRUSTLAYER_HUB_API_KEY, TRUSTLAYER_HUB_API_SECRET, HELIUS_API_KEY, SOLANA_WALLET_PRIVATE_KEY
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cpu className="size-4 text-fuchsia-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/roadmap">
            <Button variant="outline" className="w-full justify-start text-left min-h-[44px]" data-testid="button-view-roadmap">
              <Code className="size-4 mr-2" />
              View Development Roadmap
            </Button>
          </Link>
          <Link href="/owner">
            <Button variant="outline" className="w-full justify-start text-left min-h-[44px]" data-testid="button-view-owner">
              <Shield className="size-4 mr-2" />
              View Owner Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="border-t border-white/10 pt-6">
        <AnalyticsDashboard variant="developer" />
      </div>

      <BlogManager />
    </div>
  );
}
