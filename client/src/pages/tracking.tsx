import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Phone, MessageSquare, MapPin, Clock, CheckCircle,
  Package, ChefHat, Truck, CircleDot, XCircle, Timer,
  UtensilsCrossed, Navigation, AlertCircle, RefreshCw, Star
} from "lucide-react";
import { useLanguage } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { ReviewModal } from "@/components/review-modal";
import mapBg from "@/assets/images/map-bg.jpg";

interface OrderData {
  id: number;
  locationName: string;
  items: { id: number; name: string; qty: number; price: number }[] | null;
  orderDescription: string | null;
  vendorStatus: string | null;
  vendorPrepTime: number | null;
  vendorStatusUpdatedAt: string | null;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  runnerName: string | null;
  runnerPhone: string | null;
  menuTotal: string | null;
  serviceFee: string | null;
  tax: string | null;
  deliveryFee: string;
  total: string;
  orderType: string | null;
  fulfillmentType: string | null;
  foodTruckId: number | null;
  scheduledDeliveryTime: string | null;
  createdAt: string;
  updatedAt: string;
}

type CombinedStatus = "placed" | "accepted" | "preparing" | "ready" | "picked_up" | "in_transit" | "delivered" | "rejected" | "cancelled";

const STATUS_FLOW: CombinedStatus[] = ["placed", "accepted", "preparing", "ready", "picked_up", "delivered"];

const STATUS_CONFIG: Record<CombinedStatus, { label: string; labelEs: string; icon: React.ReactNode; color: string; bg: string; border: string; glow: string; description: string; descriptionEs: string }> = {
  placed: {
    label: "Order Placed", labelEs: "Pedido Realizado",
    icon: <Package className="size-5" />, color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/20",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]",
    description: "Your order has been sent to the vendor", descriptionEs: "Tu pedido ha sido enviado al vendedor"
  },
  accepted: {
    label: "Accepted", labelEs: "Aceptado",
    icon: <CheckCircle className="size-5" />, color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/20",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.4)]",
    description: "The vendor has accepted your order", descriptionEs: "El vendedor ha aceptado tu pedido"
  },
  preparing: {
    label: "Preparing", labelEs: "Preparando",
    icon: <ChefHat className="size-5" />, color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/20",
    glow: "shadow-[0_0_12px_rgba(139,92,246,0.4)]",
    description: "Your food is being prepared", descriptionEs: "Tu comida se está preparando"
  },
  ready: {
    label: "Ready for Pickup", labelEs: "Listo para Recoger",
    icon: <UtensilsCrossed className="size-5" />, color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/20",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
    description: "Your order is ready! Waiting for driver pickup", descriptionEs: "¡Tu pedido está listo! Esperando al repartidor"
  },
  picked_up: {
    label: "Picked Up", labelEs: "Recogido",
    icon: <Truck className="size-5" />, color: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-500/20",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    description: "Driver has your order and is on the way", descriptionEs: "El repartidor tiene tu pedido y está en camino"
  },
  in_transit: {
    label: "In Transit", labelEs: "En Tránsito",
    icon: <Navigation className="size-5" />, color: "text-cyan-300", bg: "bg-cyan-500/15", border: "border-cyan-500/20",
    glow: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
    description: "Your delivery is on its way to you", descriptionEs: "Tu entrega está en camino"
  },
  delivered: {
    label: "Delivered", labelEs: "Entregado",
    icon: <CheckCircle className="size-5" />, color: "text-green-300", bg: "bg-green-500/15", border: "border-green-500/20",
    glow: "shadow-[0_0_12px_rgba(34,197,94,0.4)]",
    description: "Your order has been delivered. Enjoy!", descriptionEs: "Tu pedido ha sido entregado. ¡Buen provecho!"
  },
  rejected: {
    label: "Rejected", labelEs: "Rechazado",
    icon: <XCircle className="size-5" />, color: "text-red-300", bg: "bg-red-500/15", border: "border-red-500/20",
    glow: "",
    description: "The vendor was unable to fulfill this order", descriptionEs: "El vendedor no pudo completar este pedido"
  },
  cancelled: {
    label: "Cancelled", labelEs: "Cancelado",
    icon: <XCircle className="size-5" />, color: "text-red-300", bg: "bg-red-500/15", border: "border-red-500/20",
    glow: "",
    description: "This order has been cancelled", descriptionEs: "Este pedido ha sido cancelado"
  },
};

