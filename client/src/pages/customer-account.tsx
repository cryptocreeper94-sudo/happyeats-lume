import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useCustomerSession } from "./customer-auth";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Mail, Building2, MapPin, LogOut, Package, Star, Gift, Edit3, Save, X, Truck, Clock, ChevronRight, Copy, Share2, Users, Sparkles, Crown, Loader2 } from "lucide-react";
import customerSigninImg from "@/assets/images/customer-signin.jpg";
import rewardsCardImg from "@/assets/images/rewards-card.jpg";
import starReviewImg from "@/assets/images/star-review.jpg";
import orderHistoryImg from "@/assets/images/order-history-hero.jpg";

export default function CustomerAccount() {
  const [, navigate] = useLocation();
  const { getSession, getToken, setSession, clearSession } = useCustomerSession();
  const customer = getSession();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    businessName: "",
  });

  useEffect(() => {
    if (!customer) {
      navigate("/signin");
      return;
    }
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      deliveryAddress: customer.deliveryAddress || "",
      deliveryInstructions: customer.deliveryInstructions || "",
      businessName: customer.businessName || "",
    });
  }, []);

  const { data: rewards } = useQuery({
    queryKey: ["/api/rewards", customer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/rewards/${customer?.id}`);
      return res.json();
    },
    enabled: !!customer?.id,
  });

  const { data: referral } = useQuery({
    queryKey: ["/api/customers", customer?.id, "referral"],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch(`/api/customers/${customer?.id}/referral`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!customer?.id,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/customers", customer?.id, "orders"],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch(`/api/customers/${customer?.id}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
    enabled: !!customer?.id,
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/stripe/subscription-status", customer?.id],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/subscription-status/${customer?.id}`);
      return res.json();
    },
    enabled: !!customer?.id,
  });

  const [subscribing, setSubscribing] = useState(false);
  const [subscribingStudio, setSubscribingStudio] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelingStudio, setCancelingStudio] = useState(false);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const res = await fetch("/api/stripe/create-ad-free-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, customerEmail: customer.email, customerName: customer.name }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast({ title: "Could not start checkout", variant: "destructive" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribeStudio = async () => {
    setSubscribingStudio(true);
    try {
      const res = await fetch("/api/stripe/create-media-studio-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, customerEmail: customer.email, customerName: customer.name }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast({ title: "Could not start checkout", description: data.error, variant: "destructive" });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubscribingStudio(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const res = await fetch("/api/stripe/cancel-ad-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Subscription will end at billing period" });
        queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription-status"] });
      }
    } catch {
      toast({ title: "Could not cancel", variant: "destructive" });
    } finally {
      setCanceling(false);
    }
  };

  const handleCancelStudio = async () => {
    setCancelingStudio(true);
    try {
      const res = await fetch("/api/stripe/cancel-media-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Media Studio Pro will end at billing period" });
        queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription-status"] });
      }
    } catch {
      toast({ title: "Could not cancel", variant: "destructive" });
    } finally {
      setCancelingStudio(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSession(data.customer);
        setEditing(false);
        toast({ title: "Profile updated!" });
      }
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  if (!customer) return null;

  const handleLogout = () => {
    clearSession();
    toast({ title: "Signed out" });
    navigate("/");
  };

  const rewardProgress = rewards?.orderCountSinceLastReward ?? 0;
  const ordersUntilReward = 10 - rewardProgress;

  const quickLinks = [
    { icon: Package, label: "Order History", path: "/order-history", color: "from-blue-500 to-cyan-500", img: orderHistoryImg },
    { icon: Star, label: "My Reviews", path: "/order-history?tab=reviews", color: "from-amber-500 to-orange-500", img: starReviewImg },
    { icon: Gift, label: "Rewards", path: "/rewards", color: "from-purple-500 to-pink-500", img: rewardsCardImg },
    { icon: Truck, label: "Order Now", path: "/explore", color: "from-green-500 to-emerald-500", img: orderHistoryImg },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={customerSigninImg} alt="" className="w-full h-52 object-cover brightness-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/60 via-[#0f172a]/90 to-[#0f172a]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors" data-testid="link-back">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400/70 hover:text-red-400 text-sm transition-colors" data-testid="button-logout">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <GlassCard glow className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <span className="text-xl font-bold text-white">
                    {customer.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent" data-testid="text-customer-name">{customer.name}</h1>
                  <p className="text-white/50 text-sm">{customer.accountType === "business" ? customer.businessName || "Business" : "Personal Account"}</p>
                </div>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white transition-all" data-testid="button-edit">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-white/60 text-xs flex items-center gap-1"><User className="w-3 h-3" /> Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/[0.06] border-white/[0.1] text-white h-10 mt-1" data-testid="input-edit-name" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/[0.06] border-white/[0.1] text-white h-10 mt-1" data-testid="input-edit-email" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Address</Label>
                  <Input value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className="bg-white/[0.06] border-white/[0.1] text-white h-10 mt-1" data-testid="input-edit-address" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery Instructions</Label>
                  <Input value={form.deliveryInstructions} onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })} placeholder="Gate code, leave at door, etc." className="bg-white/[0.06] border-white/[0.1] text-white h-10 mt-1" data-testid="input-edit-instructions" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="flex-1 h-10 bg-gradient-to-r from-orange-500 to-pink-500 text-white" data-testid="button-save">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button onClick={() => setEditing(false)} variant="outline" className="h-10 border-white/[0.1] text-white/60" data-testid="button-cancel-edit">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { icon: Phone, label: customer.phone, sub: "Phone" },
                  { icon: Mail, label: customer.email || "Not set", sub: "Email" },
                  { icon: MapPin, label: customer.deliveryAddress || "Not set", sub: "Delivery Address" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <item.icon className="w-4 h-4 text-white/40 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-white/40">{item.sub}</p>
                      <p className="text-sm text-white/80 truncate">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {rewards && (
            <GlassCard glow className="p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-400" /> <span className="bg-gradient-to-r from-white via-white to-purple-200 bg-clip-text text-transparent">Loyalty Card</span>
                  </h2>
                  {Number(rewards.rewardBalance) > 0 && (
                    <span className="text-sm font-bold text-green-400" data-testid="text-reward-balance">
                      ${Number(rewards.rewardBalance).toFixed(2)} credit
                    </span>
                  )}
                </div>

                {/* Digital Punch Card */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/20 p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-purple-300/70 font-bold">Happy Eats Rewards</span>
                    <span className="text-[10px] uppercase tracking-widest text-pink-300/70 font-bold">
                      {ordersUntilReward > 0 ? `${ordersUntilReward} to go!` : "🎉 REWARD EARNED!"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }, (_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${
                          i < rewardProgress
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                            : "bg-white/[0.03] border-white/[0.08] text-white/20"
                        }`}
                      >
                        {i < rewardProgress ? "✓" : i + 1}
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-xs text-white/50">
                      Every 10th order earns a <span className="text-purple-300 font-semibold">free meal credit</span> 🎁
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/40">
                  {rewards.totalRewardsEarned || 0} reward{(rewards.totalRewardsEarned || 0) !== 1 ? "s" : ""} earned total
                  {rewards.orderCount ? ` · ${rewards.orderCount} orders placed` : ""}
                </p>
              </div>
            </GlassCard>
          )}

          {referral && referral.referralCode && (
            <GlassCard glow className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" /> <span className="bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">Refer Friends</span>
                </h2>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-white/[0.06] border border-orange-500/20 rounded-lg px-3 py-2.5 font-mono text-sm text-orange-300 tracking-wider text-center" data-testid="text-referral-code">
                  {referral.referralCode}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referral.referralCode);
                    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                  }}
                  className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
                  data-testid="button-copy-code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="flex-1 bg-white/[0.04] rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white" data-testid="text-friends-referred">{referral.friendsReferred ?? 0}</p>
                  <p className="text-[10px] text-white/40">Friends Referred</p>
                </div>
                <div className="flex-1 bg-white/[0.04] rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-400" data-testid="text-credits-earned">${Number(referral.creditsEarned ?? 0).toFixed(2)}</p>
                  <p className="text-[10px] text-white/40">Credits Earned</p>
                </div>
              </div>

              <Button
                onClick={() => {
                  const shareMsg = `Use my code ${referral.referralCode} to get $5 off your first Happy Eats order! 🎉`;
                  if (navigator.share) {
                    navigator.share({ title: "Happy Eats Referral", text: shareMsg }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareMsg);
                    toast({ title: "Copied!", description: "Share message copied to clipboard" });
                  }
                }}
                className="w-full h-10 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm font-medium"
                data-testid="button-share-referral"
              >
                <Share2 className="w-4 h-4 mr-1.5" /> Share & Earn $5
              </Button>
            </GlassCard>
          )}

          <GlassCard glow className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" /> <span className="bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent">Subscriptions</span>
              </h2>
              <div className="flex gap-1.5">
                {subscriptionStatus?.mediaStudioSubscription && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold uppercase tracking-wider" data-testid="badge-media-studio">
                    Studio Pro
                  </span>
                )}
                {subscriptionStatus?.adFreeSubscription && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider" data-testid="badge-ad-free">
                    Ad-Free
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {subscriptionStatus?.mediaStudioSubscription ? (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                  <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Media Studio Pro Active</p>
                  <p className="text-xs text-white/50 mt-1">Full editing suite + ad-free experience</p>
                  {subscriptionStatus.mediaStudioExpiresAt && (
                    <p className="text-xs text-purple-400/60 mt-2">Ends {new Date(subscriptionStatus.mediaStudioExpiresAt).toLocaleDateString()}</p>
                  )}
                  <button onClick={() => navigate("/media-editor")} className="mt-3 text-xs text-purple-400 hover:text-purple-300 font-medium" data-testid="link-open-media-studio">
                    Open Media Studio
                  </button>
                  {!subscriptionStatus.mediaStudioExpiresAt && (
                    <div className="mt-2">
                      <button onClick={handleCancelStudio} disabled={cancelingStudio} className="text-xs text-white/30 hover:text-white/50 transition-colors" data-testid="button-cancel-media-studio">
                        {cancelingStudio ? "Canceling..." : "Cancel Media Studio Pro"}
                      </button>
                    </div>
                  )}
                </div>
              ) : subscriptionStatus?.adFreeSubscription ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                    <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">Ad-Free Experience Active</p>
                    <p className="text-xs text-white/50 mt-1">No ads across the entire app</p>
                    {subscriptionStatus.adFreeExpiresAt && (
                      <p className="text-xs text-amber-400/60 mt-2">Ends {new Date(subscriptionStatus.adFreeExpiresAt).toLocaleDateString()}</p>
                    )}
                  </div>
                  {!subscriptionStatus.adFreeExpiresAt && (
                    <button onClick={handleCancelSubscription} disabled={canceling} className="w-full text-xs text-white/30 hover:text-white/50 transition-colors py-1" data-testid="button-cancel-subscription">
                      {canceling ? "Canceling..." : "Cancel Ad-Free Subscription"}
                    </button>
                  )}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Upgrade to Studio Pro</p>
                        <p className="text-xs text-white/50">Photo, video, audio editors + AI flyers</p>
                      </div>
                      <p className="text-lg font-bold text-white">$15<span className="text-xs text-white/40 font-normal">/mo</span></p>
                    </div>
                  </div>
                  <Button onClick={handleSubscribeStudio} disabled={subscribingStudio} className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium" data-testid="button-subscribe-studio">
                    {subscribingStudio ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Crown className="w-4 h-4 mr-1.5" />}
                    {subscribingStudio ? "Starting..." : "Upgrade to $15/month"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Go Ad-Free</p>
                        <p className="text-xs text-white/50">Clean experience, no distractions</p>
                      </div>
                      <p className="text-lg font-bold text-white">$5<span className="text-xs text-white/40 font-normal">/mo</span></p>
                    </div>
                  </div>
                  <Button onClick={handleSubscribe} disabled={subscribing} className="w-full h-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-medium" data-testid="button-subscribe">
                    {subscribing ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
                    {subscribing ? "Starting..." : "Ad-Free for $5/month"}
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]"></div></div>
                    <div className="relative flex justify-center"><span className="bg-[#1e293b] px-3 text-[10px] text-white/30 uppercase tracking-wider">or</span></div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Media Studio Pro</p>
                        <p className="text-xs text-white/50">Full editing suite + ad-free included</p>
                      </div>
                      <p className="text-lg font-bold text-white">$15<span className="text-xs text-white/40 font-normal">/mo</span></p>
                    </div>
                  </div>
                  <Button onClick={handleSubscribeStudio} disabled={subscribingStudio} className="w-full h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium" data-testid="button-subscribe-studio">
                    {subscribingStudio ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Crown className="w-4 h-4 mr-1.5" />}
                    {subscribingStudio ? "Starting..." : "Studio Pro for $15/month"}
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <div
                  className="relative overflow-hidden rounded-xl cursor-pointer group border border-white/[0.08] shadow-lg"
                  onClick={() => navigate(link.path)}
                  data-testid={`card-quicklink-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <img src={link.img} alt="" className="w-full h-28 object-cover brightness-110 group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${link.color} opacity-40`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <link.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-white drop-shadow-md flex items-center">
                        {link.label}
                        <ChevronRight className="w-3.5 h-3.5 ml-1 text-white/60 group-hover:text-white" />
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {recentOrders && recentOrders.length > 0 && (
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" /> <span className="bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">Recent Orders</span>
                </h2>
                <button onClick={() => navigate("/order-history")} className="text-xs text-orange-400 hover:text-orange-300" data-testid="link-view-all-orders">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {recentOrders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm text-white/80 truncate">Order #{order.id}</p>
                      <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-green-500/20 text-green-400" : order.status === "cancelled" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}>
                        {order.status}
                      </span>
                      {order.total && (
                        <span className="text-sm font-medium text-white/70">${Number(order.total).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}