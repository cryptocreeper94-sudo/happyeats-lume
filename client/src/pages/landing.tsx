import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, Car, ChefHat, MapPin, Clock, Star, Phone,
  Utensils, Wrench, Package, ArrowRight, Sparkles, Users,
  ChevronLeft, ChevronRight, ChevronDown, Hand, Building2, MessageSquare, TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RestaurantRequest } from "@shared/schema";

import commercialDriverImg from "@/assets/images/commercial-driver.jpg";
import everydayDriverImg from "@/assets/images/everyday-driver.jpg";
import foodTruckVendorImg from "@/assets/images/food-truck-vendor.jpg";
import officeOrderingImg from "@/assets/images/office-ordering.jpg";
import { AdUnit } from "@/components/ad-unit";
import { useLanguage } from "@/i18n/context";

export default function Landing() {
  const { t } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const { data: vendorRequests } = useQuery<RestaurantRequest[]>({
    queryKey: ["/api/vendor-requests"],
    queryFn: async () => {
      const res = await fetch("/api/vendor-requests?limit=5");
      if (!res.ok) throw new Error("Failed to fetch requests");
      return res.json();
    },
    refetchInterval: 30000
  });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const carouselCards = [
    {
      id: "commercial",
      href: "/driver",
      image: commercialDriverImg,
      icon: Truck,
      iconBg: "bg-orange-500/20",
      iconBorder: "border-orange-500/30",
      iconColor: "text-orange-400",
      hoverBorder: "hover:border-orange-500/50",
      title: t("landing.commercialDrivers"),
      subtitle: t("landing.commercialDriversDesc"),
      badges: [t("landing.foodParts"), t("landing.breakTimer"), t("landing.games")],
      cta: t("landing.enterHub"),
      ctaGradient: "from-orange-500 to-rose-500"
    },
    {
      id: "everyday",
      href: "/everyday",
      image: everydayDriverImg,
      icon: Car,
      iconBg: "bg-sky-500/20",
      iconBorder: "border-sky-500/30",
      iconColor: "text-sky-400",
      hoverBorder: "hover:border-sky-500/50",
      title: t("landing.everydayDrivers"),
      subtitle: t("landing.everydayDriversDesc"),
      badges: [t("landing.mileageTracking"), t("landing.taxDeductions"), t("landing.expenseLog")],
      cta: t("landing.trackMiles"),
      ctaGradient: "from-sky-500 to-cyan-500"
    },
    {
      id: "vendors",
      href: "/vendor-portal",
      image: foodTruckVendorImg,
      icon: ChefHat,
      iconBg: "bg-emerald-500/20",
      iconBorder: "border-emerald-500/30",
      iconColor: "text-emerald-400",
      hoverBorder: "hover:border-emerald-500/50",
      title: t("landing.foodTruckVendors"),
      subtitle: t("landing.foodTruckVendorsDesc"),
      badges: [t("landing.vendorPortal"), t("landing.orderManagement"), t("landing.locationTracking")],
      cta: t("landing.applyNow"),
      ctaGradient: "from-emerald-500 to-teal-500"
    },
    {
      id: "office",
      href: "/office",
      image: officeOrderingImg,
      icon: Building2,
      iconBg: "bg-violet-500/20",
      iconBorder: "border-violet-500/30",
      iconColor: "text-violet-400",
      hoverBorder: "hover:border-violet-500/50",
      title: t("landing.officeTeams"),
      subtitle: t("landing.officeTeamsDesc"),
      badges: [t("landing.groupOrders"), t("landing.teamManagement"), t("landing.budgetControls")],
      cta: t("common.orderNow"),
      ctaGradient: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section - Delivery Service */}
      <div className="flex-1 flex flex-col items-center justify-start text-center px-4 pt-2 pb-8">
        <Badge className="mb-4 bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-300 border-orange-500/30">
          <Sparkles className="size-3 mr-1" /> Nashville • Lebanon • Mt. Juliet
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-orange-300 bg-clip-text text-transparent">
            Happy Eats
          </span>
          <span className="ml-2">😋</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-2">
          {t("landing.foodDeliveryTagline")}
        </p>
        
        <p className="text-sm text-muted-foreground/70 max-w-xl mb-8">
          {t("landing.foodDeliveryDesc")}
        </p>

        {/* Mobile Carousel */}
        <div className="w-full max-w-md md:hidden">
          {/* Swipe hint */}
          <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground/70 animate-pulse">
            <ChevronLeft className="size-4" />
            <Hand className="size-4" />
            <span className="text-xs">{t("landing.swipeToSee")}</span>
            <ChevronRight className="size-4" />
          </div>
          
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {carouselCards.map((card) => (
                <div key={card.id} className="flex-[0_0_100%] min-w-0 px-2">
                  <Link href={card.href}>
                    <Card 
                      data-testid={`card-${card.id}`}
                      className={`glass-panel border-white/20 ${card.hoverBorder} transition-all overflow-hidden`}
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={card.image} 
                          alt={card.title}
                          className="w-full h-full object-cover brightness-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                        <div className={`absolute top-3 left-3 size-10 rounded-xl ${card.iconBg} flex items-center justify-center border ${card.iconBorder} backdrop-blur-sm`}>
                          <card.icon className={`size-5 ${card.iconColor}`} />
                        </div>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-heading font-bold text-lg text-white mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {card.subtitle}
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {card.badges.map((badge) => (
                            <Badge key={badge} variant="outline" className="text-[10px] border-white/20 bg-white/5">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button 
                          size="sm" 
                          className={`w-full bg-gradient-to-r ${card.ctaGradient} text-white`}
                        >
                          {card.cta} <ArrowRight className="size-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          
          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button 
              onClick={scrollPrev}
              className="size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              data-testid="button-carousel-prev"
            >
              <ChevronLeft className="size-4 text-white" />
            </button>
            
            <div className="flex items-center gap-2">
              {carouselCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  data-testid={`button-carousel-dot-${index}`}
                  className={`size-2 rounded-full transition-all ${
                    index === selectedIndex 
                      ? "bg-orange-400 w-4" 
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            
            <button 
              onClick={scrollNext}
              className="size-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              data-testid="button-carousel-next"
            >
              <ChevronRight className="size-4 text-white" />
            </button>
          </div>
          
          {/* Scroll down indicator */}
          <div className="flex flex-col items-center mt-8 animate-bounce">
            <span className="text-xs text-muted-foreground/70 mb-1">{t("landing.moreBelow")}</span>
            <ChevronDown className="size-5 text-orange-400/70" />
          </div>
        </div>

        {/* Desktop Grid - Original Layout */}
        <div className="hidden md:block w-full max-w-4xl 2xl:max-w-6xl">
          {/* Main CTA - Commercial Drivers */}
          <Card data-testid="card-commercial-drivers" className="glass-panel border-2 border-orange-500/30 overflow-hidden mb-8 hover:border-orange-500/50 transition-all group">
            <div className="flex">
              <div className="w-1/3 relative">
                <img 
                  src={commercialDriverImg} 
                  alt="Commercial Driver"
                  className="w-full h-full object-cover absolute inset-0 brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/70" />
              </div>
              <CardContent className="flex-1 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="size-12 rounded-xl bg-gradient-to-br from-orange-500/30 to-rose-500/30 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                    <Truck className="size-6 text-orange-400" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-heading font-bold text-white mb-2">
                      {t("landing.commercialDrivers")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {t("landing.commercialDriversDesc")}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant="secondary" className="bg-white/10 min-w-[100px] justify-center">
                        <Utensils className="size-3 mr-1" /> {t("landing.hotMeals")}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/10 min-w-[100px] justify-center">
                        <Wrench className="size-3 mr-1" /> {t("landing.autoParts")}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/10 min-w-[100px] justify-center">
                        <Package className="size-3 mr-1" /> {t("landing.supplies")}
                      </Badge>
                    </div>
                  </div>
                  
                  <Link href="/driver">
                    <Button data-testid="button-enter-hub" size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all">
                      {t("landing.enterHub")} <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">{t("landing.alsoAvailable")}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Secondary Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            {/* Everyday Drivers */}
            <Card data-testid="card-everyday-drivers" className="glass-panel border-white/10 hover:border-sky-500/30 transition-all group cursor-pointer overflow-hidden">
              <Link href="/everyday">
                <div className="flex">
                  <div className="w-1/3 relative min-h-[140px]">
                    <img 
                      src={everydayDriverImg} 
                      alt="Everyday Driver"
                      className="w-full h-full object-cover absolute inset-0 brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/70" />
                  </div>
                  <CardContent className="flex-1 p-5">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-sky-500/20 flex items-center justify-center border border-sky-500/30">
                        <Car className="size-6 text-sky-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-white mb-1 group-hover:text-sky-400 transition-colors">
                          {t("landing.everydayDrivers")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t("landing.everydayDriversDesc")}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.mileageTracking")}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.taxDeductions")}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.expenseLog")}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </div>
              </Link>
            </Card>

            {/* Food Truck Vendors */}
            <Card data-testid="card-vendors" className="glass-panel border-white/10 hover:border-emerald-500/30 transition-all group cursor-pointer overflow-hidden">
              <Link href="/vendor-portal">
                <div className="flex">
                  <div className="w-1/3 relative min-h-[140px]">
                    <img 
                      src={foodTruckVendorImg} 
                      alt="Food Truck Vendor"
                      className="w-full h-full object-cover absolute inset-0 brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/70" />
                  </div>
                  <CardContent className="flex-1 p-5">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <ChefHat className="size-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                          {t("landing.foodTruckVendors")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t("landing.foodTruckVendorsDesc")}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.vendorPortal")}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.orderManagement")}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.locationTracking")}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </div>
              </Link>
            </Card>

            {/* Office & Shop Orders */}
            <Card data-testid="card-office" className="glass-panel border-white/10 hover:border-violet-500/30 transition-all group cursor-pointer overflow-hidden">
              <Link href="/office">
                <div className="flex">
                  <div className="w-1/3 relative min-h-[140px]">
                    <img 
                      src={officeOrderingImg} 
                      alt="Office Ordering"
                      className="w-full h-full object-cover absolute inset-0 brightness-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/70" />
                  </div>
                  <CardContent className="flex-1 p-5">
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                        <Building2 className="size-6 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-semibold text-white mb-1 group-hover:text-violet-400 transition-colors">
                          {t("landing.officeTeams")}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t("landing.officeTeamsDesc")}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.teamOrders")}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.localFavorites")}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-white/10 w-fit min-w-[100px] justify-center">
                            {t("landing.easyOrdering")}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </div>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Live Vendor Request Feed */}
      {vendorRequests && vendorRequests.length > 0 && (
        <div className="border-t border-white/10 py-6 sm:py-8 px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="size-10 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30">
                <TrendingUp className="size-5 text-orange-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">{t("landing.peopleRequesting")}</h3>
                <p className="text-sm text-muted-foreground">{t("landing.seeWhatCommunity")}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendorRequests.slice(0, 6).map((request) => (
                <Card key={request.id} className="bg-[#0d1f35]/60 border-white/10 hover:border-orange-500/30 transition-all" data-testid={`request-card-${request.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30 flex-shrink-0">
                        <MessageSquare className="size-5 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{request.restaurantName}</h4>
                        {request.cuisineType && (
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] mt-1">
                            {request.cuisineType}
                          </Badge>
                        )}
                        {request.location && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="size-3" /> {request.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link href="/vendor-portal">
                <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 gap-2" data-testid="button-join-network">
                  <ChefHat className="size-4" />
                  {t("landing.joinNetwork")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <AdUnit slot="landing-bottom" format="horizontal" className="my-6" />

      <div className="border-t border-white/10 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-orange-400" />
            <span>{t("landing.nashvilleArea")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-orange-400" />
            <span>{t("landing.delivery247")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="size-4 text-orange-400" />
            <span>{t("landing.localVendors")}</span>
          </div>
          <Link href="/franchise">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Building2 className="size-4 text-orange-400" />
              <span>{t("franchise.title")}</span>
            </div>
          </Link>
          <Link href="/investors">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <TrendingUp className="size-4 text-orange-400" />
              <span>{t("investors.title")}</span>
            </div>
          </Link>
          <Link href="/demo">
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <Sparkles className="size-4 text-orange-400" />
              <span>{t("demo.title")}</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-white/40 mb-3">
          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 text-amber-300">
            <Clock className="size-3" /> Coming Soon
          </span>
          <span className="inline-flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2.5 py-1 text-cyan-300">
            <Phone className="size-3" /> SMS order support coming soon
          </span>
          <span className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-1 text-violet-300">
            <Star className="size-3" /> Native apps coming soon to Google Play & App Store
          </span>
        </div>
      </div>

      <div className="text-center py-4 border-t border-white/5">
        <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">
          {t("landing.demoMode")}
        </Badge>
      </div>
    </div>
  );
}
