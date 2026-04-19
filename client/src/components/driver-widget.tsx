import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Package, CheckCircle2, MapPin, Phone, User,
  Navigation, Camera, DollarSign, Clock, ChevronDown,
  Power, Zap, ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (navigator.vibrate) navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 40);
};

function getGoogleMapsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

interface DriverWidgetProps {
  userName: string;
  userRole: string;
}

export default function DriverWidget({ userName, userRole }: DriverWidgetProps) {
  const queryClient = useQueryClient();
  const [deliveryPhotoDialog, setDeliveryPhotoDialog] = useState<{ orderId: number } | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Driver state
  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ["/api/drivers", userName],
    queryFn: async () => {
      const res = await fetch('/api/drivers');
      if (!res.ok) return null;
      const allDrivers = await res.json();
      return allDrivers.find((d: any) => d.name === userName) || null;
    },
  });

  const isDriving = driver?.isActiveToday || false;

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/drivers/toggle-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, role: userRole }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/all-zones"] });
      toast({
        title: data.isActiveToday ? "🚗 Driver Mode ON" : "Driver Mode OFF",
        description: data.isActiveToday
          ? `You're active as ${data.driverNumber || 'driver'}. Ready for pickups!`
          : "You've clocked out of driving for today.",
      });
    },
  });

  // Orders (only when driving)
  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders/all-zones"],
    queryFn: async () => {
      const res = await fetch('/api/orders/all-zones');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isDriving,
    refetchInterval: isDriving ? 8000 : false,
  });

  // Earnings
  const { data: earnings } = useQuery({
    queryKey: ["/api/drivers/earnings", driver?.id],
    queryFn: async () => {
      const res = await fetch(`/api/drivers/${driver.id}/earnings`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isDriving && !!driver?.id,
    refetchInterval: 30000,
  });

  // Food trucks for names
  const { data: foodTrucks = [] } = useQuery({
    queryKey: ["/api/food-trucks"],
    queryFn: async () => {
      const res = await fetch('/api/food-trucks');
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isDriving,
  });

  const truckMap: Record<number, string> = {};
  foodTrucks.forEach((t: any) => { truckMap[t.id] = t.name; });

  // Order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(err.error || 'Failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/all-zones"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/earnings"] });
      toast({ title: "Order updated ✅" });
      setDeliveryPhotoDialog(null);
      setDeliveryPhoto(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Photo capture — compress before upload
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIM = 1200;
      let w = img.width, h = img.height;
      if (w > MAX_DIM || h > MAX_DIM) {
        if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
        else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, w, h);
      setDeliveryPhoto(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmitDelivery = async () => {
    if (!deliveryPhotoDialog || !deliveryPhoto) return;
    setIsSubmittingDelivery(true);
    try {
      await fetch(`/api/orders/${deliveryPhotoDialog.orderId}/delivery-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: deliveryPhoto }),
      });
      updateOrderStatus.mutate({ orderId: deliveryPhotoDialog.orderId, status: 'delivered' });
    } catch {
      updateOrderStatus.mutate({ orderId: deliveryPhotoDialog.orderId, status: 'delivered' });
    } finally {
      setIsSubmittingDelivery(false);
    }
  };

  const handleDriverAction = (orderId: number, status: string) => {
    if (status === 'delivered') {
      setDeliveryPhoto(null);
      setDeliveryPhotoDialog({ orderId });
      return;
    }
    updateOrderStatus.mutate({ orderId, status });
  };

  // Filter orders
  const readyOrders = orders.filter((o: any) => o.vendorStatus === 'ready' && o.status !== 'picked_up' && o.status !== 'delivered' && o.status !== 'cancelled');
  const inTransitOrders = orders.filter((o: any) => o.status === 'picked_up' || o.status === 'in_progress' || o.status === 'approaching');
  const activeOrders = [...readyOrders, ...inTransitOrders];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Driver Toggle Card — entire card is tappable */}
        <button
          type="button"
          onClick={() => { haptic('heavy'); toggleMutation.mutate(); }}
          disabled={toggleMutation.isPending}
          className="w-full text-left touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500/40 rounded-2xl disabled:opacity-60"
          aria-label={isDriving ? "Stop driving" : "Start driving"}
          data-testid="button-driver-toggle"
        >
          <Card className={`${GLASS_CARD} overflow-hidden transition-all duration-300 ${isDriving ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'hover:border-white/20 active:scale-[0.98]'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={isDriving ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`size-11 rounded-xl flex items-center justify-center ${isDriving
                        ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        : 'bg-white/5 border border-white/10'
                      }`}
                  >
                    <Truck className={`size-5 ${isDriving ? 'text-emerald-400' : 'text-white/40'}`} />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">I'm Driving Today</h3>
                      {driver?.driverNumber && isDriving && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                          {driver.driverNumber}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-white/40">
                      {toggleMutation.isPending ? 'Updating...' : isDriving ? 'You\'re active. Tap to clock out.' : 'Tap to start picking up & delivering orders.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isDriving && earnings && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-emerald-400 font-bold">${(earnings.todayTips || 0).toFixed(2)} tips</p>
                      <p className="text-[10px] text-white/30">{earnings.todayDeliveries || 0} delivered</p>
                    </div>
                  )}
                  {/* Visual toggle indicator — not interactive, just shows state */}
                  <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${isDriving ? 'bg-emerald-500' : 'bg-white/10'}`}>
                    <motion.div
                      className="absolute top-0.5 size-6 rounded-full bg-white shadow-lg"
                      animate={{ left: isDriving ? '22px' : '2px' }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </button>

        {/* Active Orders Panel — shown when driving */}
        <AnimatePresence>
          {isDriving && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-2"
            >
              <Card className={`${GLASS_CARD} overflow-hidden border-emerald-500/20`}>
                <CardContent className="p-4">
                  {activeOrders.length > 0 ? (
                    <>
                      {/* Earnings bar for mobile */}
                      {earnings && (
                        <div className="flex items-center gap-3 mb-3 sm:hidden">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <DollarSign className="size-3 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">${(earnings.todayTips || 0).toFixed(2)} tips</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Package className="size-3 text-blue-400" />
                            <span className="text-xs font-bold text-blue-400">{earnings.todayDeliveries || 0} delivered</span>
                          </div>
                        </div>
                      )}

                      {/* Ready for Pickup */}
                      {readyOrders.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Package className="size-3" /> Ready for Pickup ({readyOrders.length})
                          </p>
                          <div className="space-y-2">
                            {readyOrders.map((order: any) => (
                              <div key={order.id} className="p-3 rounded-xl bg-[#0a1628]/60 border border-orange-500/10 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-white">Order #{order.id}</span>
                                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[8px]">
                                      {truckMap[order.foodTruckId] || order.locationName}
                                    </Badge>
                                    {order.customerName && (
                                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                                        <User className="size-2.5" /> {order.customerName}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm font-bold text-orange-400">${parseFloat(order.total || '0').toFixed(2)}</span>
                                </div>
                                {order.items && order.items.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {order.items.map((item: any, idx: number) => (
                                      <span key={idx} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px]">
                                        <span className="text-orange-400 font-bold">{item.qty}×</span>{' '}
                                        <span className="text-slate-300">{item.name}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {order.shoppingList && (
                                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                    <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">🛒 Shopping List</p>
                                    <p className="text-[11px] text-white/60 whitespace-pre-wrap leading-relaxed">{order.shoppingList}</p>
                                  </div>
                                )}
                                {order.deliveryInstructions && (
                                  <p className="text-[10px] text-sky-400 flex items-start gap-1">
                                    <span className="shrink-0">📋</span> {order.deliveryInstructions}
                                  </p>
                                )}
                                {order.customerVerificationPhotoUrl && (
                                  <div>
                                    <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider mb-1">📍 Location Photo</p>
                                    <img src={order.customerVerificationPhotoUrl} alt="Customer location" className="w-full max-h-24 rounded-lg border border-white/10 object-cover" />
                                  </div>
                                )}
                                <motion.div whileTap={{ scale: 0.95 }}>
                                  <Button
                                    size="sm"
                                    className="w-full h-8 text-xs bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-700 hover:to-blue-600 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                                    onClick={() => { haptic('heavy'); handleDriverAction(order.id, 'picked_up'); }}
                                    disabled={updateOrderStatus.isPending}
                                  >
                                    <Truck className="size-3 mr-1" /> Mark Picked Up 🚗
                                  </Button>
                                </motion.div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* In Transit */}
                      {inTransitOrders.length > 0 && (
                        <div>
                          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Navigation className="size-3" /> In Transit ({inTransitOrders.length})
                          </p>
                          <div className="space-y-2">
                            {inTransitOrders.map((order: any) => (
                              <div key={order.id} className="p-3 rounded-xl bg-[#0a1628]/60 border border-blue-500/10 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white">Order #{order.id}</span>
                                    <Badge className={`text-[8px] ${order.status === 'approaching'
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      }`}>
                                      {order.status === 'approaching' ? '📍 Approaching' : '🚗 Picked Up'}
                                    </Badge>
                                  </div>
                                  <span className="text-sm font-bold text-blue-400">${parseFloat(order.total || '0').toFixed(2)}</span>
                                </div>
                                {order.deliveryAddress && (
                                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <MapPin className="size-3.5 text-blue-400 shrink-0" />
                                    <p className="text-[11px] text-white/70 flex-1">{order.deliveryAddress}</p>
                                    <a href={getGoogleMapsUrl(order.deliveryAddress)} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-blue-400 hover:bg-blue-500/10">
                                        <Navigation className="size-2.5 mr-1" /> Nav
                                      </Button>
                                    </a>
                                  </div>
                                )}
                                {order.customerPhone && (
                                  <a href={`tel:${order.customerPhone}`} className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <Phone className="size-2.5" /> {order.customerPhone}
                                  </a>
                                )}
                                {order.shoppingList && (
                                  <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                    <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider mb-1">🛒 Shopping List</p>
                                    <p className="text-[11px] text-white/60 whitespace-pre-wrap leading-relaxed">{order.shoppingList}</p>
                                  </div>
                                )}
                                {order.deliveryInstructions && (
                                  <p className="text-[10px] text-sky-400 flex items-start gap-1">
                                    <span className="shrink-0">📋</span> {order.deliveryInstructions}
                                  </p>
                                )}
                                {order.customerVerificationPhotoUrl && (
                                  <div>
                                    <p className="text-[9px] text-blue-400 font-semibold uppercase tracking-wider mb-1">📍 Location Photo</p>
                                    <img src={order.customerVerificationPhotoUrl} alt="Customer location" className="w-full max-h-24 rounded-lg border border-white/10 object-cover" />
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  {order.status !== 'approaching' && (
                                    <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                                      <Button
                                        size="sm"
                                        className="w-full h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                        onClick={() => { haptic('heavy'); handleDriverAction(order.id, 'approaching'); }}
                                        disabled={updateOrderStatus.isPending}
                                      >
                                        📍 Approaching
                                      </Button>
                                    </motion.div>
                                  )}
                                  <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                                    <Button
                                      size="sm"
                                      className="w-full h-8 text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                      onClick={() => { haptic('heavy'); handleDriverAction(order.id, 'delivered'); }}
                                      disabled={updateOrderStatus.isPending}
                                    >
                                      <Camera className="size-3 mr-1" /> Delivered 📸
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Package className="size-8 text-white/20 mx-auto mb-2" />
                      </motion.div>
                      <p className="text-xs text-white/30">No orders ready. Monitoring...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delivery Photo Dialog */}
      <Dialog open={!!deliveryPhotoDialog} onOpenChange={(open) => { if (!open) setDeliveryPhotoDialog(null); }}>
        <DialogContent className="bg-[#0f172a] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 flex items-center gap-2">
              <Camera className="size-5" /> Proof of Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-white/50">Take a photo of the delivered order as proof of delivery.</p>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
            {deliveryPhoto ? (
              <div className="relative">
                <img src={deliveryPhoto} alt="Delivery proof" className="w-full rounded-xl border border-white/10 max-h-64 object-cover" />
                <button
                  onClick={() => { setDeliveryPhoto(null); photoInputRef.current?.click(); }}
                  className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-xs hover:bg-black/80 transition-all"
                >
                  Retake
                </button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => photoInputRef.current?.click()}
                className="w-full h-40 rounded-xl border-2 border-dashed border-white/20 hover:border-emerald-500/40 bg-white/[0.02] hover:bg-emerald-500/5 flex flex-col items-center justify-center gap-2 transition-all"
              >
                <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Camera className="size-7 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-white/60">Tap to take photo</span>
              </motion.button>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="border-white/10 text-white/60" onClick={() => setDeliveryPhotoDialog(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white"
              disabled={!deliveryPhoto || isSubmittingDelivery}
              onClick={handleSubmitDelivery}
            >
              {isSubmittingDelivery ? "Submitting..." : "✅ Confirm Delivery"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
