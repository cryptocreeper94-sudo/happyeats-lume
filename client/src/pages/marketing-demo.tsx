import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone, Instagram, Facebook, Calendar, Camera,
  Clock, CheckCircle, Send, Image as ImageIcon,
  LayoutGrid, Sparkles, Eye, BarChart3, Target,
  ArrowLeft, ArrowRight, Shield, Star,
  Share2, Heart, MessageCircle, Bookmark, TrendingUp,
  Zap, PieChart, MousePointer
} from "lucide-react";

import foodtruckOutdoor01 from "@/assets/marketing/foodtruck-outdoor-01.png";
import foodTacos01 from "@/assets/marketing/food-tacos-01.png";
import foodBbqBrisket from "@/assets/marketing/food-bbq-brisket.png";
import foodAsianTacos from "@/assets/marketing/food-asian-tacos.png";
import officeTeamLunch01 from "@/assets/marketing/office-team-lunch-01.png";
import truckerCab01 from "@/assets/marketing/trucker-cab-01.png";
import nashvilleSkyline from "@/assets/marketing/nashville-skyline.png";
import deliveryHandoff from "@/assets/marketing/delivery-handoff.png";
import hatchNashvilleEats from "@/assets/marketing/hatch-nashville-eats.png";
import hatchGoodFoodGo from "@/assets/marketing/hatch-good-food-go.png";

const DEMO_IMAGES = [
  { id: "foodtruck-outdoor", src: foodtruckOutdoor01, category: "Food Truck", label: "Food Truck Outdoor" },
  { id: "food-tacos", src: foodTacos01, category: "Mexican", label: "Street Tacos" },
  { id: "food-bbq", src: foodBbqBrisket, category: "BBQ", label: "BBQ Brisket" },
  { id: "food-asian", src: foodAsianTacos, category: "Asian", label: "Asian Fusion Tacos" },
  { id: "office-lunch", src: officeTeamLunch01, category: "Office", label: "Office Team Lunch" },
  { id: "trucker-cab", src: truckerCab01, category: "Trucker", label: "Trucker Cab Meal" },
  { id: "nashville", src: nashvilleSkyline, category: "Nashville", label: "Nashville Skyline" },
  { id: "delivery", src: deliveryHandoff, category: "Delivery", label: "Delivery Handoff" },
  { id: "hatch-1", src: hatchNashvilleEats, category: "Hatch Print", label: "Nashville Eats Poster" },
  { id: "hatch-2", src: hatchGoodFoodGo, category: "Hatch Print", label: "Good Food On The Go" },
];

const DEMO_POSTS = [
  { platform: "Facebook", message: "Hungry on the road? We bring Nashville's best food trucks right to you! Order now and get hot meals delivered to your truck stop. #FoodTrucks #NashvilleEats", image: foodtruckOutdoor01, likes: 47, shares: 12, comments: 8, time: "2 hours ago" },
  { platform: "Instagram", message: "Fresh street tacos from your favorite local vendors. Order now, pick up in minutes! #StreetTacos #FoodDelivery #EatLocal", image: foodTacos01, likes: 124, shares: 0, comments: 15, time: "4 hours ago" },
  { platform: "Facebook", message: "Office lunch just got an upgrade. Team ordering made easy — feed your whole crew from the best local food trucks!", image: officeTeamLunch01, likes: 38, shares: 8, comments: 5, time: "Yesterday" },
  { platform: "X", message: "BBQ brisket so good, you'll forget you're in a parking lot. Find it on Happy Eats! #BBQ #TruckerLife", image: foodBbqBrisket, likes: 89, shares: 22, comments: 11, time: "Yesterday" },
];

