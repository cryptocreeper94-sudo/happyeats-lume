import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Package, ChefHat, CheckCircle2,
  XCircle, Phone, MapPin, User, Timer, Truck,
  Bell, BellOff, AlertCircle, Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/context";
import { InfoBubble } from "@/components/info-bubble";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type VendorStatus = "pending" | "accepted" | "preparing" | "ready" | "rejected";

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface OrderData {
  id: number;
  locationName: string;
  items: OrderItem[] | null;
  vendorStatus: string | null;
  vendorPrepTime: number | null;
  status: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryInstructions: string | null;
  menuTotal: string | null;
  serviceFee: string | null;
  tax: string | null;
  subtotal: string;
  deliveryFee: string;
  total: string;
  isSandbox: boolean | null;
  orderType: string | null;
  batchId: string | null;
  shoppingList: string | null;
  customerVerificationPhotoUrl: string | null;
  deliveryPhotoUrl: string | null;
  tipAmount: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FoodTruckData {
  id: number;
  name: string;
  cuisine: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
}

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const STATUS_CONFIG: Record<VendorStatus, { label: string; color: string; bg: string; border: string; glow: string }> = {
  pending: { label: "Pending", color: "text-amber-300", bg: "bg-amber-500/20", border: "border-amber-500/30", glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]" },
  accepted: { label: "Accepted", color: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/30", glow: "" },
  preparing: { label: "Preparing", color: "text-violet-300", bg: "bg-violet-500/20", border: "border-violet-500/30", glow: "" },
  ready: { label: "Ready", color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/30", glow: "" },
  rejected: { label: "Rejected", color: "text-red-300", bg: "bg-red-500/20", border: "border-red-500/30", glow: "" },
};

const FILTER_TABS = ["all", "pending", "accepted", "preparing", "ready"] as const;

const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (navigator.vibrate) navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 40);
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function SkeletonOrderCard() {
  return (
    <Card className={`${GLASS_CARD} overflow-hidden`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 bg-white/10" />
              <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-3 w-32 bg-white/10" />
          </div>
          <Skeleton className="h-5 w-16 bg-white/10" />
        </div>
        <Separator className="bg-white/5" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-40 bg-white/10" />
          <Skeleton className="h-3 w-36 bg-white/10" />
        </div>
        <Separator className="bg-white/5" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-3/4 bg-white/10" />
          <Skeleton className="h-3 w-5/6 bg-white/10" />
        </div>
        <Separator className="bg-white/5" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-md bg-white/10" />
          <Skeleton className="h-8 flex-1 rounded-md bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-40 bg-white/10" />
              <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-4 w-48 bg-white/10" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className={GLASS_CARD}>
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-3 w-16 bg-white/10" />
                <Skeleton className="h-8 w-12 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonOrderCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PrepCountdown({ order }: { order: OrderData }) {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!order.vendorPrepTime || order.vendorStatus !== "preparing") return;

    const calc = () => {
      const updated = new Date(order.updatedAt).getTime();
      const totalMs = order.vendorPrepTime! * 60 * 1000;
      const readyAt = updated + totalMs;
      const diff = readyAt - Date.now();
      if (diff <= 0) {
        setRemaining("✓");
        setProgress(100);
        return;
      }
      const elapsed = totalMs - diff;
      setProgress(Math.min(100, (elapsed / totalMs) * 100));
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${String(secs).padStart(2, "0")}`);
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [order.updatedAt, order.vendorPrepTime, order.vendorStatus]);

  if (!order.vendorPrepTime || order.vendorStatus !== "preparing") return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2.5"
      data-testid={`text-countdown-${order.id}`}
    >
      <div className="relative w-11 h-11 shrink-0">
        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="3" />
          <motion.circle
            cx="22" cy="22" r={radius} fill="none"
            stroke="url(#prepGrad)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
          />
          <defs>
            <linearGradient id="prepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Timer className="size-3.5 text-violet-400" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-sm font-bold text-violet-300">{remaining}</span>
        <span className="text-[10px] text-violet-400/60">{t("vendor.remaining")}</span>
      </div>
    </motion.div>
  );
}

function OrderCard({
  order, onStatusUpdate, onDriverAction, index
}: {
  order: OrderData;
  onStatusUpdate: (orderId: number, vendorStatus: string, prepTime?: number, rejectionReason?: string) => void;
  onDriverAction: (orderId: number, status: string) => void;
  index: number;
}) {
  const { t } = useLanguage();
  const [prepTime, setPrepTime] = useState("20");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const vs = (order.vendorStatus || "pending") as VendorStatus;
  const config = STATUS_CONFIG[vs] || STATUS_CONFIG.pending;
  const isRejected = vs === "rejected";
  const isReady = vs === "ready";
  const isPending = vs === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`hover:-translate-y-1 transition-all duration-300 ${isRejected ? "opacity-50" : ""}`}
    >
      <Card
        className={`${GLASS_CARD} overflow-hidden transition-all duration-300 ${
          isReady ? "border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)]" : ""
        } ${isPending ? "border-amber-500/20" : ""}`}
        data-testid={`card-order-${order.id}`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white" data-testid={`text-order-number-${order.id}`}>
                  Order #{order.id}
                </span>
                <motion.div
                  key={vs}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Badge
                    className={`${config.bg} ${config.color} ${config.border} text-[10px] ${isPending ? config.glow : ""}`}
                    data-testid={`badge-status-${order.id}`}
                  >
                    {isPending && (
                      <motion.span
                        className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    {t(`vendor.status${vs.charAt(0).toUpperCase() + vs.slice(1)}` as any)}
                  </Badge>
                </motion.div>
              </div>
              <span className="text-xs text-slate-500" data-testid={`text-order-time-${order.id}`}>
                {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
              </span>
            </div>
            <span className="text-base font-bold text-orange-400 shrink-0" data-testid={`text-order-total-${order.id}`}>
              ${parseFloat(order.total).toFixed(2)}
            </span>
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {order.orderType === "one-off" ? (
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[9px]" data-testid={`badge-order-type-${order.id}`}>
                  One-Off Order
                </Badge>
              ) : (
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[9px]" data-testid={`badge-order-type-${order.id}`}>
                  Batch Order
                </Badge>
              )}
              {order.batchId && (
                <Badge variant="outline" className="text-[9px] border-white/10 text-slate-400" data-testid={`badge-batch-id-${order.id}`}>
                  {order.batchId}
                </Badge>
              )}
            </div>
            {order.customerName && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20" data-testid={`customer-banner-${order.id}`}>
                <User className="size-4 text-orange-400 shrink-0" />
                <span className="text-sm font-bold text-orange-300" data-testid={`text-customer-name-${order.id}`}>{order.customerName}</span>
              </div>
            )}
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Phone className="size-3.5 text-slate-500 shrink-0" />
                <span data-testid={`text-customer-phone-${order.id}`}>{order.customerPhone}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="size-3.5 text-slate-500 shrink-0" />
                <span className="line-clamp-1" data-testid={`text-delivery-address-${order.id}`}>{order.deliveryAddress}</span>
              </div>
            )}
          </div>

          {order.items && order.items.length > 0 && (
            <>
              <Separator className="bg-white/5" />
              <div className="flex flex-wrap gap-1.5" data-testid={`list-items-${order.id}`}>
                {order.items.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs"
                  >
                    <span className="text-orange-400 font-bold">{item.qty}×</span>
                    <span className="text-slate-300">{item.name}</span>
                    <span className="text-slate-500 ml-1">${(item.price * item.qty).toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Shopping List */}
          {order.shoppingList && (
            <>
              <Separator className="bg-white/5" />
              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  🛒 Shopping List / Custom Order
                </p>
                <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed">{order.shoppingList}</p>
              </div>
            </>
          )}

          {/* Delivery Instructions */}
          {order.deliveryInstructions && (
            <>
              <Separator className="bg-white/5" />
              <div className="p-2 rounded-lg bg-sky-500/5 border border-sky-500/15">
                <p className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider mb-1">📋 Delivery Instructions</p>
                <p className="text-xs text-white/60">{order.deliveryInstructions}</p>
              </div>
            </>
          )}

          {/* Customer Verification Photo */}
          {order.customerVerificationPhotoUrl && (
            <>
              <Separator className="bg-white/5" />
              <div className="space-y-1.5">
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  📍 Customer Location Photo
                </p>
                <img src={order.customerVerificationPhotoUrl} alt="Customer location" className="w-full max-h-32 rounded-lg border border-white/10 object-cover" />
              </div>
            </>
          )}

          {/* Tip amount */}
          {order.tipAmount && parseFloat(order.tipAmount) > 0 && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="text-[10px]">💚 Tip:</span>
              <span className="text-xs font-bold">${parseFloat(order.tipAmount).toFixed(2)}</span>
              <span className="text-[9px] text-white/30">(100% to driver)</span>
            </div>
          )}

          {vs === "preparing" && <PrepCountdown order={order} />}

          {!isRejected && vs !== "ready" && (
            <>
              <Separator className="bg-white/5" />
              <div className="flex items-center gap-2 flex-wrap" data-testid={`actions-${order.id}`}>
                {vs === "pending" && (
                  <>
                    <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white h-8 text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        onClick={() => { haptic('medium'); onStatusUpdate(order.id, "accepted"); }}
                        data-testid={`button-accept-${order.id}`}
                      >
                        <CheckCircle2 className="size-3.5 mr-1" /> {t("vendor.accept")}
                      </Button>
                    </motion.div>
                    <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 text-xs"
                        onClick={() => { haptic('medium'); setShowRejectDialog(true); }}
                        data-testid={`button-reject-${order.id}`}
                      >
                        <XCircle className="size-3.5 mr-1" /> {t("vendor.reject")}
                      </Button>
                    </motion.div>

                    {/* Rejection reason dialog */}
                    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                      <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="text-red-400 flex items-center gap-2">
                            <XCircle className="size-5" /> Reject Order #{order.id}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <p className="text-xs text-white/50">Please enter a reason for rejecting this order. The customer will be notified and receive a refund.</p>
                          <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Out of ingredients, Kitchen closed, Item unavailable..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm min-h-[80px]"
                            data-testid={`input-reject-reason-${order.id}`}
                          />
                        </div>
                        <DialogFooter className="gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 text-white/60"
                            onClick={() => setShowRejectDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={!rejectReason.trim()}
                            onClick={() => {
                              haptic('heavy');
                              onStatusUpdate(order.id, "rejected", undefined, rejectReason.trim());
                              setShowRejectDialog(false);
                              setRejectReason("");
                            }}
                            data-testid={`button-confirm-reject-${order.id}`}
                          >
                            Reject & Refund Customer
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {vs === "accepted" && (
                  <div className="flex items-center gap-2 w-full">
                    <Select value={prepTime} onValueChange={setPrepTime} data-testid={`select-preptime-${order.id}`}>
                      <SelectTrigger className="h-8 w-24 bg-[#0f172a] border-white/10 text-white text-xs" data-testid={`select-trigger-preptime-${order.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-white/10">
                        <SelectItem value="15" className="text-white text-xs">15 min</SelectItem>
                        <SelectItem value="20" className="text-white text-xs">20 min</SelectItem>
                        <SelectItem value="25" className="text-white text-xs">25 min</SelectItem>
                        <SelectItem value="30" className="text-white text-xs">30 min</SelectItem>
                      </SelectContent>
                    </Select>
                    <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white h-8 text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        onClick={() => { haptic('medium'); onStatusUpdate(order.id, "preparing", parseInt(prepTime)); }}
                        data-testid={`button-start-preparing-${order.id}`}
                      >
                        <ChefHat className="size-3.5 mr-1" /> {t("vendor.startPreparing")}
                      </Button>
                    </motion.div>
                  </div>
                )}
                {vs === "preparing" && (
                  <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white h-8 text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      onClick={() => { haptic('medium'); onStatusUpdate(order.id, "ready"); }}
                      data-testid={`button-mark-ready-${order.id}`}
                    >
                      <Package className="size-3.5 mr-1" /> {t("vendor.markReadyPickup")}
                    </Button>
                  </motion.div>
                )}
              </div>
            </>
          )}

          {vs === "ready" && (order.status === "picked_up" || order.status === "in_progress" || order.status === "approaching" || order.status === "delivered") && (
            <>
              <Separator className="bg-white/5" />
              <div className="flex items-center gap-2 py-1">
                <Truck className="size-3.5 text-blue-400 shrink-0" />
                <span className="text-[11px] text-white/60">Driver Status:</span>
                <Badge className={`text-[10px] ${
                  order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  order.status === 'approaching' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {order.status === 'delivered' ? '✅ Delivered' :
                   order.status === 'approaching' ? '📍 Approaching' :
                   '🚗 Picked Up'}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
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

export default function VendorOrders() {
  const { t } = useLanguage();
  const params = useParams<{ truckId: string }>();
  const truckId = params.truckId;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"incoming" | "history">("incoming");
  const [filter, setFilter] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevPendingRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: truck, isLoading: truckLoading } = useQuery<FoodTruckData>({
    queryKey: ["/api/food-trucks", truckId],
    queryFn: async () => {
      const res = await fetch(`/api/food-trucks/${truckId}`);
      if (!res.ok) throw new Error("Truck not found");
      return res.json();
    },
    enabled: !!truckId,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderData[]>({
    queryKey: ["/api/orders/food-truck", truckId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/food-truck/${truckId}`);
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    enabled: !!truckId,
    refetchInterval: 10000,
  });

  const updateVendorStatus = useMutation({
    mutationFn: async ({ orderId, vendorStatus, prepTime, rejectionReason }: { orderId: number; vendorStatus: string; prepTime?: number; rejectionReason?: string }) => {
      const res = await fetch(`/api/orders/${orderId}/vendor-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorStatus, prepTime, rejectionReason, foodTruckId: truckId ? parseInt(truckId) : undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to update status" }));
        throw new Error(err.error || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/food-truck"] });
      toast({ title: t("vendor.orderUpdated") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("vendor.failedUpdateOrder"), variant: "destructive" });
    },
  });

  const handleStatusUpdate = useCallback((orderId: number, vendorStatus: string, prepTime?: number, rejectionReason?: string) => {
    updateVendorStatus.mutate({ orderId, vendorStatus, prepTime, rejectionReason });
  }, [updateVendorStatus]);

  // Delivery photo state
  const [deliveryPhotoDialog, setDeliveryPhotoDialog] = useState<{ orderId: number } | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const deliveryPhotoInputRef = useRef<HTMLInputElement>(null);

  // Driver actions: picked_up / delivered (for owner-operators who are also drivers)
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status, deliveryPhotoUrl }: { orderId: number; status: string; deliveryPhotoUrl?: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deliveryPhotoUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/food-truck"] });
      toast({ title: t("vendor.orderUpdated") });
      setDeliveryPhotoDialog(null);
      setDeliveryPhoto(null);
    },
    onError: (err: any) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const handleDeliveryPhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress photo before upload — phone cameras produce 3-8MB images
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIM = 1200; // Max width/height for delivery proof
      let w = img.width, h = img.height;
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
        else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      setDeliveryPhoto(compressed);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmitDelivery = async () => {
    if (!deliveryPhotoDialog || !deliveryPhoto) return;
    setIsSubmittingDelivery(true);
    try {
      // Upload photo first
      const res = await fetch(`/api/orders/${deliveryPhotoDialog.orderId}/delivery-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: deliveryPhoto }),
      });
      let photoUrl = '';
      if (res.ok) {
        const data = await res.json();
        photoUrl = data.url || '';
      }
      // Then mark delivered
      updateOrderStatus.mutate({ orderId: deliveryPhotoDialog.orderId, status: 'delivered', deliveryPhotoUrl: photoUrl });
    } catch {
      // If photo upload fails, still allow delivery
      updateOrderStatus.mutate({ orderId: deliveryPhotoDialog.orderId, status: 'delivered' });
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const handleDriverAction = useCallback((orderId: number, status: string) => {
    if (status === 'delivered') {
      // Require proof-of-delivery photo
      setDeliveryPhoto(null);
      setDeliveryPhotoDialog({ orderId });
      return;
    }
    updateOrderStatus.mutate({ orderId, status });
  }, [updateOrderStatus]);

  const activeStatuses = ["pending", "accepted", "preparing", "ready", "rejected"];
  const historyStatuses = ["delivered", "cancelled"];

  const pendingCount = useMemo(() => orders.filter((o) => (o.vendorStatus || "pending") === "pending").length, [orders]);
  const acceptedCount = useMemo(() => orders.filter((o) => o.vendorStatus === "accepted").length, [orders]);
  const preparingCount = useMemo(() => orders.filter((o) => o.vendorStatus === "preparing").length, [orders]);
  const readyCount = useMemo(() => orders.filter((o) => o.vendorStatus === "ready").length, [orders]);

  useEffect(() => {
    if (pendingCount > prevPendingRef.current && prevPendingRef.current > 0) {
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      haptic('heavy');
      toast({ title: `🔔 ${t("vendor.newOrderAlert")}`, description: t("vendor.newOrderDesc") });
    }
    prevPendingRef.current = pendingCount;
  }, [pendingCount, soundEnabled]);

  const incomingOrders = useMemo(() => {
    const filtered = orders.filter((o) => activeStatuses.includes(o.vendorStatus || "pending"));
    if (filter === "all") return filtered;
    return filtered.filter((o) => (o.vendorStatus || "pending") === filter);
  }, [orders, filter]);

  const historyOrders = useMemo(() => {
    return orders.filter((o) => historyStatuses.includes(o.status) || historyStatuses.includes(o.vendorStatus || ""));
  }, [orders]);

  if (truckLoading || ordersLoading) {
    return <SkeletonLoading />;
  }

  if (!truck) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4" data-testid="truck-not-found">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${GLASS_CARD} border-red-500/30 max-w-md w-full`}>
            <CardContent className="p-8 text-center space-y-4">
              <XCircle className="size-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">{t("vendor.truckNotFound")}</h2>
              <p className="text-slate-400 text-sm">{t("vendor.truckNotFoundDesc").replace("{{id}}", truckId || "")}</p>
              <Link href="/sandbox">
                <Button data-testid="button-back-sandbox" className="bg-gradient-to-r from-orange-500 to-rose-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]">{t("vendor.backToSandbox")}</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#0f172a]">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" preload="auto" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-4 py-6 space-y-5"
      >
        <div className="flex items-start gap-3" data-testid="vendor-header">
          <Link href="/sandbox">
            <Button data-testid="button-back" variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0 mt-0.5 transition-all duration-300 hover:bg-white/10">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white" data-testid="text-truck-name">{truck.name}</h1>
              <InfoBubble
                title={{ en: "Vendor Order Management", es: "Gestión de Pedidos del Vendedor" }}
                content={{ en: "Your incoming orders appear here in real-time. Tap an order to manage it:\n\n• Accept — confirm you'll prepare it\n• Set prep time — tell drivers when it'll be ready (15, 20, 25, or 30 minutes)\n• Mark as Preparing — you're cooking, customer sees a countdown timer\n• Mark as Ready — it's done, driver can pick up\n• Reject — if you can't fulfill the order, it gets cancelled and the customer is notified. Only reject if you truly can't make it.\n\nBatch orders are grouped by delivery window (e.g., Morning Run cutoff at 10:00 AM, Midday Run at 12:00 PM). One-off orders come in individually for local corridor deliveries.\n\nTip: Keep your prep time accurate — it helps drivers plan their route and customers know when to expect their food.", es: "Tus pedidos entrantes aparecen aquí en tiempo real. Toca un pedido para gestionarlo:\n\n• Aceptar — confirma que lo prepararás\n• Tiempo de prep — dile a los conductores cuándo estará listo (15, 20, 25 o 30 minutos)\n• Marcar como Preparando — estás cocinando, el cliente ve un temporizador\n• Marcar como Listo — está terminado, el conductor puede recoger\n• Rechazar — si no puedes preparar el pedido, se cancela y el cliente es notificado. Solo rechaza si realmente no puedes.\n\nLos pedidos por lotes se agrupan por ventana de entrega (ej: Ronda Matutina a las 10:00 AM, Ronda del Mediodía a las 12:00 PM). Los pedidos individuales llegan por separado.\n\nConsejo: Mantén tu tiempo de preparación preciso — ayuda a los conductores a planificar su ruta." }}
                manualSection="vendor-management"
              />
              {truck.cuisine && (
                <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400" data-testid="badge-cuisine">
                  {truck.cuisine}
                </Badge>
              )}
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 rounded-full ${soundEnabled ? "text-orange-400 bg-orange-500/10" : "text-slate-500 hover:text-slate-300"}`}
                  onClick={() => { setSoundEnabled(!soundEnabled); haptic('light'); }}
                  data-testid="button-toggle-sound"
                >
                  {soundEnabled ? <Bell className="size-3.5" /> : <BellOff className="size-3.5" />}
                </Button>
              </motion.div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold" data-testid="text-dashboard-label">{t("vendor.vendorDashboard")}</span>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.05, 1] }}
                transition={{ duration: 0.4 }}
              >
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase tracking-wider" data-testid="badge-sandbox">
                  {t("vendor.sandboxMode")}
                </Badge>
              </motion.div>
              {pendingCount > 0 && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]" data-testid="badge-new-orders">
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1"
                      animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {pendingCount} {t("vendor.new")}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="status-summary">
          <StatCard label="Pending" count={pendingCount} icon={Clock} color="text-amber-300" glowColor="bg-amber-500/10" />
          <StatCard label="Accepted" count={acceptedCount} icon={CheckCircle2} color="text-blue-300" glowColor="bg-blue-500/10" />
          <StatCard label="Preparing" count={preparingCount} icon={ChefHat} color="text-violet-300" glowColor="bg-violet-500/10" />
          <StatCard label="Ready" count={readyCount} icon={Package} color="text-emerald-300" glowColor="bg-emerald-500/10" />
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20" data-testid="batch-order-notice">
          <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300 font-medium leading-relaxed">
            {t("vendor.batchOrderNotice")}
          </p>
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/5" data-testid="tab-switcher">
          {(["incoming", "history"] as const).map((tab) => (
            <motion.button
              key={tab}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === tab ? "text-white" : "text-slate-400 hover:text-white"
              }`}
              onClick={() => { setActiveTab(tab); haptic('light'); }}
              whileTap={{ scale: 0.97 }}
              data-testid={`tab-${tab}`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {tab === "incoming" ? `${t("vendor.incomingOrdersTab")} (${incomingOrders.length})` : `${t("vendor.orderHistory")} (${historyOrders.length})`}
              </span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "incoming" && (
            <motion.div
              key="incoming"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" data-testid="filter-tabs">
                {FILTER_TABS.map((tab) => {
                  const count = tab === "all"
                    ? orders.filter((o) => activeStatuses.includes(o.vendorStatus || "pending")).length
                    : orders.filter((o) => (o.vendorStatus || "pending") === tab).length;
                  const isActive = filter === tab;
                  return (
                    <motion.button
                      key={tab}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-3.5 py-2 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 hover:text-white border border-white/5 hover:border-white/10 backdrop-blur-xl bg-white/5"
                      }`}
                      onClick={() => { setFilter(tab); haptic('light'); }}
                      data-testid={`filter-${tab}`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFilter"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/80 to-rose-500/80 backdrop-blur-xl border border-orange-500/30"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab === "all" ? t("common.all") : t(`vendor.status${tab.charAt(0).toUpperCase() + tab.slice(1)}` as any)} ({count})
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={filter}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {incomingOrders.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Card className={GLASS_CARD}>
                        <CardContent className="p-8 text-center">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Package className="size-10 text-slate-600 mx-auto mb-3" />
                          </motion.div>
                          <p className="text-slate-400 text-sm">{t("vendor.noOrdersNow").replace("{{filter}}", filter === "all" ? "" : filter)}</p>
                          <p className="text-slate-500 text-xs mt-1">{t("vendor.ordersAutoRefresh")}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="order-list">
                      <AnimatePresence>
                        {incomingOrders.map((order, i) => (
                          <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} onDriverAction={handleDriverAction} index={i} />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
              data-testid="history-list"
            >
              {historyOrders.length === 0 ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Card className={GLASS_CARD}>
                    <CardContent className="p-8 text-center">
                      <Clock className="size-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">{t("vendor.noCompletedOrders")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {historyOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="hover:-translate-y-1 transition-all duration-300"
                    >
                      <Card
                        className={`${GLASS_CARD} opacity-70`}
                        data-testid={`card-history-order-${order.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-semibold text-white" data-testid={`text-history-order-number-${order.id}`}>
                                Order #{order.id}
                              </span>
                              <span className="text-xs text-slate-500 ml-2">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-[10px] ${
                                  order.status === "delivered"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-red-500/20 text-red-300 border-red-500/30"
                                }`}
                                data-testid={`badge-history-status-${order.id}`}
                              >
                                {order.status}
                              </Badge>
                              <span className="text-sm font-bold text-slate-400" data-testid={`text-history-total-${order.id}`}>
                                ${parseFloat(order.total).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          {order.customerName && (
                            <p className="text-xs text-slate-500 mt-1" data-testid={`text-history-customer-${order.id}`}>
                              {order.customerName} · {order.items?.length || 0} items
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>

    {/* Delivery Photo Dialog */}
    <Dialog open={!!deliveryPhotoDialog} onOpenChange={(open) => { if (!open) setDeliveryPhotoDialog(null); }}>
      <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-emerald-400 flex items-center gap-2">
            <Camera className="size-5" /> Proof of Delivery
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-white/50">Take a photo of the delivered order as proof of delivery. This is required before marking the order as delivered.</p>

          <input
            ref={deliveryPhotoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleDeliveryPhotoCapture}
            className="hidden"
          />

          {deliveryPhoto ? (
            <div className="relative">
              <img src={deliveryPhoto} alt="Delivery proof" className="w-full rounded-xl border border-white/10 max-h-64 object-cover" />
              <button
                onClick={() => { setDeliveryPhoto(null); deliveryPhotoInputRef.current?.click(); }}
                className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs hover:bg-black/80 transition-all"
              >
                Retake
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => deliveryPhotoInputRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-white/20 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/5 flex flex-col items-center justify-center gap-2 transition-all"
            >
              <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Camera className="size-7 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-white/60">Tap to take photo</span>
              <span className="text-[10px] text-white/30">Camera will open</span>
            </motion.button>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white/60"
            onClick={() => setDeliveryPhotoDialog(null)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
            disabled={!deliveryPhoto || isSubmittingDelivery}
            onClick={handleSubmitDelivery}
            data-testid="button-confirm-delivery"
          >
            {isSubmittingDelivery ? "Submitting..." : "✅ Confirm Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}