function getCombinedStatus(order: OrderData): CombinedStatus {
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "delivered") return "delivered";
  if (order.status === "in_transit" || order.status === "picked_up") return "picked_up";
  if (order.status === "in_progress") return "preparing";
  if (order.status === "confirmed") return "accepted";
  const vs = order.vendorStatus || "pending";
  if (vs === "rejected") return "rejected";
  if (vs === "ready") return "ready";
  if (vs === "preparing") return "preparing";
  if (vs === "accepted") return "accepted";
  return "placed";
}

function getEstimatedReadyTime(order: OrderData): string | null {
  if (!order.vendorPrepTime) return null;
  const timestamp = order.vendorStatusUpdatedAt || order.updatedAt;
  if (!timestamp) return null;
  const acceptedTime = new Date(timestamp);
  const readyTime = new Date(acceptedTime.getTime() + order.vendorPrepTime * 60 * 1000);
  return readyTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function getMinutesUntilReady(order: OrderData): number | null {
  if (!order.vendorPrepTime) return null;
  const timestamp = order.vendorStatusUpdatedAt || order.updatedAt;
  if (!timestamp) return null;
  const acceptedTime = new Date(timestamp);
  const readyTime = acceptedTime.getTime() + order.vendorPrepTime * 60 * 1000;
  const remaining = Math.max(0, Math.round((readyTime - Date.now()) / 60000));
  return remaining;
}

export default function Tracking() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const orderId = searchParams.get("order");

  const { data: order, isLoading, error } = useQuery<OrderData>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("Order not found");
      return res.json();
    },
    enabled: !!orderId,
    refetchInterval: 8000,
  });

  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!order) return;
    const update = () => setMinutesLeft(getMinutesUntilReady(order));
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [order]);

  const combinedStatus = order ? getCombinedStatus(order) : "placed";
  const currentStepIndex = STATUS_FLOW.indexOf(combinedStatus);
  const statusConfig = STATUS_CONFIG[combinedStatus];
  const estimatedReady = order ? getEstimatedReadyTime(order) : null;
  const isTerminal = combinedStatus === "delivered" || combinedStatus === "rejected" || combinedStatus === "cancelled";
  const [reviewOpen, setReviewOpen] = useState(false);
  
  const { data: existingReview } = useQuery({
    queryKey: ["/api/order-reviews/order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/order-reviews/order/${orderId}`);
      return res.json();
    },
    enabled: !!orderId && combinedStatus === "delivered",
  });

  if (!orderId) {
    return (
      <div className="min-h-screen pt-20 pb-12" style={{ background: "linear-gradient(180deg, #020617, #0c1222, #020617)" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <AlertCircle className="size-12 text-amber-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text text-transparent mb-2">No Order ID</h2>
              <p className="text-white/40 text-sm mb-4">No order was specified for tracking.</p>
              <Link href="/">
                <Button data-testid="button-go-home" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  Go Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12" style={{ background: "linear-gradient(180deg, #020617, #0c1222, #020617)" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
            <div className="h-8 w-48 bg-white/[0.03] rounded-xl" />
            <div className="h-[200px] bg-white/[0.03] rounded-2xl border border-white/[0.06]" />
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white/[0.03] rounded-2xl border border-white/[0.06]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 pb-12" style={{ background: "linear-gradient(180deg, #020617, #0c1222, #020617)" }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <XCircle className="size-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-white to-red-200 bg-clip-text text-transparent mb-2">Order Not Found</h2>
              <p className="text-white/40 text-sm mb-4">We couldn't find order #{orderId}.</p>
              <Link href="/">
                <Button data-testid="button-go-home-error" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  Go Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const orderTime = new Date(order.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="min-h-screen pt-20 pb-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #020617, #0c1222, #020617)" }}>
      <div className="absolute inset-0">
        <img src={mapBg} alt="" className="w-full h-64 object-cover brightness-110 opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/60 via-[#0c1222]/95 to-[#020617]" />
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-purple-500/[0.04] rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button data-testid="button-back-home" variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/[0.06] shrink-0 w-10 h-10 rounded-xl">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent truncate">
                Order #{order.id}
              </h1>
              <p className="text-white/30 text-xs sm:text-sm">{order.locationName} &bull; {orderTime}</p>
            </div>
            {!isTerminal && (
              <div className="ml-auto shrink-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">Live</span>
                </div>
              </div>
            )}
          </div>

          {!isTerminal && (
            <div className="mb-6" data-testid="eta-badge">
              {order.scheduledDeliveryTime ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500/[0.08] to-pink-500/[0.08] border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] backdrop-blur-xl">
                  <Clock className="size-5 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Scheduled For</p>
                    <p className="text-lg font-bold text-orange-300" data-testid="text-scheduled-time">
                      {new Date(order.scheduledDeliveryTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/[0.08] to-purple-500/[0.08] border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] backdrop-blur-xl">
                  <Timer className="size-5 text-cyan-400 shrink-0" />
                  <div className="flex-1">
                    {order.vendorPrepTime ? (
                      <>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Estimated Delivery</p>
                        <p className="text-lg font-bold text-cyan-300" data-testid="text-eta-time">
                          ~{new Date(new Date(order.createdAt).getTime() + (order.vendorPrepTime + 15) * 60 * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] text-white/30">
                          Food ready in ~{minutesLeft !== null && minutesLeft > 0 ? `${minutesLeft} min` : `${order.vendorPrepTime} min`} + ~15 min delivery
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Estimated Delivery</p>
                        <p className="text-lg font-bold text-cyan-300" data-testid="text-eta-time">
                          ~{new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </p>
                        <p className="text-[10px] text-white/30">Estimated ~30 min from order</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className={`bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border ${statusConfig.border} shadow-[0_8px_32px_rgba(0,0,0,0.3)]`}>
            <div className="flex items-center gap-4">
              <motion.div
                className={`size-14 sm:size-16 rounded-2xl ${statusConfig.bg} flex items-center justify-center ${statusConfig.glow}`}
                animate={!isTerminal ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className={statusConfig.color}>{statusConfig.icon}</span>
              </motion.div>
              <div className="min-w-0 flex-1">
                <h2 className={`text-lg sm:text-xl font-bold ${statusConfig.color}`} data-testid="text-order-status">
                  {statusConfig.label}
                </h2>
                <p className="text-white/40 text-sm">{statusConfig.description}</p>

                {combinedStatus === "preparing" && estimatedReady && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/15">
                      <Timer className="size-4 text-violet-400" />
                      <span className="text-sm text-violet-300 font-semibold">
                        Ready by ~{estimatedReady}
                        {minutesLeft !== null && minutesLeft > 0 && (
                          <span className="text-violet-400/70 font-normal ml-1">({minutesLeft} min)</span>
                        )}
                      </span>
                    </div>
                  </motion.div>
                )}

                {combinedStatus === "accepted" && order.vendorPrepTime && (
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/15">
                      <Clock className="size-4 text-blue-400" />
                      <span className="text-sm text-blue-300">Estimated {order.vendorPrepTime} min prep time</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {order.orderType && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                order.orderType === "batch"
                  ? "text-orange-300 bg-orange-500/10 border border-orange-500/20"
                  : "text-cyan-300 bg-cyan-500/10 border border-cyan-500/20"
              }`}>
                {order.orderType === "batch" ? "Batch Order" : "One-Off Order"}
              </span>
              {order.fulfillmentType && (
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/[0.03] border border-white/[0.06] rounded-full">
                  {order.fulfillmentType}
                </span>
              )}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CircleDot className="size-4 text-cyan-400" />
              Order Progress
            </h3>
            <div className="relative pl-6 space-y-0 ml-1">
              {STATUS_FLOW.map((step, index) => {
                const stepConfig = STATUS_CONFIG[step];
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const isFuture = index > currentStepIndex;
                const isLast = index === STATUS_FLOW.length - 1;

                return (
                  <div key={step} className="relative">
                    {!isLast && (
                      <div className={`absolute left-[-19px] top-[28px] w-0.5 h-[calc(100%-4px)] ${
                        isCompleted ? "bg-green-500/60" : "bg-white/[0.06]"
                      }`} />
                    )}
                    <div className={`relative flex items-start gap-3 py-3 ${isFuture ? "opacity-30" : ""}`}>
                      <div className={`absolute -left-[25px] top-[14px] size-3.5 rounded-full border-[3px] transition-all ${
                        isActive
                          ? `${stepConfig.bg} border-current ${stepConfig.color} ${stepConfig.glow} scale-125`
                          : isCompleted
                            ? "bg-green-500 border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                            : "bg-white/[0.06] border-white/15"
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${isActive ? statusConfig.color : isCompleted ? "text-green-400" : "text-white/30"}`}>
                          {stepConfig.label}
                        </p>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-white/30 mt-0.5"
                          >
                            {stepConfig.description}
                          </motion.p>
                        )}
                      </div>
                      {isActive && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`shrink-0 ${stepConfig.color}`}
                        >
                          {stepConfig.icon}
                        </motion.div>
                      )}
                      {isCompleted && (
                        <CheckCircle className="size-4 text-green-500 shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {(combinedStatus === "rejected" || combinedStatus === "cancelled") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 border border-red-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3">
                <XCircle className="size-8 text-red-400 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-300">{statusConfig.label}</h3>
                  <p className="text-white/40 text-sm">{statusConfig.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {order.runnerName && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
            <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-cyan-500/20 transition-colors">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Navigation className="size-4 text-cyan-400" />
                Your Driver
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center relative">
                    <span className="font-bold text-sm text-white">
                      {order.runnerName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-slate-900" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{order.runnerName}</p>
                    {order.runnerPhone && (
                      <p className="text-xs text-white/30">{order.runnerPhone}</p>
                    )}
                  </div>
                </div>
                {order.runnerPhone && (
                  <a href={`tel:${order.runnerPhone}`} data-testid="button-call-runner">
                    <Button size="icon" className="rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 w-10 h-10 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                      <Phone className="size-4 text-white" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package className="size-4 text-orange-400" />
              Order Details
            </h3>

            {order.items && order.items.length > 0 ? (
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-white/30 font-mono w-5 shrink-0">{item.qty}x</span>
                      <span className="text-sm text-white truncate">{item.name}</span>
                    </div>
                    <span className="text-sm text-white/50 font-mono shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : order.orderDescription ? (
              <p className="text-sm text-white/50 mb-4 bg-white/[0.03] p-3 rounded-xl border border-white/[0.04]">
                {order.orderDescription}
              </p>
            ) : null}

            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              {order.menuTotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/30">Subtotal</span>
                  <span className="text-white/50 font-mono">${parseFloat(order.menuTotal).toFixed(2)}</span>
                </div>
              )}
              {order.serviceFee && parseFloat(order.serviceFee) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/30">Service Fee</span>
                  <span className="text-white/50 font-mono">${parseFloat(order.serviceFee).toFixed(2)}</span>
                </div>
              )}
              {order.tax && parseFloat(order.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/30">Tax</span>
                  <span className="text-white/50 font-mono">${parseFloat(order.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/30">Delivery</span>
                <span className="text-white/50 font-mono">${parseFloat(order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/[0.06]">
                <span className="text-white">Total</span>
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
                  ${parseFloat(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {order.deliveryAddress && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
            <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin className="size-4 text-rose-400" />
                Delivery Info
              </h3>
              <p className="text-sm text-white" data-testid="text-delivery-address">{order.deliveryAddress}</p>
              {order.deliveryInstructions && (
                <p className="text-xs text-white/30 mt-2 bg-white/[0.03] p-3 rounded-xl border border-white/[0.04]">
                  {order.deliveryInstructions}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {combinedStatus === "delivered" && order && !existingReview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <div className="bg-white/[0.03] border border-amber-500/15 backdrop-blur-xl rounded-2xl p-5 text-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:border-amber-500/25 transition-colors">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">How was your order?</h3>
              <p className="text-xs text-white/30 mb-3">Rate your food and delivery experience</p>
              <Button
                onClick={() => setReviewOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-10 px-6 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                data-testid="button-leave-review"
              >
                <Star className="w-4 h-4 mr-1.5" /> Leave a Review
              </Button>
            </div>
          </motion.div>
        )}

        {combinedStatus === "delivered" && existingReview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-white">Your Review</span>
              </div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= (existingReview.vendorRating || 0) ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                ))}
              </div>
              {existingReview.comment && <p className="text-xs text-white/40 italic mt-1">"{existingReview.comment}"</p>}
            </div>
          </motion.div>
        )}

        {!isTerminal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <div className="flex items-center justify-center gap-2 py-3">
              <RefreshCw className="size-3 text-white/15 animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-[10px] text-white/15 uppercase tracking-wider">Auto-updating every 8 seconds</span>
            </div>
          </motion.div>
        )}

        {order && (
          <ReviewModal
            open={reviewOpen}
            onOpenChange={setReviewOpen}
            orderId={order.id}
            foodTruckId={order.foodTruckId || 0}
            vendorName={order.locationName || undefined}
          />
        )}
      </div>
    </div>
  );
}
