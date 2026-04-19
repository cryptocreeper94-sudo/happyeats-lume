import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/i18n/context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, ChefHat, Truck, BarChart3, TestTube, ArrowRight,
  MapPin, Clock, CheckCircle2, Package,
  Star, Utensils, ChevronDown, CalendarCheck, AlertTriangle,
  Zap, MoreHorizontal, ExternalLink, ArrowLeft, Home,
  Sun, Bell, Send
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { InfoBubble } from "@/components/info-bubble";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const haptic = (style: "light" | "medium" | "heavy" = "light") => {
  if (navigator.vibrate) {
    navigator.vibrate(style === "light" ? 10 : style === "medium" ? 20 : 40);
  }
};

interface ZoneData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cutoffTime: string | null;
  dinnerCutoffTime: string | null;
  exits: Array<{ exit: number; name: string; lat: number; lng: number }> | null;
  isActive: boolean | null;
}

interface FoodTruckData {
  id: number;
  name: string;
  cuisine: string | null;
  description: string | null;
  rating: string | null;
  menu?: Array<{ id: number; name: string; isAvailable: boolean }>;
  isActive?: boolean | null;
}

interface OrderData {
  id: number;
  status: string;
  vendorStatus: string | null;
  orderType: string | null;
  batchId: string | null;
  createdAt: string;
}

const STATUS_CONFIG = [
  { key: "pending", label: "Pending", color: "amber", icon: Clock },
  { key: "accepted", label: "Accepted", color: "blue", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", color: "violet", icon: ChefHat },
  { key: "ready", label: "Ready", color: "emerald", icon: Package },
  { key: "picked_up", label: "Picked Up", color: "cyan", icon: Truck },
  { key: "delivered", label: "Delivered", color: "green", icon: CheckCircle2 },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", glow: "shadow-[0_0_15px_rgba(34,197,94,0.15)]" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]" },
};

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);
  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 500;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value]);
  return <span>{display}</span>;
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48 bg-white/10" />
          <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className={GLASS_CARD}>
              <CardContent className="p-3 space-y-2">
                <Skeleton className="w-6 h-6 rounded bg-white/10" />
                <Skeleton className="h-6 w-8 bg-white/10" />
                <Skeleton className="h-3 w-14 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-xl bg-white/10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { num: 1, title: "Customer Places Order", desc: "Visit the zone ordering page, browse food truck menus, add items to cart, and checkout. Orders are batched by cutoff time.", icon: ShoppingCart, color: "orange" },
  { num: 2, title: "Vendor Accepts & Prepares", desc: "Food truck vendors see incoming orders on their dashboard. They accept, set prep time, and mark orders as ready.", icon: ChefHat, color: "violet" },
  { num: 3, title: "Driver Picks Up Orders", desc: "Drivers see all ready orders for their zone. They pick up from each food truck in an optimized route.", icon: Truck, color: "emerald" },
  { num: 4, title: "Delivery to Customer", desc: "Driver delivers the order to the customer's specified address. Everyone gets real-time status updates.", icon: Package, color: "cyan" },
  { num: 5, title: "Status Updates", desc: "All parties — customer, vendor, driver, and owner — can track order status in real time throughout the flow.", icon: CheckCircle2, color: "green" },
];

