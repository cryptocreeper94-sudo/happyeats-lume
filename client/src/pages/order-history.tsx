import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { useCustomerSession } from "./customer-auth";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Star, Clock, MapPin, ChevronRight, ShoppingBag, Filter, Truck, RotateCcw } from "lucide-react";
import orderHistoryImg from "@/assets/images/order-history-hero.jpg";

type Tab = "orders" | "reviews";

export default function OrderHistory() {
  const [, navigate] = useLocation();
  const { getSession, getToken } = useCustomerSession();
  const customer = getSession();
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window !== "undefined" && window.location.search.includes("tab=reviews")) return "reviews";
    return "orders";
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (!customer) {
    navigate("/signin");
    return null;
  }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/customers", customer.id, "orders"],
    queryFn: async () => {
      const token = getToken();
      const res = await fetch(`/api/customers/${customer.id}/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.json();
    },
  });

  const filteredOrders = statusFilter === "all" ? orders : orders.filter((o: any) => o.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    in_progress: "bg-orange-500/20 text-orange-400",
    picked_up: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statuses = ["all", "pending", "confirmed", "in_progress", "delivered", "cancelled"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={orderHistoryImg} alt="" className="w-full h-48 object-cover brightness-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/50 via-[#0f172a]/90 to-[#0f172a]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-12">
        <button onClick={() => navigate("/account")} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors" data-testid="link-back">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Account</span>
        </button>

        <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-400" /> Order History
        </h1>

        <div className="flex rounded-lg bg-white/[0.04] border border-white/[0.08] p-1 mb-4">
          {(["orders", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md" : "text-white/50 hover:text-white/80"}`}
              data-testid={`button-tab-${t}`}
            >
              {t === "orders" ? "Orders" : "Reviews"}
            </button>
          ))}
        </div>

        {tab === "orders" && (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${statusFilter === s ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/70"}`}
                  data-testid={`button-filter-${s}`}
                >
                  {s === "all" ? "All" : s.replace("_", " ")}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 text-sm">No orders yet</p>
                <Button onClick={() => navigate("/explore")} className="mt-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white" data-testid="button-start-ordering">
                  Start Ordering
                </Button>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order: any, i: number) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <GlassCard glow className="p-4 cursor-pointer group" onClick={() => navigate(`/tracking/${order.id}`)} data-testid={`card-order-${order.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-white">Order #{order.id}</p>
                          <p className="text-xs text-white/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[order.status] || "bg-white/10 text-white/60"}`}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </div>

                      {order.deliveryAddress && (
                        <p className="text-xs text-white/40 flex items-center gap-1 mb-2 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {order.deliveryAddress}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {order.total && <span className="text-sm font-medium text-white/80">${Number(order.total).toFixed(2)}</span>}
                          {order.tipAmount && Number(order.tipAmount) > 0 && (
                            <span className="text-xs text-green-400/70">+${Number(order.tipAmount).toFixed(2)} tip</span>
                          )}
                          {order.orderType && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${order.orderType === "batch" ? "bg-purple-500/20 text-purple-400" : "bg-cyan-500/20 text-cyan-400"}`}>
                              {order.orderType}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {order.status === "delivered" && order.items && order.items.length > 0 && order.zoneSlug && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-[10px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10 gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                const cartItems = order.items.map((item: any) => ({
                                  truckId: item.truckId || order.foodTruckId || 0,
                                  truckName: item.truckName || order.locationName || "",
                                  itemId: item.id,
                                  name: item.name,
                                  price: item.price,
                                  qty: item.qty,
                                }));
                                const cartKey = `sandbox-cart-${order.zoneSlug}`;
                                sessionStorage.setItem(cartKey, JSON.stringify(cartItems));
                                if (order.deliveryAddress) {
                                  const formKey = "sandbox-form";
                                  const existingForm = (() => { try { const s = sessionStorage.getItem(formKey); return s ? JSON.parse(s) : {}; } catch { return {}; } })();
                                  sessionStorage.setItem(formKey, JSON.stringify({ ...existingForm, address: order.deliveryAddress }));
                                }
                                navigate(`/order/${order.zoneSlug}`);
                              }}
                              data-testid={`button-reorder-${order.id}`}
                            >
                              <RotateCcw className="w-3 h-3" /> Order Again
                            </Button>
                          )}
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "reviews" && (
          <ReviewsList customerId={customer.id} orders={orders} />
        )}
      </div>
    </div>
  );
}

function ReviewsList({ customerId, orders }: { customerId: number; orders: any[] }) {
  const deliveredOrders = orders.filter((o: any) => o.status === "delivered");

  if (deliveredOrders.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <Star className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No delivered orders to review yet</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {deliveredOrders.map((order: any) => (
        <ReviewCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function ReviewCard({ order }: { order: any }) {
  const { data: review } = useQuery({
    queryKey: ["/api/order-reviews/order", order.id],
    queryFn: async () => {
      const res = await fetch(`/api/order-reviews/order/${order.id}`);
      return res.json();
    },
  });
  const [, navigate] = useLocation();

  return (
    <GlassCard glow className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-white">Order #{order.id}</p>
        <span className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>
      {review ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= (review.vendorRating || 0) ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
              ))}
            </div>
            <span className="text-xs text-white/50">Vendor</span>
          </div>
          {review.driverRating && (
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= review.driverRating ? "text-cyan-400 fill-cyan-400" : "text-white/20"}`} />
                ))}
              </div>
              <span className="text-xs text-white/50">Driver</span>
            </div>
          )}
          {review.comment && <p className="text-xs text-white/60 mt-2 italic">"{review.comment}"</p>}
        </div>
      ) : (
        <Button
          onClick={() => navigate(`/tracking/${order.id}?review=true`)}
          variant="outline"
          className="w-full h-9 text-xs border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          data-testid={`button-review-${order.id}`}
        >
          <Star className="w-3.5 h-3.5 mr-1" /> Leave a Review
        </Button>
      )}
    </GlassCard>
  );
}