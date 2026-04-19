import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket, Plus, Trash2, Copy, Check, X, ArrowLeft,
  Gift, Percent, Crown, Clock, Users, Shield,
  ToggleLeft, ToggleRight, Loader2, Tag, Sparkles,
  CalendarDays, Hash, Eye, EyeOff
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const PERK_TYPES = [
  { value: "fee_discount", label: "Reduced Service Fee", icon: Percent, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", description: "Lower the 20% service fee for their first period" },
  { value: "priority_listing", label: "Priority Listing", icon: Crown, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", description: "Featured placement in the vendor directory" },
  { value: "free_marketing", label: "Free Marketing Kit", icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", description: "Complimentary flyers, cards, and social media assets" },
  { value: "extended_trial", label: "Extended Trial", icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", description: "Extra time before standard fees kick in" },
  { value: "bonus_credits", label: "Bonus Credits", icon: Gift, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", description: "Credits toward delivery fees or platform services" },
];

const PERK_VALUES: Record<string, string[]> = {
  fee_discount: ["10% fee (first month)", "10% fee (first 3 months)", "12% fee (first month)", "0% fee (first 2 weeks)"],
  priority_listing: ["1 week featured", "2 weeks featured", "1 month featured"],
  free_marketing: ["Basic kit (flyers + cards)", "Premium kit (flyers, cards, social assets)", "Full brand package"],
  extended_trial: ["30-day free trial", "60-day free trial", "90-day free trial"],
  bonus_credits: ["$25 delivery credits", "$50 delivery credits", "$100 delivery credits"],
};

interface InviteCode {
  id: number;
  code: string;
  label: string;
  perkType: string;
  perkValue: string;
  perkDescription: string;
  maxUses: number | null;
  timesUsed: number;
  isActive: boolean;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
}

function generateCode(prefix: string = "HE"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix + "-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function InviteCodesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newCode, setNewCode] = useState(generateCode());
  const [label, setLabel] = useState("");
  const [perkType, setPerkType] = useState("");
  const [perkValue, setPerkValue] = useState("");
  const [customPerkDesc, setCustomPerkDesc] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: codes = [], isLoading } = useQuery<InviteCode[]>({
    queryKey: ["invite-codes"],
    queryFn: async () => {
      const res = await fetch("/api/invite-codes");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invite-codes"] });
      toast({ title: "Invite code created", description: "Your new invite code is ready to share" });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/invite-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invite-codes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/invite-codes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invite-codes"] });
      toast({ title: "Code deleted" });
    },
  });

  const resetForm = () => {
    setShowCreate(false);
    setNewCode(generateCode());
    setLabel("");
    setPerkType("");
    setPerkValue("");
    setCustomPerkDesc("");
    setMaxUses("");
    setExpiresAt("");
  };

  const handleCreate = () => {
    if (!newCode || !label || !perkType || !perkValue) {
      toast({ title: "Missing fields", description: "Please fill in the code, label, perk type, and perk value", variant: "destructive" });
      return;
    }
    const selectedPerk = PERK_TYPES.find(p => p.value === perkType);
    const perkDescription = customPerkDesc || `${selectedPerk?.label}: ${perkValue}`;
    createMutation.mutate({
      code: newCode,
      label,
      perkType,
      perkValue,
      perkDescription,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt || null,
    });
  };

  const copyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: `${code} copied to clipboard` });
  };

  const activeCodes = codes.filter(c => c.isActive);
  const totalUses = codes.reduce((sum, c) => sum + (c.timesUsed || 0), 0);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-10 space-y-4 sm:space-y-6"
      >
        <Link href="/command-center">
          <Button variant="ghost" className="text-white/60 hover:text-white -ml-2 gap-2 text-sm" data-testid="button-back">
            <ArrowLeft className="size-4" /> Command Center
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/20">
              <Ticket className="size-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" data-testid="text-page-title">Invite Codes</h1>
              <p className="text-xs text-slate-500">Generate & manage vendor invite codes with perks</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2"
            size="sm"
            data-testid="button-create-code"
          >
            <Plus className="size-4" /> New Code
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Codes", value: codes.length, icon: Tag, color: "text-violet-400" },
            { label: "Active", value: activeCodes.length, icon: Shield, color: "text-emerald-400" },
            { label: "Total Uses", value: totalUses, icon: Users, color: "text-cyan-400" },
          ].map(s => (
            <Card key={s.label} className={GLASS_CARD}>
              <CardContent className="p-3 sm:p-4 text-center">
                <s.icon className={`size-4 ${s.color} mx-auto mb-1`} />
                <p className="text-lg sm:text-2xl font-bold text-white" data-testid={`text-stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className={`${GLASS_CARD} border-violet-500/20`}>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="size-4 text-violet-400" /> Create New Invite Code
                    </h3>
                    <Button variant="ghost" size="icon" onClick={resetForm} className="text-white/30 hover:text-white size-7">
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Code</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          placeholder="HE-ABC123"
                          className="bg-white/5 border-white/10 text-white font-mono uppercase"
                          data-testid="input-code"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setNewCode(generateCode())}
                          className="border-white/10 text-white/60 hover:text-white shrink-0"
                          data-testid="button-regenerate"
                        >
                          <Hash className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Label (who is this for?)</Label>
                      <Input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g., Nashville Launch, Event Promo"
                        className="bg-white/5 border-white/10 text-white"
                        data-testid="input-label"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Perk Type</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {PERK_TYPES.map(p => (
                        <button
                          key={p.value}
                          onClick={() => { setPerkType(p.value); setPerkValue(""); }}
                          className={`p-3 rounded-xl border text-left transition-all active:scale-[0.97] ${
                            perkType === p.value
                              ? `${p.bg} border-white/20 ring-1 ring-white/10`
                              : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]"
                          }`}
                          data-testid={`button-perk-${p.value}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p.icon className={`size-4 ${p.color}`} />
                            <span className="text-xs font-semibold text-white">{p.label}</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">{p.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {perkType && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <Label className="text-white/60 text-xs">Perk Value</Label>
                      <div className="flex flex-wrap gap-2">
                        {(PERK_VALUES[perkType] || []).map(v => (
                          <button
                            key={v}
                            onClick={() => setPerkValue(v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-[0.97] ${
                              perkValue === v
                                ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                                : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/[0.15]"
                            }`}
                            data-testid={`button-value-${v.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Max Uses (optional)</Label>
                      <Input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder="Unlimited"
                        className="bg-white/5 border-white/10 text-white"
                        data-testid="input-max-uses"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/60 text-xs">Expires On (optional)</Label>
                      <Input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        data-testid="input-expires"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/60 text-xs">Custom Description (optional)</Label>
                    <Input
                      value={customPerkDesc}
                      onChange={(e) => setCustomPerkDesc(e.target.value)}
                      placeholder="Auto-generated from perk type + value if left blank"
                      className="bg-white/5 border-white/10 text-white"
                      data-testid="input-custom-desc"
                    />
                  </div>

                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !newCode || !label || !perkType || !perkValue}
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white gap-2"
                    data-testid="button-submit-create"
                  >
                    {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Ticket className="size-4" />}
                    Create Invite Code
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 text-violet-400 animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <Card className={GLASS_CARD}>
            <CardContent className="p-8 text-center">
              <Ticket className="size-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/40 mb-1">No invite codes yet</p>
              <p className="text-xs text-white/20">Create your first invite code to start recruiting vendors with perks</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {codes.map((code, i) => {
              const perk = PERK_TYPES.find(p => p.value === code.perkType);
              const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date();
              const isMaxed = code.maxUses && (code.timesUsed ?? 0) >= code.maxUses;
              const isEffectivelyActive = code.isActive && !isExpired && !isMaxed;

              return (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={`${GLASS_CARD} ${isEffectivelyActive ? "border-white/10" : "border-white/5 opacity-60"}`} data-testid={`card-invite-${code.id}`}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${perk?.bg || "bg-white/5 border-white/10"}`}>
                            {perk ? <perk.icon className={`size-5 ${perk.color}`} /> : <Gift className="size-5 text-white/40" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-white tracking-wider" data-testid={`text-code-${code.id}`}>{code.code}</span>
                              <button
                                onClick={() => copyCode(code.code, code.id)}
                                className="text-white/20 hover:text-white/60 transition-colors"
                                data-testid={`button-copy-${code.id}`}
                              >
                                {copiedId === code.id ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                              </button>
                              {isEffectivelyActive ? (
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">Active</Badge>
                              ) : isExpired ? (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[9px]">Expired</Badge>
                              ) : isMaxed ? (
                                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">Max Used</Badge>
                              ) : (
                                <Badge className="bg-slate-500/20 text-slate-300 border-slate-500/30 text-[9px]">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-xs text-white/50 mt-0.5">{code.label}</p>
                            <p className="text-[11px] text-white/30 mt-1">{code.perkDescription}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-white/20">
                              <span className="flex items-center gap-1">
                                <Users className="size-2.5" /> {code.timesUsed || 0}{code.maxUses ? `/${code.maxUses}` : ""} uses
                              </span>
                              {code.expiresAt && (
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="size-2.5" /> Expires {new Date(code.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="size-2.5" /> Created {new Date(code.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={!!code.isActive}
                            onCheckedChange={(checked) => toggleMutation.mutate({ id: code.id, isActive: checked })}
                            className="data-[state=checked]:bg-violet-500"
                            data-testid={`switch-active-${code.id}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Delete this invite code?")) {
                                deleteMutation.mutate(code.id);
                              }
                            }}
                            className="text-white/20 hover:text-red-400 size-7"
                            data-testid={`button-delete-${code.id}`}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
