import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, DollarSign, TrendingUp, Link2,
  Copy, CheckCircle, Clock, ArrowLeft,
  Sparkles, Award, Star, Share2,
  UserPlus, RefreshCw, Crown, Diamond, CircleDot
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

function haptic() {
  if (navigator.vibrate) navigator.vibrate(10);
}

const TIER_COLORS: Record<string, string> = {
  base: "bg-slate-500 text-slate-100",
  silver: "bg-gray-300 text-gray-800",
  gold: "bg-amber-500 text-amber-950",
  platinum: "bg-violet-500 text-white",
  diamond: "bg-cyan-400 text-cyan-950",
};

const TIER_BORDER_COLORS: Record<string, string> = {
  base: "border-slate-500/40",
  silver: "border-gray-300/40",
  gold: "border-amber-500/40",
  platinum: "border-violet-500/40",
  diamond: "border-cyan-400/40",
};

const TIER_THRESHOLDS = [
  { tier: "Base", referrals: 0, rate: "10%" },
  { tier: "Silver", referrals: 5, rate: "12.5%" },
  { tier: "Gold", referrals: 15, rate: "15%" },
  { tier: "Platinum", referrals: 30, rate: "17.5%" },
  { tier: "Diamond", referrals: 50, rate: "20%" },
];

function getNextTier(currentTier: string) {
  const idx = TIER_THRESHOLDS.findIndex(t => t.tier.toLowerCase() === currentTier);
  if (idx < TIER_THRESHOLDS.length - 1) return TIER_THRESHOLDS[idx + 1];
  return null;
}

