import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, Lock, Unlock, MapPin, Zap,
  Check, X, Radio, Eye, ChevronRight, AlertTriangle,
  Power, Layers, Activity, Megaphone, CalendarCheck, Loader2, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/hooks/use-toast";
import ZoneCarousel from "@/components/zone-carousel";

interface ZoneData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  isActive: boolean | null;
  exits: Array<{ exit: number; name: string; lat: number; lng: number }> | null;
  cutoffTime: string | null;
}

export default function ZoneControl() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [adminPin, setAdminPin] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);
  const [pinError, setPinError] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<number, boolean>>(new Map());
  const [tomorrowZoneIds, setTomorrowZoneIds] = useState<number[]>([]);

  const { data: zones = [], isLoading } = useQuery<ZoneData[]>({
    queryKey: ["/api/zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
    refetchInterval: isUnlocked ? 8000 : 15000,
  });

  // Tomorrow's date
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const tomorrowDate = getTomorrowDate();
  const tomorrowLabel = new Date(tomorrowDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Fetch tomorrow's schedule
  const { data: tomorrowSchedule } = useQuery<{ date: string; zoneIds: number[]; published: boolean }>({
    queryKey: ['zone-schedule', tomorrowDate],
    queryFn: async () => {
      const res = await fetch(`/api/zones/scheduled/${tomorrowDate}`);
      if (!res.ok) throw new Error('Failed to fetch schedule');
      return res.json();
    },
    refetchInterval: isUnlocked ? 10000 : 30000,
  });

  // Sync tomorrowZoneIds from schedule
  useEffect(() => {
    if (tomorrowSchedule?.zoneIds?.length) {
      setTomorrowZoneIds(tomorrowSchedule.zoneIds);
    }
  }, [tomorrowSchedule?.zoneIds?.join(',')]);

  // Publish tomorrow's schedule mutation
  const publishSchedule = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/zones/schedule-tomorrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': adminPin },
        body: JSON.stringify({ zoneIds: tomorrowZoneIds, date: tomorrowDate }),
      });
      if (!res.ok) throw new Error('Failed to publish');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Tomorrow\'s zones published!', description: `${tomorrowZoneIds.length} zones activated. Vendors are being notified via SMS & email.` });
      queryClient.invalidateQueries({ queryKey: ['zone-schedule'] });
    },
    onError: () => {
      toast({ title: 'Failed to publish schedule', variant: 'destructive' });
    },
  });

  const handleTomorrowToggle = (zoneId: number) => {
    setTomorrowZoneIds(prev =>
      prev.includes(zoneId) ? prev.filter(id => id !== zoneId) : [...prev, zoneId]
    );
  };

  const toggleZone = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle zone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
    },
  });

  const batchToggle = useMutation({
    mutationFn: async (updates: Array<{ id: number; isActive: boolean }>) => {
      const res = await fetch("/api/zones/batch-toggle", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-pin": adminPin },
        body: JSON.stringify({ zones: updates }),
      });
      if (!res.ok) throw new Error("Failed to batch toggle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zones"] });
      setPendingChanges(new Map());
    },
  });

  const handleUnlock = useCallback(async () => {
    try {
      const res = await fetch("/api/tenants/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: adminPin }),
      });
      if (res.ok) {
        setIsUnlocked(true);
        setShowPinModal(false);
        setPinError(false);
      } else {
        setPinError(true);
        setAdminPin("");
      }
    } catch {
      setPinError(true);
      setAdminPin("");
    }
  }, [adminPin]);

  const handleToggle = (zone: ZoneData) => {
    if (!isUnlocked) return;
    const newState = !(zone.isActive === true);
    toggleZone.mutate({ id: zone.id, isActive: newState });
  };

  const handleActivateAll = () => {
    if (!isUnlocked) return;
    const updates = zones.map(z => ({ id: z.id, isActive: true }));
    batchToggle.mutate(updates);
  };

  const handleDeactivateAll = () => {
    if (!isUnlocked) return;
    const updates = zones.map(z => ({ id: z.id, isActive: false }));
    batchToggle.mutate(updates);
  };

  const activeCount = zones.filter(z => z.isActive === true).length;
  const totalCount = zones.length;

  useEffect(() => {
    document.title = "Zone Control Panel — Happy Eats";
    return () => { document.title = "Happy Eats - Delivery for Drivers"; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] text-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              className="relative w-full max-w-sm bg-[#0c1222] border border-white/[0.12] rounded-3xl p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="size-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-emerald-500/20">
                  <Shield className="size-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Zone Command Access</h2>
                <p className="text-sm text-white/40">Enter your PIN to manage delivery zones</p>
              </div>

              <Input
                type="password"
                maxLength={12}
                value={adminPin}
                onChange={e => { setAdminPin(e.target.value); setPinError(false); }}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                placeholder="Enter PIN"
                className={`bg-white/5 border-white/10 text-white text-center text-xl tracking-[0.3em] mb-3 h-14 rounded-xl ${pinError ? 'border-red-500/50 shake' : ''}`}
                autoFocus
                data-testid="input-zone-pin"
              />
              {pinError && (
                <p className="text-xs text-red-400 text-center mb-3 flex items-center justify-center gap-1">
                  <AlertTriangle className="size-3" /> Invalid PIN — try again
                </p>
              )}

              <div className="flex gap-3">
                <Link href="/command-center">
                  <Button variant="ghost" className="flex-1 text-white/40 text-sm rounded-xl">
                    Back
                  </Button>
                </Link>
                <Button
                  onClick={handleUnlock}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl h-12 text-sm"
                  data-testid="button-zone-unlock"
                >
                  <Unlock className="size-4 mr-2" /> Unlock Zones
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#070b16]/80 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/command-center">
              <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5 rounded-xl">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Layers className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">Zone Control</h1>
                <p className="text-[10px] text-white/30">Middle Tennessee Delivery Zones</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isUnlocked && (
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                <Unlock className="size-2.5" /> Unlocked
              </Badge>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 relative z-10 pb-24">
        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
            <div className="flex-1 flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
              <div className="relative">
                <div className={`size-12 rounded-xl flex items-center justify-center ${activeCount > 0 ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-red-500/15 border-red-500/30'} border`}>
                  <Activity className={`size-6 ${activeCount > 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                </div>
                {activeCount > 0 && (
                  <div className="absolute -top-1 -right-1 size-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <div className="size-2 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {activeCount}<span className="text-white/30 text-lg">/{totalCount}</span>
                </p>
                <p className="text-[11px] text-white/40">Zones Active</p>
              </div>
            </div>

            {isUnlocked && (
              <div className="flex gap-2">
                <Button
                  onClick={handleActivateAll}
                  disabled={batchToggle.isPending || activeCount === totalCount}
                  className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold gap-1.5 h-11 px-4"
                  data-testid="button-activate-all"
                >
                  <Power className="size-3.5" /> All Live
                </Button>
                <Button
                  onClick={handleDeactivateAll}
                  disabled={batchToggle.isPending || activeCount === 0}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/25 rounded-xl text-xs font-bold gap-1.5 h-11 px-4"
                  data-testid="button-deactivate-all"
                >
                  <X className="size-3.5" /> All Off
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══ Tomorrow's Zones Carousel ═══ */}
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-4 sm:p-5">
              <ZoneCarousel
                zones={zones}
                scheduledZoneIds={tomorrowZoneIds}
                mode="owner"
                onToggle={handleTomorrowToggle}
                published={tomorrowSchedule?.published || false}
                dateLabel={tomorrowLabel}
              />

              {/* Publish Button */}
              <div className="mt-5 flex items-center justify-between">
                <p className="text-[11px] text-white/30">
                  {tomorrowZoneIds.length === 0
                    ? "Tap zones above to activate them for tomorrow"
                    : `${tomorrowZoneIds.length} zone${tomorrowZoneIds.length !== 1 ? 's' : ''} selected for ${tomorrowLabel}`
                  }
                </p>
                <Button
                  onClick={() => publishSchedule.mutate()}
                  disabled={publishSchedule.isPending || tomorrowZoneIds.length === 0}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-lg shadow-emerald-500/20 gap-1.5"
                  data-testid="button-publish-tomorrow"
                >
                  {publishSchedule.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" />
                  )}
                  {tomorrowSchedule?.published ? 'Update & Notify' : 'Publish & Notify Vendors'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Zone Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {zones.map((zone, index) => {
              const isActive = zone.isActive === true;
              const isToggling = toggleZone.isPending;
              const exitCount = zone.exits?.length || 0;

              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                >
                  <button
                    onClick={() => handleToggle(zone)}
                    disabled={!isUnlocked || isToggling}
                    className={`
                      w-full text-left relative overflow-hidden rounded-2xl border transition-all duration-300 group
                      ${isActive
                        ? 'bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.04] to-transparent border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-red-500/25 hover:bg-red-500/[0.03]'
                      }
                      ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.97]'}
                    `}
                    data-testid={`zone-tile-${zone.slug}`}
                  >
                    {/* Glow for active zones */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] to-transparent" />
                    )}

                    <div className="relative p-4 sm:p-5 min-h-[140px] sm:min-h-[160px] flex flex-col justify-between">
                      {/* Top row — zone number + status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`
                          size-10 sm:size-11 rounded-xl flex items-center justify-center text-lg font-black
                          ${isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/[0.05] text-white/30 border border-white/[0.08]'
                          }
                        `}>
                          {index + 1}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isActive ? (
                            <Badge className="bg-emerald-500/25 text-emerald-200 border-emerald-500/40 text-[9px] font-bold tracking-wider px-2 py-0.5 gap-1">
                              <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                              LIVE
                            </Badge>
                          ) : (
                            <Badge className="bg-white/[0.05] text-white/30 border-white/[0.1] text-[9px] font-bold tracking-wider px-2 py-0.5">
                              OFF
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Zone name + info */}
                      <div>
                        <p className={`text-sm font-bold leading-tight mb-1 ${isActive ? 'text-white' : 'text-white/50'}`}>
                          {zone.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className={`flex items-center gap-1 ${isActive ? 'text-emerald-400/70' : 'text-white/25'}`}>
                            <MapPin className="size-2.5" /> {exitCount} stops
                          </span>
                          {zone.cutoffTime && (
                            <span className={`${isActive ? 'text-emerald-400/50' : 'text-white/20'}`}>
                              · {zone.cutoffTime}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom color bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            background: isActive
                              ? `linear-gradient(90deg, ${zone.color || '#22c55e'}, ${zone.color || '#22c55e'}88)`
                              : 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)',
                            boxShadow: isActive ? `0 0 12px ${zone.color || '#22c55e'}40` : 'none',
                          }}
                        />
                      </div>

                      {/* Hover toggle hint */}
                      {isUnlocked && (
                        <div className={`
                          absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          ${isActive ? 'bg-red-950/40' : 'bg-emerald-950/40'} backdrop-blur-[2px] rounded-2xl
                        `}>
                          <div className={`
                            size-12 rounded-xl flex items-center justify-center
                            ${isActive ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}
                          `}>
                            {isActive ? <X className="size-5" /> : <Check className="size-5" />}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Link to full zone map */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Link href="/zones">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all cursor-pointer group">
              <div className="size-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/15 transition-colors">
                <Eye className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Interactive Zone Map</p>
                <p className="text-[10px] text-white/30">View full map with zone boundaries, exits, and vendor positions</p>
              </div>
              <ChevronRight className="size-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </motion.div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
}
