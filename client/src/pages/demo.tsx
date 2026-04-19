import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield, ArrowRight, ArrowLeft, CheckCircle, Play, Eye,
  ShoppingCart, ChefHat, Truck, Package, MapPin, Star,
  Clock, DollarSign, Plus, Minus, Navigation, Phone,
  ChevronRight, Sparkles, Users, Zap, BarChart3,
  Building2, Smartphone, Receipt, Target, Crown,
  Globe, MessageCircle, Award, Route, Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";

import driverEating from "@/assets/images/driver-eating.jpg";
import foodTruckBusy from "@/assets/images/food-truck-busy.jpg";
import deliveryDriver from "@/assets/images/delivery-driver.jpg";
import citySkyline from "@/assets/images/city-skyline.jpg";

const DEMO_TRUCKS = [
  { id: 1, name: "Taqueria El Sol", cuisine: "Mexican", rating: 4.9, orders: 342, image: "🌮", items: [
    { name: "Street Tacos (3)", price: 9.99, desc: "Carne asada, cilantro, onion, lime" },
    { name: "Loaded Burrito", price: 12.99, desc: "Rice, beans, guac, sour cream, cheese" },
    { name: "Elote (Mexican Corn)", price: 5.99, desc: "Mayo, cotija, chili, lime" },
    { name: "Horchata", price: 3.99, desc: "Fresh cinnamon rice drink" },
  ]},
  { id: 2, name: "Smokin' Joe's BBQ", cuisine: "BBQ", rating: 4.8, orders: 298, image: "🍖", items: [
    { name: "Pulled Pork Plate", price: 13.99, desc: "Slow-smoked 12hrs, two sides" },
    { name: "Brisket Sandwich", price: 14.99, desc: "1/2 lb hand-sliced, brioche bun" },
    { name: "Loaded Mac & Cheese", price: 7.99, desc: "Smoked gouda, bacon bits" },
    { name: "Sweet Tea", price: 2.99, desc: "Southern-style, fresh brewed" },
  ]},
  { id: 3, name: "Seoul Kitchen", cuisine: "Korean", rating: 4.7, orders: 256, image: "🍜", items: [
    { name: "Bibimbap Bowl", price: 13.99, desc: "Rice, veggies, egg, gochujang" },
    { name: "Korean Fried Chicken", price: 11.99, desc: "Double-fried, sweet chili glaze" },
    { name: "Bulgogi Tacos (3)", price: 12.99, desc: "Marinated beef, kimchi slaw" },
    { name: "Japchae Noodles", price: 9.99, desc: "Glass noodles, veggies, sesame" },
  ]},
];

interface CartItem {
  truckId: number;
  truckName: string;
  name: string;
  price: number;
  qty: number;
}

type DemoStep = "intro" | "browse" | "menu" | "cart" | "ordered" | "vendor" | "driver" | "delivered" | "complete";

const STEP_LABELS: Record<DemoStep, string> = {
  intro: "Welcome",
  browse: "Browse Trucks",
  menu: "View Menu",
  cart: "Checkout",
  ordered: "Order Placed",
  vendor: "Vendor View",
  driver: "Driver View",
  delivered: "Delivered",
  complete: "Complete",
};

const STEP_ORDER: DemoStep[] = ["intro", "browse", "menu", "cart", "ordered", "vendor", "driver", "delivered", "complete"];

