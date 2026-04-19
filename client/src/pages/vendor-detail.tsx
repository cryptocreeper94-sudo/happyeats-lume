import { useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, Star, Clock, Info, Plus, Minus, 
  ShoppingBag, ChevronDown, ChevronUp, Check, MessageSquare, Send, CheckCircle,
  Truck, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Review } from "@shared/schema";
import burgerImg from "@/assets/images/burger.jpg";
import { useLanguage } from "@/i18n/context";

// Mock Data
const VENDOR = {
  id: 1,
  name: "Big Rig Burger Co.",
  image: burgerImg,
  rating: 4.8,
  reviews: 124,
  distance: "0.2 mi",
  time: "15 min",
  categories: [
    {
      id: "meals",
      name: "Combo Meals",
      items: [
        { id: 101, name: "Double Haul Burger", description: "Two 1/4lb patties, cheddar, bacon, BBQ sauce", price: 14.50 },
        { id: 102, name: "Long Haul Chicken", description: "Crispy chicken breast, spicy mayo, pickles", price: 12.75 },
        { id: 103, name: "Driver's Delight", description: "Burger + Fries + Large Drink", price: 16.00 },
      ]
    },
    {
      id: "sides",
      name: "Sides & Snacks",
      items: [
        { id: 201, name: "Loaded Fries", description: "Cheese, bacon, scallions", price: 6.50 },
        { id: 202, name: "Onion Rings", description: "Beer battered thick cut", price: 5.00 },
      ]
    },
    {
      id: "drinks",
      name: "Drinks",
      items: [
        { id: 301, name: "Large Coffee", description: "Dark roast, 20oz", price: 3.50 },
        { id: 302, name: "Energy Drink", description: "Various flavors", price: 4.00 },
      ]
    }
  ]
};