const DEMO_SCHEDULE = [
  { time: "8:00 AM", platform: "Facebook", status: "posted", content: "Good morning Nashville! Start your day with breakfast tacos." },
  { time: "10:00 AM", platform: "Instagram", status: "posted", content: "Mid-morning snack time! Check out our food truck partners." },
  { time: "12:00 PM", platform: "All", status: "posted", content: "Lunch rush! Order now for fast delivery to your location." },
  { time: "2:00 PM", platform: "Facebook", status: "scheduled", content: "Afternoon pick-me-up! Fresh coffee and snacks nearby." },
  { time: "4:00 PM", platform: "Instagram", status: "scheduled", content: "Happy hour deals from our vendor partners!" },
  { time: "6:00 PM", platform: "All", status: "scheduled", content: "Dinner time! Hot meals delivered right to you." },
  { time: "8:00 PM", platform: "X", status: "scheduled", content: "Late night cravings? We've got you covered." },
];

const DEMO_METRICS = {
  totalReach: "12.4K",
  engagement: "8.7%",
  postsThisWeek: 42,
  topPlatform: "Instagram",
  followerGrowth: "+340",
  clickThroughRate: "3.2%",
};

export default function MarketingDemo() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#0f1d32] to-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Shield className="size-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Driver<span className="text-violet-400">Connect</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
            <Eye className="size-3 mr-1" /> DEMO MODE
          </Badge>
          <Link href="/franchise">
            <Button size="sm" className="bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs" data-testid="button-franchise-from-demo">
              Franchise Info
            </Button>
          </Link>
        </div>
      </nav>

      <div className="pt-14">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-3">
              <Megaphone className="size-3 mr-1" /> Marketing Hub Preview
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Built-in Social Media Marketing
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every franchise gets a full marketing suite. Auto-post to Facebook, Instagram & X. 
              18+ professional images included. AI-powered content generation.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {[
              { label: "Total Reach", value: DEMO_METRICS.totalReach, icon: Target, color: "text-violet-400" },
              { label: "Engagement", value: DEMO_METRICS.engagement, icon: MousePointer, color: "text-emerald-400" },
              { label: "Posts/Week", value: DEMO_METRICS.postsThisWeek.toString(), icon: Send, color: "text-orange-400" },
              { label: "Top Platform", value: DEMO_METRICS.topPlatform, icon: Instagram, color: "text-pink-400" },
              { label: "New Followers", value: DEMO_METRICS.followerGrowth, icon: TrendingUp, color: "text-sky-400" },
              { label: "Click Rate", value: DEMO_METRICS.clickThroughRate, icon: Zap, color: "text-amber-400" },
            ].map((metric) => (
              <Card key={metric.label} className="bg-slate-800/50 border-white/10">
                <CardContent className="p-3 text-center">
                  <metric.icon className={`size-5 mx-auto mb-1 ${metric.color}`} />
                  <p className="text-lg font-bold text-white">{metric.value}</p>
                  <p className="text-[10px] text-slate-500">{metric.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-white/10 w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500/20 min-h-[44px]">
                <BarChart3 className="size-4 mr-1" /> Overview
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-violet-500/20 min-h-[44px]">
                <LayoutGrid className="size-4 mr-1" /> Content Library
              </TabsTrigger>
              <TabsTrigger value="scheduler" className="data-[state=active]:bg-violet-500/20 min-h-[44px]">
                <Calendar className="size-4 mr-1" /> Auto-Scheduler
              </TabsTrigger>
              <TabsTrigger value="feed" className="data-[state=active]:bg-violet-500/20 min-h-[44px]">
                <Share2 className="size-4 mr-1" /> Social Feed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/60 border-violet-500/20">
                  <CardContent className="p-6">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4 border border-blue-500/30">
                      <Facebook className="size-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold mb-1">Facebook</h3>
                    <p className="text-sm text-slate-400 mb-3">Auto-post to your business page. Engage local community with food photos & updates.</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>2.1K followers</span>
                      <span>7 posts/week</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/60 border-rose-500/20">
                  <CardContent className="p-6">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 flex items-center justify-center mb-4 border border-pink-500/30">
                      <Instagram className="size-6 text-pink-400" />
                    </div>
                    <h3 className="text-white font-bold mb-1">Instagram</h3>
                    <p className="text-sm text-slate-400 mb-3">Eye-catching food photography posts. Professional images included in your package.</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>3.8K followers</span>
                      <span>7 posts/week</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900/60 border-slate-500/20">
                  <CardContent className="p-6">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center mb-4 border border-slate-500/30">
                      <span className="text-xl font-bold text-white">𝕏</span>
                    </div>
                    <h3 className="text-white font-bold mb-1">X (Twitter)</h3>
                    <p className="text-sm text-slate-400 mb-3">Quick updates, trucker engagement, and real-time food truck location alerts.</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>1.4K followers</span>
                      <span>7 posts/week</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/60 border-orange-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center">
                      <Sparkles className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">AI Content Generator</h3>
                      <p className="text-xs text-slate-400">Generate engaging posts with one click</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Write a fun post about food truck tacos",
                      "Create a trucker-focused lunch promo",
                      "Draft a team lunch ordering post",
                      "Nashville local business support post",
                    ].map((prompt) => (
                      <div key={prompt} className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400 flex items-center gap-2">
                        <Zap className="size-4 text-orange-400 shrink-0" />
                        {prompt}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">Image Library — 18+ Professional Images Included</h3>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  <Camera className="size-3 mr-1" /> All included free
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {DEMO_IMAGES.map((img) => (
                  <Card
                    key={img.id}
                    className={`bg-slate-800/50 border-white/10 overflow-hidden cursor-pointer transition-all hover:border-violet-500/40 ${selectedImage === img.id ? 'ring-2 ring-violet-500' : ''}`}
                    onClick={() => setSelectedImage(selectedImage === img.id ? null : img.id)}
                    data-testid={`card-demo-image-${img.id}`}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={img.src} alt={img.label} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium text-white truncate">{img.label}</p>
                      <Badge variant="outline" className="text-[9px] border-white/20 mt-1">{img.category}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="scheduler" className="space-y-6">
              <Card className="bg-slate-900/60 border-violet-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="size-5 text-violet-400" />
                    <h3 className="text-white font-bold">Today's Auto-Post Schedule — 7 posts/day</h3>
                  </div>
                  <div className="space-y-3">
                    {DEMO_SCHEDULE.map((slot) => (
                      <div key={slot.time} className={`flex items-center gap-4 p-3 rounded-lg border ${slot.status === 'posted' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                        <span className="text-sm font-mono text-white w-20">{slot.time}</span>
                        <Badge className={slot.status === 'posted' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'} variant="outline">
                          {slot.status === 'posted' ? <CheckCircle className="size-3 mr-1" /> : <Clock className="size-3 mr-1" />}
                          {slot.status}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-white/20">{slot.platform}</Badge>
                        <span className="text-sm text-slate-400 flex-1 truncate">{slot.content}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feed" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {DEMO_POSTS.map((post, i) => (
                  <Card key={i} className="bg-slate-900/60 border-white/10 overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img src={post.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`text-[10px] ${post.platform === 'Facebook' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : post.platform === 'Instagram' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                          {post.platform}
                        </Badge>
                        <span className="text-[10px] text-slate-500">{post.time}</span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">{post.message}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Heart className="size-3" /> {post.likes}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="size-3" /> {post.comments}</span>
                        <span className="flex items-center gap-1"><Share2 className="size-3" /> {post.shares}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-violet-500/10 border-orange-500/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                  This Is Included in Every Franchise
                </h2>
                <p className="text-slate-400 mb-6">
                  All 18+ marketing images, AI content generation, auto-scheduling to all 3 platforms, 
                  and performance analytics — ready to use from day one.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/franchise">
                    <Button size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold w-full sm:w-auto" data-testid="button-get-franchise">
                      Get Your Franchise <ArrowRight className="size-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button size="lg" variant="outline" className="border-white/20 text-white w-full sm:w-auto" data-testid="button-back-landing">
                      <ArrowLeft className="size-4 mr-1" /> Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 mt-8">
          <div className="container mx-auto px-4 text-center text-xs text-slate-600">
            <p>© 2026 Driver Connect. Part of the Trust Layer Ecosystem. Dark Wave Studios LLC.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