export default function DemoPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<DemoStep>("intro");
  const [selectedTruck, setSelectedTruck] = useState(DEMO_TRUCKS[0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [vendorAction, setVendorAction] = useState<"pending" | "accepted" | "preparing" | "ready">("pending");
  const [driverAction, setDriverAction] = useState<"waiting" | "picked_up" | "en_route" | "delivered">("waiting");

  const stepLabels: Record<DemoStep, string> = {
    intro: t("demo.welcome"),
    browse: t("demo.browseTrucks"),
    menu: t("demo.viewMenu"),
    cart: t("demo.checkout"),
    ordered: t("demo.orderPlaced"),
    vendor: t("demo.vendorView"),
    driver: t("demo.driverView"),
    delivered: t("demo.delivered"),
    complete: t("demo.complete"),
  };

  useEffect(() => {
    document.title = "TL Driver Connect — Interactive Demo";
    return () => { document.title = "Happy Eats - Delivery for Drivers"; };
  }, []);

  const stepIndex = STEP_ORDER.indexOf(step);

  const addToCart = (truck: typeof DEMO_TRUCKS[0], item: typeof DEMO_TRUCKS[0]["items"][0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.truckId === truck.id && c.name === item.name);
      if (existing) return prev.map(c => c.truckId === truck.id && c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { truckId: truck.id, truckName: truck.name, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const removeFromCart = (name: string, truckId: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.truckId === truckId && c.name === name);
      if (existing && existing.qty > 1) return prev.map(c => c.truckId === truckId && c.name === name ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter(c => !(c.truckId === truckId && c.name === name));
    });
  };

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const serviceFee = subtotal * 0.20;
  const deliveryFee = 3.99;
  const tax = subtotal * 0.0975;
  const total = subtotal + serviceFee + deliveryFee + tax;

  const renderProgress = () => (
    <div className="flex items-center gap-1 overflow-x-auto py-2 px-1 no-scrollbar">
      {STEP_ORDER.map((s, i) => (
        <div key={s} className="flex items-center shrink-0">
          <div className={`size-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${i < stepIndex ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : i === stepIndex ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 ring-2 ring-cyan-500/20' : 'bg-white/5 text-white/20 border border-white/10'}`}>
            {i < stepIndex ? <CheckCircle className="size-3" /> : i + 1}
          </div>
          {i < STEP_ORDER.length - 1 && <div className={`w-4 md:w-8 h-px ${i < stepIndex ? 'bg-emerald-500/30' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050810] via-[#0a1020] to-[#050810]">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#050810]/80 backdrop-blur-2xl border-b border-white/[0.04] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <Shield className="size-5" />
              </div>
              <span className="font-bold text-lg text-white">TL <span className="text-cyan-400">Demo</span></span>
            </div>
          </Link>
          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] ml-2 animate-pulse" data-testid="badge-interactive">
            INTERACTIVE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/investors">
            <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs hidden md:flex" data-testid="link-investors">
              {t("demo.investors")}
            </Button>
          </Link>
          <Link href="/franchise">
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold" data-testid="button-franchise">
              {t("demo.franchiseInfo")}
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-14">
        <div className="sticky top-14 z-40 bg-[#050810]/80 backdrop-blur-xl border-b border-white/[0.04] px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex-1 overflow-hidden">{renderProgress()}</div>
            <div className="flex items-center gap-1 ml-3 shrink-0">
              <span className="text-[10px] text-white/30 hidden sm:inline">{stepLabels[step]}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-12">
                <div className="relative mx-auto mb-8 w-full max-w-2xl h-64 rounded-2xl overflow-hidden">
                  <img src={citySkyline} alt="" className="w-full h-full object-cover brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/50 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}>
                      <div className="size-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                        <Play className="size-8 text-white ml-1" />
                      </div>
                    </motion.div>
                  </div>
                </div>

                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-4">
                  <Sparkles className="size-3 mr-1" /> {t("demo.interactiveWalkthrough")}
                </Badge>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
                  {t("demo.experienceFullFlow")}{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{t("demo.fullOrderFlow")}</span>
                </h1>
                <p className="text-lg text-white/40 max-w-xl mx-auto mb-8">
                  {t("demo.walkDescription")}
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-10">
                  {[
                    { icon: ShoppingCart, label: t("demo.customerOrders"), color: "from-orange-500 to-rose-500" },
                    { icon: ChefHat, label: t("demo.vendorAccepts"), color: "from-emerald-500 to-teal-500" },
                    { icon: Truck, label: t("demo.driverDelivers"), color: "from-cyan-500 to-blue-500" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className={`size-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                        <s.icon className="size-6 text-white" />
                      </div>
                      <p className="text-xs text-white/40">{s.label}</p>
                    </div>
                  ))}
                </div>

                <Button size="lg" onClick={() => setStep("browse")} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-6 text-base shadow-2xl shadow-cyan-500/20" data-testid="button-start-demo">
                  {t("demo.startDemo")} <ArrowRight className="size-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "browse" && (
              <motion.div key="browse" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 mb-2">{t("demo.step1of4")}</Badge>
                    <h2 className="text-2xl font-bold text-white">{t("demo.customerBrowses")}</h2>
                    <p className="text-sm text-white/40 mt-1">{t("demo.driverOpensApp")}</p>
                  </div>
                </div>

                <Card className="bg-white/[0.03] border-white/[0.06] mb-4 overflow-hidden">
                  <div className="relative h-32 overflow-hidden">
                    <img src={foodTruckBusy} alt="" className="w-full h-full object-cover brightness-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-orange-400" />
                        <span className="text-sm font-bold text-white">I-24 Corridor — Nashville, TN</span>
                      </div>
                      <p className="text-[10px] text-white/50 mt-0.5">Exit 62-70 • La Vergne to Smyrna</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                        <Clock className="size-2.5 mr-1" /> {t("demo.ordersUntil")}
                      </Badge>
                    </div>
                  </div>
                </Card>

                <div className="space-y-3">
                  {DEMO_TRUCKS.map((truck) => (
                    <motion.div key={truck.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Card
                        className="bg-white/[0.03] border-white/[0.06] hover:border-cyan-500/20 transition-all cursor-pointer group"
                        onClick={() => { setSelectedTruck(truck); setStep("menu"); }}
                        data-testid={`card-truck-${truck.id}`}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="size-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center text-3xl">
                            {truck.image}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm">{truck.name}</h3>
                              <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px]">{truck.cuisine}</Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[11px] text-amber-400">
                                <Star className="size-3 fill-amber-400" /> {truck.rating}
                              </span>
                              <span className="text-[11px] text-white/30">{truck.orders} {t("demo.orders")}</span>
                              <span className="text-[11px] text-white/30">{truck.items.length} {t("demo.items")}</span>
                            </div>
                          </div>
                          <ChevronRight className="size-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-[11px] text-white/20 mt-4">{t("demo.tapFoodTruck")}</p>
              </motion.div>
            )}

            {step === "menu" && (
              <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Button variant="ghost" size="sm" onClick={() => setStep("browse")} className="text-white/40 hover:text-white mb-4" data-testid="button-back-browse">
                  <ArrowLeft className="size-3 mr-1" /> {t("demo.backToTrucks")}
                </Button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="size-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center text-3xl">
                    {selectedTruck.image}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedTruck.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-amber-400"><Star className="size-3 fill-amber-400" /> {selectedTruck.rating}</span>
                      <Badge className="bg-white/5 text-white/30 border-white/10 text-[9px]">{selectedTruck.cuisine}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {selectedTruck.items.map((item) => {
                    const inCart = cart.find(c => c.truckId === selectedTruck.id && c.name === item.name);
                    return (
                      <Card key={item.name} className="bg-white/[0.03] border-white/[0.06]">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">{item.name}</h4>
                            <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
                            <p className="text-sm font-bold text-emerald-400 mt-1">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {inCart ? (
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" onClick={() => removeFromCart(item.name, selectedTruck.id)} className="size-8 text-white/40 hover:text-white bg-white/5 rounded-lg">
                                  <Minus className="size-3" />
                                </Button>
                                <span className="text-sm font-bold text-white w-4 text-center">{inCart.qty}</span>
                                <Button size="icon" variant="ghost" onClick={() => addToCart(selectedTruck, item)} className="size-8 text-white bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg border border-cyan-500/30">
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" onClick={() => addToCart(selectedTruck, item)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-4" data-testid={`button-add-${item.name.replace(/\s+/g, '-').toLowerCase()}`}>
                                <Plus className="size-3 mr-1" /> {t("demo.add")}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {cart.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Button onClick={() => setStep("cart")} className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-5 shadow-xl shadow-orange-500/20" data-testid="button-view-cart">
                      <ShoppingCart className="size-4 mr-2" />
                      {t("demo.viewCart")} ({cart.reduce((s, c) => s + c.qty, 0)} {t("demo.items")}) — ${subtotal.toFixed(2)}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === "cart" && (
              <motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Button variant="ghost" size="sm" onClick={() => setStep("menu")} className="text-white/40 hover:text-white mb-4">
                  <ArrowLeft className="size-3 mr-1" /> {t("demo.backToMenu")}
                </Button>

                <Badge className="bg-orange-500/10 text-orange-300 border-orange-500/20 mb-2">{t("demo.step2of4")}</Badge>
                <h2 className="text-2xl font-bold text-white mb-1">{t("demo.orderSummary")}</h2>
                <p className="text-sm text-white/40 mb-6">{t("demo.reviewAndCheckout")}</p>

                <Card className="bg-white/[0.03] border-white/[0.06] mb-4">
                  <CardContent className="p-4 space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.truckId}-${item.name}`} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white font-medium">{item.name}</p>
                          <p className="text-[10px] text-white/30">{item.truckName} x{item.qty}</p>
                        </div>
                        <p className="text-sm font-bold text-white">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.03] border-white/[0.06] mb-6">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-white/40">{t("demo.subtotal")}</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">{t("demo.serviceFee")}</span><span className="text-white">${serviceFee.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">{t("demo.delivery")}</span><span className="text-white">${deliveryFee.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">{t("demo.tax")}</span><span className="text-white">${tax.toFixed(2)}</span></div>
                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-base">
                      <span className="font-bold text-white">{t("demo.total")}</span>
                      <span className="font-black text-emerald-400">${total.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={() => setStep("ordered")} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-5 shadow-xl shadow-emerald-500/20" data-testid="button-place-order">
                  <Receipt className="size-4 mr-2" /> {t("demo.placeOrder")}
                </Button>
                <p className="text-center text-[10px] text-white/20 mt-2">{t("demo.noRealPayment")}</p>
              </motion.div>
            )}

            {step === "ordered" && (
              <motion.div key="ordered" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
                  <div className="size-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
                    <CheckCircle className="size-10 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">{t("demo.orderPlacedTitle")}</h2>
                <p className="text-white/40 mb-2">{t("demo.orderNumber")}</p>
                <p className="text-sm text-white/30 max-w-md mx-auto mb-8">
                  {t("demo.orderPlacedDesc")}
                </p>
                <Button onClick={() => { setVendorAction("pending"); setStep("vendor"); }} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-5 shadow-xl" data-testid="button-see-vendor">
                  <ChefHat className="size-5 mr-2" /> {t("demo.seeVendorDashboard")} <ArrowRight className="size-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "vendor" && (
              <motion.div key="vendor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 mb-2">{t("demo.step3of4")}</Badge>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedTruck.name} — {t("demo.vendorDashboard")}</h2>
                <p className="text-sm text-white/40 mb-6">{t("demo.vendorSeesOrders")}</p>

                <Card className={`border-2 transition-all mb-4 ${vendorAction === "pending" ? 'bg-amber-500/5 border-amber-500/30 animate-pulse' : vendorAction === "accepted" ? 'bg-cyan-500/5 border-cyan-500/20' : vendorAction === "preparing" ? 'bg-violet-500/5 border-violet-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">Order #DEMO-4821</h3>
                          <Badge className={`text-[10px] ${vendorAction === "pending" ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : vendorAction === "accepted" ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : vendorAction === "preparing" ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                            {vendorAction === "pending" ? t("demo.newOrder") : vendorAction === "accepted" ? t("demo.accepted") : vendorAction === "preparing" ? t("demo.preparing") : t("demo.readyForPickup")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-white/30 mt-1">{t("demo.customer")}</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-400">${total.toFixed(2)}</p>
                    </div>

                    <div className="bg-white/[0.03] rounded-xl p-3 mb-4">
                      {cart.map((item) => (
                        <div key={`${item.truckId}-${item.name}`} className="flex justify-between text-sm py-1">
                          <span className="text-white/60">{item.qty}x {item.name}</span>
                          <span className="text-white/40">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {vendorAction === "pending" && (
                        <>
                          <Button onClick={() => setVendorAction("accepted")} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold" data-testid="button-accept-order">
                            <CheckCircle className="size-4 mr-1" /> {t("demo.acceptOrder")}
                          </Button>
                          <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                            {t("demo.decline")}
                          </Button>
                        </>
                      )}
                      {vendorAction === "accepted" && (
                        <Button onClick={() => setVendorAction("preparing")} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold" data-testid="button-start-prep">
                          <Clock className="size-4 mr-1" /> {t("demo.startPreparing")}
                        </Button>
                      )}
                      {vendorAction === "preparing" && (
                        <Button onClick={() => setVendorAction("ready")} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold" data-testid="button-mark-ready">
                          <Package className="size-4 mr-1" /> {t("demo.markReadyForPickup")}
                        </Button>
                      )}
                      {vendorAction === "ready" && (
                        <Button onClick={() => { setDriverAction("waiting"); setStep("driver"); }} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold" data-testid="button-see-driver">
                          <Truck className="size-4 mr-1" /> {t("demo.seeDriverViewBtn")} <ArrowRight className="size-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <p className="text-center text-[10px] text-white/20">
                  {vendorAction === "pending" ? t("demo.tapAccept") : vendorAction === "accepted" ? t("demo.tapStartPrep") : vendorAction === "preparing" ? t("demo.tapWhenReady") : t("demo.orderReadyDriverSide")}
                </p>
              </motion.div>
            )}

            {step === "driver" && (
              <motion.div key="driver" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/20 mb-2">{t("demo.step4of4")}</Badge>
                <h2 className="text-2xl font-bold text-white mb-1">{t("demo.deliveryDriverDashboard")}</h2>
                <p className="text-sm text-white/40 mb-6">{t("demo.driverPicksUp")}</p>

                <Card className="bg-white/[0.03] border-white/[0.06] mb-4 overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img src={deliveryDriver} alt="" className="w-full h-full object-cover brightness-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-3 left-4">
                      <p className="text-xs text-white/50">{t("demo.pickupFrom")}</p>
                      <p className="text-base font-bold text-white">{selectedTruck.name}</p>
                      <p className="text-[10px] text-white/40">I-24 Exit 65 • Smyrna, TN</p>
                    </div>
                    <Badge className={`absolute top-3 right-3 text-[10px] ${driverAction === "waiting" ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : driverAction === "picked_up" ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : driverAction === "en_route" ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                      {driverAction === "waiting" ? t("demo.readyForPickup") : driverAction === "picked_up" ? t("demo.accepted") : driverAction === "en_route" ? t("demo.markEnRoute") : t("demo.delivered")}
                    </Badge>
                  </div>
                </Card>

                <Card className="bg-white/[0.03] border-white/[0.06] mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white">Order #DEMO-4821</h4>
                      <p className="text-sm font-bold text-emerald-400">${total.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      {cart.map((item) => (
                        <div key={`${item.truckId}-${item.name}`} className="text-xs text-white/40">
                          {item.qty}x {item.name}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <Navigation className="size-4 text-cyan-400" />
                      <div>
                        <p className="text-xs text-white/50">{t("demo.deliverTo")}</p>
                        <p className="text-sm text-white font-medium">{t("demo.demoDriverDeliverTo")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  {driverAction === "waiting" && (
                    <Button onClick={() => setDriverAction("picked_up")} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5" data-testid="button-pickup">
                      <Package className="size-4 mr-2" /> {t("demo.confirmPickup")}
                    </Button>
                  )}
                  {driverAction === "picked_up" && (
                    <Button onClick={() => setDriverAction("en_route")} className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold py-5" data-testid="button-en-route">
                      <Navigation className="size-4 mr-2" /> {t("demo.startDeliveryRoute")}
                    </Button>
                  )}
                  {driverAction === "en_route" && (
                    <Button onClick={() => { setDriverAction("delivered"); setStep("delivered"); }} className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-5" data-testid="button-deliver">
                      <CheckCircle className="size-4 mr-2" /> {t("demo.markDeliveredBtn")}
                    </Button>
                  )}
                </div>

                <p className="text-center text-[10px] text-white/20 mt-3">
                  {driverAction === "waiting" ? t("demo.tapConfirmPickup") : driverAction === "picked_up" ? t("demo.tapStartRoute") : t("demo.tapCompleteDelivery")}
                </p>
              </motion.div>
            )}

            {step === "delivered" && (
              <motion.div key="delivered" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 150, delay: 0.2 }}>
                  <div className="size-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                    <CheckCircle className="size-12 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-black text-white mb-2">{t("demo.orderDelivered")}</h2>
                <p className="text-white/40 mb-8 max-w-md mx-auto">
                  {t("demo.orderDeliveredDesc")}
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                  {[
                    { label: t("demo.orderTotal"), value: `$${total.toFixed(2)}`, color: "text-emerald-400" },
                    { label: t("demo.platformFee"), value: `$${serviceFee.toFixed(2)}`, color: "text-cyan-400" },
                    { label: t("demo.driverTip"), value: "$5.00", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</p>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={() => setStep("complete")} size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-10 shadow-xl" data-testid="button-see-results">
                  {t("demo.seeTheFullPicture")} <ArrowRight className="size-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="text-center mb-10">
                  <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 mb-3">
                    <Crown className="size-3 mr-1" /> {t("demo.demoCompleteTitle")}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{t("demo.thatsThePlatform")}</h2>
                  <p className="text-white/40 max-w-xl mx-auto">
                    {t("demo.thatsThePlatformDesc")}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                    <CardContent className="p-6">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="size-4 text-amber-400" /> {t("demo.whatYouJustSaw")}
                      </h3>
                      <div className="space-y-2">
                        {(t("demo.demoSawFeatures") as unknown as string[]).map((f: string) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                            <CheckCircle className="size-3 text-emerald-400/60 shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/[0.03] border-white/[0.06] backdrop-blur-xl">
                    <CardContent className="p-6">
                      <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="size-4 text-cyan-400" /> {t("demo.alsoBuiltWorking")}
                      </h3>
                      <div className="space-y-2">
                        {(t("demo.alsoBuiltFeatures") as unknown as string[]).map((f: string) => (
                          <div key={f} className="flex items-center gap-2 text-xs text-white/50">
                            <CheckCircle className="size-3 text-cyan-400/60 shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  <Link href="/investors">
                    <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group h-full">
                      <CardContent className="p-5 text-center">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform">
                          <BarChart3 className="size-6 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">{t("demo.investorInfo")}</h4>
                        <p className="text-[10px] text-white/30">{t("demo.investorInfoDesc")}</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/franchise">
                    <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer group h-full">
                      <CardContent className="p-5 text-center">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform">
                          <Building2 className="size-6 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">{t("demo.franchiseDetailsCard")}</h4>
                        <p className="text-[10px] text-white/30">{t("demo.franchiseDetailsDesc")}</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/zones">
                    <Card className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border-orange-500/20 hover:border-orange-500/40 transition-all cursor-pointer group h-full">
                      <CardContent className="p-5 text-center">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform">
                          <ShoppingCart className="size-6 text-white" />
                        </div>
                        <h4 className="font-bold text-white text-sm mb-1">{t("demo.liveOrderPage")}</h4>
                        <p className="text-[10px] text-white/30">{t("demo.liveOrderDesc")}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                <div className="text-center">
                  <Button onClick={() => { setStep("intro"); setCart([]); setVendorAction("pending"); setDriverAction("waiting"); }} variant="outline" className="border-white/10 text-white/40 hover:text-white mr-3" data-testid="button-restart">
                    <Play className="size-4 mr-1" /> {t("demo.restartDemo")}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
