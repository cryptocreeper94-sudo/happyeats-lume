import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, X, Package, Truck, ChefHat, Clock, CheckCircle2, MapPin } from "lucide-react";

const STORAGE_KEY = "he_active_orders";

export function saveActiveOrders(orderIds: number[]) {
  const existing = getActiveOrders();
  const merged = Array.from(new Set([...existing, ...orderIds]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event("he_orders_updated"));
}

export function getActiveOrders(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearActiveOrders() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("he_orders_updated"));
}

function clearOrder(id: number) {
  const orders = getActiveOrders().filter(o => o !== id);
  if (orders.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
  window.dispatchEvent(new Event("he_orders_updated"));
}

interface OrderStatus {
  id: number;
  status: string;
  vendorStatus: string | null;
}

const STATUS_DISPLAY: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  placed: { label: "Order Placed", icon: Clock, color: "text-amber-300", bg: "from-amber-500 to-orange-500" },
  pending: { label: "Waiting for Vendor", icon: Clock, color: "text-amber-300", bg: "from-amber-500 to-orange-500" },
  accepted: { label: "Accepted!", icon: CheckCircle2, color: "text-blue-300", bg: "from-blue-500 to-cyan-500" },
  preparing: { label: "Being Prepared", icon: ChefHat, color: "text-violet-300", bg: "from-violet-500 to-purple-500" },
  ready: { label: "Ready for Pickup", icon: Package, color: "text-emerald-300", bg: "from-emerald-500 to-teal-500" },
  picked_up: { label: "Out for Delivery", icon: Truck, color: "text-sky-300", bg: "from-sky-500 to-blue-500" },
  in_progress: { label: "Out for Delivery", icon: Truck, color: "text-sky-300", bg: "from-sky-500 to-blue-500" },
  approaching: { label: "Driver is Almost Here!", icon: MapPin, color: "text-amber-300", bg: "from-amber-500 to-orange-500" },
  delivered: { label: "Delivered!", icon: CheckCircle2, color: "text-emerald-300", bg: "from-emerald-500 to-green-500" },
};

export function FloatingOrderTracker() {
  const [orderIds, setOrderIds] = useState<number[]>(getActiveOrders());
  const [statuses, setStatuses] = useState<OrderStatus[]>([]);
  const [dismissed, setDismissed] = useState(false);

  // Listen for order updates
  useEffect(() => {
    const handler = () => {
      setOrderIds(getActiveOrders());
      setDismissed(false);
    };
    window.addEventListener("he_orders_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("he_orders_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  // Poll order statuses
  useEffect(() => {
    if (orderIds.length === 0) return;

    const poll = async () => {
      const results: OrderStatus[] = [];
      for (const id of orderIds) {
        try {
          const res = await fetch(`/api/orders/${id}`);
          if (res.ok) {
            const data = await res.json();
            results.push({
              id: data.id,
              status: data.status,
              vendorStatus: data.vendorStatus,
            });
            // Auto-clear delivered/cancelled orders
            if (data.status === "delivered" || data.status === "cancelled") {
              setTimeout(() => clearOrder(id), 5000);
            }
          }
        } catch {}
      }
      setStatuses(results);
    };

    poll();
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [orderIds]);

  if (orderIds.length === 0 || dismissed) return null;

  // Use the most relevant status to display
  const activeStatuses = statuses.filter(s => s.status !== "delivered" && s.status !== "cancelled");
  if (activeStatuses.length === 0 && statuses.length > 0) return null;

  const primary = activeStatuses[0] || statuses[0];
  const displayStatus = primary
    ? (primary.vendorStatus || primary.status || "pending")
    : "pending";
  const config = STATUS_DISPLAY[displayStatus] || STATUS_DISPLAY.pending;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 z-[90] max-w-lg mx-auto"
        data-testid="floating-order-tracker"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${config.bg} opacity-90`} />
          <div className="absolute inset-0 backdrop-blur-xl" />

          <div className="relative flex items-center gap-3 p-3 pr-2">
            {/* Pulsing icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0"
            >
              <Icon className="size-5 text-white" />
            </motion.div>

            {/* Status text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Order #{primary?.id || orderIds[0]}
              </p>
              <p className="text-sm font-black text-white">
                {config.label}
              </p>
            </div>

            {/* Track button */}
            <Link href={`/tracking?order=${primary?.id || orderIds[0]}`}>
              <button
                className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white font-bold text-sm whitespace-nowrap border border-white/20"
                data-testid="button-track-floating"
              >
                <Navigation className="size-4 inline mr-1.5 -mt-0.5" />
                Track
              </button>
            </Link>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="size-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/10 transition-all shrink-0"
              data-testid="button-dismiss-tracker"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
