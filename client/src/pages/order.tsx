import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, MapPin, Clock, ExternalLink, 
  ShoppingBag, Truck, CreditCard, AlertCircle,
  Phone, Mail, User, FileText, ShoppingCart, Check, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/context";

const SERVICE_FEE_PERCENT = 0.20;
const TAX_RATE = 0.10;
const DELIVERY_FEE = 3.99;

const TIP_OPTIONS = [
  { label: "25%", value: 0.25 },
  { label: "30%", value: 0.30 },
  { label: "35%", value: 0.35 },
  { label: "Custom", value: "custom" },
];

interface OrderForm {
  restaurantName: string;
  menuLink: string;
  orderDescription: string;
  menuTotal: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryInstructions: string;
}

type Step = "details" | "review";

export default function OrderPage() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("details");
  const [selectedTip, setSelectedTip] = useState<number | "custom">(0.25);
  const [customTipAmount, setCustomTipAmount] = useState("");
  const [form, setForm] = useState<OrderForm>({
    restaurantName: "",
    menuLink: "",
    orderDescription: "",
    menuTotal: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryInstructions: "",
  });

  const menuTotal = parseFloat(form.menuTotal) || 0;
  const serviceFee = menuTotal * SERVICE_FEE_PERCENT;
  const subtotal = menuTotal + serviceFee;
  const tax = subtotal * TAX_RATE;
  
  const tipAmount = selectedTip === "custom" 
    ? (parseFloat(customTipAmount) || 0)
    : menuTotal * (selectedTip as number);
  
  const total = subtotal + tax + DELIVERY_FEE + tipAmount;

  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: t("order.orderPlacedTitle"),
        description: t("order.orderPlacedDesc"),
      });
      setLocation(`/tracking?order=${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: t("order.errorTitle"),
        description: error.message || t("order.errorPlaceOrder"),
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!form.restaurantName || !form.orderDescription || !form.menuTotal) {
      toast({
        title: t("order.missingInformation"),
        description: t("order.missingInfoDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!form.customerName || !form.customerPhone || !form.deliveryAddress) {
      toast({
        title: t("order.missingContactInfo"),
        description: t("order.missingContactDesc"),
        variant: "destructive",
      });
      return;
    }

    if (menuTotal <= 0) {
      toast({
        title: t("order.invalidAmount"),
        description: t("order.invalidAmountDesc"),
        variant: "destructive",
      });
      return;
    }

    setStep("review");
  };

  const handlePlaceOrder = () => {
    createOrder.mutate({
      tenantId: 1,
      locationName: form.restaurantName,
      orderDescription: form.orderDescription,
      menuTotal: menuTotal.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      deliveryFee: DELIVERY_FEE.toFixed(2),
      tipAmount: tipAmount.toFixed(2),
      total: total.toFixed(2),
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      deliveryAddress: form.deliveryAddress,
      deliveryInstructions: form.deliveryInstructions,
      status: "pending",
    });
  };

  if (step === "review") {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <Button 
            data-testid="button-back-to-details" 
            variant="ghost" 
            size="icon" 
            className="text-white/40 hover:text-white hover:bg-white/[0.06] shrink-0 rounded-xl"
            onClick={() => setStep("details")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-heading font-bold flex items-center gap-2">
              <ShoppingCart className="size-5 text-orange-400 shrink-0" />
              <span className="truncate bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">{t("order.reviewYourOrder")}</span>
            </h1>
            <p className="text-xs text-white/40">{t("order.checkBeforePlacing")}</p>
          </div>
        </div>

        <div className="bg-emerald-500/[0.06] border border-emerald-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Check className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-300">{t("order.readyToOrder")}</p>
                <p className="text-xs text-emerald-200/60 mt-1">
                  {t("order.readyToOrderDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-sky-500/[0.06] border border-sky-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Phone className="size-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-sky-300">{t("order.howWellContactYou")}</p>
                <p className="text-xs text-sky-200/60 mt-1">
                  {t("order.contactDesc")}
                  {form.customerEmail && ` ${t("order.emailReceiptNote")}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <MapPin className="size-4 text-cyan-400" />
              {t("order.restaurant")}
            </h3>
          </div>
          <div className="p-4">
            <p className="text-white font-medium">{form.restaurantName}</p>
            {form.menuLink && (
              <a 
                href={form.menuLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 flex items-center gap-1 mt-1 hover:text-cyan-300 transition-colors"
              >
                {t("order.viewMenu")} <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <FileText className="size-4 text-sky-400" />
              {t("order.yourOrder")}
            </h3>
          </div>
          <div className="p-4">
            <p className="text-white whitespace-pre-wrap">{form.orderDescription}</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <Truck className="size-4 text-emerald-400" />
              {t("order.deliveryTo")}
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-white font-medium">{form.customerName}</p>
            <p className="text-sm text-white/40">{form.customerPhone}</p>
            {form.customerEmail && (
              <p className="text-sm text-white/40">{form.customerEmail}</p>
            )}
            <Separator className="bg-white/[0.06] my-2" />
            <p className="text-white">{form.deliveryAddress}</p>
            {form.deliveryInstructions && (
              <p className="text-sm text-white/40 italic">"{form.deliveryInstructions}"</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/[0.06] to-rose-500/[0.06] border border-orange-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <CreditCard className="size-4 text-amber-400" />
              {t("order.orderTotalLabel")}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.menuTotalPreTax")}</span>
              <span className="text-white">${menuTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.serviceFee15")}</span>
              <span className="text-white">${serviceFee.toFixed(2)}</span>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("common.subtotal")}</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.tax10")}</span>
              <span className="text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.deliveryFee")}</span>
              <span className="text-white">${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-400">{t("order.driverTipLabel")}</span>
              <span className="text-emerald-400">${tipAmount.toFixed(2)}</span>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="flex justify-between text-xl font-bold">
              <span className="text-white">{t("common.total")}</span>
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">${total.toFixed(2)}</span>
            </div>
            
            <Button
              data-testid="button-place-order"
              onClick={handlePlaceOrder}
              disabled={createOrder.isPending}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-[0_0_20px_rgba(249,115,22,0.2)] mt-4"
            >
              {createOrder.isPending ? t("order.placingOrderBtn") : t("order.placeOrder")}
            </Button>
            
            <div className="text-xs text-center text-white/30 space-y-1 mt-3">
              <p>{t("order.paymentLinkText")}</p>
              <p>{t("order.payCashText")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href="/vendors">
          <Button data-testid="button-back" variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/[0.06] shrink-0 rounded-xl">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-heading font-bold flex items-center gap-2">
            <ShoppingBag className="size-5 text-orange-400 shrink-0" />
            <span className="truncate bg-gradient-to-r from-white via-white to-orange-200 bg-clip-text text-transparent">{t("order.placeAnOrder")}</span>
          </h1>
          <p className="text-xs text-white/40">{t("order.wePickUpDeliverToYou")}</p>
        </div>
      </div>

      <div className="bg-orange-500/[0.06] border border-orange-500/20 backdrop-blur-xl rounded-2xl overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-300">{t("order.howThisWorks")}</p>
              <p className="text-xs text-orange-200/60 mt-1">
                {t("order.howThisWorksStep1")}<br/>
                {t("order.howThisWorksStep2")}<br/>
                {t("order.howThisWorksStep3")}<br/>
                {t("order.howThisWorksStep4")}<br/>
                {t("order.howThisWorksStep5")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <MapPin className="size-4 text-cyan-400" />
              {t("order.restaurantDetails")}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName" className="text-white/60">{t("order.restaurantNameLabel")}</Label>
              <Input
                id="restaurantName"
                data-testid="input-restaurant-name"
                placeholder={t("order.restaurantNamePlaceholder")}
                value={form.restaurantName}
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="menuLink" className="text-white/60">{t("order.menuLinkLabel")}</Label>
              <div className="flex gap-2">
                <Input
                  id="menuLink"
                  data-testid="input-menu-link"
                  placeholder="https://restaurant.com/menu"
                  value={form.menuLink}
                  onChange={(e) => setForm({ ...form, menuLink: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.08] flex-1 focus:border-cyan-500/40 transition-colors"
                />
                {form.menuLink && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(form.menuLink, "_blank")}
                    className="border-white/[0.08] hover:bg-white/[0.06]"
                    data-testid="button-open-menu"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-white/30">
                {t("order.menuLinkHelper")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <FileText className="size-4 text-sky-400" />
              {t("order.yourOrder")}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderDescription" className="text-white/60">{t("order.whatDoYouWant")}</Label>
              <Textarea
                id="orderDescription"
                data-testid="input-order-description"
                placeholder={t("order.orderDescPlaceholder")}
                value={form.orderDescription}
                onChange={(e) => setForm({ ...form, orderDescription: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] min-h-[100px] focus:border-cyan-500/40 transition-colors"
              />
              <p className="text-xs text-white/30">
                {t("order.beSpecific")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menuTotal" className="text-white/60">{t("order.menuTotalLabel")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">$</span>
                <Input
                  id="menuTotal"
                  data-testid="input-menu-total"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.menuTotal}
                  onChange={(e) => setForm({ ...form, menuTotal: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.08] pl-7 focus:border-cyan-500/40 transition-colors"
                />
              </div>
              <p className="text-xs text-white/30">
                {t("order.menuTotalHelper")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <User className="size-4 text-violet-400" />
              {t("order.yourInformation")}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="text-white/60">{t("order.yourNameLabel")}</Label>
                <Input
                  id="customerName"
                  data-testid="input-customer-name"
                  placeholder="John Smith"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="text-white/60">{t("order.phoneNumberLabel")}</Label>
                <Input
                  id="customerPhone"
                  data-testid="input-customer-phone"
                  type="tel"
                  placeholder="(615) 555-1234"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
                />
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-white/60">{t("order.emailOptionalLabel")}</Label>
              <Input
                id="customerEmail"
                data-testid="input-customer-email"
                type="email"
                placeholder="you@example.com"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <Truck className="size-4 text-emerald-400" />
              {t("order.deliveryDetailsTitle")}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress" className="text-white/60">{t("order.deliveryAddressLabel")}</Label>
              <Textarea
                id="deliveryAddress"
                data-testid="input-delivery-address"
                placeholder={t("order.deliveryAddressPlaceholder")}
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryInstructions" className="text-white/60">{t("order.specialInstructionsLabel")}</Label>
              <Input
                id="deliveryInstructions"
                data-testid="input-delivery-instructions"
                placeholder={t("order.specialInstructionsPlaceholder")}
                value={form.deliveryInstructions}
                onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
                className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-4 pb-2 border-b border-white/[0.04]">
            <h3 className="text-sm font-medium flex items-center gap-2 text-white/70">
              <CreditCard className="size-4 text-amber-400" />
              {t("order.priceEstimate")}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.menuTotalPreTax")}</span>
              <span className="text-white">${menuTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.serviceFee15")}</span>
              <span className="text-white">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.tax10")}</span>
              <span className="text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">{t("order.deliveryFee")}</span>
              <span className="text-white">${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-2">
              <Label className="text-sm text-white/40">{t("order.driverTipLabel")}</Label>
              <p className="text-xs text-white/30">{t("order.tipGoesToDriver")}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIP_OPTIONS.map((option) => (
                  <Button
                    key={option.label}
                    data-testid={`tip-option-${option.label.toLowerCase().replace('%', '')}`}
                    type="button"
                    variant={selectedTip === option.value ? "default" : "outline"}
                    size="sm"
                    className={selectedTip === option.value 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                      : "border-white/[0.08] text-white hover:bg-white/[0.06]"}
                    onClick={() => setSelectedTip(option.value as number | "custom")}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {selectedTip === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-white/40">$</span>
                  <Input
                    data-testid="input-custom-tip"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={customTipAmount}
                    onChange={(e) => setCustomTipAmount(e.target.value)}
                    className="bg-white/[0.03] border-white/[0.08] focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              )}
              {menuTotal > 0 && selectedTip !== "custom" && (
                <p className="text-xs text-emerald-400">
                  ${tipAmount.toFixed(2)} tip ({Math.round((selectedTip as number) * 100)}%)
                </p>
              )}
            </div>
            
            <Separator className="bg-white/[0.06]" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">{t("order.estimatedTotal")}</span>
              <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">${total.toFixed(2)}</span>
            </div>
            
            <Button
              data-testid="button-add-to-cart"
              onClick={handleAddToCart}
              disabled={menuTotal <= 0}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-[0_0_20px_rgba(249,115,22,0.2)] mt-4 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="size-5" />
              {t("order.reviewOrderBtn")}
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