export default function VendorDetail() {
  const { t } = useLanguage();
  const [cart, setCart] = useState<{id: number, qty: number, price: number, name: string}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup">("delivery");
  const [pickupTime, setPickupTime] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    reviewType: "vendor_food",
    reviewText: "",
    reviewerName: "",
    reviewerEmail: ""
  });

  const { data: reviews, refetch: refetchReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews", VENDOR.id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?vendorId=${VENDOR.id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    }
  });

  const submitReview = useMutation({
    mutationFn: async (data: typeof reviewData & { vendorId: number }) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit review");
      return res.json();
    },
    onSuccess: () => {
      setReviewSubmitted(true);
      setReviewData({ rating: 5, reviewType: "vendor_food", reviewText: "", reviewerName: "", reviewerEmail: "" });
      refetchReviews();
      setTimeout(() => {
        setReviewSubmitted(false);
        setShowReviewForm(false);
      }, 3000);
    }
  });

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: item.id, qty: 1, price: item.price, name: item.name }];
    });
    toast({
      title: t('vendor.addedToCart'),
      description: t('vendor.addedDesc', { name: item.name }),
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        return { ...i, qty: Math.max(0, i.qty + delta) };
      }
      return i;
    }).filter(i => i.qty > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="pb-24">
      {/* Header Image */}
      <div className="relative h-64 -mx-4 md:-mx-6 -mt-6 mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <img 
          src={VENDOR.image} 
          alt={VENDOR.name} 
          className="w-full h-full object-cover"
        />
        <Link href="/">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm rounded-full min-h-[44px] min-w-[44px]">
            <ArrowLeft className="size-6" />
          </Button>
        </Link>
      </div>

      {/* Vendor Info */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">{VENDOR.name}</h1>
            <div className="flex items-center gap-3 sm:gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 text-accent font-bold"><Star className="size-4 fill-accent" /> {VENDOR.rating}</span>
              <span className="flex items-center gap-1"><Clock className="size-4" /> {VENDOR.time}</span>
              <span className="flex items-center gap-1"><Info className="size-4" /> {t('vendor.deliveryFeeLabel')}: $2.99</span>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10 self-start">
            {t('vendor.openNow')}
          </Badge>
        </div>
      </div>

      {/* Menu Accordion */}
      <Accordion type="multiple" defaultValue={["meals"]} className="space-y-4">
        {VENDOR.categories.map((cat) => (
          <AccordionItem key={cat.id} value={cat.id} className="border border-white/5 rounded-xl bg-card/30 overflow-hidden px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <span className="text-lg font-bold text-white">{cat.name}</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4 pt-2">
                {cat.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex-1 pr-4">
                      <h4 className="font-bold text-gray-200">{item.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      <p className="text-primary font-mono mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="size-11 rounded-full bg-white/5 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Reviews Section */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="size-5 text-orange-400" />
            <h3 className="text-lg font-bold text-white">{t('vendor.reviews')}</h3>
            {reviews && reviews.length > 0 && (
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">{reviews.length}</Badge>
            )}
          </div>
          <Button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant="outline"
            size="sm"
            className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10 min-h-[44px]"
            data-testid="button-toggle-review-form"
          >
            {showReviewForm ? t('common.close') : t('vendor.leaveAReview')}
          </Button>
        </div>

        {showReviewForm && (
          <div className="bg-[#0d1f35]/60 border border-white/10 rounded-xl p-4 mb-4">
            {reviewSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="size-12 mx-auto text-emerald-400 mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">{t('vendor.thankYou')}</h4>
                <p className="text-sm text-muted-foreground">{t('vendor.reviewSubmitted')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">{t('vendor.rating')}</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        data-testid={`button-star-${star}`}
                      >
                        <Star 
                          className={`size-6 ${star <= reviewData.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-white mb-2 block">{t('vendor.whatReviewing')}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "vendor_food", label: t('vendor.foodQuality') },
                      { value: "vendor_service", label: t('vendor.serviceLabel') },
                      { value: "platform", label: t('vendor.happyEatsPlatform') }
                    ].map((type) => (
                      <Badge 
                        key={type.value}
                        className={`cursor-pointer ${reviewData.reviewType === type.value 
                          ? "bg-orange-500 text-white border-orange-500" 
                          : "bg-transparent border-white/20 text-muted-foreground hover:border-orange-500/50"}`}
                        onClick={() => setReviewData({...reviewData, reviewType: type.value})}
                        data-testid={`badge-review-type-${type.value}`}
                      >
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="reviewText" className="text-white">{t('vendor.yourReview')}</Label>
                  <Textarea 
                    id="reviewText"
                    value={reviewData.reviewText}
                    onChange={(e) => setReviewData({...reviewData, reviewText: e.target.value})}
                    placeholder={t('vendor.tellExperience')}
                    className="bg-[#0a1628] border-white/20 min-h-[80px] mt-1"
                    data-testid="textarea-review"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reviewerName" className="text-white">{t('vendor.yourNameOptional')}</Label>
                    <Input 
                      id="reviewerName"
                      value={reviewData.reviewerName}
                      onChange={(e) => setReviewData({...reviewData, reviewerName: e.target.value})}
                      placeholder="Your name"
                      className="bg-[#0a1628] border-white/20 mt-1 h-11"
                      data-testid="input-reviewer-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewerEmail" className="text-white">{t('vendor.emailOptional')}</Label>
                    <Input 
                      id="reviewerEmail"
                      type="email"
                      value={reviewData.reviewerEmail}
                      onChange={(e) => setReviewData({...reviewData, reviewerEmail: e.target.value})}
                      placeholder="your@email.com"
                      className="bg-[#0a1628] border-white/20 mt-1 h-11"
                      data-testid="input-reviewer-email"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    onClick={() => submitReview.mutate({ ...reviewData, vendorId: VENDOR.id })}
                    disabled={!reviewData.reviewText || submitReview.isPending}
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 gap-2 w-full sm:w-auto min-h-[44px]"
                    data-testid="button-submit-review"
                  >
                    <Send className="size-4" />
                    {submitReview.isPending ? t('vendor.submitting') : t('vendor.submitReview')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="bg-[#0d1f35]/40 border border-white/5 rounded-lg p-4" data-testid={`review-card-${review.id}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`size-4 ${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"}`} 
                        />
                      ))}
                    </div>
                    <Badge className="bg-white/5 text-muted-foreground border-white/10 text-[10px]">
                      {review.reviewType === "vendor_food" ? t('vendor.foodLabel') : review.reviewType === "vendor_service" ? t('vendor.serviceLabelShort') : t('vendor.platformLabel')}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.reviewerName || t('vendor.anonymous')}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{review.reviewText}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">{t('vendor.noReviewsYet')}</p>
        )}
      </div>

      {/* Floating Cart Bar (Mobile) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/10 z-40 md:hidden animate-in slide-in-from-bottom-full duration-300">
          <Button 
            className="w-full h-14 text-lg font-bold flex justify-between items-center shadow-lg shadow-primary/20" 
            size="lg"
            onClick={() => setIsCartOpen(true)}
          >
            <div className="flex items-center gap-2">
              <div className="bg-white/20 px-2 py-1 rounded text-sm">{cart.reduce((a, b) => a + b.qty, 0)}</div>
              <span>{t('vendor.viewOrder')}</span>
            </div>
            <span>${cartTotal.toFixed(2)}</span>
          </Button>
        </div>
      )}

      {/* Cart Sheet (Desktop & Mobile) */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="bottom" className="h-[85vh] md:h-full md:w-[400px] md:border-l-white/10 glass-panel border-t-white/10 rounded-t-3xl md:rounded-none">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="size-6 text-primary" /> {t('vendor.yourOrder')}
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[50vh] pr-4 -mr-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ShoppingBag className="size-12 mb-2 opacity-20" />
                <p>{t('vendor.cartEmpty')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(item.id, -1)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white text-muted-foreground"><Minus className="size-4" /></button>
                      <span className="font-mono w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white text-muted-foreground"><Plus className="size-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
            {/* Delivery / Pickup Toggle */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-white">{t('vendor.howWantOrder')}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFulfillmentType("delivery")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                    fulfillmentType === "delivery" 
                      ? "bg-primary/20 border-primary text-primary" 
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                  }`}
                  data-testid="button-fulfillment-delivery"
                >
                  <Truck className="size-4" />
                  <span className="font-medium">{t('vendor.delivery')}</span>
                </button>
                <button
                  onClick={() => setFulfillmentType("pickup")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                    fulfillmentType === "pickup" 
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                  }`}
                  data-testid="button-fulfillment-pickup"
                >
                  <MapPin className="size-4" />
                  <span className="font-medium">{t('vendor.pickupOption')}</span>
                </button>
              </div>
            </div>

            {/* Pickup Time Selector */}
            {fulfillmentType === "pickup" && (
              <div className="space-y-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <Label className="text-emerald-400 text-sm">{t('vendor.whenPickUp')}</Label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-[#0a1628] border border-white/20 rounded-lg p-2 text-white"
                  data-testid="select-pickup-time"
                >
                  <option value="">{t('vendor.selectTime')}</option>
                  <option value="asap">{t('vendor.asap')}</option>
                  <option value="30min">{t('vendor.in30Min')}</option>
                  <option value="45min">{t('vendor.in45Min')}</option>
                  <option value="1hr">{t('vendor.in1Hr')}</option>
                  <option value="1.5hr">{t('vendor.in1_5Hr')}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {t('vendor.foodReadyAt', { name: VENDOR.name })}
                </p>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('vendor.subtotal')}</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {fulfillmentType === "delivery" ? (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('vendor.deliveryFeeLabel')}</span>
                <span>$2.99</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm text-emerald-400">
                <span>{t('vendor.pickupNoFee')}</span>
                <span>$0.00</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-white">
              <span>{t('vendor.totalLabel')}</span>
              <span className="text-primary">${(cartTotal + (fulfillmentType === "delivery" ? 2.99 : 0)).toFixed(2)}</span>
            </div>
            
            <Link href="/tracking">
              <Button 
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 mt-4" 
                disabled={cart.length === 0 || (fulfillmentType === "pickup" && !pickupTime)}
              >
                {fulfillmentType === "pickup" ? t('vendor.placePickupOrder') : t('vendor.placeOrderAmount')}
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
