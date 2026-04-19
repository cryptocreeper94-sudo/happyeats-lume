import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, Plus, Minus, ShoppingCart, MapPin,
  CreditCard, User, Phone, Check, ChevronDown, ChevronUp,
  Timer, Utensils, Loader2, Clock, Truck, AlertCircle,
  Tag, DollarSign, Store, ChefHat, Settings, ListPlus,
  MinusCircle, MessageSquare, X, CheckCircle2, FileText
} from "lucide-react";
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
import type { MenuItemType, OrderItemCustomizations, MenuItemAddOn } from "@shared/schema";

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
  if (navigator.vibrate) navigator.vibrate(style === 'light' ? 10 : style === 'medium' ? 20 : 40);
};

interface CartItem {
  cartId: string;
  itemId: number;
  name: string;
  basePrice: number;
  qty: number;
  customizations?: OrderItemCustomizations;
  addOnTotal: number;
}

interface VendorData {
  id: number;
  name: string;
  slug: string;
  businessType: string;
  cuisine: string;
  description: string;
  rating: string;
  phone: string;
  address: string;
  isApproved: boolean;
  isActive: boolean;
  locationType: string;
  menu: MenuItemType[];
  logoUrl?: string | null;
  healthInspectionScore?: string | null;
  healthInspectionGrade?: string | null;
  healthInspectionCertUrl?: string | null;
  healthInspectionDate?: string | null;
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

function CustomizeDialog({
  item,
  open,
  onClose,
  onAdd,
}: {
  item: MenuItemType;
  open: boolean;
  onClose: () => void;
  onAdd: (customizations: OrderItemCustomizations) => void;
}) {
  const { t } = useLanguage();
  const [selectedAddOns, setSelectedAddOns] = useState<MenuItemAddOn[]>([]);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
  const [specialRequest, setSpecialRequest] = useState("");

  const c = item.customizations;
  const hasCustomizations = c && ((c.addOns?.length || 0) > 0 || (c.removals?.length || 0) > 0 || c.allowSpecialRequests);

  useEffect(() => {
    if (open) {
      setSelectedAddOns([]);
      setSelectedRemovals([]);
      setSpecialRequest("");
    }
  }, [open]);

  const toggleAddOn = (addon: MenuItemAddOn) => {
    setSelectedAddOns(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const toggleRemoval = (removal: string) => {
    setSelectedRemovals(prev =>
      prev.includes(removal)
        ? prev.filter(r => r !== removal)
        : [...prev, removal]
    );
  };

  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const totalPrice = item.price + addOnTotal;

  const handleAdd = () => {
    onAdd({
      selectedAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      selectedRemovals: selectedRemovals.length > 0 ? selectedRemovals : undefined,
      specialRequest: specialRequest.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md bg-[#0d1f35] border-white/10 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="size-4 text-orange-400" />
            {t("vendor.customizeItem")}: {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
            <div>
              <p className="text-sm font-medium text-white">{item.name}</p>
              {item.description && <p className="text-[11px] text-muted-foreground">{item.description}</p>}
            </div>
            <p className="text-sm font-bold text-emerald-400">${item.price.toFixed(2)}</p>
          </div>

          {c?.addOns && c.addOns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ListPlus className="size-3.5 text-emerald-400" />
                <p className="text-xs font-bold text-white">{t("vendor.addOnsExtraCharge")}</p>
              </div>
              <div className="space-y-1">
                {c.addOns.map(addon => {
                  const selected = selectedAddOns.find(a => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        selected
                          ? "bg-emerald-500/20 border-emerald-500/40"
                          : "bg-white/5 border-white/10 hover:border-emerald-500/20"
                      }`}
                      data-testid={`addon-${addon.id}`}
                    >
                      <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
                        selected ? "bg-emerald-500 border-emerald-500" : "border-white/30"
                      }`}>
                        {selected && <Check className="size-3 text-white" />}
                      </div>
                      <span className="text-sm text-white flex-1">{addon.name}</span>
                      <span className="text-xs text-emerald-400 font-medium">+${addon.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {c?.removals && c.removals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MinusCircle className="size-3.5 text-orange-400" />
                <p className="text-xs font-bold text-white">{t("vendor.remove")}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.removals.map(removal => {
                  const selected = selectedRemovals.includes(removal);
                  return (
                    <button
                      key={removal}
                      onClick={() => toggleRemoval(removal)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? "bg-orange-500/30 border-orange-500/50 text-orange-300"
                          : "bg-white/5 border-white/10 text-muted-foreground hover:border-orange-500/20"
                      }`}
                      data-testid={`removal-${removal}`}
                    >
                      {selected ? `No ${removal} ✓` : `No ${removal}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {c?.allowSpecialRequests && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-3.5 text-sky-400" />
                <p className="text-xs font-bold text-white">{t("vendor.specialRequest")}</p>
              </div>
              <Input
                placeholder="e.g., Extra crispy, sauce on the side..."
                value={specialRequest}
                onChange={e => setSpecialRequest(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-special-request"
              />
            </div>
          )}

          {!hasCustomizations && (
            <p className="text-xs text-muted-foreground text-center py-3">{t("vendor.noCustomizations")}</p>
          )}

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div>
              {addOnTotal > 0 && <p className="text-[10px] text-muted-foreground">{t("vendor.basePrice")}: ${item.price.toFixed(2)} + {t("vendor.addOnsLabel")}: ${addOnTotal.toFixed(2)}</p>}
              <p className="text-sm font-bold text-white">{t("vendor.itemTotal")}: <span className="text-emerald-400">${totalPrice.toFixed(2)}</span></p>
            </div>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[44px] px-6"
              data-testid="button-add-customized"
            >
              <Plus className="size-4 mr-1" /> {t("order.addToCart")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function VendorOrderPage() {
  const { t } = useLanguage();
  const params = useParams<{ vendorId: string }>();
  const vendorId = parseInt(params.vendorId || "0");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [tipPercent, setTipPercent] = useState(0.20);
  const [customTip, setCustomTip] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "", notes: "" });
  const [customizeItem, setCustomizeItem] = useState<MenuItemType | null>(null);

  const { data: vendor, isLoading } = useQuery<VendorData>({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/food-trucks/${vendorId}`);
      if (!res.ok) throw new Error("Vendor not found");
      return res.json();
    },
    enabled: vendorId > 0,
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error("Order failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("vendor.orderPlacedSuccess"), description: t("vendor.orderSentToVendor") });
      setCart([]);
      setShowCheckout(false);
      setCustomerInfo({ name: "", phone: "", address: "", notes: "" });
    },
    onError: () => {
      toast({ title: t("vendor.orderFailedRetry"), variant: "destructive" });
    },
  });

  const addToCart = (item: MenuItemType, customizations?: OrderItemCustomizations) => {
    haptic('light');
    const addOnTotal = customizations?.selectedAddOns?.reduce((s, a) => s + a.price, 0) || 0;
    const cartId = `${item.id}-${Date.now()}`;
    setCart(prev => [...prev, {
      cartId,
      itemId: item.id,
      name: item.name,
      basePrice: item.price,
      qty: 1,
      customizations,
      addOnTotal,
    }]);
  };

  const addToCartSimple = (item: MenuItemType) => {
    const c = item.customizations;
    const hasCustomizations = c && ((c.addOns?.length || 0) > 0 || (c.removals?.length || 0) > 0 || c.allowSpecialRequests);
    if (hasCustomizations) {
      setCustomizeItem(item);
    } else {
      addToCart(item);
    }
  };

  const updateQty = (cartId: string, delta: number) => {
    haptic('light');
    setCart(prev => {
      return prev.map(c => {
        if (c.cartId === cartId) {
          const newQty = c.qty + delta;
          if (newQty <= 0) return null as any;
          return { ...c, qty: newQty };
        }
        return c;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (cartId: string) => {
    haptic('light');
    setCart(prev => prev.filter(c => c.cartId !== cartId));
  };

  const getItemQty = (itemId: number) => cart.filter(c => c.itemId === itemId).reduce((s, c) => s + c.qty, 0);

  const menuTotal = cart.reduce((sum, item) => sum + (item.basePrice + item.addOnTotal) * item.qty, 0);
  const serviceFee = menuTotal * SERVICE_FEE_RATE;
  const tax = menuTotal * TAX_RATE;
  const subtotal = menuTotal + serviceFee + tax;
  const tipAmount = typeof tipPercent === "number" ? menuTotal * tipPercent : parseFloat(customTip) || 0;
  const total = subtotal + DELIVERY_FEE + tipAmount;
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleOrder = () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast({ title: t("vendor.fillAllRequired"), variant: "destructive" });
      return;
    }
    haptic('heavy');
    orderMutation.mutate({
      tenantId: 1,
      foodTruckId: vendorId,
      locationName: vendor?.name || "Vendor",
      items: cart.map(c => ({
        id: c.itemId,
        name: c.name,
        qty: c.qty,
        price: c.basePrice,
        customizations: c.customizations,
        itemTotal: (c.basePrice + c.addOnTotal) * c.qty,
      })),
      menuTotal: menuTotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      tax: tax.toFixed(2),
      subtotal: subtotal.toFixed(2),
      deliveryFee: DELIVERY_FEE.toFixed(2),
      total: total.toFixed(2),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      deliveryAddress: customerInfo.address,
      orderDescription: customerInfo.notes || undefined,
      status: "pending",
      vendorStatus: "pending",
      isSandbox: false,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] p-4 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className={`${GLASS_CARD} max-w-md w-full`}>
          <CardContent className="p-6 text-center">
            <AlertCircle className="size-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-2">{t("vendor.vendorNotFound")}</h2>
            <p className="text-sm text-muted-foreground mb-4">{t("vendor.vendorNotFoundDesc")}</p>
            <Link href="/">
              <Button variant="outline">{t("vendor.goHome")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableMenu = (vendor.menu || []).filter(i => i.isAvailable);
  const menuByCategory: Record<string, MenuItemType[]> = {};
  availableMenu.forEach(item => {
    if (!menuByCategory[item.category]) menuByCategory[item.category] = [];
    menuByCategory[item.category].push(item);
  });
  const categories = Object.keys(menuByCategory);

  if (expandedCategory === null && categories.length > 0) {
    setTimeout(() => setExpandedCategory(categories[0]), 0);
  }

  const businessTypeLabel = vendor.businessType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Vendor";

  const getCustomizationSummary = (c?: OrderItemCustomizations) => {
    if (!c) return null;
    const parts: string[] = [];
    if (c.selectedAddOns?.length) parts.push(c.selectedAddOns.map(a => `+${a.name}`).join(', '));
    if (c.selectedRemovals?.length) parts.push(c.selectedRemovals.map(r => `No ${r}`).join(', '));
    if (c.specialRequest) parts.push(`"${c.specialRequest}"`);
    return parts.length > 0 ? parts.join(' · ') : null;
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <div className="max-w-2xl mx-auto p-4 pb-32 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground mb-2">
              <ArrowLeft className="size-3 mr-1" /> {t("common.back")}
            </Button>
          </Link>

          <div className="flex items-start gap-3">
            {vendor.logoUrl ? (
              <div className="size-16 rounded-2xl border border-white/20 overflow-hidden shrink-0 bg-white/5">
                <img src={vendor.logoUrl} alt={vendor.name} className="w-full h-full object-cover" data-testid="img-vendor-logo" />
              </div>
            ) : (
              <div className="size-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
                <ChefHat className="size-7 text-orange-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-heading font-bold text-white truncate" data-testid="text-vendor-name">{vendor.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px]">
                  {businessTypeLabel}
                </Badge>
                {vendor.cuisine && (
                  <span className="text-xs text-muted-foreground">{vendor.cuisine}</span>
                )}
                {vendor.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                    <Star className="size-3 fill-current" /> {parseFloat(vendor.rating).toFixed(1)}
                  </span>
                )}
              </div>
              {vendor.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{vendor.description}</p>
              )}
            </div>
          </div>

          {(vendor.healthInspectionGrade || vendor.healthInspectionScore) && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20" data-testid="vendor-health-badge">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  {vendor.healthInspectionGrade ? (
                    <span className="text-lg font-bold text-emerald-400">{vendor.healthInspectionGrade}</span>
                  ) : (
                    <CheckCircle2 className="size-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    {t("vendor.healthBadge")}
                    {vendor.healthInspectionScore && (
                      <span className="text-white ml-1">{parseFloat(vendor.healthInspectionScore).toFixed(0)}/100</span>
                    )}
                  </p>
                  {vendor.healthInspectionDate && (
                    <p className="text-[10px] text-muted-foreground">{t("vendor.inspectionDate")}: {vendor.healthInspectionDate}</p>
                  )}
                </div>
              </div>
              {vendor.healthInspectionCertUrl && (
                <a
                  href={vendor.healthInspectionCertUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[10px] text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                  data-testid="link-view-certificate"
                >
                  <FileText className="size-3" /> {t("vendor.viewCertificate")}
                </a>
              )}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-3 gap-2">
          <Card className={`${GLASS_CARD} border-emerald-500/20`}>
            <CardContent className="p-2.5 text-center">
              <Truck className="size-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[10px] text-white font-medium">{t("vendor.delivery")}</p>
              <p className="text-[10px] text-emerald-400">${DELIVERY_FEE.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className={`${GLASS_CARD} border-violet-500/20`}>
            <CardContent className="p-2.5 text-center">
              <Clock className="size-4 text-violet-400 mx-auto mb-1" />
              <p className="text-[10px] text-white font-medium">{t("vendor.prepTime")}</p>
              <p className="text-[10px] text-violet-400">{t("vendor.prepTimeRange")}</p>
            </CardContent>
          </Card>
          <Card className={`${GLASS_CARD} border-orange-500/20`}>
            <CardContent className="p-2.5 text-center">
              <DollarSign className="size-4 text-orange-400 mx-auto mb-1" />
              <p className="text-[10px] text-white font-medium">{t("order.serviceFee")}</p>
              <p className="text-[10px] text-orange-400">20%</p>
            </CardContent>
          </Card>
        </div>

        {availableMenu.length === 0 ? (
          <Card className={`${GLASS_CARD}`}>
            <CardContent className="p-6 text-center">
              <Utensils className="size-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("vendor.noMenuYet")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("vendor.checkBackSoon")}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {categories.map((category, ci) => (
              <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }}>
                <Card className={`${GLASS_CARD} border-white/5 overflow-hidden`}>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                    className="w-full flex items-center justify-between p-3 text-left"
                    data-testid={`button-category-${category.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="size-3.5 text-orange-400" />
                      <span className="text-sm font-bold text-white">{category}</span>
                      <Badge variant="secondary" className="text-[9px]">{menuByCategory[category].length}</Badge>
                    </div>
                    {expandedCategory === category ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                  </button>

                  <AnimatePresence>
                    {expandedCategory === category && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-1.5">
                          {menuByCategory[category].map((item, ii) => {
                            const qty = getItemQty(item.id);
                            const c = item.customizations;
                            const hasCustomizations = c && ((c.addOns?.length || 0) > 0 || (c.removals?.length || 0) > 0 || c.allowSpecialRequests);
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ii * 0.03 }}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-orange-500/20 transition-all"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-white">{item.name}</p>
                                    {hasCustomizations && (
                                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[8px] px-1">
                                        {t("vendor.customizable")}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.description && <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>}
                                  <p className="text-sm font-bold text-emerald-400 mt-0.5">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {qty > 0 && (
                                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                                      {qty} {t("vendor.inCartLabel")}
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={() => addToCartSimple(item)}
                                    className="h-8 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 text-xs px-3"
                                    data-testid={`button-add-${item.id}`}
                                  >
                                    <Plus className="size-3 mr-1" /> {t("order.add")}
                                  </Button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {customizeItem && (
        <CustomizeDialog
          item={customizeItem}
          open={!!customizeItem}
          onClose={() => setCustomizeItem(null)}
          onAdd={(customizations) => addToCart(customizeItem, customizations)}
        />
      )}

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a1628] via-[#0a1628] to-transparent"
          >
            <div className="max-w-2xl mx-auto">
              <Button
                onClick={() => { haptic('medium'); setShowCheckout(true); }}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[52px] text-base shadow-2xl shadow-orange-500/20"
                data-testid="button-view-cart"
              >
                <ShoppingCart className="size-5 mr-2" />
                {t("vendor.viewCartItems")} ({totalItems}) — <AnimatedPrice value={total} prefix="$" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-lg bg-[#0d1f35] border-white/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="size-5 text-orange-400" />
              {t("vendor.yourOrderFrom").replace("{{name}}", vendor?.name || "")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              {cart.map(item => {
                const customSummary = getCustomizationSummary(item.customizations);
                const lineTotal = (item.basePrice + item.addOnTotal) * item.qty;
                return (
                  <div key={item.cartId} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-1 bg-orange-500/20 rounded px-1.5 py-0.5 border border-orange-500/30">
                          <Button size="sm" variant="ghost" onClick={() => updateQty(item.cartId, -1)} className="h-5 w-5 p-0 text-orange-400"><Minus className="size-2.5" /></Button>
                          <span className="text-xs font-bold text-white w-4 text-center">{item.qty}</span>
                          <Button size="sm" variant="ghost" onClick={() => updateQty(item.cartId, 1)} className="h-5 w-5 p-0 text-orange-400"><Plus className="size-2.5" /></Button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-white">{item.name}</span>
                          {item.addOnTotal > 0 && <span className="text-[10px] text-emerald-400 ml-1">(+${item.addOnTotal.toFixed(2)})</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-400">${lineTotal.toFixed(2)}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.cartId)} className="h-5 w-5 p-0 text-red-400 hover:text-red-300">
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                    {customSummary && (
                      <p className="text-[10px] text-violet-300 mt-1 ml-[52px]">{customSummary}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>{t("order.menuTotal")}</span><span>${menuTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>{t("order.serviceFee")} (20%)</span><span>${serviceFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>{t("order.tax")}</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>{t("order.deliveryFee")}</span><span>${DELIVERY_FEE.toFixed(2)}</span></div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1.5">{t("vendor.tipForDriver")}</p>
                <div className="flex gap-1.5">
                  {TIP_OPTIONS.map(opt => (
                    <Button
                      key={opt.label}
                      size="sm"
                      variant={tipPercent === opt.value ? "default" : "outline"}
                      onClick={() => { setTipPercent(opt.value as number); setCustomTip(""); }}
                      className={`flex-1 text-xs h-8 ${tipPercent === opt.value ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
                {tipPercent === ("custom" as any) && (
                  <Input
                    type="number"
                    placeholder={t("vendor.enterTipAmount")}
                    value={customTip}
                    onChange={e => setCustomTip(e.target.value)}
                    className="mt-2 h-9 text-sm"
                  />
                )}
                {tipAmount > 0 && <p className="text-xs text-emerald-400 mt-1">{t("vendor.tipLabel")}: ${tipAmount.toFixed(2)}</p>}
              </div>

              <Separator className="bg-white/10" />
              <div className="flex justify-between text-white font-bold text-base pt-1">
                <span>{t("order.total")}</span>
                <span className="text-emerald-400"><AnimatedPrice value={total} /></span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <p className="text-sm font-bold text-white flex items-center gap-2"><User className="size-4 text-orange-400" /> {t("vendor.deliveryInfo")}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">{t("vendor.yourNameRequired")}</label>
                  <Input
                    placeholder="Name"
                    value={customerInfo.name}
                    onChange={e => setCustomerInfo(d => ({ ...d, name: e.target.value }))}
                    className="h-9 text-sm"
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">{t("vendor.phoneRequired")}</label>
                  <Input
                    type="tel"
                    placeholder="(615) 555-0123"
                    value={customerInfo.phone}
                    onChange={e => setCustomerInfo(d => ({ ...d, phone: e.target.value }))}
                    className="h-9 text-sm"
                    data-testid="input-customer-phone"
                  />
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer group" data-testid="label-sms-consent">
                <input
                  type="checkbox"
                  defaultChecked
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
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">{t("vendor.deliveryAddressRequired")}</label>
                <Input
                  placeholder="123 Main St, City, TN"
                  value={customerInfo.address}
                  onChange={e => setCustomerInfo(d => ({ ...d, address: e.target.value }))}
                  className="h-9 text-sm"
                  data-testid="input-customer-address"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">{t("vendor.specialInstructionsOptional")}</label>
                <Input
                  placeholder="Gate code, building number, etc."
                  value={customerInfo.notes}
                  onChange={e => setCustomerInfo(d => ({ ...d, notes: e.target.value }))}
                  className="h-9 text-sm"
                  data-testid="input-delivery-notes"
                />
              </div>
            </div>

            <Button
              onClick={handleOrder}
              disabled={orderMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[48px] text-sm"
              data-testid="button-place-order"
            >
              {orderMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <><CreditCard className="size-4 mr-2" /> {t("vendor.placeOrderAmount")} — ${total.toFixed(2)}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
