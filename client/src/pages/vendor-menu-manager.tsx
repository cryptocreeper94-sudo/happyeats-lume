import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat, Plus, Trash2, Save, Edit3, Check, X, KeyRound,
  DollarSign, Tag, FileText, Eye, ArrowRight, ArrowLeft, Loader2,
  UtensilsCrossed, Store, LogOut, Settings, Link as LinkIcon, Copy,
  MapPin, Navigation, Clock, CalendarCheck, ListPlus, MinusCircle,
  MessageSquare, ChevronDown, ChevronUp, ExternalLink, ShoppingBag,
  Home, Shield, Bell, Upload, Image as ImageIcon, Award, Phone, Mail, User, Hash,
  Calendar, Download, Printer, Share2, Palette, CreditCard, RotateCcw,
  Layers, Type, Square, Bold, AlignLeft, AlignCenter, AlignRight,
  Megaphone, Truck, Camera, Users, Briefcase, BarChart3, Headphones, Zap, Globe, TrendingUp,
  Receipt, ClipboardList, Building2, Sparkles, AlertTriangle
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  captureElementAsImage,
  captureElementAsPDF,
  captureElementAndEmail,
} from "@/lib/download-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useLanguage } from "@/i18n/context";
import { InfoBubble } from "@/components/info-bubble";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";
import { UserGreeting } from "@/components/user-greeting";
import type { MenuItemType, MenuItemCustomizations, MenuItemAddOn, VendorPageContent } from "@shared/schema";
import PageContentEditor from "@/components/page-content-editor";
import ZoneCarousel from "@/components/zone-carousel";

const GLASS_CARD = "backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/80 to-[#162840]/80 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.3)]";

const CATEGORIES = [
  "Appetizers", "Entrees", "Tacos", "Burritos", "Sandwiches", "Burgers",
  "Wings", "Sides", "BBQ", "Plates", "Combos", "Drinks", "Desserts", "Specials"
];

interface Vendor {
  id: number;
  name: string;
  slug: string;
  businessType: string;
  cuisine: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  pin: string;
  isApproved: boolean;
  locationType: string;
  locationLat: string | null;
  locationLng: string | null;
  zoneIds: number[];
  menu: MenuItemType[];
  logoUrl?: string | null;
  healthInspectionScore?: string | null;
  healthInspectionGrade?: string | null;
  healthInspectionCertUrl?: string | null;
  healthInspectionDate?: string | null;
  createdAt?: string | null;
  stripeConnectAccountId?: string | null;
  stripeConnectOnboardingComplete?: boolean;
  stripeConnectPayoutsEnabled?: boolean;
  pageContent?: VendorPageContent | null;
}

const gradeColorMap: Record<string, string> = {
  A: "bg-emerald-500",
  B: "bg-amber-500",
  C: "bg-orange-500",
  D: "bg-red-500",
  F: "bg-red-700",
};

const gradeTextColorMap: Record<string, string> = {
  A: "text-emerald-400",
  B: "text-amber-400",
  C: "text-orange-400",
  D: "text-red-400",
  F: "text-red-500",
};

const gradeBorderMap: Record<string, string> = {
  A: "border-emerald-500/30",
  B: "border-amber-500/30",
  C: "border-orange-500/30",
  D: "border-red-500/30",
  F: "border-red-700/30",
};

type TabId = "dashboard" | "menu" | "earnings" | "areas" | "records" | "marketing" | "settings";

