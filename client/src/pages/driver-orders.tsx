import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Truck, Package, CheckCircle2, Clock,
  Phone, MapPin, User, Navigation, ChevronDown,
  DollarSign, Route, ExternalLink, AlertTriangle, Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/context";
import { InfoBubble } from "@/components/info-bubble";

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface OrderData {
  id: number;
  locationName: string;
  foodTruckId: number | null;
  items: OrderItem[] | null;
  vendorStatus: string | null;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  subtotal: string;
  deliveryFee: string;
  total: string;
  isSandbox: boolean | null;
  orderType: string | null;
  batchId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ZoneData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface FoodTruckData {
  id: number;
  name: string;
  cuisine: string | null;
  phone: string | null;
}

type TabType = "pickup" | "delivery" | "completed";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const TRUCK_BORDER_COLORS = [
  "border-l-orange-500",
  "border-l-cyan-500",
  "border-l-violet-500",
  "border-l-rose-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-blue-500",
  "border-l-pink-500",
];

const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (navigator.vibrate) navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 40);
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function getEstimatedDelivery(createdAt: string) {
  const d = new Date(createdAt);
  d.setMinutes(d.getMinutes() + 30);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function SkeletonStatCard() {
  return (
    <Card className={GLASS_CARD}>
      <CardContent className="p-3 sm:p-4 space-y-2">
        <Skeleton className="h-3 w-14 bg-white/10" />
        <Skeleton className="h-7 w-10 bg-white/10" />
      </CardContent>
    </Card>
  );
}

function SkeletonGroupCard() {
  return (
    <Card className={`${GLASS_CARD} overflow-hidden`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded bg-white/10" />
          <Skeleton className="h-4 w-32 bg-white/10" />
          <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
        </div>
        <Separator className="bg-white/5" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
          <Skeleton className="h-12 w-full rounded-lg bg-white/10" />
        </div>
        <Skeleton className="h-9 w-full rounded-md bg-white/10" />
      </CardContent>
    </Card>
  );
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-44 bg-white/10" />
              <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-4 w-48 bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg bg-white/10" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <SkeletonGroupCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, icon: Icon, color, glowColor }: {
  label: string; count: number; icon: any; color: string; glowColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${GLASS_CARD} hover:border-white/20 transition-all duration-300`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</p>
              <motion.p
                key={count}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-xl sm:text-2xl font-bold ${color}`}
              >
                {count}
              </motion.p>
            </div>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${glowColor}`}>
              <Icon className={`size-4 sm:size-5 ${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DeliveredConfirmation() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.6, times: [0, 0.6, 1] }}
        className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        >
          <CheckCircle2 className="size-10 text-emerald-400" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function DriverOrders() {
  const { t } = useLanguage();
  const params = useParams<{ zoneSlug: string }>();
  const zoneSlug = params.zoneSlug;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("pickup");
  const [showDeliveredAnim, setShowDeliveredAnim] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const { data: zone, isLoading: zoneLoading } = useQuery<ZoneData>({
    queryKey: ["/api/zones", zoneSlug],
    queryFn: async () => {
      const res = await fetch(`/api/zones/${zoneSlug}`);
      if (!res.ok) throw new Error("Zone not found");
      return res.json();
    },
    enabled: !!zoneSlug,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderData[]>({
    queryKey: ["/api/orders/zone", zone?.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/zone/${zone!.id}`);
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    enabled: !!zone?.id,
    refetchInterval: 10000,
  });

  const { data: foodTrucks = [] } = useQuery<FoodTruckData[]>({
    queryKey: ["/api/food-trucks"],
    queryFn: async () => {
      const res = await fetch("/api/food-trucks");
      if (!res.ok) throw new Error("Failed to load trucks");
      return res.json();
    },
  });

  const truckMap = useMemo(() => {
    const map: Record<number, FoodTruckData> = {};
    foodTrucks.forEach((t) => { map[t.id] = t; });
    return map;
  }, [foodTrucks]);

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/zone"] });
      toast({ title: t("driver.orderUpdated") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("driver.failedUpdateStatus"), variant: "destructive" });
    },
  });

  const readyOrders = useMemo(() => {
    return orders.filter(
      (o) => o.vendorStatus === "ready" && o.status !== "picked_up" && o.status !== "delivered"
    );
  }, [orders]);

  const inTransitOrders = useMemo(() => {
    return orders
      .filter((o) => o.status === "picked_up" || o.status === "in_progress")
      .sort((a, b) => (a.deliveryAddress || "").localeCompare(b.deliveryAddress || ""));
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status === "delivered");
  }, [orders]);

  const grouped = useMemo(() => {
    return readyOrders.reduce((acc, order) => {
      const key = String(order.foodTruckId || order.locationName);
      if (!acc[key]) {
        const truck = order.foodTruckId ? truckMap[order.foodTruckId] : null;
        acc[key] = { truckName: truck?.name || order.locationName, orders: [] };
      }
      acc[key].orders.push(order);
      return acc;
    }, {} as Record<string, { truckName: string; orders: OrderData[] }>);
  }, [readyOrders, truckMap]);

  const handleMarkPickedUp = (orderId: number) => {
    haptic('medium');
    updateOrderStatus.mutate({ orderId, status: "picked_up" });
  };

  const handleMarkAllPickedUp = (orderIds: number[]) => {
    haptic('heavy');
    orderIds.forEach((orderId) => {
      updateOrderStatus.mutate({ orderId, status: "picked_up" });
    });
  };

  const handleMarkDelivered = (orderId: number) => {
    haptic('medium');
    setShowDeliveredAnim(true);
    setTimeout(() => setShowDeliveredAnim(false), 1200);
    updateOrderStatus.mutate({ orderId, status: "delivered" });
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (zoneLoading || ordersLoading) {
    return <SkeletonLoading />;
  }

  if (!zone) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4" data-testid="zone-not-found">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className={`${GLASS_CARD} max-w-md w-full border-red-500/30`}>
            <CardContent className="p-8 text-center space-y-4">
              <Truck className="size-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">{t("driver.zoneNotFound")}</h2>
              <p className="text-slate-400 text-sm">{t("driver.zoneNotFoundDesc", { slug: zoneSlug || "" })}</p>
              <Link href="/sandbox">
                <Button data-testid="button-back-sandbox" className="bg-gradient-to-r from-orange-500 to-rose-500">{t("driver.backToSandbox")}</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const TABS: { key: TabType; label: string; count: number; icon: any }[] = [
    { key: "pickup", label: t("driver.pickup"), count: readyOrders.length, icon: Package },
    { key: "delivery", label: t("driver.delivery"), count: inTransitOrders.length, icon: Route },
    { key: "completed", label: t("driver.done"), count: deliveredOrders.length, icon: CheckCircle2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0f172a]"
      data-testid="driver-orders-page"
    >
      {showDeliveredAnim && <DeliveredConfirmation />}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3"
          data-testid="driver-header"
        >
          <Link href="/sandbox">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button data-testid="button-back" variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0 mt-0.5">
                <ArrowLeft className="size-5" />
              </Button>
            </motion.div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                <Truck className="size-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white" data-testid="text-page-title">{t("driver.dashboard")}</h1>
              <InfoBubble
                title={{ en: "Driver Delivery Dashboard", es: "Panel de Entregas del Conductor" }}
                content={{ en: "Manage your pickups and deliveries from this dashboard:\n\n• Pickup tab — orders ready at food trucks, grouped by truck name. Tap 'Mark Picked Up' when you have the food.\n• Delivery tab — orders in transit. Tap 'Mark Delivered' when you drop off.\n• Completed tab — your delivery history.\n\nBatch orders are grouped for efficient multi-stop runs. One-off orders are individual deliveries within the local corridor.", es: "Gestiona tus recogidas y entregas desde este panel:\n\n• Pestaña Recogida — pedidos listos en food trucks, agrupados por nombre de truck. Toca 'Marcar Recogido' cuando tengas la comida.\n• Pestaña Entrega — pedidos en tránsito. Toca 'Marcar Entregado' cuando dejes el pedido.\n• Pestaña Completados — tu historial de entregas.\n\nLos pedidos por lotes se agrupan para rutas eficientes con múltiples paradas. Los pedidos individuales son entregas dentro del corredor local." }}
                manualSection="orders-delivery"
              />
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400" data-testid="badge-zone-name">
                {zone.name}
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase tracking-wider" data-testid="badge-sandbox">
                {t("driver.sandboxMode")}
              </Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="summary-stats">
          <StatCard label={t("driver.ready")} count={readyOrders.length} icon={Package} color="text-emerald-400" glowColor="bg-emerald-500/10" />
          <StatCard label={t("driver.inTransit")} count={inTransitOrders.length} icon={Truck} color="text-blue-400" glowColor="bg-blue-500/10" />
          <StatCard label={t("order.delivered")} count={deliveredOrders.length} icon={CheckCircle2} color="text-violet-400" glowColor="bg-violet-500/10" />
          <StatCard label={t("common.total")} count={orders.length} icon={DollarSign} color="text-orange-400" glowColor="bg-orange-500/10" />
        </div>

        <div className={`flex gap-1 p-1 rounded-xl ${GLASS_CARD}`} data-testid="tab-switcher">
          {TABS.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                onClick={() => { haptic('light'); setActiveTab(tab.key); }}
                data-testid={`tab-${tab.key}`}
              >
                <TabIcon className="size-3.5" />
                {tab.label}
                <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? "bg-white/20" : "bg-white/5"
                }`}>
                  {tab.count}
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "pickup" && (
            <motion.div
              key="pickup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
              data-testid="pickup-list"
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs text-slate-500 font-medium">Orders grouped by truck for efficient pickup</p>
                <InfoBubble
                  title={{ en: "How Pickup Works", es: "Cómo Funciona la Recogida" }}
                  content={{ en: "Orders are grouped by food truck so you can pick up all orders from one truck at a time.\n\nFor each truck group:\n1. Drive to the truck at the Hwy 109 & I-840 hub\n2. Collect all the orders listed under that truck\n3. Tap 'Mark Picked Up' for each order, or use 'Mark All Picked Up' to confirm the entire group at once\n\nOnce marked as picked up, the orders move to your Delivery tab and customers get a notification that their food is on the way.\n\nBatch orders are time-sensitive — pick up promptly at the scheduled window time to keep food fresh.", es: "Los pedidos se agrupan por food truck para que puedas recoger todos los pedidos de un truck a la vez.\n\nPara cada grupo de truck:\n1. Ve al truck en el hub de Hwy 109 e I-840\n2. Recoge todos los pedidos listados bajo ese truck\n3. Toca 'Marcar Recogido' para cada pedido, o usa 'Marcar Todos Recogidos' para confirmar el grupo completo\n\nUna vez marcados como recogidos, los pedidos pasan a tu pestaña de Entregas y los clientes reciben una notificación." }}
                  manualSection="quick-start"
                />
              </div>
              {Object.keys(grouped).length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={GLASS_CARD}>
                    <CardContent className="p-8 text-center">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Package className="size-12 text-slate-600 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-slate-400 text-sm font-medium">{t("driver.noPickups")}</p>
                      <p className="text-slate-500 text-xs mt-1">{t("driver.ordersAutoRefresh")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {Object.entries(grouped).map(([key, group], groupIndex) => {
                const isExpanded = expandedGroups[key] !== false;
                const borderColor = TRUCK_BORDER_COLORS[groupIndex % TRUCK_BORDER_COLORS.length];
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card
                      className={`${GLASS_CARD} overflow-hidden border-l-4 ${borderColor}`}
                      data-testid={`card-truck-group-${key}`}
                    >
                      <CardContent className="p-0">
                        <motion.button
                          whileTap={{ scale: 0.99 }}
                          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                          onClick={() => toggleGroup(key)}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                              <Truck className="size-4 text-orange-400" />
                            </div>
                            <span className="text-sm font-bold text-white" data-testid={`text-truck-name-${key}`}>
                              {group.truckName}
                            </span>
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]" data-testid={`badge-ready-count-${key}`}>
                              {group.orders.length} {t("driver.ready").toLowerCase()}
                            </Badge>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="size-4 text-slate-400" />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-3">
                                <Separator className="bg-white/5" />
                                <div className="space-y-2">
                                  {group.orders.map((order, orderIndex) => (
                                    <motion.div
                                      key={order.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: orderIndex * 0.05 }}
                                      className="p-3 rounded-xl bg-[#0f172a]/60 border border-white/5 space-y-2"
                                      data-testid={`card-pickup-order-${order.id}`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-xs font-bold text-white" data-testid={`text-pickup-order-number-${order.id}`}>
                                            Order #{order.id}
                                          </span>
                                          {order.orderType === "one-off" ? (
                                            <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[8px]" data-testid={`badge-pickup-type-${order.id}`}>
                                              One-Off
                                            </Badge>
                                          ) : (
                                            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[8px]" data-testid={`badge-pickup-type-${order.id}`}>
                                              Batch
                                            </Badge>
                                          )}
                                          {order.customerName && (
                                            <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400" data-testid={`text-pickup-customer-${order.id}`}>
                                              <User className="size-2.5 mr-1" />
                                              {order.customerName}
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-sm font-bold text-orange-400" data-testid={`text-pickup-order-total-${order.id}`}>
                                          ${parseFloat(order.total).toFixed(2)}
                                        </span>
                                      </div>
                                      {order.items && order.items.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5" data-testid={`text-pickup-items-${order.id}`}>
                                          {order.items.map((item, idx) => (
                                            <motion.span
                                              key={idx}
                                              initial={{ opacity: 0, scale: 0.8 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: idx * 0.03 }}
                                              className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]"
                                            >
                                              <span className="text-orange-400 font-bold">{item.qty}×</span>{" "}
                                              <span className="text-slate-300">{item.name}</span>
                                            </motion.span>
                                          ))}
                                        </div>
                                      )}
                                      <motion.div whileTap={{ scale: 0.95 }}>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 w-full"
                                          onClick={() => handleMarkPickedUp(order.id)}
                                          disabled={updateOrderStatus.isPending}
                                          data-testid={`button-mark-picked-up-${order.id}`}
                                        >
                                          <CheckCircle2 className="size-3 mr-1" />
                                          {t("driver.pickUp")}
                                        </Button>
                                      </motion.div>
                                    </motion.div>
                                  ))}
                                </div>

                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    className="w-full h-10 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    onClick={() => handleMarkAllPickedUp(group.orders.map((o) => o.id))}
                                    disabled={updateOrderStatus.isPending}
                                    data-testid={`button-mark-all-picked-up-${key}`}
                                  >
                                    <Truck className="size-4 mr-2" />
                                    {t("driver.markAllPickedUp")} ({group.orders.length})
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "delivery" && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
              data-testid="delivery-list"
            >
              {inTransitOrders.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={GLASS_CARD}>
                    <CardContent className="p-8 text-center">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Navigation className="size-12 text-slate-600 mx-auto mb-3" />
                      </motion.div>
                      <p className="text-slate-400 text-sm font-medium">{t("driver.noOrdersInTransit")}</p>
                      <p className="text-slate-500 text-xs mt-1">{t("driver.pickUpFromPickupTab")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inTransitOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Card className={`${GLASS_CARD} overflow-hidden hover:border-white/20 transition-all duration-300`} data-testid={`card-delivery-order-${order.id}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-white" data-testid={`text-delivery-order-number-${order.id}`}>
                                Order #{order.id}
                              </span>
                              {order.orderType === "one-off" ? (
                                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[8px]" data-testid={`badge-delivery-type-${order.id}`}>
                                  One-Off
                                </Badge>
                              ) : (
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[8px]" data-testid={`badge-delivery-type-${order.id}`}>
                                  Batch
                                </Badge>
                              )}
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]" data-testid={`badge-delivery-status-${order.id}`}>
                                {order.status === "picked_up" ? t("driver.pickedUpStatus") : t("driver.inProgressStatus")}
                              </Badge>
                            </div>
                            <span className="text-xs text-slate-500" data-testid={`text-delivery-from-${order.id}`}>
                              {t("driver.from")} {order.locationName}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-bold text-orange-400 block" data-testid={`text-delivery-total-${order.id}`}>
                              ${parseFloat(order.total).toFixed(2)}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500" data-testid={`text-est-delivery-${order.id}`}>
                              <Clock className="size-2.5" />
                              {t("driver.eta")} {getEstimatedDelivery(order.createdAt)}
                            </div>
                          </div>
                        </div>

                        {order.deliveryAddress && (
                          <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-start gap-2">
                              <MapPin className="size-4 text-blue-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white leading-relaxed" data-testid={`text-delivery-address-${order.id}`}>
                                  {order.deliveryAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {order.deliveryAddress && (
                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                              <a
                                href={getGoogleMapsUrl(order.deliveryAddress)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`link-navigate-${order.id}`}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-8 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                >
                                  <Navigation className="size-3 mr-1" />
                                  {t("driver.navigate")}
                                  <ExternalLink className="size-2.5 ml-1 opacity-50" />
                                </Button>
                              </a>
                            </motion.div>
                          )}
                          {order.customerPhone && (
                            <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                              <a href={`tel:${order.customerPhone}`} data-testid={`link-phone-${order.id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full h-8 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                >
                                  <Phone className="size-3 mr-1" />
                                  {t("driver.call")}
                                </Button>
                              </a>
                            </motion.div>
                          )}
                        </div>

                        <Separator className="bg-white/5" />

                        <div className="space-y-2">
                          {order.customerName && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <User className="size-3.5 text-slate-500 shrink-0" />
                              <span data-testid={`text-delivery-customer-${order.id}`}>{order.customerName}</span>
                            </div>
                          )}
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5" data-testid={`list-delivery-items-${order.id}`}>
                            {order.items.map((item, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px]">
                                <span className="text-orange-400 font-bold">{item.qty}×</span>{" "}
                                <span className="text-slate-300">{item.name}</span>
                                <span className="text-slate-500 ml-1">${(item.price * item.qty).toFixed(2)}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {order.deliveryInstructions && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20" data-testid={`text-instructions-${order.id}`}>
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="size-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-0.5">{t("driver.deliveryInstructions")}</p>
                                <p className="text-xs text-amber-300/80">{order.deliveryInstructions}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <motion.div whileTap={{ scale: 0.95 }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            id={`photo-proof-${order.id}`} 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                toast({ title: "Photo proof saved successfully." });
                                handleMarkDelivered(order.id);
                              }
                            }}
                          />
                          <label htmlFor={`photo-proof-${order.id}`} className="w-full h-10 flex items-center justify-center gap-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-md cursor-pointer transition-all" data-testid={`button-mark-delivered-${order.id}`}>
                            <Camera className="size-4" />
                            Take Photo & Mark Delivered
                          </label>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "completed" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              data-testid="completed-list"
            >
              {deliveredOrders.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className={GLASS_CARD}>
                    <CardContent className="p-8 text-center">
                      <Clock className="size-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm font-medium">{t("driver.noCompletedDeliveries")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {deliveredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.35 }}
                  >
                    <Card
                      className={`${GLASS_CARD} opacity-75 hover:opacity-90 transition-all duration-300`}
                      data-testid={`card-completed-order-${order.id}`}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 400, delay: index * 0.06 + 0.1 }}
                            >
                              <CheckCircle2 className="size-5 text-emerald-400" />
                            </motion.div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-white" data-testid={`text-completed-order-number-${order.id}`}>
                                  Order #{order.id}
                                </span>
                                {order.orderType === "one-off" ? (
                                  <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[7px] px-1 py-0">1-Off</Badge>
                                ) : (
                                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[7px] px-1 py-0">Batch</Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500" data-testid={`text-completed-time-${order.id}`}>
                                {t("driver.deliveredAt")} {formatTime(order.updatedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]" data-testid={`badge-completed-${order.id}`}>
                              {t("order.delivered")}
                            </Badge>
                            <p className="text-sm font-bold text-slate-400 mt-1" data-testid={`text-completed-total-${order.id}`}>
                              ${parseFloat(order.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {order.customerName && (
                          <p className="text-xs text-slate-500" data-testid={`text-completed-customer-${order.id}`}>
                            {order.customerName} · {order.items?.length || 0} {t("common.items")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}