import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, Search, MapPin, Navigation, Phone, 
  Clock, Star, Filter, ArrowRight, Truck, Wrench, ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/lib/api";
import mapBg from "@/assets/images/concierge-map.jpg";
import partsImg from "@/assets/images/parts.jpg";
import serviceImg from "@/assets/images/service.jpg";
import superstoreImg from "@/assets/images/superstore.jpg";
import { useLanguage } from "@/i18n/context";

export default function Concierge() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allLocations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const getImageForType = (type: string) => {
    if (type === "parts") return partsImg;
    if (type === "service") return serviceImg;
    if (type === "supplies") return superstoreImg;
    return partsImg;
  };

  const locations = allLocations
    .filter(loc => loc.type !== "partner")
    .map(loc => ({
      id: String(loc.id),
      name: loc.name,
      type: loc.type,
      category: loc.category,
      address: loc.address,
      distance: "2.1 mi",
      rating: loc.rating ? parseFloat(loc.rating) : 4.0,
      isOpen: loc.isOpen ?? true,
      image: getImageForType(loc.type),
      phone: loc.phone || ""
    }));

  const filteredLocations = locations.filter(loc => {
    const matchesTab = activeTab === "all" || loc.type === activeTab;
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         loc.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] pb-20 md:pb-0">
      <div className="relative p-4 space-y-4 z-10 sticky top-0 border-b border-white/[0.06] bg-[#0a0f1e]/95 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.05] via-transparent to-orange-500/[0.05]" />
        <div className="relative flex items-center gap-3">
          <Link href="/vendors">
            <Button data-testid="button-back-vendors" variant="ghost" size="icon" className="-ml-2 text-white/70 hover:text-white hover:bg-white/[0.06]">
              <ArrowLeft className="size-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">{t('concierge.findNearby')}</h1>
            <p className="text-xs text-white/40">{t('concierge.gpsLocation')}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input 
            data-testid="input-search"
            placeholder={t('concierge.searchPlaceholder')} 
            className="pl-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 focus:border-cyan-500/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-white/[0.03] border border-white/[0.06]">
            <TabsTrigger data-testid="tab-all" value="all" className="flex-1 min-h-[44px] data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">{t('concierge.all')}</TabsTrigger>
            <TabsTrigger data-testid="tab-parts" value="parts" className="flex-1 min-h-[44px] data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">{t('concierge.parts')}</TabsTrigger>
            <TabsTrigger data-testid="tab-service" value="service" className="flex-1 min-h-[44px] data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">{t('concierge.service')}</TabsTrigger>
            <TabsTrigger data-testid="tab-supplies" value="supplies" className="flex-1 min-h-[44px] data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-300">{t('concierge.supplies')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="relative h-[25vh] sm:h-[35vh] lg:h-full lg:flex-1 lg:order-2 border-b lg:border-l border-white/[0.06] order-1">
          <img src={mapBg} className="w-full h-full object-cover opacity-70" alt="Map View" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent lg:hidden" />
          
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button size="icon" className="rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl hover:bg-cyan-500/20 hover:border-cyan-500/30 hover:text-cyan-300 shadow-xl text-white/70">
              <Navigation className="size-5" />
            </Button>
            <Button size="icon" className="rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.1] shadow-xl text-white/70">
              <MapPin className="size-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 lg:flex-none lg:w-[450px] bg-[#0a0f1e] lg:order-1 order-2 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-4 py-2">
            <div className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider">
                  {t('concierge.locationsFound', { count: filteredLocations.length })}
                </h3>
                <Button variant="ghost" size="sm" className="h-6 text-xs text-cyan-400 gap-1 hover:bg-cyan-500/10">
                  <Filter className="size-3" /> {t('concierge.filter')}
                </Button>
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                  <p className="text-sm text-white/40">{t('common.loading')}</p>
                </div>
              )}

              {!isLoading && filteredLocations.length === 0 && (
                <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-8 text-center">
                  <MapPin className="size-10 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/50">No locations found</p>
                  <p className="text-xs text-white/30 mt-1">Try adjusting your search or filters</p>
                </div>
              )}

              {filteredLocations.map((loc) => (
                <div key={loc.id} className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer overflow-hidden">
                  <div className="p-3 flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="w-full h-32 sm:size-20 rounded-xl bg-black/20 overflow-hidden shrink-0 border border-white/[0.06]">
                      <img src={loc.image} alt={loc.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white truncate pr-2 group-hover:text-cyan-300 transition-colors">{loc.name}</h4>
                        <Badge variant="secondary" className="text-[10px] h-5 bg-white/[0.06] text-white/60 border border-white/[0.08]">
                          {loc.distance}
                        </Badge>
                      </div>
                      <p className="text-xs text-orange-400 mb-1 font-medium">{loc.category}</p>
                      <p className="text-xs text-white/40 truncate mb-2">{loc.address}</p>
                      
                      <div className="flex items-center gap-2 mt-auto">
                        <Button size="sm" className="h-10 sm:h-7 text-xs bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 flex-1 min-h-[44px] sm:min-h-0">
                          <Navigation className="size-3 mr-1" /> {t('concierge.go')}
                        </Button>
                         <Button size="sm" variant="secondary" className="h-10 sm:h-7 text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 flex-1 min-h-[44px] sm:min-h-0">
                          <Phone className="size-3 mr-1" /> {t('concierge.call')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-4 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] text-center mt-4">
                <p className="text-sm text-white/40 mb-2">{t('concierge.dontSeeWhatYouNeed')}</p>
                <Button variant="outline" className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40">
                  {t('concierge.requestCustomPickup')}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