const TAB_CONFIG: { id: TabId; labelKey: string; icon: React.ReactNode; activeClass: string }[] = [
  { id: "dashboard", labelKey: "vendor.tabDashboard", icon: <Home className="size-4" />, activeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  { id: "menu", labelKey: "vendor.tabMenu", icon: <UtensilsCrossed className="size-4" />, activeClass: "bg-orange-500/20 text-orange-300 border border-orange-500/30" },
  { id: "earnings", labelKey: "Earnings", icon: <DollarSign className="size-4" />, activeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  { id: "areas", labelKey: "vendor.tabServiceAreas", icon: <MapPin className="size-4" />, activeClass: "bg-sky-500/20 text-sky-300 border border-sky-500/30" },
  { id: "records", labelKey: "vendor.tabRecords", icon: <Shield className="size-4" />, activeClass: "bg-violet-500/20 text-violet-300 border border-violet-500/30" },
  { id: "marketing", labelKey: "vendor.tabMarketing", icon: <Award className="size-4" />, activeClass: "bg-rose-500/20 text-rose-300 border border-rose-500/30" },
  { id: "settings", labelKey: "vendor.tabSettings", icon: <Settings className="size-4" />, activeClass: "bg-slate-500/20 text-slate-300 border border-slate-500/30" },
];

function CustomizationEditor({
  customizations,
  onChange,
}: {
  customizations: MenuItemCustomizations;
  onChange: (c: MenuItemCustomizations) => void;
}) {
  const { t } = useLanguage();
  const [newAddOnName, setNewAddOnName] = useState("");
  const [newAddOnPrice, setNewAddOnPrice] = useState("");
  const [newRemoval, setNewRemoval] = useState("");

  const addAddOn = () => {
    if (!newAddOnName || !newAddOnPrice) return;
    const addOns = [...(customizations.addOns || [])];
    const nextId = addOns.length > 0 ? Math.max(...addOns.map(a => a.id)) + 1 : 1;
    addOns.push({ id: nextId, name: newAddOnName, price: parseFloat(newAddOnPrice) || 0 });
    onChange({ ...customizations, addOns });
    setNewAddOnName("");
    setNewAddOnPrice("");
  };

  const removeAddOn = (id: number) => {
    onChange({ ...customizations, addOns: (customizations.addOns || []).filter(a => a.id !== id) });
  };

  const addRemoval = () => {
    if (!newRemoval) return;
    const removals = [...(customizations.removals || []), newRemoval];
    onChange({ ...customizations, removals });
    setNewRemoval("");
  };

  const removeRemoval = (idx: number) => {
    const removals = (customizations.removals || []).filter((_, i) => i !== idx);
    onChange({ ...customizations, removals });
  };

  return (
    <div className="space-y-3 p-3 rounded-lg bg-white/[0.03] border border-violet-500/20">
      <p className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
        <Settings className="size-3" /> {t("vendor.customizationOptions")}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ListPlus className="size-3 text-emerald-400" />
          <p className="text-[11px] font-semibold text-white">{t("vendor.addOnsExtraCharge")}</p>
        </div>
        {(customizations.addOns || []).map(addon => (
          <div key={addon.id} className="flex items-center gap-2 pl-5">
            <span className="text-[11px] text-white flex-1">{addon.name}</span>
            <span className="text-[11px] text-emerald-400">+${addon.price.toFixed(2)}</span>
            <Button size="sm" variant="ghost" onClick={() => removeAddOn(addon.id)} className="h-6 w-6 p-0 text-red-400 hover:text-red-300">
              <X className="size-3" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-1.5 pl-5">
          <Input
            placeholder={t("vendor.placeholderAddonName")}
            value={newAddOnName}
            onChange={e => setNewAddOnName(e.target.value)}
            className="h-7 text-[11px] flex-1"
            data-testid="input-addon-name"
          />
          <div className="relative w-20">
            <DollarSign className="size-2.5 absolute left-1.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="number"
              step="0.25"
              placeholder="1.50"
              value={newAddOnPrice}
              onChange={e => setNewAddOnPrice(e.target.value)}
              className="h-7 text-[11px] pl-5"
              data-testid="input-addon-price"
            />
          </div>
          <Button size="sm" onClick={addAddOn} className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700" data-testid="button-add-addon">
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MinusCircle className="size-3 text-orange-400" />
          <p className="text-[11px] font-semibold text-white">{t("vendor.removalsNoCharge")}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 pl-5">
          {(customizations.removals || []).map((removal, idx) => (
            <Badge key={idx} className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] gap-1 cursor-pointer hover:bg-red-500/20" onClick={() => removeRemoval(idx)}>
              {t("vendor.noPrefix")} {removal} <X className="size-2.5" />
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1.5 pl-5">
          <Input
            placeholder={t("vendor.placeholderRemovalName")}
            value={newRemoval}
            onChange={e => setNewRemoval(e.target.value)}
            className="h-7 text-[11px] flex-1"
            data-testid="input-removal-name"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRemoval(); } }}
          />
          <Button size="sm" onClick={addRemoval} className="h-7 px-2 bg-orange-600 hover:bg-orange-700" data-testid="button-add-removal">
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="flex items-center justify-between pl-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-3 text-sky-400" />
          <p className="text-[11px] font-semibold text-white">{t("vendor.allowSpecialRequests")}</p>
        </div>
        <Switch
          checked={customizations.allowSpecialRequests || false}
          onCheckedChange={v => onChange({ ...customizations, allowSpecialRequests: v })}
          className="scale-75"
          data-testid="switch-special-requests"
        />
      </div>
    </div>
  );
}

export default function VendorMenuManager() {
  const { t } = useLanguage();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCustomizations, setShowCustomizations] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [newItem, setNewItem] = useState<Omit<MenuItemType, "id">>({
    name: "", description: "", price: 0, category: "Entrees", isAvailable: true,
    customizations: { addOns: [], removals: [], allowSpecialRequests: true }
  });
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (vendorPin: string) => {
      const res = await fetch("/api/food-trucks/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: vendorPin }),
      });
      if (!res.ok) throw new Error("Invalid PIN");
      return res.json();
    },
    onSuccess: (data) => {
      setVendor(data);
      setLoginError("");
      localStorage.setItem("vendorPin", data.pin);
    },
    onError: () => setLoginError(t("vendor.invalidPinRetry")),
  });

  const menuMutation = useMutation({
    mutationFn: async (menu: MenuItemType[]) => {
      const res = await fetch(`/api/food-trucks/${vendor!.id}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu }),
      });
      if (!res.ok) throw new Error("Failed to save menu");
      return res.json();
    },
    onSuccess: (data) => {
      setVendor(data);
      toast({ title: t("vendor.menuSaved") });
    },
    onError: () => {
      toast({ title: t("vendor.failedSaveMenu"), variant: "destructive" });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const res = await fetch(`/api/food-trucks/${vendor!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (data) => {
      setVendor(data);
      toast({ title: t("vendor.settingsSaved") });
    },
    onError: () => {
      toast({ title: t("vendor.failedSaveSettings"), variant: "destructive" });
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/truck-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update availability");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t("vendor.availabilityConfirmed") });
      queryClient.invalidateQueries({ queryKey: ["truck-avail"] });
      queryClient.invalidateQueries({ queryKey: ["truck-avail-tomorrow"] });
    },
    onError: () => {
      toast({ title: t("vendor.failedUpdateAvailability"), variant: "destructive" });
    },
  });

  useEffect(() => {
    const savedPin = localStorage.getItem("vendorPin");
    if (savedPin) loginMutation.mutate(savedPin);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(pin);
  };

  const addMenuItem = () => {
    if (!newItem.name || newItem.price <= 0) {
      toast({ title: t("vendor.fillNamePrice"), variant: "destructive" });
      return;
    }
    const menu = [...(vendor?.menu || [])];
    const nextId = menu.length > 0 ? Math.max(...menu.map(i => i.id)) + 1 : 1;
    menu.push({ ...newItem, id: nextId });
    menuMutation.mutate(menu);
    setNewItem({
      name: "", description: "", price: 0, category: "Entrees", isAvailable: true,
      customizations: { addOns: [], removals: [], allowSpecialRequests: true }
    });
    setShowAddForm(false);
  };

  const updateMenuItem = (item: MenuItemType) => {
    const menu = (vendor?.menu || []).map(i => i.id === item.id ? item : i);
    menuMutation.mutate(menu);
    setEditingItem(null);
  };

  const deleteMenuItem = (itemId: number) => {
    const menu = (vendor?.menu || []).filter(i => i.id !== itemId);
    menuMutation.mutate(menu);
  };

  const toggleAvailability = (itemId: number) => {
    const menu = (vendor?.menu || []).map(i =>
      i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i
    );
    menuMutation.mutate(menu);
  };

  const updateItemCustomizations = (itemId: number, customizations: MenuItemCustomizations) => {
    const menu = (vendor?.menu || []).map(i =>
      i.id === itemId ? { ...i, customizations } : i
    );
    menuMutation.mutate(menu);
  };

  const logout = () => {
    setVendor(null);
    setPin("");
    localStorage.removeItem("vendorPin");
  };

  const copyOrderLink = () => {
    const url = `${window.location.origin}/menu/${vendor?.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: t("vendor.orderLinkCopied") });
  };

  if (!vendor) {
    return (
      <PageLanguageProvider>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className={`${GLASS_CARD} border-orange-500/20`}>
            <CardHeader className="text-center pb-2">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center mx-auto mb-3 border border-orange-500/30">
                <ChefHat className="size-8 text-orange-400" />
              </div>
              <CardTitle className="text-lg font-bold text-white">{t("vendor.vendorLogin")}</CardTitle>
              <p className="text-xs text-muted-foreground">Enter your vendor PIN to manage your menu</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="pin" className="text-xs">{t("vendor.vendorPin")}</Label>
                  <Input
                    id="pin"
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder={t("vendor.enterPinPlaceholder")}
                    value={pin}
                    onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setLoginError(""); }}
                    className="h-12 text-center text-2xl font-mono tracking-[0.3em]"
                    data-testid="input-vendor-pin"
                    autoFocus
                  />
                </div>
                {loginError && (
                  <p className="text-xs text-red-400 text-center">{loginError}</p>
                )}
                <Button
                  type="submit"
                  disabled={pin.length < 4 || loginMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 min-h-[44px]"
                  data-testid="button-vendor-login"
                >
                  {loginMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <><KeyRound className="size-4 mr-2" /> {t("common.logIn")}</>}
                </Button>
                <div className="text-center">
                  <Link href="/vendor-portal">
                    <Button variant="link" size="sm" className="text-xs text-muted-foreground">
                      {t("vendor.noAccountSignUp")}
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      </PageLanguageProvider>
    );
  }

  const menuItemCount = vendor.menu?.length || 0;
  const availableCount = vendor.menu?.filter(i => i.isAvailable).length || 0;
  const memberId = `HE-${vendor.id.toString().padStart(5, '0')}`;
  const orderUrl = `${window.location.origin}/menu/${vendor.id}`;

  return (
    <PageLanguageProvider>
    <div className="min-h-screen bg-gradient-to-b from-[#070b16] via-[#0c1222] to-[#070b16] relative overflow-hidden">
      <div className="absolute top-20 -left-32 w-72 h-72 bg-orange-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-60 -right-40 w-80 h-80 bg-emerald-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-violet-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 pb-28 sm:pb-6 space-y-6">
        {/* ═══ Premium Hero Banner ═══ */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Hero Image */}
            <div className="h-44 sm:h-52 relative">
              <img 
                src="/images/vendor-hero.png" 
                alt="Vendor Dashboard" 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-rose-500/10" />
              
              {/* Top Bar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <Link href="/vendor-portal">
                  <Button data-testid="back-vendor-portal" variant="ghost" size="icon" className="size-9 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60 rounded-xl border border-white/10">
                    <ArrowLeft className="size-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-1.5">
                  <PageLanguageToggle />
                  <Button variant="ghost" size="sm" onClick={logout} className="h-8 px-2.5 bg-black/40 backdrop-blur-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg border border-white/10 text-[10px]" data-testid="button-vendor-logout">
                    <LogOut className="size-3.5 mr-1" /> {t("vendor.signOut")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Vendor Identity - overlapping hero */}
            <div className="relative -mt-16 px-5 pb-5">
              <div className="flex items-end gap-4">
                {/* Logo */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  transition={{ delay: 0.15 }}
                  className="shrink-0"
                >
                  {vendor.logoUrl ? (
                    <img src={vendor.logoUrl} alt={vendor.name} className="size-20 rounded-2xl object-cover border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20 ring-2 ring-[#070b16]" data-testid="img-vendor-logo" />
                  ) : (
                    <div className="size-20 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center border-2 border-orange-500/40 shadow-2xl shadow-orange-500/20 ring-2 ring-[#070b16]">
                      <span className="text-3xl font-black text-white drop-shadow-lg">{vendor.name?.charAt(0) || 'V'}</span>
                    </div>
                  )}
                </motion.div>

                {/* Name + Badges */}
                <div className="flex-1 min-w-0 pb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white truncate tracking-tight drop-shadow-lg" data-testid="text-vendor-name">{vendor.name}</h1>
                    <InfoBubble
                      title={{ en: "Vendor Dashboard", es: "Panel del Vendedor" }}
                      content={{ en: "Welcome to your vendor dashboard! From here you can:\n\n• Add & edit menu items with photos and prices\n• Toggle item availability on/off\n• Set up customization options (add-ons, removals)\n• Check in daily to confirm you're operating\n• View and manage your incoming orders\n• Access free marketing tools (flyers, business cards)\n• Track your order link and QR code\n\nYour menu is live — customers can order from your page anytime you're checked in.", es: "¡Bienvenido a tu panel de vendedor!" }}
                      link={{ href: "/vendor-portal", label: { en: "Learn More About Vendor Benefits", es: "Más Información Sobre Beneficios para Vendedores" } }}
                      manualSection="vendor-management"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] font-mono" data-testid="badge-member-id">
                      <Hash className="size-2.5 mr-1" /> {memberId}
                    </Badge>
                    {vendor.isApproved ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]" data-testid="badge-approved">
                        <Check className="size-2.5 mr-1" /> {t("vendor.approved")}
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px]" data-testid="badge-pending">
                        <Clock className="size-2.5 mr-1" /> {t("common.pending")}
                      </Badge>
                    )}
                    <Badge className="bg-white/5 text-slate-400 border-white/10 text-[10px]">
                      {vendor.locationType === 'permanent' ? '📍 ' + t("vendor.permanent") : '🚚 ' + t("vendor.mobile")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center">
                  <p className="text-lg font-black text-orange-400">{availableCount}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">{t("vendor.activeItemsLabel")}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center">
                  <p className="text-lg font-black text-emerald-400">{menuItemCount}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">{t("vendor.totalMenuLabel")}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3 text-center">
                  <p className="text-lg font-black text-violet-400">{vendor.zoneIds?.length || 0}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wider">{t("vendor.zonesLabel")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons + Order Link */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/menu/${vendor.id}`}>
              <Button variant="outline" size="sm" className="h-9 text-xs border-white/10 text-slate-300 hover:text-white hover:bg-white/5" data-testid="button-preview-menu">
                <Eye className="size-3.5 mr-1.5" /> {t("vendor.preview")}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={copyOrderLink} className="h-9 text-xs border-white/10 text-slate-300 hover:text-white hover:bg-white/5" data-testid="button-copy-order-link">
              <Copy className="size-3.5 mr-1.5" /> {t("vendor.copyLink")}
            </Button>
          </div>
          <div className={`${GLASS_CARD} rounded-lg px-4 py-2.5 flex items-center gap-3`}>
            <LinkIcon className="size-3.5 text-emerald-400 shrink-0" />
            <code className="text-xs text-emerald-400 truncate flex-1" data-testid="text-order-url">{orderUrl}</code>
            <Button variant="ghost" size="sm" onClick={copyOrderLink} className="h-7 px-2 text-[10px] text-emerald-400 hover:text-emerald-300" data-testid="button-copy-url-bar">
              <Copy className="size-3" />
            </Button>
          </div>
        </motion.div>

        {/* Payout Connection Banner */}
        {!vendor.stripeAccountId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 p-4"
            data-testid="payout-banner"
          >
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <CreditCard className="size-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="size-4" /> Connect Your Payout Account
                </p>
                <p className="text-xs text-amber-200/60 mt-1 leading-relaxed">
                  You need to connect a bank account to receive payouts from your orders. Orders will still come in, but
                  <span className="text-amber-300 font-semibold"> earnings won't be deposited until your payment method is connected</span>.
                  This takes under 2 minutes via Stripe.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs font-bold min-h-[36px]"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/stripe/connect-onboarding/${vendor.id}`, { method: "POST" });
                        if (res.ok) {
                          const data = await res.json();
                          if (data.url) window.open(data.url, "_blank");
                        } else {
                          toast({ title: "Unable to start payout setup. Please contact support.", variant: "destructive" });
                        }
                      } catch {
                        toast({ title: "Failed to connect. Please try again.", variant: "destructive" });
                      }
                    }}
                    data-testid="button-connect-payouts"
                  >
                    <CreditCard className="size-3.5 mr-1.5" /> Set Up Payouts
                  </Button>
                  <span className="text-[10px] text-amber-300/50">Powered by Stripe • Secure • 2 minutes</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1 min-w-0 ${
                activeTab === tab.id ? tab.activeClass : "text-muted-foreground hover:text-white"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && (
              <DashboardTab
                vendor={vendor}
                onConfirmAvailability={(data) => availabilityMutation.mutate(data)}
                isPending={availabilityMutation.isPending}
                copyOrderLink={copyOrderLink}
                orderUrl={orderUrl}
                menuItemCount={menuItemCount}
                availableCount={availableCount}
              />
            )}
            {activeTab === "menu" && (
              <MenuTab
                vendor={vendor}
                menuMutation={menuMutation}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
                showCustomizations={showCustomizations}
                setShowCustomizations={setShowCustomizations}
                newItem={newItem}
                setNewItem={setNewItem}
                addMenuItem={addMenuItem}
                updateMenuItem={updateMenuItem}
                deleteMenuItem={deleteMenuItem}
                toggleAvailability={toggleAvailability}
                updateItemCustomizations={updateItemCustomizations}
                menuItemCount={menuItemCount}
              />
            )}
            {activeTab === "earnings" && (
              <EarningsTab vendor={vendor} />
            )}
            {activeTab === "areas" && (
              <ServiceAreasTab
                vendor={vendor}
                onConfirmAvailability={(data) => availabilityMutation.mutate(data)}
                isPending={availabilityMutation.isPending}
              />
            )}
            {activeTab === "records" && (
              <RecordsTab
                vendor={vendor}
                onUpdateVendor={(updates) => updateVendorMutation.mutate(updates)}
                isPending={updateVendorMutation.isPending}
              />
            )}
            {activeTab === "marketing" && (
              <MarketingTab vendor={vendor} orderUrl={orderUrl} />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                vendor={vendor}
                onUpdateVendor={(updates) => updateVendorMutation.mutate(updates)}
                isPending={updateVendorMutation.isPending}
                copyOrderLink={copyOrderLink}
                logout={logout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ Cockpit Bottom Navigation (Mobile) ═══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom">
        <div className="backdrop-blur-xl bg-gradient-to-t from-[#070b16] via-[#0c1222]/95 to-[#0c1222]/90 border-t border-white/10 px-2 pt-2 pb-2">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {[
              { id: "dashboard" as TabId, icon: <Home className="size-5" />, label: t("vendor.cockpitHome") },
              { id: "menu" as TabId, icon: <UtensilsCrossed className="size-5" />, label: t("vendor.cockpitMenu") },
              { id: "earnings" as TabId, icon: <DollarSign className="size-5" />, label: t("vendor.cockpitOrders") },
              { id: "marketing" as TabId, icon: <Megaphone className="size-5" />, label: t("vendor.cockpitPromote") },
              { id: "settings" as TabId, icon: <Settings className="size-5" />, label: t("vendor.cockpitSettings") },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? "text-orange-400"
                    : "text-white/40 active:text-white/70"
                }`}
                data-testid={`cockpit-${item.id}`}
              >
                {item.icon}
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="cockpit-indicator"
                    className="absolute -bottom-0.5 w-6 h-0.5 bg-orange-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PageLanguageProvider>
  );
}

function TomorrowZonesVendor({
  vendor,
  zones,
  onConfirmAvailability,
  isPending,
  tomorrowConfirmed,
  tomorrowZoneId,
}: {
  vendor: Vendor;
  zones: any[];
  onConfirmAvailability: (data: any) => void;
  isPending: boolean;
  tomorrowConfirmed: boolean;
  tomorrowZoneId: number | null;
}) {
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const tomorrowDate = getTomorrowDate();
  const tomorrowLabel = new Date(tomorrowDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  const { data: tomorrowSchedule } = useQuery<{ date: string; zoneIds: number[]; published: boolean }>({
    queryKey: ['zone-schedule-vendor', tomorrowDate],
    queryFn: async () => {
      const res = await fetch(`/api/zones/scheduled/${tomorrowDate}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const scheduledIds = tomorrowSchedule?.zoneIds || [];
  const confirmedIds = tomorrowConfirmed && tomorrowZoneId ? [tomorrowZoneId] : [];

  const handleConfirm = (zoneId: number) => {
    onConfirmAvailability({
      foodTruckId: vendor.id,
      date: tomorrowDate,
      zoneId,
      status: "confirmed",
      locationAddress: vendor.address,
    });
  };

  if (!tomorrowSchedule?.published || scheduledIds.length === 0) {
    return (
      <Card className={`${GLASS_CARD} border-white/[0.08]`}>
        <CardContent className="p-5 text-center">
          <CalendarCheck className="size-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm font-bold text-white/40">Tomorrow's Zones Not Published Yet</p>
          <p className="text-[11px] text-white/25 mt-1">Check back after 8 PM — the owner publishes tomorrow's active zones each evening.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] p-4 sm:p-5">
      <ZoneCarousel
        zones={zones}
        scheduledZoneIds={scheduledIds}
        mode="vendor"
        vendorZoneIds={vendor.zoneIds || []}
        confirmedZoneIds={confirmedIds}
        onConfirm={handleConfirm}
        isConfirming={isPending}
        published={tomorrowSchedule.published}
        dateLabel={tomorrowLabel}
      />
      {tomorrowConfirmed && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <Check className="size-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300">You're confirmed for tomorrow! Be at the hub at your stated opening time.</p>
        </div>
      )}
      {!vendor.zoneIds?.length && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="size-4 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-300">You haven't been assigned to any zones yet. Contact the owner to get assigned.</p>
        </div>
      )}
    </div>
  );
}

function DashboardTab({
  vendor,
  onConfirmAvailability,
  isPending,
  copyOrderLink,
  orderUrl,
  menuItemCount,
  availableCount,
}: {
  vendor: Vendor;
  onConfirmAvailability: (data: any) => void;
  isPending: boolean;
  copyOrderLink: () => void;
  orderUrl: string;
  menuItemCount: number;
  availableCount: number;
}) {
  const { t } = useLanguage();
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getNextDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const { data: todayAvail } = useQuery({
    queryKey: ["truck-avail", vendor.id, getTodayDate()],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${getTodayDate()}/truck/${vendor.id}`);
      return res.json();
    },
  });

  const { data: tomorrowAvail } = useQuery({
    queryKey: ["truck-avail-tomorrow", vendor.id, getNextDate()],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${getNextDate()}/truck/${vendor.id}`);
      return res.json();
    },
  });

  const { data: zones } = useQuery<any[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
  });

  const [tomorrowZoneId, setTomorrowZoneId] = useState<number | null>(vendor.zoneIds?.[0] || null);

  const todayConfirmed = todayAvail?.status === 'confirmed';
  const tomorrowConfirmed = tomorrowAvail?.status === 'confirmed';

  const todayZone = zones?.find((z: any) => z.id === todayAvail?.zoneId);

  const confirmToday = () => {
    onConfirmAvailability({
      foodTruckId: vendor.id,
      date: getTodayDate(),
      zoneId: vendor.zoneIds?.[0] || null,
      status: "confirmed",
      locationAddress: vendor.address,
    });
  };

  const confirmTomorrow = () => {
    onConfirmAvailability({
      foodTruckId: vendor.id,
      date: getNextDate(),
      zoneId: tomorrowZoneId,
      status: "confirmed",
      locationAddress: vendor.address,
    });
  };

  const memberSince = vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-4">
      <UserGreeting name={vendor.contactName || vendor.name} userNumber={vendor.id} role="Vendor" />
      
      {/* Page Content Editor — customize your free business page */}
      {vendor.slug && (
        <PageContentEditor
          vendorId={vendor.id}
          vendorSlug={vendor.slug}
          vendorPin={vendor.pin}
          initialContent={vendor.pageContent}
        />
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 }}>
        <Card className={`${GLASS_CARD} border-emerald-500/30`} data-testid="banner-live">
          <CardContent className="p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 pointer-events-none" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                  <Zap className="size-3 mr-1" /> {t("vendor.liveNow")}
                </Badge>
              </div>
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Sparkles className="size-5 text-emerald-400" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-bold text-emerald-300">{t("vendor.vendorPageLive")}</p>
                  <p className="text-[11px] text-white/50 flex items-start gap-1.5">
                    <Bell className="size-3 text-emerald-400/60 shrink-0 mt-0.5" />
                    {t("vendor.vendorPageLiveNotif")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className={`${GLASS_CARD} ${todayConfirmed ? "border-emerald-500/25" : "border-amber-500/25"}`}>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{t("vendor.todaysStatus")}</p>
                <div className="flex items-center gap-3">
                  <div className={`size-4 rounded-full ${todayConfirmed ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" : "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"}`} />
                  <h2 className={`text-lg font-bold ${todayConfirmed ? "text-emerald-300" : "text-amber-300"}`} data-testid="text-today-status">
                    {todayConfirmed ? t("vendor.youreOpen") : t("vendor.notConfirmedYet")}
                  </h2>
                </div>
              </div>
              <Badge className={`text-[10px] ${todayConfirmed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
                {todayConfirmed ? t("vendor.openForOrders") : t("vendor.notConfirmed")}
              </Badge>
            </div>
            {todayConfirmed && todayZone && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                <MapPin className="size-3" /> {todayZone.name}
                {todayAvail?.locationAddress && <span className="text-slate-500">· {todayAvail.locationAddress}</span>}
              </p>
            )}
            {!todayConfirmed && (
              <Button
                onClick={confirmToday}
                disabled={isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-sm min-h-[44px] mt-2"
                data-testid="button-confirm-today"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <><CalendarCheck className="size-4 mr-2" /> {t("vendor.confirmOpenToday")}</>}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t("vendor.menuItems"), value: menuItemCount.toString(), icon: <UtensilsCrossed className="size-3.5 text-orange-400" />, color: "border-orange-500/15" },
          { label: t("vendor.activeItems"), value: availableCount.toString(), icon: <Check className="size-3.5 text-emerald-400" />, color: "border-emerald-500/15" },
          { label: t("vendor.memberSince"), value: memberSince, icon: <CalendarCheck className="size-3.5 text-sky-400" />, color: "border-sky-500/15" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className={`${GLASS_CARD} ${stat.color}`}>
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex justify-center mb-1.5">{stat.icon}</div>
                <p className="text-lg font-bold text-white" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ═══ Tomorrow's Zones Carousel ═══ */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <TomorrowZonesVendor
          vendor={vendor}
          zones={zones || []}
          onConfirmAvailability={onConfirmAvailability}
          isPending={isPending}
          tomorrowConfirmed={tomorrowConfirmed}
          tomorrowZoneId={tomorrowZoneId}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className={`${GLASS_CARD} border-emerald-500/15`}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <LinkIcon className="size-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{t("vendor.yourOrderLink")}</p>
              <code className="text-[10px] text-emerald-400 truncate block" data-testid="text-dashboard-order-url">{orderUrl}</code>
            </div>
            <Button size="sm" variant="outline" onClick={copyOrderLink} className="h-8 text-[10px] border-emerald-500/20 text-emerald-400" data-testid="button-dashboard-copy-link">
              <Copy className="size-3 mr-1" /> {t("common.copy")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href={`/vendor-orders/${vendor.id}`}>
          <Card className={`${GLASS_CARD} border-violet-500/15 hover:border-violet-500/30 cursor-pointer transition-all`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                <ShoppingBag className="size-4 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">{t("vendor.viewOrdersLink")}</p>
                <p className="text-[10px] text-slate-500">{t("vendor.incomingOrders")}</p>
              </div>
              <ArrowRight className="size-3 text-violet-400" />
            </CardContent>
          </Card>
        </Link>
        <VendorLiveOrders vendorId={vendor.id} />
      </div>
    </div>
  );
}

function MenuTab({
  vendor,
  menuMutation,
  editingItem,
  setEditingItem,
  showAddForm,
  setShowAddForm,
  showCustomizations,
  setShowCustomizations,
  newItem,
  setNewItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateItemCustomizations,
  menuItemCount,
}: {
  vendor: Vendor;
  menuMutation: any;
  editingItem: MenuItemType | null;
  setEditingItem: (item: MenuItemType | null) => void;
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
  showCustomizations: number | null;
  setShowCustomizations: (v: number | null) => void;
  newItem: Omit<MenuItemType, "id">;
  setNewItem: React.Dispatch<React.SetStateAction<Omit<MenuItemType, "id">>>;
  addMenuItem: () => void;
  updateMenuItem: (item: MenuItemType) => void;
  deleteMenuItem: (id: number) => void;
  toggleAvailability: (id: number) => void;
  updateItemCustomizations: (id: number, c: MenuItemCustomizations) => void;
  menuItemCount: number;
}) {
  const { t } = useLanguage();

  // Menu photo digitizer state
  const menuPhotoInputRef = useRef<HTMLInputElement>(null);
  const [menuPhotoImage, setMenuPhotoImage] = useState<string | null>(null);
  const [digitizedItems, setDigitizedItems] = useState<MenuItemType[] | null>(null);
  const [isDigitizing, setIsDigitizing] = useState(false);
  const [digitizeError, setDigitizeError] = useState<string | null>(null);

  const handleMenuPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMenuPhotoImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    setDigitizedItems(null);
    setDigitizeError(null);
  };

  const digitizeMenu = async () => {
    if (!menuPhotoImage) return;
    setIsDigitizing(true);
    setDigitizeError(null);
    try {
      const res = await fetch("/api/menu-digitize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: menuPhotoImage, vendorName: vendor.name }),
      });
      if (!res.ok) throw new Error("Failed to digitize menu");
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setDigitizedItems(data.items);
        toast({ title: `🎉 Found ${data.items.length} menu items!`, description: "Review and save to your menu." });
      } else {
        setDigitizeError("Could not read any items from this photo. Try a clearer image or add items manually.");
      }
    } catch {
      setDigitizeError("Failed to process the menu image. Please try again or add items manually.");
    } finally {
      setIsDigitizing(false);
    }
  };

  const applyDigitizedMenu = () => {
    if (!digitizedItems || digitizedItems.length === 0) return;
    const existing = vendor.menu || [];
    const nextId = existing.length > 0 ? Math.max(...existing.map(i => i.id)) + 1 : 1;
    const merged = [
      ...existing,
      ...digitizedItems.map((item, i) => ({ ...item, id: nextId + i, isAvailable: true }))
    ];
    menuMutation.mutate(merged);
    setMenuPhotoImage(null);
    setDigitizedItems(null);
    setDigitizeError(null);
  };

  const menuByCategory: Record<string, MenuItemType[]> = {};
  (vendor.menu || []).forEach(item => {
    if (!menuByCategory[item.category]) menuByCategory[item.category] = [];
    menuByCategory[item.category].push(item);
  });

  const customizationCount = (item: MenuItemType) => {
    const c = item.customizations;
    if (!c) return 0;
    return (c.addOns?.length || 0) + (c.removals?.length || 0) + (c.allowSpecialRequests ? 1 : 0);
  };

  return (
    <Card className={`${GLASS_CARD} border-orange-500/20`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <UtensilsCrossed className="size-4 text-orange-400" />
            {t("vendor.menuItems")}
            <Badge variant="secondary" className="text-[10px]">{menuItemCount}</Badge>
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-xs min-h-[36px]"
            data-testid="button-add-menu-item"
          >
            <Plus className="size-3 mr-1" /> {t("vendor.addItem")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-white/5 border border-orange-500/20 p-3 space-y-3">
                <p className="text-xs font-bold text-white">{t("vendor.newMenuItem")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">{t("vendor.itemNameRequired")}</Label>
                    <Input
                      placeholder={t("vendor.placeholderItemName")}
                      value={newItem.name}
                      onChange={e => setNewItem(d => ({ ...d, name: e.target.value }))}
                      className="h-9 text-sm"
                      data-testid="input-new-item-name"
                    />
                  </div>
                  <div className="space-y-1 flex gap-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">{t("vendor.priceRequired")}</Label>
                      <div className="relative">
                        <DollarSign className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="9.50"
                          value={newItem.price || ""}
                          onChange={e => setNewItem(d => ({ ...d, price: parseFloat(e.target.value) || 0 }))}
                          className="h-9 text-sm pl-7"
                          data-testid="input-new-item-price"
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-[10px]">{t("vendor.categoryLabel")}</Label>
                      <select
                        value={newItem.category}
                        onChange={e => setNewItem(d => ({ ...d, category: e.target.value }))}
                        className="w-full h-9 px-2 rounded-md bg-background border border-input text-sm"
                        data-testid="select-new-item-category"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">{t("common.description")} <span className="text-amber-400/70">— Be specific! This is what customers see.</span></Label>
                  <Textarea
                    placeholder="e.g., Smoked pulled pork with house-made coleslaw on a brioche bun. Served with your choice of fries or mac & cheese."
                    value={newItem.description}
                    onChange={e => setNewItem(d => ({ ...d, description: e.target.value }))}
                    className="text-sm min-h-[60px] resize-none"
                    data-testid="input-new-item-description"
                    rows={2}
                  />
                </div>

                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <ListPlus className="size-3.5 text-violet-400" />
                    <p className="text-[11px] font-bold text-violet-300">{t("vendor.addOnsCustomizations")}</p>
                    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/25 text-[9px] ml-auto">Important</Badge>
                  </div>
                  <p className="text-[10px] text-violet-300/60">Add toppings, extras, and removal options so customers can customize their order exactly how they want it.</p>
                  <CustomizationEditor
                    customizations={newItem.customizations || { addOns: [], removals: [], allowSpecialRequests: true }}
                    onChange={c => setNewItem(d => ({ ...d, customizations: c }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={addMenuItem}
                    disabled={menuMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-xs min-h-[36px]"
                    data-testid="button-save-new-item"
                  >
                    {menuMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <><Check className="size-3 mr-1" /> {t("vendor.addToMenu")}</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)} className="text-xs min-h-[36px]">
                    <X className="size-3 mr-1" /> {t("common.cancel")}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {(!vendor.menu || vendor.menu.length === 0) && !showAddForm && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-orange-500/15 to-rose-500/15 flex items-center justify-center mx-auto mb-3 border border-orange-500/25">
                <UtensilsCrossed className="size-8 text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Build Your Digital Menu</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
                Your menu is how customers discover and order your food. Upload a photo of your menu or add items manually.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-rose-500 text-sm min-h-[44px] px-6"
                  data-testid="button-add-first-menu-item"
                >
                  <Plus className="size-4 mr-2" /> Add Items Manually
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => menuPhotoInputRef?.current?.click()}
                  className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-sm min-h-[44px] px-6"
                  data-testid="button-upload-menu-photo"
                >
                  <Camera className="size-4 mr-2" /> Upload Menu Photo
                </Button>
              </div>
            </div>

            {/* Menu Photo Digitizer */}
            <Card className={`${GLASS_CARD} border-cyan-500/20 overflow-hidden`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 via-teal-500/5 to-emerald-500/10" />
                <div className="relative px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
                      <Camera className="size-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Snap & Digitize Your Menu</p>
                      <p className="text-[10px] text-cyan-300/70">Take a photo of your menu board, printed menu, or handwritten menu — we'll convert it to digital</p>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px]">AI-Powered</Badge>
                  </div>
                </div>
              </div>
              <CardContent className="px-4 pb-4 pt-0 space-y-3">
                <input
                  ref={menuPhotoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleMenuPhotoUpload}
                  data-testid="input-menu-photo"
                />

                {!menuPhotoImage && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={() => menuPhotoInputRef?.current?.click()} data-testid="button-take-menu-photo"
                      className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer">
                      <Camera className="size-7 text-cyan-400" />
                      <span className="text-xs font-medium text-white">Take Photo</span>
                      <span className="text-[10px] text-muted-foreground">Use your camera</span>
                    </button>
                    <button onClick={() => { if (menuPhotoInputRef?.current) { menuPhotoInputRef.current.removeAttribute('capture'); menuPhotoInputRef.current.click(); menuPhotoInputRef.current.setAttribute('capture', 'environment'); }}} data-testid="button-upload-menu-file"
                      className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-teal-500/30 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all cursor-pointer">
                      <Upload className="size-7 text-teal-400" />
                      <span className="text-xs font-medium text-white">Upload Image</span>
                      <span className="text-[10px] text-muted-foreground">From your files</span>
                    </button>
                  </div>
                )}

                {menuPhotoImage && (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-[250px]">
                      <img src={menuPhotoImage} alt="Menu" className="w-full object-contain max-h-[250px]" />
                      <button onClick={() => { setMenuPhotoImage(null); setDigitizedItems(null); setDigitizeError(null); }}
                        className="absolute top-2 right-2 size-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                        <X className="size-4" />
                      </button>
                    </div>

                    {!digitizedItems && !digitizeError && (
                      <Button onClick={digitizeMenu} disabled={isDigitizing} className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 min-h-[44px]" data-testid="button-digitize-menu">
                        {isDigitizing ? <><Loader2 className="size-4 animate-spin mr-2" /> Analyzing menu...</> : <><Eye className="size-4 mr-2" /> Digitize Menu</>}
                      </Button>
                    )}

                    {digitizeError && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                        <p className="text-xs text-red-300">{digitizeError}</p>
                        <Button onClick={digitizeMenu} size="sm" variant="outline" className="mt-2 border-red-500/30 text-red-300 text-xs">Try Again</Button>
                      </div>
                    )}

                    {digitizedItems && digitizedItems.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="size-4 text-emerald-400" />
                          <p className="text-sm font-bold text-emerald-300">Found {digitizedItems.length} menu items!</p>
                        </div>
                        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                          {digitizedItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs">
                              <div className="flex-1 min-w-0 mr-2">
                                <p className="text-white font-medium truncate">{item.name}</p>
                                <p className="text-white/40 truncate text-[10px]">{item.description}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="secondary" className="text-[9px]">{item.category}</Badge>
                                <span className="text-emerald-400 font-bold">${item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={applyDigitizedMenu} disabled={menuMutation.isPending} className="flex-1 bg-emerald-600 hover:bg-emerald-700 min-h-[44px]" data-testid="button-apply-digitized-menu">
                            {menuMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Check className="size-4 mr-2" />}
                            Save All {digitizedItems.length} Items
                          </Button>
                          <Button onClick={() => { setMenuPhotoImage(null); setDigitizedItems(null); }} size="sm" variant="outline" className="border-white/20 text-white/60 min-h-[44px]">
                            <X className="size-4" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground">You can edit any item after saving. Toggle items on/off day-to-day from your menu tab.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-amber-400" />
                <p className="text-xs font-bold text-amber-300">Why Detail Matters</p>
              </div>
              <p className="text-[11px] text-amber-200/70 leading-relaxed">
                Customers can't ask you questions through the app — your menu description is their only guide. The more specific you are, the fewer order mistakes and the happier your customers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: <ListPlus className="size-3.5 text-emerald-400" />, title: "Add-Ons & Extras", desc: "Extra cheese, bacon, avocado — list every upgrade with its price", color: "border-emerald-500/15 bg-emerald-500/5" },
                  { icon: <MinusCircle className="size-3.5 text-sky-400" />, title: "Removal Options", desc: "No onions, no mayo, no lettuce — let customers remove what they don't want", color: "border-sky-500/15 bg-sky-500/5" },
                  { icon: <Tag className="size-3.5 text-violet-400" />, title: "Detailed Descriptions", desc: "\"Smoked brisket with house slaw on brioche\" sells more than \"BBQ Sandwich\"", color: "border-violet-500/15 bg-violet-500/5" },
                  { icon: <MessageSquare className="size-3.5 text-rose-400" />, title: "Special Requests", desc: "Enable special requests so customers can tell you exactly how they want it", color: "border-rose-500/15 bg-rose-500/5" },
                ].map((tip, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${tip.color}`}>
                    <div className="mt-0.5 shrink-0">{tip.icon}</div>
                    <div>
                      <p className="text-[11px] font-bold text-white">{tip.title}</p>
                      <p className="text-[10px] text-white/50 leading-relaxed">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                <ChefHat className="size-3.5 text-orange-400" /> Quick Example
              </p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-start gap-2">
                  <X className="size-3 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300/70"><span className="line-through">Taco Plate - $12.00</span></p>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-emerald-300 font-medium">Street Taco Plate (3 tacos) - $12.00</p>
                    <p className="text-white/40">Choose from carne asada, al pastor, or chicken. Served with rice, beans, and fresh pico. Corn or flour tortillas.</p>
                    <p className="text-violet-300/70 mt-0.5">+ Extra taco $3.50 · + Guacamole $2.00 · + Queso $1.50</p>
                    <p className="text-sky-300/70">Can remove: cilantro, onions, salsa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {vendor.menu && vendor.menu.length > 0 && vendor.menu.filter(i => {
          const c = i.customizations;
          return c && ((c.addOns?.length || 0) > 0 || (c.removals?.length || 0) > 0);
        }).length === 0 && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2.5">
            <Zap className="size-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-amber-300">Boost your orders — add customizations!</p>
              <p className="text-[10px] text-amber-300/60 mt-0.5">
                None of your items have add-ons or removal options yet. Tap the <Settings className="size-2.5 inline" /> gear icon on any item to add extras (extra cheese +$1.50), toppings, and removal options (no onions, no mayo).
              </p>
            </div>
          </div>
        )}

        {Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="size-3 text-orange-400" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">{category}</p>
              <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
            </div>
            <div className="space-y-1.5">
              {items.map(item => (
                <div key={item.id}>
                  <motion.div
                    layout
                    className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                      item.isAvailable
                        ? "bg-white/5 border-white/10 hover:border-orange-500/30"
                        : "bg-white/[0.02] border-white/5 opacity-60"
                    }`}
                  >
                    {editingItem?.id === item.id ? (
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={editingItem.name}
                            onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="h-8 text-sm"
                          />
                          <div className="relative">
                            <DollarSign className="size-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.01"
                              value={editingItem.price}
                              onChange={e => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                              className="h-8 text-sm pl-6"
                            />
                          </div>
                        </div>
                        <Input
                          value={editingItem.description}
                          onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                          placeholder={t("vendor.placeholderEditDescription")}
                          className="h-8 text-sm"
                        />
                        <div className="flex gap-2">
                          <select
                            value={editingItem.category}
                            onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                            className="h-8 px-2 rounded-md bg-background border border-input text-xs"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <Button size="sm" onClick={() => updateMenuItem(editingItem)} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs px-3">
                            <Check className="size-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)} className="h-8 text-xs px-3">
                            <X className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">{item.name}</p>
                            {!item.isAvailable && <Badge className="bg-red-500/20 text-red-300 text-[9px]">{t("vendor.badgeOff")}</Badge>}
                            {customizationCount(item) > 0 && (
                              <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[9px]">
                                {customizationCount(item)} {t("vendor.optsLabel")}
                              </Badge>
                            )}
                          </div>
                          {item.description && <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>}
                        </div>
                        <p className="text-sm font-bold text-emerald-400 shrink-0">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Switch
                            checked={item.isAvailable}
                            onCheckedChange={() => toggleAvailability(item.id)}
                            className="scale-75"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowCustomizations(showCustomizations === item.id ? null : item.id)}
                            className={`h-7 w-7 p-0 ${showCustomizations === item.id ? 'text-violet-400' : 'text-muted-foreground hover:text-violet-400'}`}
                            data-testid={`button-customizations-${item.id}`}
                          >
                            <Settings className="size-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem({ ...item })} className="h-7 w-7 p-0 text-muted-foreground hover:text-white">
                            <Edit3 className="size-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteMenuItem(item.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400">
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                  <AnimatePresence>
                    {showCustomizations === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-1"
                      >
                        <CustomizationEditor
                          customizations={item.customizations || { addOns: [], removals: [], allowSpecialRequests: true }}
                          onChange={c => updateItemCustomizations(item.id, c)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ServiceAreasTab({
  vendor,
  onConfirmAvailability,
  isPending,
}: {
  vendor: Vendor;
  onConfirmAvailability: (data: any) => void;
  isPending: boolean;
}) {
  const { t } = useLanguage();
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getNextDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const { data: zones, isLoading: zonesLoading } = useQuery<any[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: todayAvail } = useQuery({
    queryKey: ["truck-avail", vendor.id, getTodayDate()],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${getTodayDate()}/truck/${vendor.id}`);
      return res.json();
    },
  });

  const { data: tomorrowAvail } = useQuery({
    queryKey: ["truck-avail-tomorrow", vendor.id, getNextDate()],
    queryFn: async () => {
      const res = await fetch(`/api/truck-availability/${getNextDate()}/truck/${vendor.id}`);
      return res.json();
    },
  });

  const todayConfirmed = todayAvail?.status === 'confirmed';
  const tomorrowConfirmed = tomorrowAvail?.status === 'confirmed';

  const [todayZoneId, setTodayZoneId] = useState<number | null>(vendor.zoneIds?.[0] || null);
  const [todayAddress, setTodayAddress] = useState(vendor.address || "");
  const [todayNotes, setTodayNotes] = useState("");
  const [tomorrowZoneId, setTomorrowZoneId] = useState<number | null>(vendor.zoneIds?.[0] || null);
  const [tomorrowAddress, setTomorrowAddress] = useState(vendor.address || "");
  const [tomorrowNotes, setTomorrowNotes] = useState("");

  const confirmToday = () => {
    onConfirmAvailability({
      foodTruckId: vendor.id,
      date: getTodayDate(),
      zoneId: todayZoneId,
      status: "confirmed",
      locationAddress: todayAddress,
      notes: todayNotes,
    });
  };

  const confirmTomorrow = () => {
    onConfirmAvailability({
      foodTruckId: vendor.id,
      date: getNextDate(),
      zoneId: tomorrowZoneId,
      status: "confirmed",
      locationAddress: tomorrowAddress,
      notes: tomorrowNotes,
    });
  };

  const zoneColorBorderMap: Record<string, string> = {
    "#22c55e": "border-l-green-500",
    "#3b82f6": "border-l-blue-500",
    "#f59e0b": "border-l-amber-500",
    "#ef4444": "border-l-red-500",
    "#8b5cf6": "border-l-violet-500",
    "#06b6d4": "border-l-cyan-500",
    "#ec4899": "border-l-pink-500",
    "#f97316": "border-l-orange-500",
  };

  const getZoneBorderClass = (color: string | null) => {
    if (!color) return "border-l-emerald-500";
    return zoneColorBorderMap[color] || "border-l-emerald-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <MapPin className="size-5 text-sky-400" /> {t("vendor.whereWeDeliver")}
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t("vendor.zoneDeliveryDesc")}
        </p>
      </div>

      {zonesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-sky-400" />
        </div>
      ) : (
        <>
          {/* Active zone summary banner */}
          {(() => {
            const activeZones = (zones || []).filter((z: any) => z.isActive);
            const inactiveZones = (zones || []).filter((z: any) => !z.isActive);
            return (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500/[0.06] to-sky-500/[0.04] border border-emerald-500/15 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="size-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">{activeZones.length} of {(zones || []).length} zones active today</span>
                </div>
                <p className="text-[10px] text-white/30 pl-5">
                  Your owner activates zones daily. Check in to an active zone to start receiving orders.
                </p>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(zones || []).map((zone: any) => (
              <Card
                key={zone.id}
                className={`${GLASS_CARD} border-l-4 ${getZoneBorderClass(zone.color)} transition-all ${
                  zone.isActive
                    ? 'opacity-100'
                    : 'opacity-50 grayscale-[30%]'
                }`}
                data-testid={`zone-card-${zone.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{zone.name}</p>
                      {zone.description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{zone.description}</p>}
                    </div>
                    <Badge className={`text-[9px] gap-1 ${zone.isActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-red-500/15 text-red-300/70 border-red-500/25"
                    }`}>
                      {zone.isActive && <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {zone.isActive ? "LIVE TODAY" : "OFF TODAY"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock className="size-2.5" /> {t("vendor.cutoffLabel")} {zone.cutoffTime || "11:00"} AM</span>
                    {zone.isActive && vendor.zoneIds?.includes(zone.id) && (
                      <span className="flex items-center gap-1 text-emerald-400/60"><Check className="size-2.5" /> Your zone</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Separator className="bg-white/5" />

      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
          <CalendarCheck className="size-4 text-emerald-400" /> {t("vendor.dailyCheckIn")}
          <InfoBubble
            title={{ en: "Daily Check-In", es: "Check-In Diario" }}
            content={{ en: "Check in each morning to let customers know you're serving today. When you're checked in, your truck appears on the ordering page and can receive orders. If you don't check in, customers won't see your menu for the day.\n\nYou can check out anytime if you close early.", es: "Haz check-in cada mañana para que los clientes sepan que estás sirviendo hoy. Cuando estás registrado, tu truck aparece en la página de pedidos y puede recibir pedidos. Si no haces check-in, los clientes no verán tu menú del día.\n\nPuedes hacer check-out en cualquier momento si cierras temprano." }}
            manualSection="vendor-management"
          />
        </h3>
        <p className="text-[11px] text-slate-500 mb-4">
          {t("vendor.dailyCheckInDesc")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`${GLASS_CARD} ${todayConfirmed ? "border-emerald-500/25" : "border-amber-500/20"}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{t("vendor.todaysCheckIn")}</p>
                {todayConfirmed ? (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                    <Check className="size-2.5 mr-1" /> {t("vendor.confirmed")}
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">{t("common.pending")}</Badge>
                )}
              </div>
              {!todayConfirmed ? (
                <>
                  <select
                    value={todayZoneId || ""}
                    onChange={e => setTodayZoneId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white"
                    data-testid="select-today-zone"
                  >
                    <option value="">{t("vendor.selectYourZone")}</option>
                    {(zones || []).filter((z: any) => z.isActive).map((z: any) => (
                      <option key={z.id} value={z.id}>✅ {z.name}</option>
                    ))}
                  </select>
                  {(zones || []).filter((z: any) => z.isActive).length === 0 && (
                    <p className="text-[10px] text-amber-400/70 flex items-center gap-1">
                      <AlertTriangle className="size-2.5" /> No zones are active today. Contact your operator.
                    </p>
                  )}
                  <Input
                    placeholder={t("vendor.addressPlaceholder")}
                    value={todayAddress}
                    onChange={e => setTodayAddress(e.target.value)}
                    className="h-9 text-sm bg-white/5 border-white/10"
                    data-testid="input-today-address"
                  />
                  <Input
                    placeholder={t("vendor.notesTodayPlaceholder")}
                    value={todayNotes}
                    onChange={e => setTodayNotes(e.target.value)}
                    className="h-9 text-sm bg-white/5 border-white/10"
                    data-testid="input-today-notes"
                  />
                  <Button
                    onClick={confirmToday}
                    disabled={isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs min-h-[40px]"
                    data-testid="button-checkin-today"
                  >
                    {isPending ? <Loader2 className="size-3 animate-spin" /> : <><Check className="size-3 mr-1.5" /> {t("vendor.confirmTodayBtn")}</>}
                  </Button>
                </>
              ) : (
                <p className="text-xs text-emerald-300">{t("vendor.checkedInToday")}</p>
              )}
            </CardContent>
          </Card>

          <Card className={`${GLASS_CARD} ${tomorrowConfirmed ? "border-sky-500/25" : "border-white/10"}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">{t("vendor.tomorrowsCheckIn")}</p>
                {tomorrowConfirmed ? (
                  <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[10px]">
                    <Check className="size-2.5 mr-1" /> {t("vendor.confirmed")}
                  </Badge>
                ) : (
                  <Badge className="bg-white/10 text-slate-400 border-white/10 text-[10px]">{t("common.pending")}</Badge>
                )}
              </div>
              {!tomorrowConfirmed ? (
                <>
                  <select
                    value={tomorrowZoneId || ""}
                    onChange={e => setTomorrowZoneId(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-white"
                    data-testid="select-tomorrow-zone-areas"
                  >
                    <option value="">{t("vendor.selectYourZone")}</option>
                    {(zones || []).filter((z: any) => z.isActive).map((z: any) => (
                      <option key={z.id} value={z.id}>✅ {z.name}</option>
                    ))}
                  </select>
                  {(zones || []).filter((z: any) => z.isActive).length === 0 && (
                    <p className="text-[10px] text-amber-400/70 flex items-center gap-1">
                      <AlertTriangle className="size-2.5" /> No zones active. Check back tomorrow.
                    </p>
                  )}
                  <Input
                    placeholder={t("vendor.addressPlaceholder")}
                    value={tomorrowAddress}
                    onChange={e => setTomorrowAddress(e.target.value)}
                    className="h-9 text-sm bg-white/5 border-white/10"
                    data-testid="input-tomorrow-address"
                  />
                  <Input
                    placeholder={t("vendor.notesTomorrowPlaceholder")}
                    value={tomorrowNotes}
                    onChange={e => setTomorrowNotes(e.target.value)}
                    className="h-9 text-sm bg-white/5 border-white/10"
                    data-testid="input-tomorrow-notes"
                  />
                  <Button
                    onClick={confirmTomorrow}
                    disabled={isPending}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-xs min-h-[40px]"
                    data-testid="button-checkin-tomorrow"
                  >
                    {isPending ? <Loader2 className="size-3 animate-spin" /> : <><Check className="size-3 mr-1.5" /> {t("vendor.confirmTomorrow")}</>}
                  </Button>
                </>
              ) : (
                <p className="text-xs text-sky-300">{t("vendor.setForTomorrowShort")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Link href="/zones">
        <Button variant="outline" className="w-full border-sky-500/20 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10" data-testid="button-view-zone-map">
          <MapPin className="size-4 mr-2" /> {t("vendor.viewFullZoneMap")} <ArrowRight className="size-3 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function RecordsTab({
  vendor,
  onUpdateVendor,
  isPending,
}: {
  vendor: Vendor;
  onUpdateVendor: (updates: Record<string, any>) => void;
  isPending: boolean;
}) {
  const { t } = useLanguage();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"logo" | "cert" | null>(null);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("logo");
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "vendor-logo", entityId: vendor.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error);
      }
      onUpdateVendor({ logoUrl: dataUrl });
      toast({ title: t("vendor.logoUploadedSuccess") });
    } catch (err: any) {
      toast({ title: err.message || t("vendor.failedUploadLogo"), variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("cert");
    try {
      const dataUrl = await fileToDataUrl(file);
      const res = await fetch("/api/upload/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, type: "health-cert", entityId: vendor.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error);
      }
      onUpdateVendor({ healthInspectionCertUrl: dataUrl });
      toast({ title: t("vendor.certUploadedSuccess") });
    } catch (err: any) {
      toast({ title: err.message || t("vendor.failedUploadCert"), variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const grade = vendor.healthInspectionGrade || null;

  return (
    <div className="space-y-4">
      <Card className={`${GLASS_CARD} ${grade ? (gradeBorderMap[grade] || "border-white/10") : "border-white/10"}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="size-4 text-violet-400" /> {t("vendor.healthInspectionTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {grade ? (
              <div className={`size-16 rounded-2xl ${gradeColorMap[grade] || "bg-slate-500"} flex items-center justify-center shadow-lg`}>
                <span className="text-2xl font-black text-white">{grade}</span>
              </div>
            ) : (
              <div className="size-16 rounded-2xl bg-slate-700/50 flex items-center justify-center border border-white/10">
                <span className="text-xs text-slate-500">N/A</span>
              </div>
            )}
            <div className="space-y-1">
              {vendor.healthInspectionScore && (
                <p className="text-sm text-white">{t("vendor.scoreLabel")} <span className={`font-bold ${grade ? (gradeTextColorMap[grade] || "text-white") : "text-white"}`}>{vendor.healthInspectionScore}</span></p>
              )}
              {vendor.healthInspectionDate && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <CalendarCheck className="size-3" /> {t("vendor.inspectedLabel")} {vendor.healthInspectionDate}
                </p>
              )}
              {!grade && !vendor.healthInspectionScore && (
                <p className="text-xs text-slate-500">{t("vendor.noInspectionData")}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {vendor.healthInspectionCertUrl && (
              <a href={vendor.healthInspectionCertUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="text-xs border-violet-500/20 text-violet-400" data-testid="button-view-cert">
                  <ExternalLink className="size-3 mr-1.5" /> {t("vendor.viewCertificate")}
                </Button>
              </a>
            )}
            <input type="file" ref={certInputRef} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.pdf" onChange={handleCertUpload} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => certInputRef.current?.click()}
              disabled={uploading === "cert"}
              className="text-xs border-white/10 text-slate-300"
              data-testid="button-upload-cert"
            >
              {uploading === "cert" ? <Loader2 className="size-3 animate-spin mr-1.5" /> : <Upload className="size-3 mr-1.5" />}
              {vendor.healthInspectionCertUrl ? t("vendor.updateCertificate") : t("vendor.uploadCertificate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={`${GLASS_CARD} border-white/10`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="size-4 text-sky-400" /> {t("vendor.businessInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: t("vendor.businessName"), value: vendor.name, icon: <Store className="size-3 text-orange-400" /> },
              { label: t("vendor.businessType"), value: vendor.businessType || "N/A", icon: <Tag className="size-3 text-emerald-400" /> },
              { label: t("vendor.cuisine"), value: vendor.cuisine || "N/A", icon: <UtensilsCrossed className="size-3 text-amber-400" /> },
              { label: t("vendor.contactLabel"), value: vendor.contactName || "N/A", icon: <User className="size-3 text-sky-400" /> },
              { label: t("vendor.phoneLabel"), value: vendor.phone || "N/A", icon: <Phone className="size-3 text-violet-400" /> },
              { label: t("vendor.emailLabel"), value: vendor.email || "N/A", icon: <Mail className="size-3 text-rose-400" /> },
            ].map(field => (
              <div key={field.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                {field.icon}
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">{field.label}</p>
                  <p className="text-xs text-white truncate" data-testid={`text-biz-${field.label.toLowerCase().replace(/\s/g, '-')}`}>{field.value}</p>
                </div>
              </div>
            ))}
          </div>
          {vendor.address && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <MapPin className="size-3 text-cyan-400" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500">{t("vendor.addressFieldLabel")}</p>
                <p className="text-xs text-white truncate">{vendor.address}</p>
              </div>
            </div>
          )}
          <p className="text-[10px] text-slate-600 italic">{t("vendor.contactToUpdate")}</p>
        </CardContent>
      </Card>

      <Card className={`${GLASS_CARD} border-orange-500/15`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="size-4 text-orange-400" /> {t("vendor.yourLogo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt="Logo" className="size-20 rounded-xl object-cover border border-white/10" data-testid="img-records-logo" />
            ) : (
              <div className="size-20 rounded-xl bg-white/5 border border-dashed border-white/15 flex items-center justify-center">
                <ImageIcon className="size-8 text-slate-600" />
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-2">{vendor.logoUrl ? t("vendor.updateLogoBelow") : t("vendor.uploadBusinessLogo")}</p>
              <input type="file" ref={logoInputRef} className="hidden" accept=".jpg,.jpeg,.png,.gif,.webp,.svg" onChange={handleLogoUpload} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading === "logo"}
                className="text-xs border-orange-500/20 text-orange-400"
                data-testid="button-upload-logo"
              >
                {uploading === "logo" ? <Loader2 className="size-3 animate-spin mr-1.5" /> : <Upload className="size-3 mr-1.5" />}
                {vendor.logoUrl ? t("vendor.changeLogo") : t("vendor.uploadLogo")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type CardTemplateId = 'classic' | 'bold' | 'trucker' | 'neon' | 'split' | 'modern';
const CARD_TEMPLATES: { id: CardTemplateId; label: string; desc: string }[] = [
  { id: 'classic', label: 'Classic', desc: 'Logo + info' },
  { id: 'bold', label: 'Bold', desc: 'Accent bar' },
  { id: 'trucker', label: 'Trucker', desc: 'Road theme' },
  { id: 'neon', label: 'Neon', desc: 'Glow effect' },
  { id: 'split', label: 'Split', desc: 'Two-tone' },
  { id: 'modern', label: 'Modern', desc: 'Geometric' },
];
const CARD_ACCENT_COLORS = [
  { id: 'orange', value: '#FF7849' }, { id: 'cyan', value: '#06B6D4' },
  { id: 'rose', value: '#F43F5E' }, { id: 'emerald', value: '#10B981' },
  { id: 'violet', value: '#8B5CF6' }, { id: 'amber', value: '#F59E0B' },
];

const ACCOUNTING_SOFTWARE = [
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Sync expenses, invoices, and revenue automatically' },
  { id: 'freshbooks', name: 'FreshBooks', desc: 'Time tracking, invoicing, and expense management' },
  { id: 'xero', name: 'Xero', desc: 'Cloud accounting with bank reconciliation' },
  { id: 'wave', name: 'Wave', desc: 'Free invoicing and accounting' },
  { id: 'square', name: 'Square POS', desc: 'Point of sale and payment processing' },
  { id: 'toast', name: 'Toast POS', desc: 'Restaurant-specific POS system' },
  { id: 'clover', name: 'Clover POS', desc: 'Versatile POS for food trucks' },
  { id: 'other', name: 'Other', desc: 'Tell us what you use' },
];

function EarningsTab({ vendor }: { vendor: Vendor }) {
  const [connectLoading, setConnectLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const { data: connectStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/stripe/connect/status", vendor.id],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/connect/status/${vendor.id}`, {
        headers: { "x-vendor-pin": vendor.pin || "" },
      });
      return res.json();
    },
    refetchInterval: 15000,
  });

  const { data: balance } = useQuery({
    queryKey: ["/api/stripe/connect/balance", vendor.id],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/connect/balance/${vendor.id}`, {
        headers: { "x-vendor-pin": vendor.pin || "" },
      });
      return res.json();
    },
    enabled: connectStatus?.payoutsEnabled,
    refetchInterval: 30000,
  });

  const { data: payoutsData } = useQuery({
    queryKey: ["/api/stripe/connect/payouts", vendor.id],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/connect/payouts/${vendor.id}`, {
        headers: { "x-vendor-pin": vendor.pin || "" },
      });
      return res.json();
    },
    enabled: connectStatus?.payoutsEnabled,
    refetchInterval: 60000,
  });

  const handleConnectBank = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-vendor-pin": vendor.pin || "" },
        body: JSON.stringify({ vendorId: vendor.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "Could not start bank connection", variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection failed. Please try again.", variant: "destructive" });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setDashboardLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/dashboard-link", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-vendor-pin": vendor.pin || "" },
        body: JSON.stringify({ vendorId: vendor.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch {
      toast({ title: "Could not open dashboard", variant: "destructive" });
    } finally {
      setDashboardLoading(false);
    }
  };

  const isConnected = connectStatus?.connected && connectStatus?.payoutsEnabled;
  const isPending = connectStatus?.connected && !connectStatus?.payoutsEnabled;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${GLASS_CARD} rounded-2xl overflow-hidden`}
      >
        <div className="bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <DollarSign className="size-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white">Earnings & Payouts</h2>
                <InfoBubble
                  title={{ en: "How Vendor Payouts Work", es: "Cómo Funcionan los Pagos a Vendedores" }}
                  content={{ en: "You must connect a Stripe account to receive payments. Here's how it works:\n\n1. Click 'Connect with Stripe' to link your bank account\n2. Complete Stripe's verification (takes about 5 minutes)\n3. Once connected, you'll see a green 'Bank Connected' badge\n\nPayment schedule:\n• You keep 80% of every order — we take a 20% platform fee\n• Deposits go directly to your bank account daily\n• Payments arrive within 2 business days\n• No signup fees, no monthly fees, no hidden charges\n\nYou can view your Stripe dashboard anytime by clicking 'View Stripe Dashboard' to see detailed payout history.", es: "Debes conectar una cuenta de Stripe para recibir pagos. Así funciona:\n\n1. Haz clic en 'Conectar con Stripe' para vincular tu cuenta bancaria\n2. Completa la verificación de Stripe (toma unos 5 minutos)\n3. Una vez conectado, verás un badge verde 'Banco Conectado'\n\nCalendario de pagos:\n• Te quedas con el 80% de cada pedido — tomamos el 20% de comisión\n• Los depósitos van directamente a tu cuenta bancaria diariamente\n• Los pagos llegan en 2 días hábiles\n• Sin tarifas de registro, sin tarifas mensuales" }}
                  manualSection="vendor-management"
                />
              </div>
              <p className="text-xs text-emerald-300/60">Get paid automatically for every order</p>
            </div>
            {isConnected && (
              <Badge className="ml-auto bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[10px]" data-testid="badge-bank-connected">
                <Check className="size-3 mr-1" /> Bank Connected
              </Badge>
            )}
          </div>
        </div>

        {!connectStatus?.connected && !isPending && (
          <div className="p-5 space-y-5">
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="size-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20"
              >
                <CreditCard className="size-10 text-emerald-400" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Connect Your Bank Account</h3>
              <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
                Link your bank account so you can get paid automatically for every order. No invoicing, no chasing payments — money goes straight to your bank.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Shield, title: "Secure & Private", desc: "Bank-level encryption protects your information. We never see your bank details.", color: "emerald" },
                { icon: Clock, title: "Daily Payouts", desc: "Earnings are deposited directly into your bank account. Payments process daily, arriving within 2 business days.", color: "cyan" },
                { icon: DollarSign, title: "You keep 80%", desc: "We only take a 20% platform fee on completed orders. No signup fees, no monthly fees, no hidden charges.", color: "orange" },
              ].map((item, i) => {
                const Icon = item.icon;
                const colorMap: Record<string, string> = {
                  emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
                  cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400",
                  orange: "from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400",
                };
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${colorMap[item.color]} border backdrop-blur-xl`}
                  >
                    <Icon className="size-6 mb-2" />
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-[11px] text-white/50 leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className={`${GLASS_CARD} rounded-xl p-4 border-emerald-500/20`}>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ClipboardList className="size-4 text-emerald-400" /> How It Works
              </h4>
              <div className="space-y-2">
                {[
                  { step: "1", text: "Click the button below — it takes about 2 minutes" },
                  { step: "2", text: "Enter your basic info and bank account details (routing + account number)" },
                  { step: "3", text: "That's it — you're set up to receive automatic payments" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5"
                  >
                    <span className="size-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">{s.step}</span>
                    <p className="text-xs text-white/70">{s.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleConnectBank}
              disabled={connectLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold min-h-[52px] text-base shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
              data-testid="button-connect-bank"
            >
              {connectLoading ? (
                <><Loader2 className="size-5 mr-2 animate-spin" /> Setting up...</>
              ) : (
                <><CreditCard className="size-5 mr-2" /> Connect Your Bank Account</>
              )}
            </Button>

            <p className="text-[10px] text-white/30 text-center">
              Powered by Stripe — the same payment platform used by Amazon, Shopify, and millions of businesses worldwide. Your bank details are never stored on our servers.
            </p>
          </div>
        )}

        {isPending && (
          <div className="p-5 space-y-4">
            <div className="text-center py-4">
              <div className="size-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
                <Clock className="size-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Setup In Progress</h3>
              <p className="text-sm text-white/50 max-w-md mx-auto">
                Your bank connection is being verified. This usually completes within a few minutes. If you need to finish providing your information, click below.
              </p>
            </div>
            <Button
              onClick={handleConnectBank}
              disabled={connectLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 min-h-[48px]"
              data-testid="button-finish-setup"
            >
              {connectLoading ? (
                <><Loader2 className="size-4 mr-2 animate-spin" /> Loading...</>
              ) : (
                <><ArrowRight className="size-4 mr-2" /> Continue Setup</>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => refetchStatus()}
              className="w-full text-white/50 hover:text-white min-h-[44px]"
              data-testid="button-refresh-status"
            >
              <RotateCcw className="size-4 mr-2" /> Check Status
            </Button>
          </div>
        )}

        {isConnected && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 border border-emerald-500/20"
              >
                <p className="text-[10px] text-emerald-300/60 uppercase tracking-wider mb-1">Available</p>
                <p className="text-2xl font-black text-emerald-400" data-testid="text-available-balance">
                  ${(balance?.available || 0).toFixed(2)}
                </p>
                <p className="text-[10px] text-white/30 mt-1">Ready for payout</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20"
              >
                <p className="text-[10px] text-cyan-300/60 uppercase tracking-wider mb-1">Pending</p>
                <p className="text-2xl font-black text-cyan-400" data-testid="text-pending-balance">
                  ${(balance?.pending || 0).toFixed(2)}
                </p>
                <p className="text-[10px] text-white/30 mt-1">Processing (1-2 days)</p>
              </motion.div>
            </div>

            <div className={`${GLASS_CARD} rounded-xl border-emerald-500/10`}>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="size-4 text-emerald-400" /> Recent Payouts
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenDashboard}
                  disabled={dashboardLoading}
                  className="text-xs text-cyan-400 hover:text-cyan-300 min-h-[36px]"
                  data-testid="button-stripe-dashboard"
                >
                  {dashboardLoading ? <Loader2 className="size-3 animate-spin" /> : <><ExternalLink className="size-3 mr-1" /> Full Dashboard</>}
                </Button>
              </div>
              <div className="p-4">
                {payoutsData?.payouts && payoutsData.payouts.length > 0 ? (
                  <div className="space-y-2">
                    {payoutsData.payouts.slice(0, 10).map((payout: any, i: number) => (
                      <motion.div
                        key={payout.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                        data-testid={`payout-${payout.id}`}
                      >
                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          payout.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          payout.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-white/10 text-white/40'
                        }`}>
                          {payout.status === 'paid' ? <Check className="size-4" /> :
                           payout.status === 'pending' ? <Clock className="size-4" /> :
                           <DollarSign className="size-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">${payout.amount.toFixed(2)}</p>
                          <p className="text-[10px] text-white/40">
                            {new Date(payout.arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <Badge className={`text-[9px] ${
                          payout.status === 'paid' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
                          payout.status === 'pending' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
                          'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {payout.status === 'paid' ? 'Deposited' : payout.status === 'pending' ? 'Processing' : payout.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <DollarSign className="size-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40">No payouts yet</p>
                    <p className="text-[10px] text-white/30 mt-1">Payouts will appear here once you start receiving orders</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`${GLASS_CARD} rounded-xl p-4 border-emerald-500/10`}>
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="size-4 text-emerald-400" /> How You Get Paid
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { icon: ShoppingBag, title: "Customer Orders", desc: "Customer pays through the app at checkout", color: "text-orange-400" },
                  { icon: DollarSign, title: "Automatic Split", desc: "80% goes to you, 20% platform fee", color: "text-emerald-400" },
                  { icon: CreditCard, title: "Daily Deposits", desc: "Earnings deposited to your bank within 2 business days", color: "text-cyan-400" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5">
                      <Icon className={`size-4 shrink-0 mt-0.5 ${item.color}`} />
                      <div>
                        <p className="text-[11px] font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-white/40">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleOpenDashboard}
                disabled={dashboardLoading}
                className="flex-1 border-white/20 text-white hover:bg-white/10 min-h-[44px]"
                data-testid="button-manage-bank"
              >
                {dashboardLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Settings className="size-4 mr-2" />}
                Manage Bank Account
              </Button>
              <Button
                variant="outline"
                onClick={() => refetchStatus()}
                className="border-white/20 text-white hover:bg-white/10 min-h-[44px]"
                data-testid="button-refresh-earnings"
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MarketingTab({ vendor, orderUrl }: { vendor: Vendor; orderUrl: string }) {
  const { t } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<'cards' | 'flyers' | 'media' | 'social' | 'tlidio' | 'receipts' | 'integrations' | 'orbit'>('cards');
  const [cardTemplate, setCardTemplate] = useState<CardTemplateId>('trucker');
  const [cardTheme, setCardTheme] = useState<'dark' | 'light'>('dark');
  const [cardAccent, setCardAccent] = useState('#FF7849');
  const [cardName, setCardName] = useState(vendor.contactName || '');
  const [cardTitle, setCardTitle] = useState('Food Truck Owner');
  const [cardBusiness, setCardBusiness] = useState(vendor.name || '');
  const [cardPhone, setCardPhone] = useState(vendor.phone || '');
  const [cardEmail, setCardEmail] = useState(vendor.email || '');
  const [isDownloading, setIsDownloading] = useState(false);

  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [integrationDetails, setIntegrationDetails] = useState('');
  const [integrationSubmitted, setIntegrationSubmitted] = useState(false);
  const [isSubmittingIntegration, setIsSubmittingIntegration] = useState(false);

  const menuUrl = `${window.location.origin}/menu/${vendor.id}`;
  const isDark = cardTheme === 'dark';
  const txP = isDark ? '#ffffff' : '#1e293b';
  const txS = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(100,116,139,1)';
  const txM = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(148,163,184,1)';

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReceiptImage(ev.target?.result as string);
      setReceiptData(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  const scanReceipt = async () => {
    if (!receiptImage) return;
    setIsScanning(true);
    setScanError(null);
    try {
      const res = await fetch('/api/receipt-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: receiptImage }),
      });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setReceiptData(data.receipt);
    } catch (e) {
      setScanError('Could not read the receipt. Try a clearer photo.');
    }
    setIsScanning(false);
  };

  const submitIntegrationRequest = async () => {
    if (selectedSoftware.length === 0) return;
    setIsSubmittingIntegration(true);
    try {
      await fetch('/api/vendor-integration-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          vendorName: vendor.name,
          software: selectedSoftware.join(', '),
          details: integrationDetails,
          email: vendor.email,
        }),
      });
      setIntegrationSubmitted(true);
    } catch (e) {
      console.error(e);
    }
    setIsSubmittingIntegration(false);
  };

  const handleDownloadCard = async (format: 'png' | 'pdf') => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      if (format === 'png') {
        await captureElementAsImage(cardRef.current, `${vendor.slug || vendor.name}-business-card.png`, { scale: 4 });
      } else {
        await captureElementAsPDF(cardRef.current, `${vendor.slug || vendor.name}-business-card.pdf`, {
          scale: 3, orientation: 'landscape', format: [3.5, 2],
        });
      }
    } catch (e) { console.error(e); }
    setIsDownloading(false);
  };

  const handleEmailCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      await captureElementAndEmail(cardRef.current, `${vendor.slug || vendor.name}-card.png`, `Business Card - ${vendor.name}`, { scale: 3 });
    } catch (e) { console.error(e); }
    setIsDownloading(false);
  };

  const cardWrapper: React.CSSProperties = {
    width: 420, height: 240, borderRadius: 12, overflow: 'hidden', position: 'relative',
    fontFamily: 'system-ui, sans-serif',
    background: cardTemplate === 'neon' ? '#0a0a0a' : cardTemplate === 'trucker' ? (isDark ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #e2e8f0, #f1f5f9)') : isDark ? 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)' : '#ffffff',
    ...((!isDark && cardTemplate !== 'neon') ? { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}),
  };

  const dn = cardName || 'Your Name';
  const dt = cardTitle || 'Food Truck Owner';
  const db = cardBusiness || vendor.name;
  const nameStyle: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: txP, lineHeight: 1.2, margin: 0 };

  const logoBlock = (
    <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: `1px solid ${cardAccent}50` }}>
      <img src={vendor.logoUrl || "/happyeats-smiley-hires.png"} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );

  const qrBlock = (
    <div style={{ padding: 6, borderRadius: 6, background: '#fff', display: 'inline-block', flexShrink: 0 }}>
      <QRCodeSVG value={menuUrl} size={50} level="M" includeMargin={false} fgColor={cardAccent} />
    </div>
  );

  const contactBlock = (
    <div>
      {cardPhone && <p style={{ fontSize: 11, color: txS, margin: '1px 0' }}>{cardPhone}</p>}
      {cardEmail && <p style={{ fontSize: 11, color: txS, margin: '1px 0' }}>{cardEmail}</p>}
      <p style={{ fontSize: 11, fontWeight: 500, color: cardAccent, margin: '1px 0' }}>happyeats.app</p>
    </div>
  );

  const badgeBlock = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: cardAccent }}>
      <Shield style={{ width: 12, height: 12 }} />
      <span style={{ fontSize: 9 }}>Trust Layer Verified</span>
    </div>
  );

  const renderBusinessCard = () => {
    const content = { position: 'relative' as const, zIndex: 2, width: '100%', height: '100%' };

    if (cardTemplate === 'classic') return (
      <div ref={cardRef} style={cardWrapper}>
        <div style={{ ...content, padding: 20, display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {logoBlock}
              <div style={{ minWidth: 0 }}>
                <h2 style={nameStyle}>{dn}</h2>
                <p style={{ fontSize: 12, color: cardAccent, margin: '3px 0' }}>{dt}</p>
                <p style={{ fontSize: 11, color: txS, margin: 0 }}>{db}</p>
              </div>
            </div>
            {contactBlock}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
            {qrBlock}
            <div style={{ textAlign: 'right' }}>{badgeBlock}</div>
          </div>
        </div>
      </div>
    );

    if (cardTemplate === 'bold') return (
      <div ref={cardRef} style={cardWrapper}>
        <div style={{ ...content, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 8, background: cardAccent, width: '100%' }} />
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ ...nameStyle, letterSpacing: '-0.5px' }}>{dn}</h2>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.15em', color: cardAccent, marginTop: 4 }}>{dt}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: txP }}>{db}</p>
                {contactBlock}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {qrBlock}
                <div style={{ textAlign: 'right' }}>{badgeBlock}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    if (cardTemplate === 'trucker') return (
      <div ref={cardRef} style={cardWrapper}>
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ width: 12, background: `repeating-linear-gradient(45deg, ${cardAccent}, ${cardAccent} 4px, transparent 4px, transparent 8px)` }} />
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck style={{ width: 20, height: 20, color: cardAccent }} />
                  <h2 style={nameStyle}>{dn}</h2>
                </div>
                <p style={{ fontSize: 11, color: cardAccent, marginTop: 2 }}>{dt} &bull; {db}</p>
              </div>
              {logoBlock}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 10, color: txM, marginBottom: 4 }}>Order by 10:30 AM for lunch delivery!</p>
                {contactBlock}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{badgeBlock}</div>
            </div>
          </div>
        </div>
      </div>
    );

    if (cardTemplate === 'neon') return (
      <div ref={cardRef} style={{ ...cardWrapper, boxShadow: `inset 0 0 30px ${cardAccent}15, 0 0 15px ${cardAccent}10` }}>
        <div style={{ ...content, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ ...nameStyle, textShadow: `0 0 10px ${cardAccent}80` }}>{dn}</h2>
              <p style={{ fontSize: 11, fontWeight: 500, color: cardAccent, textShadow: `0 0 5px ${cardAccent}60` }}>{dt}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{db}</p>
            </div>
            {logoBlock}
          </div>
          <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${cardAccent}, transparent)` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            {contactBlock}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{qrBlock}{badgeBlock}</div>
          </div>
        </div>
      </div>
    );

    if (cardTemplate === 'split') return (
      <div ref={cardRef} style={cardWrapper}>
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ width: 140, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: cardAccent }}>
            {logoBlock && <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 4 }}>{logoBlock}</div>}
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>{db}</h2>
            {badgeBlock}
          </div>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: isDark ? '#0f172a' : '#ffffff' }}>
            <div>
              <h2 style={nameStyle}>{dn}</h2>
              <p style={{ fontSize: 11, color: cardAccent }}>{dt}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {contactBlock}
              {qrBlock}
            </div>
          </div>
        </div>
      </div>
    );

    if (cardTemplate === 'modern') return (
      <div ref={cardRef} style={cardWrapper}>
        <div style={{ ...content, display: 'flex' }}>
          <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 4, borderRadius: 2, background: cardAccent }} />
                <div style={{ width: 16, height: 4, borderRadius: 2, background: cardAccent + '60' }} />
              </div>
              <h2 style={nameStyle}>{dn}</h2>
              <p style={{ fontSize: 11, fontWeight: 500, color: cardAccent, marginTop: 2 }}>{dt}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 500, color: txP, marginBottom: 4 }}>{db}</p>
              {contactBlock}
            </div>
          </div>
          <div style={{ width: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: cardAccent + '15', borderLeft: `1px solid ${cardAccent}40` }}>
            {logoBlock}
            {qrBlock}
            {badgeBlock}
          </div>
        </div>
      </div>
    );

    return null;
  };

  const sections = [
    { id: 'cards' as const, label: 'Business Cards', icon: <CreditCard className="size-4" />, color: 'rose' },
    { id: 'flyers' as const, label: 'Flyers', icon: <FileText className="size-4" />, color: 'orange' },
    { id: 'media' as const, label: 'Media Studio', icon: <Camera className="size-4" />, color: 'blue' },
    { id: 'social' as const, label: 'Social & Brand', icon: <Share2 className="size-4" />, color: 'pink' },
    { id: 'tlidio' as const, label: 'SignalCast', icon: <Zap className="size-4" />, color: 'indigo' },
    { id: 'receipts' as const, label: 'Receipt Scanner', icon: <Eye className="size-4" />, color: 'cyan' },
    { id: 'integrations' as const, label: 'Software', icon: <Layers className="size-4" />, color: 'violet' },
    { id: 'orbit' as const, label: 'Payroll & HR', icon: <Users className="size-4" />, color: 'emerald' },
  ];

  const sectionColorMap: Record<string, string> = {
    rose: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    pink: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    violet: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  };

  return (
    <div className="space-y-4">
      {/* Free Business Page CTA */}
      {vendor.slug && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${GLASS_CARD} border-emerald-500/25 overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] to-sky-500/[0.03]" />
            <CardContent className="p-4 relative">
              <div className="flex items-start gap-3 mb-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <Globe className="size-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Your Free Business Page
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">FREE</Badge>
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Auto-generated from your profile. Share it, put it on your truck, use it as your website.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 mb-3">
                <code className="flex-1 text-[11px] text-emerald-300/70 truncate">{window.location.origin}/v/{vendor.slug}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/v/${vendor.slug}`); toast({ title: "Link copied!" }); }}
                  className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  data-testid="button-copy-vendor-page"
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Link href={`/v/${vendor.slug}`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-xs h-9 gap-1.5" data-testid="button-view-vendor-page">
                    <ExternalLink className="size-3" /> View Your Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`${GLASS_CARD} border-rose-500/20`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center border border-rose-500/30">
                <Award className="size-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Vendor Marketing Toolkit</h3>
                <p className="text-[10px] text-muted-foreground">Free tools to grow your food truck business</p>
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)} data-testid={`marketing-section-${s.id}`}
                  className={`px-3 py-2 rounded-lg text-[11px] flex items-center gap-1.5 whitespace-nowrap transition-all min-h-[40px] ${activeSection === s.id ? sectionColorMap[s.color] : 'text-muted-foreground hover:text-white bg-white/5 border border-white/5'}`}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

          {activeSection === 'cards' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-rose-500/15`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard className="size-4 text-rose-400" /> Business Card Designer
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] ml-auto">6 Templates</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  <div className="flex justify-center overflow-x-auto pb-2">
                    <div className="flex-shrink-0">{renderBusinessCard()}</div>
                  </div>
                  <p className="text-center text-[10px] text-muted-foreground">3.5" x 2" standard &bull; QR code links to your menu &bull; Print-ready for FedEx, Staples, Office Max</p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    <Button onClick={() => handleDownloadCard('png')} disabled={isDownloading} data-testid="button-vendor-card-png" size="sm" className="gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 min-h-[40px] text-xs">
                      {isDownloading ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />} PNG
                    </Button>
                    <Button onClick={() => handleDownloadCard('pdf')} disabled={isDownloading} data-testid="button-vendor-card-pdf" size="sm" variant="outline" className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/10 min-h-[40px] text-xs">
                      <FileText className="size-3" /> PDF
                    </Button>
                    <Button onClick={handleEmailCard} disabled={isDownloading} data-testid="button-vendor-card-email" size="sm" variant="outline" className="gap-1.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 min-h-[40px] text-xs">
                      <Mail className="size-3" /> Email
                    </Button>
                    <Link href="/marketing-materials">
                      <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 min-h-[40px] text-xs w-full" data-testid="button-full-card-editor">
                        <Palette className="size-3" /> Full Editor
                      </Button>
                    </Link>
                    <Button onClick={() => { setCardName(vendor.contactName || ''); setCardBusiness(vendor.name || ''); setCardPhone(vendor.phone || ''); setCardEmail(vendor.email || ''); setCardTemplate('trucker'); setCardAccent('#FF7849'); }} size="sm" variant="outline" className="gap-1.5 border-white/10 text-white/50 hover:bg-white/5 min-h-[40px] text-xs" data-testid="button-reset-vendor-card">
                      <RotateCcw className="size-3" /> Reset
                    </Button>
                  </div>

                  <Accordion type="single" collapsible defaultValue="template">
                    <AccordionItem value="template" className="border-0">
                      <AccordionTrigger className="hover:no-underline py-2 text-xs text-white/60">
                        <span className="flex items-center gap-1.5"><Layers className="size-3" /> Template & Style</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                            {CARD_TEMPLATES.map(tmpl => (
                              <button key={tmpl.id} onClick={() => setCardTemplate(tmpl.id)} data-testid={`vendor-card-template-${tmpl.id}`}
                                className={`px-2 py-2 rounded-md text-[11px] transition-all ${cardTemplate === tmpl.id ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 ring-1 ring-rose-500/20' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                                <span className="font-semibold block">{tmpl.label}</span>
                                <span className="text-[9px] opacity-60">{tmpl.desc}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setCardTheme('dark')} className={`px-3 py-1.5 rounded-md text-[11px] ${cardTheme === 'dark' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-white/50 border border-white/10'}`}>Dark</button>
                            <button onClick={() => setCardTheme('light')} className={`px-3 py-1.5 rounded-md text-[11px] ${cardTheme === 'light' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-white/50 border border-white/10'}`}>Light</button>
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground mb-1.5 block">Accent Color</label>
                            <div className="flex gap-1.5">
                              {CARD_ACCENT_COLORS.map(col => (
                                <button key={col.id} onClick={() => setCardAccent(col.value)} data-testid={`vendor-card-color-${col.id}`}
                                  className={`size-7 rounded-full transition-all border ${cardAccent === col.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 border-white/50' : 'border-white/10 hover:scale-105'}`}
                                  style={{ backgroundColor: col.value }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="info" className="border-0">
                      <AccordionTrigger className="hover:no-underline py-2 text-xs text-white/60">
                        <span className="flex items-center gap-1.5"><Type className="size-3" /> Edit Info</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { val: cardName, set: setCardName, label: 'Your Name', ph: vendor.contactName || 'Your Name' },
                            { val: cardTitle, set: setCardTitle, label: 'Title', ph: 'Food Truck Owner' },
                            { val: cardBusiness, set: setCardBusiness, label: 'Business Name', ph: vendor.name },
                            { val: cardPhone, set: setCardPhone, label: 'Phone', ph: vendor.phone || '(615) 555-1234' },
                            { val: cardEmail, set: setCardEmail, label: 'Email', ph: vendor.email || 'you@email.com' },
                          ].map(f => (
                            <div key={f.label}>
                              <label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</label>
                              <input type="text" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                                className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-rose-500/50" />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'flyers' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-orange-500/15`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="size-4 text-orange-400" /> Flyer Generator
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] ml-auto">Print Ready</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Create professional flyers to hand out at truck stops, businesses, and events. Pre-loaded with Happy Eats branding and your truck info.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/food-truck-flyer">
                      <Card className={`${GLASS_CARD} border-orange-500/20 hover:border-orange-500/40 cursor-pointer transition-all h-full`} data-testid="link-partner-flyer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30">
                              <Megaphone className="size-5 text-orange-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">Partner Recruitment Flyer</p>
                              <p className="text-[10px] text-muted-foreground">Recruit new food truck vendors</p>
                            </div>
                            <ArrowRight className="size-4 text-orange-400" />
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-[9px]">6 Colors</Badge>
                            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-[9px]">EN/ES</Badge>
                            <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 text-[9px]">QR Code</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/flyer">
                      <Card className={`${GLASS_CARD} border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all h-full`} data-testid="link-customer-flyer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                              <Users className="size-5 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">Customer Flyer</p>
                              <p className="text-[10px] text-muted-foreground">Attract customers to order</p>
                            </div>
                            <ArrowRight className="size-4 text-cyan-400" />
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[9px]">6 Colors</Badge>
                            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[9px]">EN/ES</Badge>
                            <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-[9px]">Print Ready</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                    <p className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                      <Megaphone className="size-3.5" /> Pro Tip: Hand out flyers at truck stops and businesses
                    </p>
                    <p className="text-[10px] text-amber-300/60 mt-1">
                      Key message: "Order lunch by 10:30 AM on the Happy Eats app — delivered by noon!" Leave flyers at warehouses, logistics hubs, and offices along the I-24 corridor.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'media' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-blue-500/20 overflow-hidden`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-purple-500/10" />
                  <div className="relative px-4 pt-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                        <Camera className="size-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">Media Studio</h3>
                        <p className="text-xs text-blue-300 font-medium">Professional tools to create stunning visuals</p>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[9px] mt-1">Free for Vendors</Badge>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Create eye-catching flyers, social media posts, and promotional materials using our full media suite — the same tools our admins use.
                    </p>
                  </div>
                </div>
                <CardContent className="px-4 pb-4 pt-0 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/ai-flyer-creator">
                      <Card className={`${GLASS_CARD} border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all h-full group`} data-testid="link-ai-flyer-creator">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30 group-hover:scale-105 transition-transform">
                              <Sparkles className="size-5 text-purple-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">AI Flyer Creator</p>
                              <p className="text-[10px] text-muted-foreground">AI writes your copy & designs the flyer</p>
                            </div>
                            <ArrowRight className="size-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[9px]">AI-Powered</Badge>
                            <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[9px]">4 Styles</Badge>
                            <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[9px]">Print Ready</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/media-editor">
                      <Card className={`${GLASS_CARD} border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all h-full group`} data-testid="link-media-editor">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                              <Palette className="size-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">Media Editor Pro</p>
                              <p className="text-[10px] text-muted-foreground">Photo, video & audio editing suite</p>
                            </div>
                            <ArrowRight className="size-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[9px]">Photo</Badge>
                            <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[9px]">Video</Badge>
                            <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[9px]">Audio</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link href="/marketing-materials">
                      <Card className={`${GLASS_CARD} border-amber-500/20 hover:border-amber-500/40 cursor-pointer transition-all h-full group`} data-testid="link-print-studio">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
                              <Printer className="size-4 text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">Print Studio</p>
                              <p className="text-[10px] text-muted-foreground">Advanced card editor, 12 templates</p>
                            </div>
                            <ArrowRight className="size-3 text-amber-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    <Link href="/marketing-hub">
                      <Card className={`${GLASS_CARD} border-rose-500/20 hover:border-rose-500/40 cursor-pointer transition-all h-full group`} data-testid="link-marketing-hub">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center border border-rose-500/30">
                              <Megaphone className="size-4 text-rose-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-white">Full Marketing Hub</p>
                              <p className="text-[10px] text-muted-foreground">Social scheduler, brand assets, analytics</p>
                            </div>
                            <ArrowRight className="size-3 text-rose-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                    <p className="text-[11px] text-blue-300 font-medium flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> All tools are free for Happy Eats vendors
                    </p>
                    <p className="text-[10px] text-blue-300/60 mt-1">
                      Create professional marketing materials to promote your truck — flyers, business cards, social posts, and more. Download as PNG, PDF, or share directly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'social' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-pink-500/20 overflow-hidden`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 via-rose-500/5 to-violet-500/10" />
                  <div className="relative px-4 pt-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20 flex-shrink-0">
                        <Share2 className="size-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">Social Media & Brand</h3>
                        <p className="text-xs text-pink-300 font-medium">Grow your following and build your brand</p>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="px-4 pb-4 pt-0 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <TrendingUp className="size-3.5 text-pink-400" /> Quick-Share Your Menu
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const text = `Check out ${vendor.name} on Happy Eats! Order fresh food delivered to your location.\n\n${orderUrl}`;
                          if (navigator.share) { navigator.share({ title: vendor.name, text, url: orderUrl }).catch(() => {}); }
                          else { navigator.clipboard.writeText(text); toast({ title: 'Copied to clipboard!' }); }
                        }}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs min-h-[40px] flex-1"
                        data-testid="button-share-social"
                      >
                        <Share2 className="size-3.5 mr-1.5" /> Share Menu Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const text = `Order from ${vendor.name} on Happy Eats!\n${orderUrl}\n\n#HappyEats #FoodTruck #Nashville #FreshFood #LunchDelivery`;
                          navigator.clipboard.writeText(text);
                          toast({ title: 'Social post copied!' });
                        }}
                        className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10 text-xs min-h-[40px] flex-1"
                        data-testid="button-copy-social-post"
                      >
                        <Copy className="size-3.5 mr-1.5" /> Copy Social Post
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Palette className="size-3.5 text-amber-400" /> Brand Assets for Your Truck
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Your QR Code", desc: "Customers scan to order", content: (
                          <div className="bg-white p-2 rounded-lg inline-block mx-auto">
                            <QRCodeSVG value={orderUrl} size={80} level="M" fgColor="#FF7849" />
                          </div>
                        )},
                        { label: "Menu Link", desc: "Share anywhere", content: (
                          <div className="space-y-2">
                            <code className="text-[10px] text-emerald-400 break-all block bg-black/30 rounded p-2">{orderUrl}</code>
                            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(orderUrl); toast({ title: 'Link copied!' }); }}
                              className="w-full h-7 text-[10px] border-emerald-500/20 text-emerald-400">
                              <Copy className="size-2.5 mr-1" /> Copy Link
                            </Button>
                          </div>
                        )},
                      ].map((asset, i) => (
                        <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center space-y-2">
                          <p className="text-[11px] font-bold text-white">{asset.label}</p>
                          <p className="text-[9px] text-muted-foreground">{asset.desc}</p>
                          {asset.content}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Megaphone className="size-3.5 text-violet-400" /> Social Media Ideas
                    </p>
                    <div className="space-y-2">
                      {[
                        { platform: "Instagram/Facebook", post: `Fresh from ${vendor.name}! Order by 10:30 AM for lunch delivery straight to your work site. Link in bio!`, hashtags: "#HappyEats #FoodTruck #Nashville #FreshFood" },
                        { platform: "Twitter/X", post: `Hungry? ${vendor.name} delivers! Order on Happy Eats before 10:30 AM for noon delivery. ${orderUrl}`, hashtags: "#NashvilleEats #FoodTruckLife" },
                        { platform: "Nextdoor", post: `Hey neighbors! ${vendor.name} is now delivering through Happy Eats. Order fresh food to your door — check out our menu: ${orderUrl}`, hashtags: "" },
                      ].map((idea, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-violet-500/15 text-violet-300 border-violet-500/25 text-[9px]">{idea.platform}</Badge>
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-violet-400 hover:text-violet-300 px-2"
                              onClick={() => { navigator.clipboard.writeText(`${idea.post}${idea.hashtags ? '\n\n' + idea.hashtags : ''}`); toast({ title: 'Post copied!' }); }}>
                              <Copy className="size-2.5 mr-1" /> Copy
                            </Button>
                          </div>
                          <p className="text-[11px] text-white/70 leading-relaxed">{idea.post}</p>
                          {idea.hashtags && <p className="text-[10px] text-violet-400/60">{idea.hashtags}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-pink-500/10 border border-pink-500/20 p-3">
                    <p className="text-[11px] text-pink-300 font-medium flex items-center gap-1.5">
                      <TrendingUp className="size-3.5" /> Pro Tip: Post 3-5 times per week
                    </p>
                    <p className="text-[10px] text-pink-300/60 mt-1">
                      Share photos of your food, behind-the-scenes prep, and happy customers. Tag @HappyEatsApp and use #HappyEats for a chance to be featured on our page!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'tlidio' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-indigo-500/20 overflow-hidden`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-violet-500/10 to-blue-500/10" />
                  <div className="relative px-4 pt-5 pb-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                        <Zap className="size-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">SignalCast</h3>
                        <p className="text-xs text-indigo-300 font-medium">Automated Social Media for Your Business</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Stop spending hours on social media. SignalCast automatically creates and posts content to <span className="text-blue-300 font-semibold">Facebook</span>, <span className="text-pink-300 font-semibold">Instagram</span>, and <span className="text-sky-300 font-semibold">X (Twitter)</span> — all powered by Meta and social platform APIs. More platforms coming soon.
                    </p>
                  </div>
                </div>
                <CardContent className="px-4 pb-4 pt-0 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { platform: "Facebook", icon: "📘", color: "from-blue-500/15 to-blue-600/10 border-blue-500/25", desc: "Auto-post menus, specials & updates to your business page" },
                      { platform: "Instagram", icon: "📸", color: "from-pink-500/15 to-rose-500/10 border-pink-500/25", desc: "Schedule posts, stories & reels with food photography" },
                      { platform: "X (Twitter)", icon: "💬", color: "from-sky-500/15 to-cyan-500/10 border-sky-500/25", desc: "Auto-tweet daily specials, locations & limited-time offers" },
                    ].map((p, i) => (
                      <div key={i} className={`p-3 rounded-lg bg-gradient-to-br ${p.color} border text-center space-y-1.5`}>
                        <span className="text-2xl">{p.icon}</span>
                        <p className="text-[11px] font-bold text-white">{p.platform}</p>
                        <p className="text-[9px] text-white/50 leading-relaxed">{p.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-indigo-400" />
                      <p className="text-xs font-bold text-white">What SignalCast Does For You</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: "Auto-Schedule", desc: "Posts go out at peak engagement times" },
                        { title: "AI Captions", desc: "Smart captions written for each platform" },
                        { title: "Menu Sync", desc: "Your Happy Eats menu auto-updates your socials" },
                        { title: "Analytics", desc: "Track reach, engagement & follower growth" },
                        { title: "Multi-Platform", desc: "One dashboard for all your social accounts" },
                        { title: "Content Library", desc: "Food photography templates & brand assets" },
                      ].map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/5">
                          <Check className="size-3 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-white">{feat.title}</p>
                            <p className="text-[9px] text-white/40">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-white/5" />

                  <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 space-y-3">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <CreditCard className="size-3.5 text-amber-400" /> Subscription Add-On
                    </p>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      SignalCast is available as a subscription add-on to your Happy Eats vendor account. Connect all your social accounts and let the automation handle posting while you focus on cooking.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => window.open('https://signalcast.tlid.io', '_blank')}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs min-h-[44px] font-bold shadow-lg shadow-indigo-500/20"
                      data-testid="button-tlidio-subscribe"
                    >
                      <ExternalLink className="size-3.5 mr-2" /> Visit SignalCast — Get Started
                    </Button>
                    <p className="text-[9px] text-center text-white/30">Subscription managed through SignalCast. Pairs with your Happy Eats vendor account.</p>
                  </div>

                  <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                    <p className="text-[11px] text-indigo-300 font-medium flex items-center gap-1.5">
                      <Globe className="size-3.5" /> More Platforms Coming Soon
                    </p>
                    <p className="text-[10px] text-indigo-300/60 mt-1">
                      TikTok, LinkedIn, YouTube Shorts, and Nextdoor integrations are in development. Get started now with Facebook, Instagram, and X.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'receipts' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-cyan-500/15`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="size-4 text-cyan-400" /> Receipt Scanner
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] ml-auto">AI-Powered OCR</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Snap a photo of any business receipt and our AI will extract all the details — merchant, items, totals, tax. Great for expense tracking and tax time.</p>

                  <input ref={receiptInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleReceiptUpload} />

                  {!receiptImage && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={() => receiptInputRef.current?.click()} data-testid="button-take-receipt-photo"
                        className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer">
                        <Camera className="size-8 text-cyan-400" />
                        <span className="text-xs font-medium text-white">Take Photo</span>
                        <span className="text-[10px] text-muted-foreground">Use your camera</span>
                      </button>
                      <button onClick={() => { if (receiptInputRef.current) { receiptInputRef.current.removeAttribute('capture'); receiptInputRef.current.click(); receiptInputRef.current.setAttribute('capture', 'environment'); }}} data-testid="button-upload-receipt"
                        className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all cursor-pointer">
                        <Upload className="size-8 text-violet-400" />
                        <span className="text-xs font-medium text-white">Upload Image</span>
                        <span className="text-[10px] text-muted-foreground">From your files</span>
                      </button>
                    </div>
                  )}

                  {receiptImage && (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-[300px]">
                        <img src={receiptImage} alt="Receipt" className="w-full object-contain max-h-[300px]" />
                        <button onClick={() => { setReceiptImage(null); setReceiptData(null); setScanError(null); }}
                          className="absolute top-2 right-2 size-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                          <X className="size-4" />
                        </button>
                      </div>

                      {!receiptData && !scanError && (
                        <Button onClick={scanReceipt} disabled={isScanning} className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 min-h-[44px]" data-testid="button-scan-receipt">
                          {isScanning ? <><Loader2 className="size-4 animate-spin mr-2" /> Scanning...</> : <><Eye className="size-4 mr-2" /> Scan Receipt</>}
                        </Button>
                      )}

                      {scanError && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                          <p className="text-xs text-red-300">{scanError}</p>
                          <Button onClick={scanReceipt} size="sm" variant="outline" className="mt-2 border-red-500/30 text-red-300 text-xs">Try Again</Button>
                        </div>
                      )}

                      {receiptData && (
                        <Card className={`${GLASS_CARD} border-emerald-500/20`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Check className="size-4 text-emerald-400" />
                              <p className="text-sm font-bold text-emerald-300">Receipt Scanned</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-[10px] text-muted-foreground">Merchant</p>
                                <p className="text-xs font-medium text-white">{receiptData.merchant || 'Unknown'}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-[10px] text-muted-foreground">Date</p>
                                <p className="text-xs font-medium text-white">{receiptData.date || 'Unknown'}</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-2">
                                <p className="text-[10px] text-muted-foreground">Tax</p>
                                <p className="text-xs font-medium text-white">{receiptData.tax != null ? `$${Number(receiptData.tax).toFixed(2)}` : 'N/A'}</p>
                              </div>
                              <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                                <p className="text-[10px] text-emerald-400">Total</p>
                                <p className="text-sm font-bold text-emerald-300">{receiptData.total != null ? `$${Number(receiptData.total).toFixed(2)}` : 'N/A'}</p>
                              </div>
                            </div>
                            {receiptData.items && receiptData.items.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground">Items</p>
                                {receiptData.items.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center text-xs bg-white/5 rounded px-2 py-1">
                                    <span className="text-white/80">{item.name}</span>
                                    <span className="text-white font-medium">{item.price != null ? `$${Number(item.price).toFixed(2)}` : ''}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button onClick={() => { setReceiptImage(null); setReceiptData(null); }} size="sm" variant="outline" className="flex-1 border-cyan-500/30 text-cyan-300 text-xs min-h-[40px]" data-testid="button-scan-another">
                                <Camera className="size-3 mr-1.5" /> Scan Another
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-violet-500/15`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="size-4 text-violet-400" /> Software Integrations
                    <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px] ml-auto">Request Access</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Tell us what accounting or POS software you use, and we'll build the integration for you. We'll handle the OAuth authorization and sync your Happy Eats sales data automatically.
                  </p>

                  {integrationSubmitted ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 text-center space-y-3">
                      <div className="size-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                        <Check className="size-7 text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-bold text-emerald-300">Request Submitted!</h4>
                      <p className="text-xs text-muted-foreground">
                        We'll reach out to {vendor.email} when your {selectedSoftware.join(' & ')} integration is ready. We'll handle all the setup — just authorize the connection when we notify you.
                      </p>
                      <Button onClick={() => { setIntegrationSubmitted(false); setSelectedSoftware([]); setIntegrationDetails(''); }} size="sm" variant="outline" className="border-emerald-500/30 text-emerald-300 text-xs">
                        Request Another
                      </Button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {ACCOUNTING_SOFTWARE.map(sw => (
                          <button key={sw.id} onClick={() => setSelectedSoftware(prev => prev.includes(sw.id) ? prev.filter(s => s !== sw.id) : [...prev, sw.id])} data-testid={`integration-${sw.id}`}
                            className={`p-3 rounded-lg text-left transition-all ${selectedSoftware.includes(sw.id) ? 'bg-violet-500/15 border border-violet-500/40 ring-1 ring-violet-500/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                            <div className="flex items-center gap-2">
                              {selectedSoftware.includes(sw.id) && <Check className="size-3 text-violet-400" />}
                              <p className="text-xs font-medium text-white">{sw.name}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{sw.desc}</p>
                          </button>
                        ))}
                      </div>

                      {selectedSoftware.includes('other') && (
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1 block">What software do you use?</label>
                          <input type="text" value={integrationDetails} onChange={e => setIntegrationDetails(e.target.value)} placeholder="e.g., Sage, Zoho Books, custom POS..."
                            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500/50" data-testid="input-other-software" />
                        </div>
                      )}

                      {selectedSoftware.length > 0 && (
                        <Button onClick={submitIntegrationRequest} disabled={isSubmittingIntegration} className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 min-h-[44px]" data-testid="button-submit-integration">
                          {isSubmittingIntegration ? <Loader2 className="size-4 animate-spin mr-2" /> : <ArrowRight className="size-4 mr-2" />}
                          Request {selectedSoftware.length} Integration{selectedSoftware.length > 1 ? 's' : ''}
                        </Button>
                      )}

                      <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                        <p className="text-[11px] text-violet-300 font-medium">What happens next?</p>
                        <ul className="text-[10px] text-violet-300/60 mt-1 space-y-0.5">
                          <li>1. We build the integration for your software</li>
                          <li>2. You'll get an email to authorize the connection</li>
                          <li>3. Your Happy Eats sales sync automatically</li>
                          <li>4. Expenses, invoices, and revenue — all in one place</li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className={`${GLASS_CARD} border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Building2 className="size-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-300">Don't have bookkeeping software?</p>
                      <p className="text-[10px] text-emerald-300/60">We've got you covered — check out the Payroll & HR tab</p>
                    </div>
                    <Button onClick={() => setActiveSection('orbit')} size="sm" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-[10px] h-7" data-testid="button-go-to-orbit">
                      <ArrowRight className="size-3 mr-1" /> Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'orbit' && (
            <div className="space-y-4">
              <Card className={`${GLASS_CARD} border-emerald-500/20 overflow-hidden`}>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-500/10 to-cyan-500/10" />
                  <div className="relative px-4 pt-5 pb-4">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                        <Globe className="size-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">Orbit Staffing</h3>
                        <p className="text-xs text-emerald-300 font-medium">Payroll, HR & Bookkeeping Hub</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">Powered by Trust Layer</Badge>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">Save 40-60%</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-white/90 leading-relaxed mb-1">
                      Running a food truck is hard enough without worrying about payroll, taxes, and bookkeeping. <span className="text-emerald-300 font-semibold">Orbit Staffing</span> is your all-in-one back office — built specifically for small food businesses like yours.
                    </p>
                  </div>
                </div>

                <CardContent className="px-4 pb-4 space-y-4 pt-0">
                  <div className="rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-3">
                    <p className="text-xs font-bold text-amber-300 mb-1">The Problem We Solve</p>
                    <p className="text-[11px] text-amber-200/70 leading-relaxed">
                      Most food truck owners are either paying $200-$500/month for bookkeeping services they barely use, or they're managing everything in shoe boxes and spreadsheets. Either way, tax season becomes a nightmare, employee payments get messy, and you're spending nights on paperwork instead of perfecting your recipes.
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                      <Zap className="size-3.5 text-emerald-400" /> Everything You Need, One Platform
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { icon: <DollarSign className="size-4" />, title: 'Automated Payroll', desc: 'Pay your crew on time, every time. Handles hourly, salary, tips, and seasonal workers. Direct deposit included.', bg: 'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/10', iconBg: 'bg-emerald-500/20 text-emerald-400' },
                        { icon: <Receipt className="size-4" />, title: '1099 & Tax Filing', desc: 'Automatic 1099 generation for contractors. Quarterly tax estimates. Year-end filings done for you — no surprises in April.', bg: 'bg-teal-500/5 border-teal-500/15 hover:bg-teal-500/10', iconBg: 'bg-teal-500/20 text-teal-400' },
                        { icon: <ClipboardList className="size-4" />, title: 'Bookkeeping & Expenses', desc: 'Every sale from Happy Eats syncs automatically. Track supplies, fuel, commissary fees, and equipment. Know your real profit margins.', bg: 'bg-cyan-500/5 border-cyan-500/15 hover:bg-cyan-500/10', iconBg: 'bg-cyan-500/20 text-cyan-400' },
                        { icon: <Users className="size-4" />, title: 'HR & Hiring', desc: 'Post jobs, onboard new hires, manage schedules, and track hours. Digital I-9s and W-4s. No more paper forms in your glove box.', bg: 'bg-blue-500/5 border-blue-500/15 hover:bg-blue-500/10', iconBg: 'bg-blue-500/20 text-blue-400' },
                        { icon: <Briefcase className="size-4" />, title: 'Contractor Management', desc: 'Manage substitute cooks, event staff, and part-time help. Track who worked what shift, and pay them accurately.', bg: 'bg-indigo-500/5 border-indigo-500/15 hover:bg-indigo-500/10', iconBg: 'bg-indigo-500/20 text-indigo-400' },
                        { icon: <BarChart3 className="size-4" />, title: 'Financial Reports', desc: 'Profit & loss, revenue trends, expense breakdowns, and tax summaries — all in plain English, not accountant-speak.', bg: 'bg-violet-500/5 border-violet-500/15 hover:bg-violet-500/10', iconBg: 'bg-violet-500/20 text-violet-400' },
                      ].map((feature, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${feature.bg}`}>
                          <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${feature.iconBg}`}>
                            {feature.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">{feature.title}</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{feature.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 space-y-3">
                    <p className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                      <TrendingUp className="size-3.5" /> Why Food Truck Owners Love Orbit
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { stat: '40-60%', label: 'cheaper than traditional bookkeeping services' },
                        { stat: '10 hrs', label: 'saved per month on paperwork and admin tasks' },
                        { stat: '$0', label: 'tax penalties — we handle filings and deadlines' },
                        { stat: '100%', label: 'synced with your Happy Eats sales data' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-center">
                          <p className="text-lg font-black text-emerald-400">{item.stat}</p>
                          <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-2">
                      <Headphones className="size-3.5 text-teal-400" /> Built for Small Food Businesses
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Orbit isn't some generic corporate payroll system crammed into a food truck. We built it ground-up for mobile food vendors, pop-up kitchens, and small restaurant operations. Whether you're a one-person taco truck or running 3 trucks with a crew of 12, Orbit scales with you. No long contracts, no hidden fees, no accountant required.
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Solo Operators', 'Multi-Truck Fleets', 'Pop-Up Kitchens', 'Catering Crews', 'Commissary Operations', 'Seasonal Vendors'].map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] text-teal-300">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 p-4 space-y-3">
                    <p className="text-xs font-bold text-white">Ready to stop drowning in paperwork?</p>
                    <p className="text-[11px] text-emerald-200/70">
                      As a Happy Eats vendor, you get priority access and exclusive pricing on Orbit Staffing. Your sales data already syncs — just connect the rest and let Orbit handle your back office.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a href="https://orbitstaffing.io" target="_blank" rel="noopener noreferrer" data-testid="link-orbit-signup"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 min-h-[44px]">
                        <Globe className="size-4" /> Get Started with Orbit
                        <ExternalLink className="size-3 opacity-70" />
                      </a>
                      <a href="mailto:support@orbitstaffing.io?subject=Happy%20Eats%20Vendor%20-%20Orbit%20Inquiry&body=Hi%2C%20I%27m%20a%20Happy%20Eats%20vendor%20and%20I%27d%20like%20to%20learn%20more%20about%20Orbit%20Staffing%20for%20my%20food%20truck%20business." data-testid="link-orbit-contact"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/20 transition-all min-h-[44px]">
                        <Mail className="size-4" /> Contact Sales
                      </a>
                    </div>
                    <p className="text-[9px] text-emerald-300/50 text-center">
                      No credit card required to get started. Free consultation for Happy Eats vendors.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SettingsTab({
  vendor,
  onUpdateVendor,
  isPending,
  copyOrderLink,
  logout,
}: {
  vendor: Vendor;
  onUpdateVendor: (updates: Record<string, any>) => void;
  isPending: boolean;
  copyOrderLink: () => void;
  logout: () => void;
}) {
  const { t } = useLanguage();
  const [locationType, setLocationType] = useState(vendor.locationType || "mobile");
  const [address, setAddress] = useState(vendor.address || "");
  const [selectedZone, setSelectedZone] = useState<number | null>(vendor.zoneIds?.[0] || null);
  const [showPin, setShowPin] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  const { data: zones } = useQuery<any[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      const res = await fetch("/api/zones");
      if (!res.ok) throw new Error("Failed to fetch zones");
      return res.json();
    },
  });

  const saveSettings = () => {
    onUpdateVendor({ locationType, address });
  };

  const memberId = `HE-${vendor.id.toString().padStart(5, '0')}`;
  const memberSince = vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-4">
      <Card className={`${GLASS_CARD} border-slate-500/15`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <User className="size-4 text-slate-400" /> {t("vendor.accountInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-[10px] text-slate-500 mb-0.5">{t("vendor.memberId")}</p>
              <p className="text-sm font-mono font-bold text-orange-400" data-testid="text-settings-member-id">{memberId}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-[10px] text-slate-500 mb-0.5">{t("vendor.yourPinLabel")}</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono font-bold text-white" data-testid="text-settings-pin">
                  {showPin ? vendor.pin : "••••"}
                </p>
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-500 hover:text-white transition-colors"
                  data-testid="button-toggle-pin"
                >
                  <Eye className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="text-[10px] text-slate-500 mb-0.5">{t("vendor.memberSince")}</p>
              <p className="text-sm text-white" data-testid="text-settings-member-since">{memberSince}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${GLASS_CARD} border-sky-500/20`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="size-4 text-sky-400" />
            {t("vendor.locationSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLocationType("permanent")}
              className={`p-3 rounded-lg border text-left transition-all ${
                locationType === "permanent"
                  ? "bg-sky-500/20 border-sky-500/40 text-white"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-sky-500/20"
              }`}
              data-testid="button-location-permanent"
            >
              <Store className="size-5 mb-1" />
              <p className="text-xs font-bold">{t("vendor.permanent")}</p>
              <p className="text-[10px] opacity-70">{t("vendor.sameSpot")}</p>
            </button>
            <button
              onClick={() => setLocationType("mobile")}
              className={`p-3 rounded-lg border text-left transition-all ${
                locationType === "mobile"
                  ? "bg-orange-500/20 border-orange-500/40 text-white"
                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-orange-500/20"
              }`}
              data-testid="button-location-mobile"
            >
              <Navigation className="size-5 mb-1" />
              <p className="text-xs font-bold">{t("vendor.mobile")}</p>
              <p className="text-[10px] opacity-70">{t("vendor.movesAround")}</p>
            </button>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px]">{t("common.address")}</Label>
            <Input
              placeholder={t("vendor.placeholderAddress")}
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="h-9 text-sm"
              data-testid="input-vendor-address"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[10px]">{t("vendor.deliveryZone")}</Label>
            <select
              value={selectedZone || ""}
              onChange={e => setSelectedZone(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full h-9 px-2 rounded-md bg-background border border-input text-sm"
              data-testid="select-vendor-zone"
            >
              <option value="">{t("vendor.selectZone")}</option>
              {(zones || []).map((z: any) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            onClick={saveSettings}
            disabled={isPending}
            className="bg-sky-600 hover:bg-sky-700 text-xs min-h-[36px]"
            data-testid="button-save-location"
          >
            {isPending ? <Loader2 className="size-3 animate-spin" /> : <><Save className="size-3 mr-1" /> {t("vendor.saveSettings")}</>}
          </Button>
        </CardContent>
      </Card>

      <Card className={`${GLASS_CARD} border-white/10`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="size-4 text-amber-400" /> {t("vendor.notificationPreferences")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2">
              <Mail className="size-3.5 text-sky-400" />
              <div>
                <p className="text-xs text-white">{t("vendor.emailNotifications")}</p>
                <p className="text-[10px] text-slate-500">{t("vendor.orderAlertsUpdates")}</p>
              </div>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} className="scale-90" data-testid="switch-email-notif" />
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2">
              <Phone className="size-3.5 text-emerald-400" />
              <div>
                <p className="text-xs text-white">{t("vendor.smsNotifications")}</p>
                <p className="text-[10px] text-slate-500">{t("vendor.realtimeOrderAlerts")}</p>
              </div>
            </div>
            <Switch checked={smsNotif} onCheckedChange={setSmsNotif} className="scale-90" data-testid="switch-sms-notif" />
          </div>
          <p className="text-[10px] text-slate-600 italic">{t("vendor.notifComingSoon")}</p>
        </CardContent>
      </Card>

      <Card className={`${GLASS_CARD} border-emerald-500/15`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <LinkIcon className="size-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">{t("vendor.yourOrderLink")}</p>
              <code className="text-[10px] text-emerald-400 truncate block">{window.location.origin}/menu/{vendor.id}</code>
            </div>
            <Button size="sm" variant="outline" onClick={copyOrderLink} className="h-8 text-[10px] border-emerald-500/20">
              <Copy className="size-3 mr-1" /> {t("common.copy")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={logout}
        className="w-full border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 min-h-[44px]"
        data-testid="button-settings-logout"
      >
        <LogOut className="size-4 mr-2" /> {t("vendor.logOut")}
      </Button>
    </div>
  );
}

function VendorLiveOrders({ vendorId }: { vendorId: number }) {
  const { t } = useLanguage();
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders/food-truck", vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/food-truck/${vendorId}`);
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 15000,
  });

  const activeOrders = orders
    .filter((o: any) => !["delivered", "cancelled"].includes(o.status))
    .slice(0, 5);

  const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/20" },
    accepted: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/20" },
    preparing: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/20" },
    ready: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/20" },
    rejected: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/20" },
  };

  if (activeOrders.length === 0) {
    return (
      <Card className={`${GLASS_CARD} border-white/5`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            <Bell className="size-4 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">{t("vendor.recentActivity")}</p>
            <p className="text-[10px] text-slate-500">{t("vendor.ordersWillAppear")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${GLASS_CARD} border-orange-500/15`} data-testid="card-live-orders">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold text-white flex items-center gap-1.5">
            <motion.div
              className="size-2 rounded-full bg-orange-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {t("vendor.recentActivity")} ({activeOrders.length})
          </p>
          <Link href={`/vendor-orders/${vendorId}`}>
            <span className="text-[9px] text-orange-400 hover:text-orange-300 cursor-pointer flex items-center gap-0.5">
              {t("vendor.viewOrdersLink")} <ArrowRight className="size-2.5" />
            </span>
          </Link>
        </div>
        {activeOrders.map((order: any) => {
          const vs = order.vendorStatus || "pending";
          const sc = statusColorMap[vs] || statusColorMap.pending;
          const itemCount = order.items?.reduce((s: number, i: any) => s + (i.qty || 1), 0) || 0;
          return (
            <Link key={order.id} href={`/vendor-orders/${vendorId}`}>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/3 border border-white/5 hover:border-orange-500/20 cursor-pointer transition-all" data-testid={`live-order-${order.id}`}>
                <div className={`size-2.5 rounded-full ${vs === "pending" ? "bg-amber-500" : vs === "ready" ? "bg-emerald-500" : "bg-violet-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-white">#{order.id}</span>
                    {order.customerName && <span className="text-[9px] text-slate-500 truncate">{order.customerName}</span>}
                  </div>
                </div>
                <span className="text-[9px] text-slate-500">{itemCount} items</span>
                <Badge className={`${sc.bg} ${sc.text} ${sc.border} text-[8px] px-1.5`}>
                  {vs}
                </Badge>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