export default function SandboxHub() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTruckId, setSelectedTruckId] = useState<string>("");

  const { data: zones = [], isLoading: zonesLoading } = useQuery<ZoneData[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to load zones");
      return res.json();
    },
  });

  const { data: trucks = [], isLoading: trucksLoading } = useQuery<FoodTruckData[]>({
    queryKey: ["food-trucks"],
    queryFn: async () => {
      const res = await fetch("/api/food-trucks");
      if (!res.ok) throw new Error("Failed to load trucks");
      return res.json();
    },
  });

  const primaryZone = zones[0];

  const { data: orders = [] } = useQuery<OrderData[]>({
    queryKey: ["zone-orders", primaryZone?.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/zone/${primaryZone!.id}`);
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    enabled: !!primaryZone?.id,
    refetchInterval: 10000,
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const { data: todayAvailability = [] } = useQuery<Array<{ id: number; foodTruckId: number; date: string; status: string; zoneId: number | null; locationAddress: string | null; notes: string | null }>>({
    queryKey: ["truck-availability", todayStr],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${todayStr}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000,
  });

  const confirmedTruckIds = new Set(todayAvailability.filter(a => a.status === "confirmed").map(a => a.foodTruckId));

  const { data: tenantData } = useQuery<{ id: number; name: string; slug: string }>({
    queryKey: ["tenant-slug", "happy-eats-nashville"],
    queryFn: async () => {
      const res = await fetch("/api/tenants/slug/happy-eats-nashville");
      if (!res.ok) throw new Error("Failed to load tenant");
      return res.json();
    },
  });

  const tenantId = tenantData?.id;

  const { data: plannedZonesData } = useQuery<{ plannedZonesForTomorrow: number[] }>({
    queryKey: ["planned-zones", tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}/planned-zones`);
      if (!res.ok) throw new Error("Failed to load planned zones");
      return res.json();
    },
    enabled: !!tenantId,
  });

  const plannedZones = plannedZonesData?.plannedZonesForTomorrow || [];

  const updatePlannedZones = useMutation({
    mutationFn: async (zoneIds: number[]) => {
      const res = await fetch(`/api/tenants/${tenantId}/planned-zones`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneIds }),
      });
      if (!res.ok) throw new Error("Failed to update planned zones");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planned-zones", tenantId] });
    },
  });

  const sendNotifications = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}/send-vendor-notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to send notifications");
      return res.json();
    },
    onSuccess: (data: { sent: number; totalMatching: number; zones: string }) => {
      toast({
        title: "Notifications Sent",
        description: `Notified ${data.totalMatching} vendor(s) about tomorrow's zones: ${data.zones}`,
      });
    },
    onError: () => {
      toast({ title: "Failed to send notifications", variant: "destructive" });
    },
  });

  const togglePlannedZone = useCallback((zoneId: number) => {
    haptic("light");
    const current = plannedZones;
    const updated = current.includes(zoneId)
      ? current.filter((id: number) => id !== zoneId)
      : [...current, zoneId];
    updatePlannedZones.mutate(updated);
  }, [plannedZones, updatePlannedZones]);

  const toggleZone = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await fetch(`/api/zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update zone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      toast({ title: t('sandbox.zoneUpdated'), description: t('sandbox.zoneStatusToggled') });
    },
    onError: () => {
      toast({ title: t('sandbox.zoneUpdateError'), description: t('sandbox.zoneUpdateErrorDesc'), variant: "destructive" });
    },
  });

  const todayOrders = orders.filter((o) => {
    const created = new Date(o.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  });

  const statusCounts = STATUS_CONFIG.map((s) => ({
    ...s,
    count: orders.filter((o) => o.status === s.key || o.vendorStatus === s.key).length,
  }));

  const activeOrders = statusCounts.filter(s => ["pending", "accepted", "preparing", "ready", "picked_up"].includes(s.key)).reduce((sum, s) => sum + s.count, 0);

  const isLoading = zonesLoading || trucksLoading;

  if (isLoading) return <SkeletonLoading />;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-20 space-y-4 sm:space-y-6"
      >
        {/* Back Navigation */}
        <Link href="/">
          <Button variant="ghost" className="text-white/60 hover:text-white -ml-2 gap-2 text-sm" data-testid="button-back-home">
            <ArrowLeft className="size-4" /> {t('sandbox.backToHome')}
          </Button>
        </Link>

        {/* Compact Header */}
        <div className="flex items-center justify-between -mt-2" data-testid="section-hero">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/20">
              <Zap className="size-5 text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" data-testid="text-page-title">{t('sandbox.operationsHub')}</h1>
              <p className="text-xs text-slate-500">{todayStr} · {activeOrders} {t('sandbox.activeOrders')} · {confirmedTruckIds.size}/{trucks.length} {t('sandbox.trucksConfirmed')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-slate-500">{t('sandbox.live')}</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: Zone Controls — compact, always visible            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-3" data-testid="section-zone-controls">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="size-4 text-emerald-400" />
              Zone Controls
              <InfoBubble
                title={{ en: "Zone Controls", es: "Controles de Zona" }}
                content={{ en: "Toggle delivery zones on/off based on driver availability and demand. Each zone covers a specific area along the I-840/109/I-24 corridor. The cutoff time shows when batch orders close for that zone. Tap the switch to activate or deactivate a zone.", es: "Activa/desactiva zonas de entrega según la disponibilidad de conductores y la demanda. Cada zona cubre un área específica a lo largo del corredor I-840/109/I-24. El tiempo de corte muestra cuándo cierran los pedidos por lotes. Toca el interruptor para activar o desactivar una zona." }}
                link={{ href: "/zones", label: { en: "View Zone Map", es: "Ver Mapa de Zonas" } }}
                manualSection="getting-started"
              />
            </h2>
          </div>
          {zones.map((zone) => (
            <Card key={zone.id} className={`${GLASS_CARD} ${zone.isActive ? "border-emerald-500/20" : "border-red-500/20"}`} data-testid={`card-zone-${zone.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${zone.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} data-testid={`indicator-zone-status-${zone.id}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white truncate" data-testid={`text-zone-name-${zone.id}`}>{zone.name}</h3>
                        <Badge className={`text-[9px] ${zone.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}`} data-testid={`badge-zone-status-${zone.id}`}>
                          {zone.isActive ? t('common.open') : t('order.closed')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        {zone.cutoffTime && (
                          <span className="flex items-center gap-1" data-testid={`text-zone-cutoff-${zone.id}`}>
                            <Clock className="size-2.5" /> {t('zones.cutoff')} {zone.cutoffTime}
                          </span>
                        )}
                        <span data-testid={`text-zone-order-count-${zone.id}`}>{todayOrders.length} {t('sandbox.ordersToday')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link href={`/order/${zone.slug}`}>
                      <Button size="sm" variant="outline" className="h-8 text-[11px] border-white/10 text-white hover:bg-white/10">
                        <ExternalLink className="size-3 mr-1" /> {t('sandbox.orderPage')}
                      </Button>
                    </Link>
                    <Switch
                      checked={!!zone.isActive}
                      onCheckedChange={(checked) => {
                        haptic("medium");
                        toggleZone.mutate({ id: zone.id, isActive: checked });
                      }}
                      className={zone.isActive ? "data-[state=checked]:bg-emerald-500" : ""}
                      data-testid={`switch-zone-active-${zone.id}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Link href="/zones">
            <Button variant="ghost" size="sm" className="w-full text-white/30 hover:text-white text-xs gap-2 mt-2 border border-white/5 hover:border-white/10" data-testid="button-view-all-zones">
              <MapPin className="size-3" /> {t('sandbox.viewAllZonesOnMap')}
              <ArrowRight className="size-3" />
            </Button>
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1B: Tomorrow's Plan — Zone scheduling for vendors     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-3" data-testid="section-tomorrows-plan">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sun className="size-4 text-amber-400" />
              Tomorrow's Plan
              <InfoBubble
                title={{ en: "Tomorrow's Plan", es: "Plan de Mañana" }}
                content={{ en: "Use this to pre-schedule which zones will be active tomorrow.\n\nCheck the zones you plan to operate in, then at 8:30 PM tonight, every vendor with a phone number or email on file will automatically get a notification asking them to confirm their availability for tomorrow.\n\nThis helps vendors prepare their food and supplies ahead of time. You can also manually send notifications using the 'Notify Vendors Now' button without waiting until 8:30 PM.", es: "Usa esto para pre-programar qué zonas estarán activas mañana.\n\nSelecciona las zonas que planeas operar, y a las 8:30 PM esta noche, cada vendedor con teléfono o email registrado recibirá automáticamente una notificación para confirmar su disponibilidad.\n\nEsto ayuda a los vendedores a preparar su comida y suministros con anticipación. También puedes enviar notificaciones manualmente usando el botón 'Notificar Vendedores Ahora'." }}
                manualSection="quick-start"
              />
            </h2>
            <span className="text-[10px] text-slate-600">{plannedZones.length} zone(s) selected</span>
          </div>

          <Card className={`${GLASS_CARD} border-amber-500/15`} data-testid="card-tomorrows-plan">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-400">Select which zones will be active tomorrow. Vendors in those zones will be notified at 8:30 PM.</p>
              <div className="space-y-2">
                {zones.map((zone) => {
                  const isPlanned = plannedZones.includes(zone.id);
                  return (
                    <div
                      key={zone.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        isPlanned
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      }`}
                      onClick={() => togglePlannedZone(zone.id)}
                      data-testid={`checkbox-planned-zone-${zone.id}`}
                    >
                      <Checkbox
                        checked={isPlanned}
                        onCheckedChange={() => togglePlannedZone(zone.id)}
                        className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{zone.name}</p>
                        {zone.description && (
                          <p className="text-[10px] text-slate-500 truncate">{zone.description}</p>
                        )}
                      </div>
                      {isPlanned && (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">
                          Planned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {plannedZones.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    size="sm"
                    className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-[11px] gap-1.5 flex-1"
                    onClick={() => {
                      haptic("medium");
                      sendNotifications.mutate();
                    }}
                    disabled={sendNotifications.isPending}
                    data-testid="button-send-vendor-notifications"
                  >
                    <Send className="size-3" />
                    {sendNotifications.isPending ? "Sending..." : "Notify Vendors Now"}
                  </Button>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Bell className="size-3" />
                    Auto at 8:30 PM
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: Live Order Status — the heartbeat                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-3" data-testid="section-order-status">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="size-4 text-violet-400" />
              {t('sandbox.orderPipeline')}
              <InfoBubble
                title={{ en: "Order Pipeline", es: "Pipeline de Pedidos" }}
                content={{ en: "Real-time view of all orders across every status. Orders flow left to right: Pending → Accepted → Preparing → Ready → Picked Up → Delivered. Batch orders are grouped by cutoff window, one-off orders process individually. Numbers update automatically every 30 seconds.", es: "Vista en tiempo real de todos los pedidos en cada estado. Los pedidos fluyen de izquierda a derecha: Pendiente → Aceptado → Preparando → Listo → Recogido → Entregado. Los pedidos por lotes se agrupan por ventana de corte, los pedidos individuales se procesan por separado. Los números se actualizan automáticamente cada 30 segundos." }}
                manualSection="orders-delivery"
              />
            </h2>
            <span className="text-[10px] text-slate-600" data-testid="text-auto-refresh">{t('sandbox.autoRefresh')}</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {statusCounts.map((status) => {
              const c = COLOR_MAP[status.color] || COLOR_MAP.amber;
              const Icon = status.icon;
              return (
                <Card key={status.key} className={`${GLASS_CARD} ${c.border} ${status.count > 0 ? c.glow : ""}`} data-testid={`card-status-${status.key}`}>
                  <CardContent className="p-3 text-center">
                    <div className={`w-6 h-6 rounded ${c.bg} flex items-center justify-center mx-auto mb-1`}>
                      <Icon className={`size-3 ${c.text}`} />
                    </div>
                    <div className={`text-xl font-bold ${c.text}`} data-testid={`text-count-${status.key}`}>
                      <AnimatedCounter value={status.count} />
                    </div>
                    <p className="text-[9px] text-slate-500 font-medium">{t(`sandbox.status${status.key.charAt(0).toUpperCase() + status.key.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {orders.length > 0 && (
            <div className="flex items-center gap-3 mt-2" data-testid="batch-oneoff-summary">
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px]" data-testid="badge-batch-count">
                {orders.filter(o => o.orderType !== "one-off").length} Batch
              </Badge>
              <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px]" data-testid="badge-oneoff-count">
                {orders.filter(o => o.orderType === "one-off").length} One-Off
              </Badge>
              <span className="text-[10px] text-slate-500">
                {t('common.total')}: {orders.length}
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: Morning View — Truck Availability                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-3" data-testid="section-morning-view">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="size-4 text-emerald-400" />
              {t('sandbox.truckStatus')}
              <InfoBubble
                title={{ en: "Truck Availability", es: "Disponibilidad de Trucks" }}
                content={{ en: "Shows which food trucks have checked in for the day. Vendors confirm each morning whether they're operating. Only confirmed trucks appear on the customer ordering page. If a truck hasn't checked in, they won't receive orders for the day.", es: "Muestra qué food trucks han hecho check-in para el día. Los vendedores confirman cada mañana si están operando. Solo los trucks confirmados aparecen en la página de pedidos del cliente. Si un truck no ha hecho check-in, no recibirá pedidos ese día." }}
                link={{ href: "/vendor-portal", label: { en: "Vendor Portal", es: "Portal de Vendedores" } }}
                manualSection="vendor-management"
              />
              <span className="text-[10px] text-slate-600 normal-case font-normal">{t('sandbox.confirmedOf', { confirmed: String(confirmedTruckIds.size), total: String(trucks.length) })}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {trucks.map((truck) => {
              const isConfirmed = confirmedTruckIds.has(truck.id);
              const avail = todayAvailability.find(a => a.foodTruckId === truck.id);
              return (
                <Card
                  key={truck.id}
                  className={`${GLASS_CARD} ${isConfirmed ? "border-emerald-500/15" : "border-amber-500/15"}`}
                  data-testid={`card-availability-${truck.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isConfirmed ? "bg-emerald-500/15" : "bg-amber-500/15"
                      }`}>
                        {isConfirmed ? <CheckCircle2 className="size-4 text-emerald-400" /> : <AlertTriangle className="size-4 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white truncate">{truck.name}</p>
                          <Badge className={`text-[8px] px-1.5 ${isConfirmed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                            {isConfirmed ? t('sandbox.ready') : t('common.pending')}
                          </Badge>
                        </div>
                        {isConfirmed && avail?.locationAddress && (
                          <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="size-2 shrink-0" /> {avail.locationAddress}
                          </p>
                        )}
                        {!isConfirmed && (
                          <p className="text-[10px] text-amber-400/70">{t('sandbox.notConfirmedToday')}</p>
                        )}
                      </div>
                      <Link href={`/vendor-orders/${truck.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-slate-400 hover:text-white">
                          {t('sandbox.orders')} <ArrowRight className="size-2.5 ml-0.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {trucks.length === 0 && (
              <Card className={`${GLASS_CARD} col-span-full`}>
                <CardContent className="p-6 text-center">
                  <Utensils className="size-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">{t('sandbox.noTrucksYet')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: Resources — Collapsed by default                   */}
        {/* Quick Launch, How It Works, Truck Directory — all tucked away  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div data-testid="section-resources">
          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="quick-launch" className="border-0">
              <Card className={`${GLASS_CARD} border-white/5`}>
                <AccordionTrigger className="hover:no-underline px-4 py-3" data-testid="trigger-quick-launch">
                  <div className="flex items-center gap-2 text-left">
                    <ExternalLink className="size-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">{t('sandbox.quickLaunch')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" data-testid="section-quick-launch">
                    <Link href="/zones">
                      <Card className={`${GLASS_CARD} border-orange-500/20 hover:border-orange-500/40 cursor-pointer transition-all`} data-testid="card-role-customer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                            <ShoppingCart className="size-5 text-orange-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white" data-testid="text-role-customer">{t('sandbox.customerView')}</p>
                            <p className="text-[11px] text-slate-400">{t('sandbox.placeOrders')}</p>
                          </div>
                          <ArrowRight className="size-4 text-orange-400 shrink-0 ml-auto" />
                        </CardContent>
                      </Card>
                    </Link>

                    <Card className={`${GLASS_CARD} border-violet-500/20`} data-testid="card-role-vendor">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                            <ChefHat className="size-5 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white" data-testid="text-role-vendor">{t('sandbox.vendorView')}</p>
                            <p className="text-[11px] text-slate-400">{t('sandbox.manageOrders')}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select value={selectedTruckId} onValueChange={(v) => { haptic("light"); setSelectedTruckId(v); }}>
                            <SelectTrigger className="bg-violet-500/10 border-violet-500/20 text-white text-[11px] h-8 flex-1" data-testid="select-truck">
                              <SelectValue placeholder={t('sandbox.pickTruck')} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-white/10">
                              {trucks.map((tr) => (
                                <SelectItem key={tr.id} value={String(tr.id)} className="text-white hover:bg-white/10 text-sm" data-testid={`select-truck-option-${tr.id}`}>
                                  {tr.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedTruckId ? (
                            <Link href={`/vendor-orders/${selectedTruckId}`}>
                              <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 text-[11px]" data-testid="button-launch-vendor">
                                Go <ArrowRight className="size-3 ml-1" />
                              </Button>
                            </Link>
                          ) : (
                            <Button size="sm" className="h-8 bg-violet-600/50 text-violet-300" disabled data-testid="button-launch-vendor-disabled">Go</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Link href={primaryZone ? `/driver-orders/${primaryZone.slug}` : "/zones"}>
                      <Card className={`${GLASS_CARD} border-emerald-500/20 hover:border-emerald-500/40 cursor-pointer transition-all`} data-testid="card-role-driver">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Truck className="size-5 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white" data-testid="text-role-driver">{t('sandbox.driverView')}</p>
                            <p className="text-[11px] text-slate-400">{t('sandbox.pickupDeliver')}</p>
                          </div>
                          <ArrowRight className="size-4 text-emerald-400 shrink-0 ml-auto" />
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/kitchen">
                      <Card className={`${GLASS_CARD} border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all`} data-testid="card-role-kitchen">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Utensils className="size-5 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white" data-testid="text-role-kitchen">{t('sandbox.heKitchen')}</p>
                            <p className="text-[11px] text-slate-400">{t('common.comingSoon')}</p>
                          </div>
                          <ArrowRight className="size-4 text-amber-400 shrink-0 ml-auto" />
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="zone-details" className="border-0">
              <Card className={`${GLASS_CARD} border-white/5`}>
                <AccordionTrigger className="hover:no-underline px-4 py-3" data-testid="trigger-zone-details">
                  <div className="flex items-center gap-2 text-left">
                    <MapPin className="size-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">{t('sandbox.zoneDetails')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {zones.map((zone) => (
                    <div key={zone.id} className="space-y-2">
                      {zone.description && (
                        <p className="text-xs text-slate-400" data-testid={`text-zone-desc-${zone.id}`}>{zone.description}</p>
                      )}
                      {zone.exits && zone.exits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {zone.exits.map((exit) => (
                            <Badge key={exit.exit} variant="outline" className="border-white/10 text-slate-400 text-[10px]" data-testid={`badge-exit-${exit.exit}`}>
                              {t('order.exit')} {exit.exit} — {exit.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="how-it-works" className="border-0">
              <Card className={`${GLASS_CARD} border-white/5`}>
                <AccordionTrigger className="hover:no-underline px-4 py-3" data-testid="trigger-how-it-works">
                  <div className="flex items-center gap-2 text-left">
                    <TestTube className="size-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">{t('sandbox.howOrderFlowWorks')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4" data-testid="section-how-it-works">
                  <div className="space-y-2">
                    {STEPS.map((step) => {
                      const c = COLOR_MAP[step.color] || COLOR_MAP.amber;
                      const Icon = step.icon;
                      return (
                        <div key={step.num} className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.03]">
                          <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`size-3.5 ${c.text}`} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white">{step.num}. {t(`sandbox.step${step.num}Title`)}</p>
                            <p className="text-[11px] text-slate-500">{t(`sandbox.step${step.num}Desc`)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="truck-directory" className="border-0">
              <Card className={`${GLASS_CARD} border-white/5`}>
                <AccordionTrigger className="hover:no-underline px-4 py-3" data-testid="trigger-truck-directory">
                  <div className="flex items-center gap-2 text-left">
                    <Utensils className="size-4 text-orange-400" />
                    <span className="text-sm font-medium text-white">{t('sandbox.foodTruckDirectory')} ({trucks.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4" data-testid="section-truck-directory">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {trucks.map((truck) => (
                      <div key={truck.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5" data-testid={`card-truck-${truck.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate" data-testid={`text-truck-name-${truck.id}`}>{truck.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            {truck.cuisine && <span>{truck.cuisine}</span>}
                            {truck.rating && (
                              <span className="flex items-center gap-0.5" data-testid={`text-truck-rating-${truck.id}`}>
                                <Star className="size-2.5 text-amber-400 fill-amber-400" /> {truck.rating}
                              </span>
                            )}
                            {truck.menu && <span data-testid={`text-truck-menu-count-${truck.id}`}>{truck.menu.length} {t('common.items')}</span>}
                          </div>
                        </div>
                        <Link href={`/vendor-orders/${truck.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] text-slate-400" data-testid={`button-truck-vendor-${truck.id}`}>
                            {t('common.view')} <ArrowRight className="size-2.5 ml-0.5" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </motion.div>
    </div>
  );
}
