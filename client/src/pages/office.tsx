import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, Utensils, Clock, MapPin, ChefHat, 
  Star, Users, Truck, ArrowRight, Sparkles,
  Phone, ShoppingBag, Heart, Coffee, Plus, Send, CheckCircle
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import catFoodtruckImg from "@/assets/images/cat-foodtruck.jpg";
import catLocalRestaurantImg from "@/assets/images/cat-local-restaurant.jpg";
import catCoffeeImg from "@/assets/images/cat-coffee.jpg";
import catMompopImg from "@/assets/images/cat-mompop.jpg";
import vendorTacosImg from "@/assets/images/vendor-tacos.jpg";
import vendorBbqImg from "@/assets/images/vendor-bbq.jpg";
import vendorNoodlesImg from "@/assets/images/vendor-noodles.jpg";
import vendorBurgerImg from "@/assets/images/vendor-burger.jpg";
import { AdUnit } from "@/components/ad-unit";

export default function OfficeDashboard() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: "",
    location: "",
    cuisineType: "",
    requesterName: "",
    requesterEmail: "",
    notes: ""
  });

  const submitRequest = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/vendor-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit request");
      return res.json();
    },
    onSuccess: () => {
      setRequestSubmitted(true);
      setFormData({ restaurantName: "", location: "", cuisineType: "", requesterName: "", requesterEmail: "", notes: "" });
      setTimeout(() => {
        setRequestSubmitted(false);
        setShowRequestForm(false);
      }, 3000);
    }
  });
  const featuredVendors = [
    { id: 1, name: "Taco Wheels", type: "Food Truck", cuisine: "Mexican", rating: 4.8, deliveryTime: "25-35 min", image: vendorTacosImg },
    { id: 2, name: "BBQ Pit Stop", type: "Food Truck", cuisine: "BBQ", rating: 4.9, deliveryTime: "30-40 min", image: vendorBbqImg },
    { id: 3, name: "Noodle Express", type: "Food Truck", cuisine: "Asian Fusion", rating: 4.7, deliveryTime: "20-30 min", image: vendorNoodlesImg },
    { id: 4, name: "The Burger Bus", type: "Food Truck", cuisine: "American", rating: 4.6, deliveryTime: "25-35 min", image: vendorBurgerImg },
  ];

  const categories = [
    { name: "Food Trucks", icon: Truck, color: "orange", count: 12, image: catFoodtruckImg },
    { name: "Local Restaurants", icon: Utensils, color: "emerald", count: 8, image: catLocalRestaurantImg },
    { name: "Coffee & Drinks", icon: Coffee, color: "amber", count: 5, image: catCoffeeImg },
    { name: "Mom & Pop Shops", icon: Heart, color: "rose", count: 6, image: catMompopImg },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1d32] to-[#0a1628]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-violet-500/20 text-violet-300 border-violet-500/30">
            <Building2 className="size-3 mr-1" /> Office & Shop Orders
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Order from Your Favorite Food Trucks
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Something different for lunch? Local food trucks, mom & pop restaurants, and hidden gems - delivered right to your office or shop.
          </p>
        </div>

        <Card className="bg-[#0d1f35]/80 backdrop-blur-xl border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.1)] mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="size-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/30">
                <ShoppingBag className="size-8 text-violet-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-white mb-1">Team Orders Made Easy</h2>
                <p className="text-sm text-muted-foreground">
                  Order for yourself or the whole office. Browse local vendors, pick your favorites, and we'll deliver it fresh.
                </p>
              </div>
              <Link href="/vendors">
                <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 gap-2">
                  Browse All Vendors <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((cat) => (
            <Link key={cat.name} href="/vendors">
              <Card className="bg-[#0d1f35]/60 border-white/10 hover:border-violet-500/30 transition-all cursor-pointer group overflow-hidden relative h-40">
                <img 
                  src={cat.image} 
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <CardContent className="p-4 text-center relative z-10 flex flex-col justify-end h-full">
                  <div className={`size-10 mx-auto rounded-xl bg-${cat.color}-500/30 backdrop-blur-sm flex items-center justify-center border border-${cat.color}-500/40 mb-2 group-hover:scale-105 transition-transform`}>
                    <cat.icon className={`size-5 text-white`} />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-0.5 drop-shadow-lg">{cat.name}</h3>
                  <p className="text-xs text-white/80">{cat.count} available</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <AdUnit slot="office-mid" format="horizontal" className="mb-6" />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="size-5 text-violet-400" />
              Featured Vendors
            </h2>
            <Link href="/vendors">
              <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                View All <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredVendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendor/${vendor.id}`}>
                <Card className="bg-[#0d1f35]/60 border-white/10 hover:border-violet-500/30 transition-all cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="size-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-violet-500/30 transition-colors relative">
                        <img 
                          src={vendor.image} 
                          alt={vendor.name}
                          className="w-full h-full object-cover brightness-110 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors">{vendor.name}</h3>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px]">{vendor.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{vendor.cuisine}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Star className="size-3 fill-amber-400" /> {vendor.rating}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="size-3" /> {vendor.deliveryTime}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="size-5 text-muted-foreground group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 border-orange-500/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center border border-orange-500/30">
                <Plus className="size-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Request Your Favorite Food Truck</h3>
                <p className="text-sm text-muted-foreground">
                  Don't see your favorite? Let us know and we'll reach out to get them on the platform!
                </p>
              </div>
              <Button 
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600"
                data-testid="button-toggle-request-form"
              >
                {showRequestForm ? "Close" : "Request a Food Truck"}
              </Button>
            </div>

            {showRequestForm && (
              <div className="border-t border-white/10 pt-4 mt-4">
                {requestSubmitted ? (
                  <div className="text-center py-6">
                    <CheckCircle className="size-12 mx-auto text-emerald-400 mb-3" />
                    <h4 className="text-lg font-bold text-white mb-1">Request Submitted!</h4>
                    <p className="text-sm text-muted-foreground">We'll reach out to this food truck and let you know when they join.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName" className="text-white">Food Truck / Restaurant Name *</Label>
                      <Input 
                        id="restaurantName"
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                        placeholder="e.g., Tony's Tacos"
                        className="bg-[#0a1628] border-white/20"
                        data-testid="input-restaurant-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Location (if known)</Label>
                      <Input 
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., Nashville, Downtown area"
                        className="bg-[#0a1628] border-white/20"
                        data-testid="input-location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cuisineType" className="text-white">Cuisine Type</Label>
                      <Input 
                        id="cuisineType"
                        value={formData.cuisineType}
                        onChange={(e) => setFormData({...formData, cuisineType: e.target.value})}
                        placeholder="e.g., Mexican, BBQ, Asian"
                        className="bg-[#0a1628] border-white/20"
                        data-testid="input-cuisine-type"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requesterName" className="text-white">Your Name</Label>
                      <Input 
                        id="requesterName"
                        value={formData.requesterName}
                        onChange={(e) => setFormData({...formData, requesterName: e.target.value})}
                        placeholder="Your name"
                        className="bg-[#0a1628] border-white/20"
                        data-testid="input-requester-name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="requesterEmail" className="text-white">Your Email (we'll notify you when they join)</Label>
                      <Input 
                        id="requesterEmail"
                        type="email"
                        value={formData.requesterEmail}
                        onChange={(e) => setFormData({...formData, requesterEmail: e.target.value})}
                        placeholder="your@email.com"
                        className="bg-[#0a1628] border-white/20"
                        data-testid="input-requester-email"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes" className="text-white">Why do you love this food truck?</Label>
                      <Textarea 
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Tell us what makes them special..."
                        className="bg-[#0a1628] border-white/20 min-h-[80px]"
                        data-testid="input-notes"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <Button 
                        onClick={() => submitRequest.mutate(formData)}
                        disabled={!formData.restaurantName || submitRequest.isPending}
                        className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 gap-2"
                        data-testid="button-submit-request"
                      >
                        <Send className="size-4" />
                        {submitRequest.isPending ? "Submitting..." : "Submit Request"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-6 text-center">
            <Users className="size-10 mx-auto text-violet-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Bulk Orders for Your Team?</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Ordering for 10+ people? We can coordinate with multiple vendors to get everyone exactly what they want.
            </p>
            <Button variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Phone className="size-4 mr-2" /> Contact Us for Team Orders
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
