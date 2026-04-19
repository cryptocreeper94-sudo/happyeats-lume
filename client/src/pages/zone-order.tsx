import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Star, Plus, Minus, ShoppingCart, MapPin,
  Truck, CreditCard, User, Phone, Mail, FileText, Check,
  ChevronDown, ChevronUp, AlertCircle, Timer, Utensils, Loader2, Map,
  Trash2, Heart, BookmarkPlus
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/context";
import { InfoBubble } from "@/components/info-bubble";
import { saveActiveOrders } from "@/components/floating-order-tracker";

const SERVICE_FEE_RATE = 0.20;
const TAX_RATE = 0.10;
const DELIVERY_FEE = 3.99;
const TIP_OPTIONS = [
  { label: "15%", value: 0.15 },
  { label: "20%", value: 0.20 },
  { label: "25%", value: 0.25 },
  { label: "Custom", value: "custom" as const },
];

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (navigator.vibrate) {
    navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 40);
  }
};

function createExitIcon() {
  return L.divIcon({
    className: "custom-exit-marker",
    html: `<div style="width:12px;height:12px;border-radius:50%;background:#f97316;border:2px solid #c2410c;box-shadow:0 0 8px rgba(249,115,22,0.5)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function FitExitBounds({ exits }: { exits: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (exits.length === 0) return;
    const bounds = L.latLngBounds(exits.map(e => [e.lat, e.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [exits, map]);
  return null;
}

interface CartItem {
  truckId: number;
  truckName: string;
  itemId: number;
  name: string;
  description: string;
  price: number;
  qty: number;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

interface FoodTruckData {
  id: number;
  name: string;
  cuisine: string | null;
  description: string | null;
  rating: string | null;
  menu: MenuItem[];
  logoUrl?: string | null;
  healthInspectionScore?: string | null;
  healthInspectionGrade?: string | null;
  operatingHoursStart?: string | null;
  operatingHoursEnd?: string | null;
}

interface BatchWindow {
  cutoffTime: string;
  pickupTime: string;
  deliveryTime: string;
  label: string;
}

interface ZoneData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  cutoffTime: string | null;
  dinnerCutoffTime: string | null;
  batchWindows: BatchWindow[] | null;
  exits: Array<{ exit: number; name: string; lat: number; lng: number }> | null;
  isActive: boolean | null;
  deliveryMode: string | null;
  lunchDeliveryTime: string | null;
  dinnerDeliveryTime: string | null;
  operatingHoursStart: string | null;
  operatingHoursEnd: string | null;
}

function AnimatedPrice({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 400;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevValue.current = value;
  }, [value]);
  return <span>{prefix}{display.toFixed(2)}</span>;
}

function getTimeUntilCutoff(cutoffTime: string): { hours: number; minutes: number; seconds: number; isPast: boolean; progress: number } {
  const now = new Date();
  const [h, m] = cutoffTime.split(":").map(Number);
  const cutoff = new Date(now);
  cutoff.setHours(h, m, 0, 0);

  const diff = cutoff.getTime() - now.getTime();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isPast: true, progress: 100 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const totalWindow = cutoff.getTime() - startOfDay.getTime();
  const elapsed = now.getTime() - startOfDay.getTime();
  const progress = Math.min(100, (elapsed / totalWindow) * 100);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: false,
    progress,
  };
}

function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function SkeletonTruckCard() {
  return (
    <Card className={`${GLASS_CARD} overflow-hidden`}>
      <div className="p-4 flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16 rounded-full bg-white/10" />
            <Skeleton className="h-3 w-10 bg-white/10" />
          </div>
          <Skeleton className="h-3 w-48 bg-white/10" />
        </div>
        <Skeleton className="w-4 h-4 bg-white/10" />
      </div>
    </Card>
  );
}

function SkeletonLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-40 bg-white/10" />
              <Skeleton className="h-5 w-24 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-4 w-64 bg-white/10" />
            <Skeleton className="h-3 w-80 bg-white/10" />
          </div>
        </div>

        <Card className={GLASS_CARD}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48 bg-white/10" />
              <Skeleton className="h-4 w-4 bg-white/10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full bg-white/10" />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <SkeletonTruckCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ZoneOrderPage() {
  const params = useParams<{ zoneSlug: string }>();
  const [, setLocation] = useLocation();
  const zoneSlug = params.zoneSlug;
  const { t } = useLanguage();

  const cartKey = `sandbox-cart-${zoneSlug}`;
  const formKey = `sandbox-form`;

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { const s = sessionStorage.getItem(cartKey); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [expandedTruck, setExpandedTruck] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<number | "custom">(0.25);
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isPast: false, progress: 0 });
  const [form, setForm] = useState(() => {
    try { const s = sessionStorage.getItem(formKey); return s ? JSON.parse(s) : { name: "", phone: "", email: "", address: "", city: "", state: "TN", zip: "", instructions: "" }; } catch { return { name: "", phone: "", email: "", address: "", city: "", state: "TN", zip: "", instructions: "" }; }
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderIds, setPlacedOrderIds] = useState<number[]>([]);
  const [scheduledDeliveryTime, setScheduledDeliveryTime] = useState("ASAP");
  const [stripeRedirecting, setStripeRedirecting] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ valid: boolean; promo: any; discount: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [rewardCredit, setRewardCredit] = useState(0);
  const [rewardBalance, setRewardBalance] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("paid") === "true") {
      const orderParam = urlParams.getAll("order");
      if (orderParam.length > 0) {
        setPlacedOrderIds(orderParam.map(Number));
      }
      setOrderPlaced(true);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("happyeats_customer");
      if (raw) {
        const c = JSON.parse(raw);
        if (c.name || c.phone) {
          setForm((prev: any) => ({
            ...prev,
            name: prev.name || c.name || "",
            phone: prev.phone || c.phone || "",
            email: prev.email || c.email || "",
            address: prev.address || c.deliveryAddress || "",
            instructions: prev.instructions || c.deliveryInstructions || "",
          }));
        }
      if (c.id) {
          fetch(`/api/rewards/${c.id}`).then(r => r.json()).then(data => {
            if (data?.rewardBalance) setRewardBalance(Number(data.rewardBalance));
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), orderTotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoResult(data);
        setPromoError("");
      } else {
        setPromoResult(null);
        setPromoError(data.error || "Invalid promo code");
      }
    } catch {
      setPromoError("Failed to validate code");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setPromoResult(null);
    setPromoCode("");
    setPromoError("");
  };

  useEffect(() => { sessionStorage.setItem(cartKey, JSON.stringify(cart)); }, [cart, cartKey]);
  useEffect(() => { sessionStorage.setItem(formKey, JSON.stringify(form)); }, [form]);
  const prevCartCount = useRef(0);
  const [cartBounce, setCartBounce] = useState(false);

  const { data: zone, isLoading: zoneLoading } = useQuery<ZoneData>({
    queryKey: ["zone", zoneSlug],
    queryFn: async () => {
      const res = await fetch(`/api/zones/${zoneSlug}`);
      if (!res.ok) throw new Error("Zone not found");
      return res.json();
    },
    enabled: !!zoneSlug,
  });

  const { data: trucks = [], isLoading: trucksLoading } = useQuery<FoodTruckData[]>({
    queryKey: ["zone-trucks", zone?.id],
    queryFn: async () => {
      const res = await fetch(`/api/food-trucks/zone/${zone!.id}`);
      if (!res.ok) throw new Error("Failed to load trucks");
      return res.json();
    },
    enabled: !!zone?.id,
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const { data: availability = [] } = useQuery<Array<{ foodTruckId: number; status: string; locationAddress: string | null }>>({
    queryKey: ["truck-availability", todayStr],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${todayStr}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const [vendorRatings, setVendorRatings] = useState<Record<number, number>>({});
  const [vendorReviews, setVendorReviews] = useState<Record<number, any[]>>({});
  const [vendorReviewCounts, setVendorReviewCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (trucks.length > 0) {
      trucks.forEach((truck) => {
        fetch(`/api/order-reviews/vendor/${truck.id}/average`)
          .then((r) => r.json())
          .then((data) => {
            if (data?.averageRating) {
              setVendorRatings((prev) => ({ ...prev, [truck.id]: parseFloat(data.averageRating) }));
            }
            if (data?.totalReviews) {
              setVendorReviewCounts((prev) => ({ ...prev, [truck.id]: data.totalReviews }));
            }
          })
          .catch(() => {});
        fetch(`/api/order-reviews/vendor/${truck.id}`)
          .then((r) => r.json())
          .then((reviews) => {
            if (Array.isArray(reviews) && reviews.length > 0) {
              setVendorReviews((prev) => ({ ...prev, [truck.id]: reviews.slice(0, 5) }));
            }
          })
          .catch(() => {});
      });
    }
  }, [trucks]);

  const confirmedTruckIds = new Set(availability.filter(a => a.status === "confirmed").map(a => a.foodTruckId));

  const availableTrucks = useMemo(() => {
    return trucks.filter(t => {
      const truck = t as any;
      if (truck.locationType === "permanent") return true;
      return confirmedTruckIds.has(t.id);
    });
  }, [trucks, confirmedTruckIds]);

  const batchWindows = zone?.batchWindows;
  const hasBatchWindows = batchWindows && batchWindows.length > 0;

  const nextWindowInfo = useMemo(() => {
    if (!hasBatchWindows) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const win of batchWindows!) {
      const [h, m] = win.cutoffTime.split(":").map(Number);
      if (currentMinutes <= h * 60 + m) return win;
    }
    return null;
  }, [hasBatchWindows, batchWindows, countdown]);

  // For one-off (non-batch) zones, use operating hours end as the cutoff
  const isOneOff = zone?.deliveryMode === 'one-off';
  const cutoffTime = isOneOff
    ? (zone?.operatingHoursEnd || "23:00")
    : (nextWindowInfo?.cutoffTime || zone?.cutoffTime || "11:00");

  useEffect(() => {
    if (isOneOff) {
      // For one-off zones, just check if we're within operating hours
      const update = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [endH, endM] = (zone?.operatingHoursEnd || "23:00").split(":").map(Number);
        const [startH, startM] = (zone?.operatingHoursStart || "06:00").split(":").map(Number);
        const endMinutes = endH * 60 + endM;
        const startMinutes = startH * 60 + startM;
        // One-off zones are always open for ordering — time is informational only
        const isPast = false;
        const totalWindow = endMinutes - startMinutes;
        const elapsed = currentMinutes - startMinutes;
        const progress = Math.min(Math.max((elapsed / totalWindow) * 100, 0), 100);
        const remaining = endMinutes - currentMinutes;
        setCountdown({
          hours: Math.floor(remaining / 60),
          minutes: remaining % 60,
          seconds: 0,
          isPast,
          progress,
        });
      };
      update();
      const interval = setInterval(update, 60000); // update every minute for one-off
      return () => clearInterval(interval);
    } else {
      const update = () => setCountdown(getTimeUntilCutoff(cutoffTime));
      update();
      const interval = setInterval(update, 1000);
      return () => clearInterval(interval);
    }
  }, [cutoffTime, isOneOff, zone]);

  const menuTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);
  const serviceFee = menuTotal * SERVICE_FEE_RATE;
  const tax = menuTotal * TAX_RATE;
  const subtotal = menuTotal + serviceFee + tax;
  const tipAmount = selectedTip === "custom" ? (parseFloat(customTipAmount) || 0) : menuTotal * selectedTip;
  const promoDiscount = promoResult ? parseFloat(promoResult.discount) : 0;
  const grandTotal = Math.max(0, subtotal + DELIVERY_FEE + tipAmount - promoDiscount - rewardCredit);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    if (cartCount !== prevCartCount.current && cartCount > 0) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 300);
      return () => clearTimeout(t);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const cartByTruck = useMemo(() => {
    const map = new globalThis.Map<number, { truckName: string; items: CartItem[] }>();
    cart.forEach((item) => {
      if (!map.has(item.truckId)) map.set(item.truckId, { truckName: item.truckName, items: [] });
      map.get(item.truckId)!.items.push(item);
    });
    return map;
  }, [cart]);

  const addToCart = (truck: FoodTruckData, item: MenuItem) => {
    haptic('light');
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === item.id && c.truckId === truck.id);
      if (existing) return prev.map((c) => (c.itemId === item.id && c.truckId === truck.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { truckId: truck.id, truckName: truck.name, itemId: item.id, name: item.name, description: item.description || '', price: item.price, qty: 1 }];
    });
  };

  const updateQty = (truckId: number, itemId: number, delta: number) => {
    haptic('light');
    setCart((prev) => {
      return prev
        .map((c) => (c.itemId === itemId && c.truckId === truckId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0);
    });
  };

  const getItemQty = (truckId: number, itemId: number) => {
    return cart.find((c) => c.truckId === truckId && c.itemId === itemId)?.qty || 0;
  };

  const createOrder = useMutation({
    mutationFn: async (orders: any[]) => {
      const results = [];
      for (const orderData of orders) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Failed to create order (${res.status})`);
        }
        results.push(await res.json());
      }
      return results;
    },
    onSuccess: async (data) => {
      haptic('heavy');
      toast({ title: "Redirecting to payment...", description: "Please complete your payment to confirm." });
      const orderIds = data.map((o: any) => o.id);
      setPlacedOrderIds(orderIds);
      saveActiveOrders(orderIds);
      setCart([]);
      setReviewOpen(false);
      setStripeRedirecting(true);

      const allItems = data.flatMap((o: any) => {
        const items = o.items || [];
        return items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.qty || 1,
        }));
      });

      const aggregatedSubtotal = data.reduce((sum: number, o: any) => sum + parseFloat(o.subtotal || "0"), 0);
      const aggregatedServiceFee = data.reduce((sum: number, o: any) => sum + parseFloat(o.serviceFee || "0"), 0);
      const aggregatedTax = data.reduce((sum: number, o: any) => sum + parseFloat(o.tax || "0"), 0);
      const aggregatedDeliveryFee = data.reduce((sum: number, o: any) => sum + parseFloat(o.deliveryFee || "0"), 0);
      const aggregatedTotal = data.reduce((sum: number, o: any) => sum + parseFloat(o.total || "0"), 0);
      const vendorNames = data.map((o: any) => o.locationName).filter(Boolean).join(", ");

      try {
        const stripeRes = await fetch("/api/stripe/create-order-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderIds,
            customerEmail: form.email || undefined,
            customerName: form.name,
            vendorName: vendorNames,
            orderType: "food",
            items: allItems,
            subtotal: aggregatedSubtotal.toFixed(2),
            serviceFee: aggregatedServiceFee.toFixed(2),
            tax: aggregatedTax.toFixed(2),
            deliveryFee: aggregatedDeliveryFee.toFixed(2),
            total: aggregatedTotal.toFixed(2),
          }),
        });

        if (!stripeRes.ok) throw new Error("Failed to create checkout session");
        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          window.location.href = stripeData.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (err) {
        setStripeRedirecting(false);
        toast({ title: "Payment Error", description: "Could not redirect to payment. Your order has been saved.", variant: "destructive" });
        setOrderPlaced(true);
      }
    },
    onError: (err: any) => {
      toast({ title: t("common.error"), description: err?.message || t("order.orderError"), variant: "destructive" });
    },
  });

  // Alcohol detection
  const ALCOHOL_KEYWORDS = ['alcohol', 'beer', 'wine', 'liquor', 'spirits', 'cocktail', 'bourbon', 'whiskey', 'vodka', 'tequila', 'rum', 'gin', 'seltzer', 'hard', 'ipa', 'lager', 'ale', 'malt'];
  const cartContainsAlcohol = cart.some(item =>
    ALCOHOL_KEYWORDS.some(kw => item.name.toLowerCase().includes(kw))
  );

  const handlePlaceOrder = () => {
    haptic('medium');
    if (!form.name || !form.phone || !form.address) {
      toast({ title: t("order.missingInfo"), description: t("order.fillRequired"), variant: "destructive" });
      return;
    }
    // HARD BLOCK: Alcohol cannot be delivered to non-residential addresses
    if (cartContainsAlcohol && !form.isResidential) {
      toast({
        title: "⚠️ Alcohol — Residential Only",
        description: "By law, alcohol can only be delivered to a residential address. Please update your delivery address or remove alcohol items.",
        variant: "destructive",
      });
      return;
    }
    // HARD BLOCK: Age verification required for alcohol
    if (cartContainsAlcohol && !form.ageVerificationPhoto) {
      toast({
        title: "🪪 ID Required for Alcohol",
        description: "Please upload a photo of your government-issued ID to verify you are 21+.",
        variant: "destructive",
      });
      return;
    }
    if (!zone) return;

    const truckIds = Array.from(cartByTruck.keys());
    const orders = truckIds.map((truckId) => {
      const group = cartByTruck.get(truckId)!;
      const truckMenuTotal = group.items.reduce((s, i) => s + i.price * i.qty, 0);
      const proportion = menuTotal > 0 ? truckMenuTotal / menuTotal : 1 / truckIds.length;
      const truckServiceFee = truckMenuTotal * SERVICE_FEE_RATE;
      const truckTax = truckMenuTotal * TAX_RATE;
      const truckSubtotal = truckMenuTotal + truckServiceFee + truckTax;
      const truckDeliveryFee = DELIVERY_FEE * proportion;
      const truckTip = tipAmount * proportion;
      const truckTotal = truckSubtotal + truckDeliveryFee + truckTip;

      const promoDiscountProportion = promoDiscount * proportion;
      const rewardCreditProportion = rewardCredit * proportion;
      const adjustedTotal = Math.max(0, truckTotal - promoDiscountProportion - rewardCreditProportion);

      let customerId: number | undefined;
      try {
        const raw = localStorage.getItem("happyeats_customer");
        if (raw) customerId = JSON.parse(raw)?.id;
      } catch {}

      return {
        tenantId: 1,
        foodTruckId: truckId,
        zoneId: zone.id,
        locationName: group.truckName,
        items: group.items.map((i) => ({ id: i.itemId, name: i.name, qty: i.qty, price: i.price })),
        menuTotal: truckMenuTotal.toFixed(2),
        serviceFee: truckServiceFee.toFixed(2),
        tax: truckTax.toFixed(2),
        subtotal: truckSubtotal.toFixed(2),
        deliveryFee: truckDeliveryFee.toFixed(2),
        tipAmount: truckTip.toFixed(2),
        total: adjustedTotal.toFixed(2),
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email || undefined,
        deliveryAddress: [form.address, form.city, form.state, form.zip].filter(Boolean).join(', '),
        deliveryInstructions: form.instructions || undefined,
        shoppingList: form.shoppingList || undefined,
        customerVerificationPhotoUrl: form.verificationPhoto || undefined,
        ageVerificationPhotoUrl: form.ageVerificationPhoto || undefined,
        containsAlcohol: cartContainsAlcohol || false,
        isResidentialDelivery: form.isResidential !== false,
        status: "pending",
        vendorStatus: "pending",
        batchId: `batch-${zone.slug}-${new Date().toISOString().split("T")[0]}`,
        scheduledDeliveryTime: scheduledDeliveryTime !== "ASAP" ? scheduledDeliveryTime : undefined,
        orderType: zone.deliveryMode === "one-off" ? "one-off" : "batch",
        customerId: customerId || undefined,
        promoCodeId: promoResult?.promo?.id || undefined,
        // rewardCreditApplied: not yet in production DB
      };
    });

    createOrder.mutate(orders);
  };

  if (stripeRedirecting) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={`${GLASS_CARD} border-orange-500/30 max-w-md w-full`}>
            <CardContent className="p-8 text-center space-y-4">
              <Loader2 className="size-10 text-orange-400 animate-spin mx-auto" />
              <h2 className="text-xl font-bold text-white">Redirecting to Payment...</h2>
              <p className="text-slate-400 text-sm">You will be redirected to our secure payment page.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className={`${GLASS_CARD} border-emerald-500/30 max-w-md w-full`} data-testid="card-confirmation">
            <CardContent className="p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto"
              >
                <Check className="size-10 text-emerald-400" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-white"
              >
                Order Confirmed! Payment received.
              </motion.h2>
              <p className="text-slate-400 text-sm">Your order is being prepared. You can track it below.</p>
              <div className="pt-4 space-y-2">
                {placedOrderIds.length === 1 && (
                  <Link href={`/tracking?order=${placedOrderIds[0]}`}>
                    <Button
                      data-testid="button-track-order"
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                      Track Your Order
                    </Button>
                  </Link>
                )}
                {placedOrderIds.length > 1 && (
                  <div className="space-y-2">
                    {placedOrderIds.map((id, i) => (
                      <Link key={id} href={`/tracking?order=${id}`}>
                        <Button
                          data-testid={`button-track-order-${id}`}
                          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                        >
                          Track Order #{i + 1}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
                <Button
                  data-testid="button-order-again"
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                  onClick={() => setOrderPlaced(false)}
                >
                  {t("order.orderAgain")}
                </Button>
                <Link href="/">
                  <Button data-testid="button-go-home" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (zoneLoading || trucksLoading) {
    return <SkeletonLoading />;
  }

  if (!zone) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4" data-testid="zone-not-found">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${GLASS_CARD} border-red-500/30 max-w-md w-full`}>
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="size-12 text-red-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">{t("order.zoneNotFound")}</h2>
              <p className="text-slate-400 text-sm">{t("order.zoneNotFoundDesc", { slug: zoneSlug || "" })}</p>
              <Link href="/sandbox">
                <Button data-testid="button-back-sandbox" className="bg-gradient-to-r from-orange-500 to-rose-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]">{t("order.backToSandbox")}</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const groupMenuByCategory = (menu: MenuItem[]) => {
    const groups: Record<string, MenuItem[]> = {};
    menu.filter((m) => m.isAvailable).forEach((item) => {
      const cat = item.category || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto px-4 py-6 pb-32 space-y-5"
      >
        {/* Zone Header */}
        <div className="flex items-start gap-3" data-testid="zone-header">
          <Link href="/sandbox">
            <Button data-testid="button-back" variant="ghost" size="icon" className="text-slate-400 hover:text-white shrink-0 mt-0.5 transition-all duration-300 hover:bg-white/10">
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-white" data-testid="text-zone-name">{zone.name}</h1>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.05, 1] }}
                transition={{ duration: 0.4 }}
              >
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] uppercase tracking-wider" data-testid="badge-live">
                  LIVE
                </Badge>
              </motion.div>
            </div>
            {zone.description && <p className="text-sm text-slate-400 mt-1" data-testid="text-zone-description">{zone.description}</p>}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
              <Truck className="size-3.5" />
              <span>
                {zone.deliveryMode === "one-off"
                  ? t("order.oneOffInfo", { start: zone.operatingHoursStart || "8 AM", end: zone.operatingHoursEnd || "8 PM" })
                  : hasBatchWindows
                    ? `${batchWindows!.length} pickup windows today${nextWindowInfo ? ` · Next: ${nextWindowInfo.label}` : " · All windows closed"}`
                    : t("order.batchOrderInfo", { time: cutoffTime.replace(/^0/, "") })}
              </span>
            </div>
          </div>
        </div>

        {/* Exit Badges */}
        {zone.exits && zone.exits.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {zone.exits.map((exit) => (
              <Badge
                key={exit.exit}
                variant="outline"
                className="border-white/10 text-slate-400 text-[10px] whitespace-nowrap shrink-0 transition-all duration-300 hover:border-orange-500/30 hover:text-orange-300"
              >
                <MapPin className="size-3 mr-1" />
                {t("order.exit")} {exit.exit} — {exit.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Inline Zone Map */}
        {zone.exits && zone.exits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className={`${GLASS_CARD} overflow-hidden`} data-testid="card-zone-map">
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                <Map className="size-4 text-orange-400" />
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">Delivery Zone</span>
                <span className="text-[10px] text-white/30 ml-auto">{zone.exits.length} exits</span>
              </div>
              <style>{`
                .zone-order-map .leaflet-container { background: #0f172a !important; border-radius: 0 0 12px 12px; }
                .zone-order-map .leaflet-tile-pane { filter: brightness(0.6) saturate(0.3) hue-rotate(180deg) invert(1); }
                .zone-order-map .leaflet-control-zoom a { background: rgba(15,23,42,0.9) !important; color: #fff !important; border-color: rgba(255,255,255,0.1) !important; }
                .zone-order-map .leaflet-control-attribution { display: none !important; }
                .zone-order-map .leaflet-popup-content-wrapper { background: rgba(15,23,42,0.95); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
                .zone-order-map .leaflet-popup-tip { background: rgba(15,23,42,0.95); }
              `}</style>
              <div className="zone-order-map" style={{ height: '200px' }}>
                <MapContainer
                  center={[zone.exits[0].lat, zone.exits[0].lng]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  dragging={true}
                  touchZoom={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FitExitBounds exits={zone.exits} />
                  {zone.exits.map((exit, i) => (
                    <Marker key={i} position={[exit.lat, exit.lng]} icon={createExitIcon()}>
                      <Popup>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {exit.exit > 0 ? `Exit ${exit.exit}` : exit.name}
                        </div>
                        {exit.exit > 0 && <div style={{ fontSize: '10px', opacity: 0.7 }}>{exit.name}</div>}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-[10px]" data-testid="banner-coming-soon">
          <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
            <Clock className="size-3" /> Coming Soon
          </span>
          <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2 py-0.5">
            <Phone className="size-3" /> SMS notifications coming soon
          </span>
          <span className="inline-flex items-center gap-1 text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
            <Star className="size-3" /> Native apps coming to Google Play & App Store
          </span>
        </div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={`${GLASS_CARD} ${countdown.isPast ? "border-amber-500/20" : "border-emerald-500/20"}`} data-testid="card-countdown">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`relative flex items-center justify-center ${countdown.isPast ? "" : ""}`}>
                    <Timer className={`size-5 ${countdown.isPast ? "text-amber-400" : "text-emerald-400"}`} />
                    {!countdown.isPast && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  {countdown.isPast ? (
                    <span className="text-sm text-amber-300" data-testid="text-cutoff-closed">
                      {hasBatchWindows && !nextWindowInfo
                        ? "All batch windows closed for today"
                        : t("order.lunchOrdersClosed", { time: zone.dinnerCutoffTime || "5:00" })}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1" data-testid="text-cutoff-open">
                      <span className="text-sm text-slate-400">{t("order.closesIn")}</span>
                      <div className="flex items-center gap-0.5 ml-1">
                        <span className="font-mono font-bold text-lg text-emerald-300 bg-emerald-500/10 rounded px-1.5 py-0.5 min-w-[2ch] text-center">
                          {countdown.hours}
                        </span>
                        <motion.span
                          className="text-emerald-400 font-bold"
                          animate={{ opacity: [1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >:</motion.span>
                        <span className="font-mono font-bold text-lg text-emerald-300 bg-emerald-500/10 rounded px-1.5 py-0.5 min-w-[2ch] text-center">
                          {String(countdown.minutes).padStart(2, "0")}
                        </span>
                        <motion.span
                          className="text-emerald-400 font-bold"
                          animate={{ opacity: [1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >:</motion.span>
                        <span className="font-mono font-bold text-lg text-emerald-300 bg-emerald-500/10 rounded px-1.5 py-0.5 min-w-[2ch] text-center">
                          {String(countdown.seconds).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Clock className="size-4 text-slate-500" />
                <InfoBubble
                  title={{ en: "Batch Ordering Windows", es: "Ventanas de Pedidos por Lotes" }}
                  content={{
                    en: hasBatchWindows
                      ? `Orders are collected in batches for efficient delivery:\n\n${batchWindows!.map(w => {
                          const fmt = (t: string) => { const [h, m] = t.split(":").map(Number); return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
                          return `• ${w.label}: Place by ${fmt(w.cutoffTime)} → Pickup ${fmt(w.pickupTime)} → Delivered by ${fmt(w.deliveryTime)}`;
                        }).join("\n")}\n\nThe countdown shows time remaining before the next available window.`
                      : "Orders are collected in batches for efficient delivery:\n\n• Lunch Batch: Place by 10:30 AM → Delivered around noon\n• Dinner Batch: Place by 5:00 PM → Delivered around 6:30 PM\n\nAfter the cutoff time, you can still place one-off orders for direct delivery within the local corridor. The countdown shows time remaining before the next cutoff.",
                    es: "Los pedidos se recopilan en lotes para entregas eficientes. La cuenta regresiva muestra el tiempo restante antes del próximo corte."
                  }}
                  manualSection="getting-started"
                />
              </div>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden" data-testid="progress-countdown">
                <motion.div
                  className={`h-full rounded-full ${countdown.isPast ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"}`}
                  style={{ width: `${countdown.progress}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
              {zone.deliveryMode !== "one-off" && hasBatchWindows && (
                <div className={`mt-3 grid gap-2 ${batchWindows!.length <= 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`} data-testid="batch-windows">
                  {batchWindows!.map((win, idx) => {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    const [wH, wM] = win.cutoffTime.split(":").map(Number);
                    const isPast = currentMinutes > wH * 60 + wM;
                    const isNext = nextWindowInfo?.cutoffTime === win.cutoffTime;
                    const colorSets = [
                      { activeBg: "bg-orange-500/10", activeBorder: "border-orange-500/30 ring-1 ring-orange-500/20", normalBg: "bg-orange-500/5", normalBorder: "border-orange-500/10", iconBg: "bg-orange-500/15", iconText: "text-orange-400", labelText: "text-orange-300", badgeBg: "bg-orange-500/20" },
                      { activeBg: "bg-violet-500/10", activeBorder: "border-violet-500/30 ring-1 ring-violet-500/20", normalBg: "bg-violet-500/5", normalBorder: "border-violet-500/10", iconBg: "bg-violet-500/15", iconText: "text-violet-400", labelText: "text-violet-300", badgeBg: "bg-violet-500/20" },
                      { activeBg: "bg-cyan-500/10", activeBorder: "border-cyan-500/30 ring-1 ring-cyan-500/20", normalBg: "bg-cyan-500/5", normalBorder: "border-cyan-500/10", iconBg: "bg-cyan-500/15", iconText: "text-cyan-400", labelText: "text-cyan-300", badgeBg: "bg-cyan-500/20" },
                      { activeBg: "bg-emerald-500/10", activeBorder: "border-emerald-500/30 ring-1 ring-emerald-500/20", normalBg: "bg-emerald-500/5", normalBorder: "border-emerald-500/10", iconBg: "bg-emerald-500/15", iconText: "text-emerald-400", labelText: "text-emerald-300", badgeBg: "bg-emerald-500/20" },
                    ];
                    const c = colorSets[idx % colorSets.length];
                    const formatTime = (t: string) => {
                      const [h, m] = t.split(":").map(Number);
                      const ampm = h >= 12 ? "PM" : "AM";
                      const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                      return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
                    };
                    return (
                      <div
                        key={win.cutoffTime}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 ${
                          isPast
                            ? "bg-white/[0.02] border-white/5 opacity-50"
                            : isNext
                              ? `${c.activeBg} ${c.activeBorder}`
                              : `${c.normalBg} ${c.normalBorder}`
                        }`}
                        data-testid={`batch-window-${idx}`}
                      >
                        <div className={`size-6 rounded flex items-center justify-center shrink-0 ${isPast ? "bg-white/5" : c.iconBg}`}>
                          {isPast ? (
                            <Check className="size-3 text-slate-500" />
                          ) : (
                            <Clock className={`size-3 ${c.iconText}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-[10px] font-bold ${isPast ? "text-slate-500 line-through" : c.labelText}`}>
                              {win.label}
                            </p>
                            {isPast && (
                              <span className="text-[8px] bg-white/5 text-slate-500 px-1 rounded">CLOSED</span>
                            )}
                            {isNext && !isPast && (
                              <span className={`text-[8px] ${c.badgeBg} ${c.labelText} px-1 rounded animate-pulse`}>NEXT</span>
                            )}
                          </div>
                          <p className="text-[9px] text-slate-500">
                            Order by {formatTime(win.cutoffTime)} · Pickup {formatTime(win.pickupTime)} · Delivery {formatTime(win.deliveryTime)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {zone.deliveryMode !== "one-off" && !hasBatchWindows && (
                <div className="mt-3 grid grid-cols-2 gap-2" data-testid="batch-windows">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                    <div className="size-6 rounded bg-orange-500/15 flex items-center justify-center shrink-0">
                      <Clock className="size-3 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-orange-300">Lunch Batch</p>
                      <p className="text-[9px] text-slate-500">Orders by {zone.cutoffTime || "10:30"} → Delivered by {zone.lunchDeliveryTime || "12:00"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/5 border border-violet-500/10">
                    <div className="size-6 rounded bg-violet-500/15 flex items-center justify-center shrink-0">
                      <Clock className="size-3 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-violet-300">Dinner Batch</p>
                      <p className="text-[9px] text-slate-500">Orders by {zone.dinnerCutoffTime || "17:00"} → Delivered by {zone.dinnerDeliveryTime || "18:00"}</p>
                    </div>
                  </div>
                </div>
              )}
              {zone.deliveryMode === "one-off" && (
                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/10" data-testid="oneoff-info">
                  <div className="size-6 rounded bg-cyan-500/15 flex items-center justify-center shrink-0">
                    <Truck className="size-3 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-cyan-300">Individual Delivery</p>
                    <p className="text-[9px] text-slate-500">Order anytime • Typically 30-45 min delivery</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Food Truck List */}
        <div className="space-y-4" data-testid="truck-list">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Utensils className="size-4" />
            {t("order.foodTrucks")} ({availableTrucks.length}{availableTrucks.length < trucks.length ? ` ${t("order.ofConfirmed", { total: String(trucks.length) })}` : ""})
          </h2>

          {availableTrucks.length === 0 && (
            <Card className={GLASS_CARD}>
              <CardContent className="p-6 text-center">
                <Utensils className="size-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">{t("order.noFoodTrucks")}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableTrucks.map((truck, index) => {
              const isExpanded = expandedTruck === truck.id;
              const truckCartCount = cart.filter((c) => c.truckId === truck.id).reduce((s, c) => s + c.qty, 0);
              const grouped = groupMenuByCategory(truck.menu || []);

              return (
                <motion.div
                  key={truck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={isExpanded ? "md:col-span-2 lg:col-span-3" : ""}
                >
                  <Card
                    className={`${GLASS_CARD} overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(255,120,73,0.15)] hover:-translate-y-1`}
                    data-testid={`card-truck-${truck.id}`}
                  >
                    <button
                      className="w-full text-left p-4 flex items-center gap-3 hover:bg-white/5 transition-all duration-300"
                      onClick={() => setExpandedTruck(isExpanded ? null : truck.id)}
                      data-testid={`button-toggle-truck-${truck.id}`}
                    >
                      {truck.logoUrl ? (
                        <div className="w-12 h-12 rounded-xl border border-white/20 overflow-hidden shrink-0 bg-white/5">
                          <img src={truck.logoUrl} alt={truck.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                          <Utensils className="size-5 text-orange-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate" data-testid={`text-truck-name-${truck.id}`}>{truck.name}</span>
                          {truck.healthInspectionGrade && (
                            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] shrink-0" data-testid={`badge-health-${truck.id}`}>
                              {t("vendor.healthBadge")}: {truck.healthInspectionGrade}
                              {truck.healthInspectionScore && ` (${parseFloat(truck.healthInspectionScore).toFixed(0)})`}
                            </Badge>
                          )}
                          <AnimatePresence>
                            {truckCartCount > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px]" data-testid={`badge-truck-cart-${truck.id}`}>
                                  {truckCartCount} {t("order.inCart")}
                                </Badge>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {truck.cuisine && (
                            <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400" data-testid={`badge-cuisine-${truck.id}`}>
                              {truck.cuisine}
                            </Badge>
                          )}
                          {vendorRatings[truck.id] ? (
                            <span className="flex items-center gap-0.5 text-xs text-amber-400" data-testid={`text-rating-${truck.id}`}>
                              <span className="text-amber-400">★</span> {vendorRatings[truck.id].toFixed(1)}
                              {vendorReviewCounts[truck.id] && (
                                <span className="text-white/30 ml-0.5">({vendorReviewCounts[truck.id]})</span>
                              )}
                            </span>
                          ) : truck.rating ? (
                            <span className="flex items-center gap-0.5 text-xs text-amber-400" data-testid={`text-rating-${truck.id}`}>
                              <Star className="size-3 fill-amber-400 text-amber-400" /> {parseFloat(truck.rating).toFixed(1)}
                            </span>
                          ) : null}
                        </div>
                        {truck.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{truck.description}</p>}
                        {(truck.operatingHoursStart || truck.operatingHoursEnd) && (
                          <div className="flex items-center gap-1 mt-1" data-testid={`text-hours-${truck.id}`}>
                            <Clock className="size-3 text-cyan-400" />
                            <span className="text-[10px] text-cyan-300">
                              {truck.operatingHoursStart ? formatTime(truck.operatingHoursStart) : "Open"} – {truck.operatingHoursEnd ? formatTime(truck.operatingHoursEnd) : "Close"}
                            </span>
                          </div>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="size-4 text-slate-500 shrink-0" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/5 bg-[#0a1628]/60" data-testid={`menu-truck-${truck.id}`}>
                            {Object.keys(grouped).length === 0 && (
                              <div className="p-4 text-center text-sm text-slate-500">{t("order.noMenuItems")}</div>
                            )}
                            {Object.entries(grouped).map(([category, items]) => (
                              <div key={category}>
                                <div className="px-4 py-2 bg-white/[0.03] border-l-2 border-orange-500/50 sticky top-0 z-10 backdrop-blur-sm">
                                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider" data-testid={`text-category-${truck.id}-${category}`}>
                                    {category}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                                  {items.map((item, itemIndex) => {
                                    const qty = getItemQty(truck.id, item.id);
                                    return (
                                      <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: itemIndex * 0.05 }}
                                        className="px-4 py-3 flex items-center gap-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all duration-300"
                                        data-testid={`menu-item-${item.id}`}
                                      >
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-white" data-testid={`text-item-name-${item.id}`}>{item.name}</p>
                                          {item.description && <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>}
                                          <p className="text-sm font-semibold text-orange-400 mt-0.5" data-testid={`text-item-price-${item.id}`}>
                                            ${item.price.toFixed(2)}
                                          </p>
                                        </div>
                                        {qty === 0 ? (
                                          <motion.div whileTap={{ scale: 0.95 }}>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50 h-8 px-3 transition-all duration-300"
                                              onClick={() => addToCart(truck, item)}
                                              disabled={!isOneOff && countdown.isPast}
                                              data-testid={`button-add-item-${item.id}`}
                                            >
                                              <Plus className="size-3.5 mr-1" /> {(!isOneOff && countdown.isPast) ? t("order.closed") : t("order.add")}
                                            </Button>
                                          </motion.div>
                                        ) : (
                                          <div className="flex items-center gap-1" data-testid={`qty-controls-${item.id}`}>
                                            <motion.div whileTap={{ scale: 0.9 }}>
                                              <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-7 w-7 border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                                                onClick={() => updateQty(truck.id, item.id, -1)}
                                                data-testid={`button-minus-${item.id}`}
                                              >
                                                <Minus className="size-3" />
                                              </Button>
                                            </motion.div>
                                            <motion.span
                                              key={qty}
                                              initial={{ scale: 1.3 }}
                                              animate={{ scale: 1 }}
                                              className="text-sm text-white font-semibold w-6 text-center"
                                              data-testid={`text-qty-${item.id}`}
                                            >
                                              {qty}
                                            </motion.span>
                                            <motion.div whileTap={{ scale: 0.9 }}>
                                              <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-7 w-7 border-white/10 text-white hover:bg-white/10 transition-all duration-300"
                                                onClick={() => updateQty(truck.id, item.id, 1)}
                                                data-testid={`button-plus-${item.id}`}
                                              >
                                                <Plus className="size-3" />
                                              </Button>
                                            </motion.div>
                                          </div>
                                        )}
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}

                            {/* Customer Reviews Section */}
                            {vendorReviews[truck.id] && vendorReviews[truck.id].length > 0 && (
                              <div>
                                <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 sticky top-0 z-10 backdrop-blur-sm">
                                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider" data-testid={`text-category-${truck.id}-reviews`}>
                                    ★ Customer Reviews ({vendorReviewCounts[truck.id] || vendorReviews[truck.id].length})
                                  </span>
                                </div>
                                <div className="px-4 py-3 space-y-2">
                                  {vendorReviews[truck.id].map((review: any) => (
                                    <div key={review.id} className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="flex gap-0.5">
                                          {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className={`size-3 ${s <= review.vendorRating ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                                          ))}
                                        </div>
                                        {review.platformRating && (
                                          <span className="text-[9px] text-emerald-400/60 flex items-center gap-0.5">
                                            Platform: {review.platformRating}/5
                                          </span>
                                        )}
                                        <span className="text-[9px] text-white/20 ml-auto">
                                          {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      {review.comment && (
                                        <p className="text-xs text-white/40 italic line-clamp-2">"{review.comment}"</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Custom Order Section — COMING SOON */}
                            <div>
                              <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 sticky top-0 z-10 backdrop-blur-sm">
                                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider" data-testid={`text-category-${truck.id}-custom`}>
                                  Custom Requests
                                </span>
                              </div>
                              <div className="px-4 py-4 relative">
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-lg z-10 flex flex-col items-center justify-center gap-2">
                                  <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                    <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">Coming Soon — Phase 2</span>
                                  </div>
                                  <p className="text-[10px] text-white/40 text-center max-w-[200px]">Custom shopping & Walmart orders launching soon!</p>
                                </div>
                                <div className="opacity-30 pointer-events-none">
                                  <p className="text-sm font-medium text-white">Manual / Custom Order</p>
                                  <p className="text-xs text-slate-500">Request a pickup from Walmart, Dollar General, or any store.</p>
                                  <p className="text-sm font-semibold text-emerald-400 mt-0.5">$0.00 <span className="text-[10px] text-white/40 font-normal">(Price set after shopping)</span></p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Sticky Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 backdrop-blur-xl bg-[#1e293b]/95 border-t border-white/10 p-4 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]"
            data-testid="cart-bar"
          >
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="size-5 text-orange-400" />
                  <AnimatePresence>
                    <motion.div
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: cartBounce ? [1, 1.4, 1] : 1 }}
                      className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center"
                    >
                      <span className="text-[10px] font-bold text-white leading-none">{cartCount}</span>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span className="text-white font-semibold ml-1" data-testid="text-cart-count">{cartCount} {cartCount !== 1 ? t("order.itemPlural") : t("order.item")}</span>
                <span className="text-slate-500">·</span>
                <span className="text-orange-400 font-bold" data-testid="text-cart-total">${menuTotal.toFixed(2)}</span>
              </div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 font-semibold px-6 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all duration-300"
                  onClick={() => {
                    haptic('medium');
                    setReviewOpen(true);
                  }}
                  data-testid="button-review-order"
                >
                  {t("order.reviewOrder")}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className={`${GLASS_CARD} bg-[#0f172a]/95 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto p-0`}>
          <DialogHeader className="p-5 pb-0">
            <DialogTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="size-5 text-orange-400" />
              {t("order.reviewOrder")}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.05, 1] }}
                transition={{ duration: 0.4 }}
                className="ml-auto"
              >
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">SECURE CHECKOUT</Badge>
              </motion.div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 space-y-5">
            {Array.from(cartByTruck.entries()).map(([truckId, group]) => (
              <motion.div
                key={truckId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid={`review-truck-${truckId}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center">
                      <Utensils className="size-3.5 text-orange-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">{group.truckName}</span>
                  </div>
                  <Badge className="bg-white/5 text-slate-400 border-white/10 text-[10px]">{group.items.reduce((s: number, i: CartItem) => s + i.qty, 0)} items</Badge>
                </div>
                <div className="space-y-1">
                  {group.items.map((item: CartItem) => (
                    <motion.div
                      key={item.itemId}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg bg-white/[0.03] border border-white/5 p-3 hover:border-white/10 transition-all duration-300"
                      data-testid={`review-item-${item.itemId}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{item.name}</p>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-white shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={() => updateQty(truckId, item.itemId, -1)}
                            data-testid={`review-minus-${item.itemId}`}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="text-xs font-bold text-white w-6 text-center">{item.qty}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={() => updateQty(truckId, item.itemId, 1)}
                            data-testid={`review-plus-${item.itemId}`}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => setCart(prev => prev.filter(c => !(c.itemId === item.itemId && c.truckId === truckId)))}
                          data-testid={`review-remove-${item.itemId}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <Separator className="bg-white/5 mt-3" />
              </motion.div>
            ))}

            {/* Save / Load Favorite Order */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-9"
                onClick={() => {
                  const key = `happyeats_fav_${zoneSlug}`;
                  const existing = JSON.parse(localStorage.getItem(key) || '[]');
                  const favName = `Order ${new Date().toLocaleDateString()} (${cart.reduce((s, i) => s + i.qty, 0)} items)`;
                  existing.push({ name: favName, items: cart, savedAt: new Date().toISOString() });
                  localStorage.setItem(key, JSON.stringify(existing));
                  haptic('medium');
                  toast({ title: "⭐ Order Saved!", description: `"${favName}" saved to your favorites.` });
                }}
                disabled={cart.length === 0}
                data-testid="button-save-favorite"
              >
                <Heart className="size-3.5" /> Save Favorite
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs h-9"
                onClick={() => {
                  const key = `happyeats_fav_${zoneSlug}`;
                  const favs = JSON.parse(localStorage.getItem(key) || '[]');
                  if (favs.length === 0) {
                    toast({ title: "No Favorites", description: "Save an order first to load it later.", variant: "destructive" });
                    return;
                  }
                  const latest = favs[favs.length - 1];
                  setCart(latest.items);
                  haptic('light');
                  toast({ title: "✅ Favorite Loaded", description: `"${latest.name}" loaded into your cart.` });
                }}
                data-testid="button-load-favorite"
              >
                <BookmarkPlus className="size-3.5" /> Load Favorite
              </Button>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <User className="size-3.5" /> {t("order.yourInfo")}
              </h3>
              <div className="grid gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <Input
                    placeholder={t("order.namePlaceholder")}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300"
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <Input
                    placeholder={t("order.phonePlaceholder")}
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300"
                    data-testid="input-customer-phone"
                  />
                </div>
                <label className="flex items-start gap-2 cursor-pointer group" data-testid="label-sms-consent">
                  <input
                    type="checkbox"
                    checked={form.smsConsent ?? false}
                    onChange={(e) => setForm({ ...form, smsConsent: e.target.checked })}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/30 cursor-pointer"
                    data-testid="checkbox-sms-consent"
                  />
                  <span className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">
                    I agree to receive SMS order updates & notifications.{" "}
                    <a href="/sms-consent" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
                      SMS Consent Policy
                    </a>
                    . Msg & data rates may apply. Reply STOP to cancel.
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
                  <Input
                    placeholder={t("order.emailPlaceholder")}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300"
                    data-testid="input-customer-email"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-3.5 text-slate-500" />
                  <Input
                    placeholder={t("order.addressPlaceholder")}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300"
                    data-testid="input-delivery-address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <Input
                      placeholder="City"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300 text-sm"
                      data-testid="input-city"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="State"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300 text-sm"
                      data-testid="input-state"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="Zip Code"
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300 text-sm"
                      data-testid="input-zip"
                    />
                  </div>
                </div>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 size-3.5 text-slate-500" />
                  <Input
                    placeholder={t("order.instructionsPlaceholder")}
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="bg-white/5 border-white/10 pl-9 text-white placeholder:text-slate-500 focus:border-orange-500/50 transition-all duration-300"
                    data-testid="input-delivery-instructions"
                  />
                </div>

                {/* Shopping List — for Walmart-style custom orders */}
                {cart.some(c => c.name === "Custom Manual Order") && (
                  <div className="space-y-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="size-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Shopping List / Custom Order</span>
                    </div>
                    <p className="text-[10px] text-white/40">
                      Write out everything you need. Be as specific as possible — brand, size, quantity. This is what your driver will shop for.
                    </p>
                    <textarea
                      placeholder="Example:&#10;- Walmart: 2x Great Value Bread, 1x Gallon Milk (2%)&#10;- Dollar General: Phone charger (USB-C)&#10;- Specific brand or any brand OK"
                      value={form.shoppingList || ""}
                      onChange={(e) => setForm({ ...form, shoppingList: e.target.value })}
                      className="w-full min-h-[120px] px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-y"
                      data-testid="textarea-shopping-list"
                    />
                  </div>
                )}

                {/* Customer Verification Photo — for truck stops & non-residential */}
                <div className="space-y-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">Verification Photo</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[8px]">Optional</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40">
                    Delivering to a truck stop or non-residential address? Upload a photo of your location to help our driver find you.
                  </p>
                  {form.verificationPhoto ? (
                    <div className="relative">
                      <img src={form.verificationPhoto} alt="Location verification" className="w-full max-h-40 rounded-lg border border-white/10 object-cover" />
                      <button
                        onClick={() => setForm({ ...form, verificationPhoto: "" })}
                        className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] hover:bg-black/80 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 py-4 rounded-lg border border-dashed border-white/15 hover:border-blue-500/30 hover:bg-blue-500/5 cursor-pointer transition-all">
                      <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <MapPin className="size-5 text-blue-400" />
                      </div>
                      <span className="text-xs text-white/40">Tap to upload location photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => setForm({ ...form, verificationPhoto: ev.target?.result as string });
                          reader.readAsDataURL(file);
                        }}
                        data-testid="input-verification-photo"
                      />
                    </label>
                  )}
                </div>

                {/* Residential Delivery Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group py-1">
                  <input
                    type="checkbox"
                    checked={form.isResidential !== false}
                    onChange={(e) => setForm({ ...form, isResidential: e.target.checked })}
                    className="mt-0.5 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/30 cursor-pointer"
                    data-testid="checkbox-residential"
                  />
                  <span className="text-[11px] text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                    This is a residential delivery address
                  </span>
                </label>

                {/* ALCOHOL: Age Verification ID Upload */}
                {cartContainsAlcohol && (
                  <div className="space-y-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400">Age Verification Required</span>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[8px]">21+</Badge>
                    </div>
                    <p className="text-[10px] text-white/40 leading-relaxed">
                      Your cart contains alcohol. You must upload a valid government-issued photo ID proving you are 21 or older. 
                      <span className="text-red-400 font-semibold"> Alcohol can ONLY be delivered to a residential address.</span>
                    </p>
                    {!form.isResidential && form.isResidential !== undefined && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/25">
                        <AlertCircle className="size-3.5 text-red-400 shrink-0" />
                        <p className="text-[10px] text-red-300 font-semibold">
                          ⛔ Alcohol cannot be delivered to non-residential addresses. Check the residential box above or remove alcohol items.
                        </p>
                      </div>
                    )}
                    {form.ageVerificationPhoto ? (
                      <div className="relative">
                        <img src={form.ageVerificationPhoto} alt="ID verification" className="w-full max-h-40 rounded-lg border border-white/10 object-cover" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/80 text-[10px] text-white font-bold">
                          ✅ ID Uploaded
                        </div>
                        <button
                          onClick={() => setForm({ ...form, ageVerificationPhoto: "" })}
                          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] hover:bg-black/80 transition-all"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 py-4 rounded-lg border-2 border-dashed border-red-500/25 hover:border-red-500/40 hover:bg-red-500/5 cursor-pointer transition-all">
                        <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center">
                          <User className="size-6 text-red-400" />
                        </div>
                        <span className="text-xs text-red-300 font-medium">Upload Photo ID (Driver's License, Passport, etc.)</span>
                        <span className="text-[10px] text-white/30">Your ID will be verified by the driver at delivery</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => setForm({ ...form, ageVerificationPhoto: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }}
                          data-testid="input-age-verification-photo"
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <Clock className="size-3.5" /> Schedule Delivery
              </h3>
              <div className="grid grid-cols-3 gap-2" data-testid="schedule-delivery-slots">
                {["ASAP", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"].map((slot) => (
                  <motion.div key={slot} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant={scheduledDeliveryTime === slot ? "default" : "outline"}
                      className={scheduledDeliveryTime === slot
                        ? "bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs w-full shadow-[0_0_12px_rgba(249,115,22,0.3)] transition-all duration-300"
                        : "border-white/10 text-slate-300 hover:bg-white/10 h-8 text-xs w-full transition-all duration-300"}
                      onClick={() => setScheduledDeliveryTime(slot)}
                      data-testid={`schedule-slot-${slot.toLowerCase().replace(/[\s:]/g, "-")}`}
                    >
                      {slot}
                    </Button>
                  </motion.div>
                ))}
              </div>
              {scheduledDeliveryTime !== "ASAP" && (
                <p className="text-xs text-orange-300">Scheduled for {scheduledDeliveryTime} delivery</p>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Pricing Breakdown */}
            <div className="space-y-2" data-testid="pricing-breakdown">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <CreditCard className="size-3.5" /> {t("order.pricing")}
                <InfoBubble
                  title={{ en: "Fees Explained", es: "Tarifas Explicadas" }}
                  content={{ en: "• Service Fee (20%): Covers platform operations, order management, and vendor support.\n• Delivery Fee ($3.99): Covers driver compensation for delivering your order.\n• Tax (10%): Applicable sales tax on food items.\n\nTips go directly to your delivery driver — thank you for supporting them!", es: "• Tarifa de Servicio (20%): Cubre operaciones de la plataforma, gestión de pedidos y soporte al vendedor.\n• Tarifa de Entrega ($3.99): Cubre compensación del conductor por entregar tu pedido.\n• Impuesto (10%): Impuesto sobre ventas aplicable a los alimentos.\n\n¡Las propinas van directamente a tu conductor de entrega — gracias por apoyarlos!" }}
                  manualSection="orders-delivery"
                />
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t("order.menuTotal")}</span>
                <span className="text-white" data-testid="text-menu-total"><AnimatedPrice value={menuTotal} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t("order.serviceFeePercent")}</span>
                <span className="text-white" data-testid="text-service-fee"><AnimatedPrice value={serviceFee} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t("order.taxPercent")}</span>
                <span className="text-white" data-testid="text-tax"><AnimatedPrice value={tax} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t("order.deliveryFee")}</span>
                <span className="text-white" data-testid="text-delivery-fee">${DELIVERY_FEE.toFixed(2)}</span>
              </div>

              <Separator className="bg-white/5" />

              {/* Tip */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{t("order.driverTip")}</span>
                  <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">💚 Drivers keep 100% of tips</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {TIP_OPTIONS.map((opt) => (
                    <motion.div key={opt.label} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        variant={selectedTip === opt.value ? "default" : "outline"}
                        className={selectedTip === opt.value
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs w-full shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-300"
                          : "border-white/10 text-slate-300 hover:bg-white/10 h-8 text-xs w-full transition-all duration-300"}
                        onClick={() => setSelectedTip(opt.value)}
                        data-testid={`tip-option-${opt.label.toLowerCase().replace("%", "")}`}
                      >
                        {opt.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <AnimatePresence>
                  {selectedTip === "custom" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative overflow-hidden"
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                      <Input
                        type="number"
                        step="0.50"
                        min="0"
                        placeholder="0.00"
                        value={customTipAmount}
                        onChange={(e) => setCustomTipAmount(e.target.value)}
                        className="bg-white/5 border-white/10 pl-7 text-white focus:border-emerald-500/50 transition-all duration-300"
                        data-testid="input-custom-tip"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">{t("common.tip")}</span>
                  <span className="text-emerald-400" data-testid="text-tip"><AnimatedPrice value={tipAmount} /></span>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Promo Code */}
              <div className="space-y-2">
                <span className="text-sm text-slate-400">Promo Code</span>
                {promoResult ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-emerald-400">{promoResult.promo.code}</span>
                      <span className="text-xs text-slate-400 ml-2">-${promoResult.discount}</span>
                    </div>
                    <button onClick={removePromo} className="text-xs text-red-400 hover:text-red-300" data-testid="button-remove-promo">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(""); }}
                      placeholder="Enter code"
                      className="bg-white/5 border-white/10 text-white text-sm h-9 flex-1"
                      onKeyDown={(e) => e.key === "Enter" && validatePromo()}
                      data-testid="input-promo-code"
                    />
                    <Button
                      size="sm"
                      onClick={validatePromo}
                      disabled={promoLoading || !promoCode.trim()}
                      className="h-9 bg-white/10 hover:bg-white/20 text-white text-xs px-3"
                      data-testid="button-apply-promo"
                    >
                      {promoLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
                {promoError && <p className="text-xs text-red-400">{promoError}</p>}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400">Discount</span>
                    <span className="text-emerald-400" data-testid="text-promo-discount">-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {rewardBalance > 0 && (
                <>
                  <Separator className="bg-white/5" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-400">Reward Credit (${rewardBalance.toFixed(2)} available)</span>
                    </div>
                    {rewardCredit > 0 ? (
                      <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-purple-400">-${rewardCredit.toFixed(2)} applied</span>
                        <button onClick={() => setRewardCredit(0)} className="text-xs text-red-400 hover:text-red-300" data-testid="button-remove-reward">Remove</button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          const maxApply = Math.min(rewardBalance, subtotal + DELIVERY_FEE - promoDiscount);
                          setRewardCredit(Math.max(0, maxApply));
                        }}
                        className="w-full h-9 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/20 text-xs"
                        data-testid="button-apply-reward"
                      >
                        Apply ${Math.min(rewardBalance, subtotal + DELIVERY_FEE - promoDiscount).toFixed(2)} Reward Credit
                      </Button>
                    )}
                  </div>
                </>
              )}

              <Separator className="bg-white/10" />

              <div className="flex justify-between text-lg font-bold pt-1">
                <span className="text-white">{t("common.total")}</span>
                <motion.span
                  key={grandTotal.toFixed(2)}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="text-orange-400"
                  data-testid="text-grand-total"
                >
                  <AnimatedPrice value={grandTotal} />
                </motion.span>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-[0_0_25px_rgba(249,115,22,0.3)] disabled:opacity-50 disabled:shadow-none transition-all duration-300"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending}
                data-testid="button-place-order"
              >
                {createOrder.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {t("order.placingOrder")}
                  </span>
                ) : (
                  "Place Order & Pay"
                )}
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}