function getToken() {
  return localStorage.getItem("customer_token");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export default function AffiliateDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const token = getToken();

  const dashboardQuery = useQuery({
    queryKey: ["/api/affiliate/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard", { headers: authHeaders() });
      if (res.status === 401) throw new Error("unauthorized");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    enabled: !!token,
    retry: false,
  });

  const linkQuery = useQuery({
    queryKey: ["/api/affiliate/link"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/link", { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch link");
      return res.json();
    },
    enabled: !!token && !dashboardQuery.isError,
    retry: false,
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/affiliate/request-payout", {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Payout request failed");
      return res.json();
    },
    onSuccess: (data) => {
      haptic();
      toast({ title: "Payout Requested!", description: `${data.amount} SIG across ${data.commissionsProcessed} commissions processed.` });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/dashboard"] });
    },
    onError: () => {
      toast({ title: "Payout Failed", description: "Please try again later.", variant: "destructive" });
    },
  });

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      haptic();
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const shareLink = async (link: string) => {
    const shareText = `Join me on Happy Eats — part of the Trust Layer ecosystem! ${link}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Happy Eats Referral", text: shareText, url: link });
        haptic();
      } catch {}
    } else {
      copyLink(shareText);
    }
  };

  if (!token || (dashboardQuery.isError && (dashboardQuery.error as Error)?.message === "unauthorized")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f172a] to-[#0a0e1a]">
        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-16">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors" data-testid="link-back">
              <ArrowLeft className="w-4 h-4" /> Back
            </a>
          </Link>
          <div className="text-center py-20">
            <UserPlus className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2" data-testid="text-signin-prompt">Sign In Required</h2>
            <p className="text-white/50 mb-6">Please sign in to access your affiliate dashboard.</p>
            <Link href="/signin">
              <Button className="bg-gradient-to-r from-[#FF7849] to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-0" data-testid="link-signin">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dashboard = dashboardQuery.data;
  const linkData = linkQuery.data;
  const tier = dashboard?.tier || "base";
  const nextTier = getNextTier(tier);
  const convertedReferrals = dashboard?.convertedReferrals || 0;
  const pendingEarnings = Number(dashboard?.pendingEarnings) || 0;

  const progressPercent = nextTier
    ? Math.min(100, (convertedReferrals / nextTier.referrals) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e1a] via-[#0f172a] to-[#0a0e1a]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors" data-testid="link-back-home">
            <ArrowLeft className="w-4 h-4" /> Back
          </a>
        </Link>

        {dashboardQuery.isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white/10 rounded-2xl h-32" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* 1. Header with tier badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF7849]/20 to-rose-500/20 border border-[#FF7849]/30 mb-4">
                  <Sparkles className="w-4 h-4 text-[#FF7849]" />
                  <span className="text-orange-300 text-sm font-medium">Affiliate Partner Program</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white" data-testid="text-dashboard-title">
                  Affiliate Dashboard
                </h1>
              </div>
              <Badge className={`text-sm px-4 py-2 font-bold uppercase tracking-wider ${TIER_COLORS[tier] || TIER_COLORS.base}`} data-testid="badge-tier">
                {tier === "diamond" && <Diamond className="w-4 h-4 mr-1" />}
                {tier === "platinum" && <Crown className="w-4 h-4 mr-1" />}
                {tier === "gold" && <Star className="w-4 h-4 mr-1" />}
                {tier === "silver" && <Award className="w-4 h-4 mr-1" />}
                {tier === "base" && <CircleDot className="w-4 h-4 mr-1" />}
                {tier} Tier
              </Badge>
            </div>

            {/* 2. Referral link section */}
            {linkData && (
              <div className={`rounded-2xl border ${TIER_BORDER_COLORS[tier] || "border-white/[0.06]"} backdrop-blur-xl bg-white/[0.03] p-6`}>
                <h2 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-[#FF7849]" />
                  Your Referral Link
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-[#1e293b] rounded-xl px-4 py-3 text-white/80 text-sm font-mono truncate border border-white/[0.06]" data-testid="text-referral-link">
                    {linkData.link}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyLink(linkData.link)}
                      className="bg-[#1e293b] hover:bg-white/10 text-white border border-white/[0.06]"
                      data-testid="button-copy-link"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-2">{copied ? "Copied" : "Copy"}</span>
                    </Button>
                    <Button
                      onClick={() => shareLink(linkData.link)}
                      className="bg-gradient-to-r from-[#FF7849] to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-0"
                      data-testid="button-share-link"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="ml-2">Share</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Ecosystem Cross-Platform Links */}
            {linkData?.crossPlatformLinks?.length > 0 && (
              <div className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-6">
                <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF7849]" />
                  Ecosystem Referral Links
                </h2>
                <p className="text-white/40 text-xs mb-4">Your unique referral hash works across all 33 Trust Layer apps. One identity, one link per app.</p>
                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {linkData.crossPlatformLinks.map((app: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1e293b]/60 border border-white/[0.04] hover:border-[#FF7849]/20 transition-colors group" data-testid={`ecosystem-link-${app.prefix}`}>
                      <span className="text-[10px] font-bold text-[#FF7849] bg-[#FF7849]/10 rounded px-1.5 py-0.5 font-mono shrink-0 w-8 text-center">{app.prefix}</span>
                      <span className="text-white/70 text-xs font-medium truncate min-w-0 w-28 shrink-0">{app.app}</span>
                      <span className="text-white/30 text-[10px] font-mono truncate flex-1 min-w-0">{app.link}</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(app.link); haptic(); toast({ title: `${app.app} link copied!` }); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        data-testid={`button-copy-${app.prefix}`}
                      >
                        <Copy className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Stats cards row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Referrals", value: dashboard?.totalReferrals || 0, icon: Users, color: "text-blue-400", bg: "from-blue-500/20 to-blue-600/10" },
                { label: "Converted", value: convertedReferrals, icon: CheckCircle, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-600/10" },
                { label: "Pending Earnings", value: `${pendingEarnings.toFixed(2)} SIG`, icon: Clock, color: "text-amber-400", bg: "from-amber-500/20 to-amber-600/10" },
                { label: "Paid Earnings", value: `${(Number(dashboard?.paidEarnings) || 0).toFixed(2)} SIG`, icon: DollarSign, color: "text-green-400", bg: "from-green-500/20 to-green-600/10" },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-5 relative overflow-hidden" data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} pointer-events-none`} />
                  <div className="relative">
                    <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                    <p className="text-2xl font-bold text-white">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                    <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Tier progress bar */}
            <div className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF7849]" />
                Tier Progress
              </h2>
              {nextTier ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60 capitalize">{tier}</span>
                    <span className="text-white/60">{nextTier.tier} ({nextTier.referrals} referrals)</span>
                  </div>
                  <div className="w-full h-3 bg-[#1e293b] rounded-full overflow-hidden" data-testid="progress-tier">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF7849] to-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    {convertedReferrals} / {nextTier.referrals} converted referrals to reach {nextTier.tier}
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <Diamond className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">Maximum tier reached!</p>
                  <p className="text-white/50 text-sm">You're at the Diamond tier — 20% commission rate.</p>
                </div>
              )}
            </div>

            {/* 5. Commission tier table */}
            <div className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF7849]" />
                Commission Tiers
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-commission-tiers">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-white/50 py-3 px-4 font-medium">Tier</th>
                      <th className="text-center text-white/50 py-3 px-4 font-medium">Referrals Needed</th>
                      <th className="text-right text-white/50 py-3 px-4 font-medium">Commission Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIER_THRESHOLDS.map((t) => {
                      const isCurrentTier = t.tier.toLowerCase() === tier;
                      return (
                        <tr key={t.tier} className={`border-b border-white/[0.04] ${isCurrentTier ? "bg-[#FF7849]/10" : ""}`} data-testid={`row-tier-${t.tier.toLowerCase()}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${TIER_COLORS[t.tier.toLowerCase()] || TIER_COLORS.base}`}>
                                {t.tier}
                              </Badge>
                              {isCurrentTier && <span className="text-[#FF7849] text-xs font-medium">(Current)</span>}
                            </div>
                          </td>
                          <td className="text-center text-white/70 py-3 px-4">{t.referrals}</td>
                          <td className="text-right text-white font-semibold py-3 px-4">{t.rate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Recent referrals list */}
            <div className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FF7849]" />
                Recent Referrals
              </h2>
              {(!dashboard?.referrals || dashboard.referrals.length === 0) ? (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm" data-testid="text-no-referrals">No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="list-referrals">
                  {dashboard.referrals.map((ref: any, i: number) => (
                    <div key={ref.id || i} className="flex items-center justify-between p-4 rounded-xl bg-[#1e293b]/60 border border-white/[0.06]" data-testid={`referral-item-${i}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          ref.status === "converted" ? "bg-emerald-500/20" : ref.status === "expired" ? "bg-red-500/20" : "bg-yellow-500/20"
                        }`}>
                          <Users className={`w-4 h-4 ${
                            ref.status === "converted" ? "text-emerald-400" : ref.status === "expired" ? "text-red-400" : "text-yellow-400"
                          }`} />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{ref.referredName || ref.email || "Anonymous"}</p>
                          <p className="text-white/40 text-xs">{ref.platform || "—"} · {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : ""}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${
                        ref.status === "converted" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        ref.status === "expired" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`} data-testid={`badge-referral-status-${i}`}>
                        {ref.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Recent commissions list */}
            <div className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FF7849]" />
                Recent Commissions
              </h2>
              {(!dashboard?.commissions || dashboard.commissions.length === 0) ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/40 text-sm" data-testid="text-no-commissions">No commissions yet.</p>
                </div>
              ) : (
                <div className="space-y-3" data-testid="list-commissions">
                  {dashboard.commissions.map((comm: any, i: number) => (
                    <div key={comm.id || i} className="flex items-center justify-between p-4 rounded-xl bg-[#1e293b]/60 border border-white/[0.06]" data-testid={`commission-item-${i}`}>
                      <div>
                        <p className="text-white text-sm font-medium">{Number(comm.amount).toFixed(2)} SIG</p>
                        <p className="text-white/40 text-xs">{comm.createdAt ? new Date(comm.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                      <Badge className={`text-xs ${
                        comm.status === "paid" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        comm.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-white/10 text-white/60 border-white/20"
                      }`} data-testid={`badge-commission-status-${i}`}>
                        {comm.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Request Payout button */}
            <div className="rounded-2xl border border-white/[0.06] backdrop-blur-xl bg-white/[0.03] p-6 text-center">
              <h2 className="text-white font-semibold text-lg mb-2">Ready to Cash Out?</h2>
              <p className="text-white/50 text-sm mb-4">Minimum payout: 10 SIG</p>
              <Button
                onClick={() => { haptic(); payoutMutation.mutate(); }}
                disabled={pendingEarnings < 10 || payoutMutation.isPending}
                className="bg-gradient-to-r from-[#FF7849] to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-0 h-12 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-request-payout"
              >
                {payoutMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <DollarSign className="w-4 h-4 mr-2" />
                )}
                Request Payout ({pendingEarnings.toFixed(2)} SIG)
              </Button>
              {pendingEarnings < 10 && (
                <p className="text-white/30 text-xs mt-2" data-testid="text-payout-minimum">You need at least 10 SIG in pending earnings to request a payout.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
