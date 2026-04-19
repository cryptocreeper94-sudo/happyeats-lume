import { useState, useMemo, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, subDays, subWeeks } from "date-fns";
import { 
  Megaphone, Instagram, Facebook, Calendar, Camera,
  Clock, CheckCircle, Plus, Trash2, Send, Image as ImageIcon,
  LayoutGrid, Sparkles, RefreshCw, X as XIcon, TrendingUp,
  ChevronLeft, ChevronRight, Edit, Copy, Download, Eye,
  BarChart3, Target, Lightbulb, MessageSquare, Star,
  Zap, Settings, PieChart, Users, Volume2, VolumeX,
  Link as LinkIcon, Hash, Layers, Loader2, Play, Pause,
  StickyNote, FileText, Wand2, ArrowRight, AlertCircle,
  MousePointer, Share2, Heart, MessageCircle, Bookmark, DollarSign,
  Palette, Printer, BookOpen
} from "lucide-react";
import BrandAssetsTab from "@/components/brand-assets-tab";
import { PrintStudioTab } from "@/pages/marketing-materials";
import SiteAnalyticsDashboard from "@/components/analytics-dashboard";
import ConnectionsTab from "@/components/connections-tab";
import PostComposer from "@/components/post-composer";
import { useAuth } from "@/lib/auth-context";
import { PageLanguageProvider, PageLanguageToggle } from "@/i18n/usePageLanguage";
import { useLanguage } from "@/i18n/context";

import foodtruckOutdoor01 from "@/assets/marketing/foodtruck-outdoor-01.png";
import foodTacos01 from "@/assets/marketing/food-tacos-01.png";
import foodElote01 from "@/assets/marketing/food-elote-01.png";
import truckerCab01 from "@/assets/marketing/trucker-cab-01.png";
import hatchNashvilleEats from "@/assets/marketing/hatch-nashville-eats.png";
import hatchGoodFoodGo from "@/assets/marketing/hatch-good-food-go.png";
import foodBbqBrisket from "@/assets/marketing/food-bbq-brisket.png";
import officeTeamLunch01 from "@/assets/marketing/office-team-lunch-01.png";
import foodtruckNight01 from "@/assets/marketing/foodtruck-night-01.png";
import foodAsianTacos from "@/assets/marketing/food-asian-tacos.png";
import hatchDriverConnect from "@/assets/marketing/hatch-driver-connect.png";
import hatchEatLocal from "@/assets/marketing/hatch-eat-local.png";
import truckerCabPov from "@/assets/marketing/trucker-cab-pov.png";
import nashvilleSkyline from "@/assets/marketing/nashville-skyline.png";
import warehouseBreakroom from "@/assets/marketing/warehouse-breakroom.png";
import foodGyro from "@/assets/marketing/food-gyro.png";
import deliveryHandoff from "@/assets/marketing/delivery-handoff.png";
import hatchTrustLayer from "@/assets/marketing/hatch-trust-layer.png";

interface LibraryImage {
  id: string;
  src: string;
  category: string;
  label: string;
  tags: string[];
}

interface ContentBundle {
  id: string;
  imageId: string;
  message: string;
  hashtags: string[];
  platform: string;
  category: string;
  usageCount: number;
  lastUsed?: string;
  metrics?: {
    impressions: number;
    reach: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

interface TeamNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  pinned?: boolean;
}

const LIBRARY_IMAGES: LibraryImage[] = [
  { id: "foodtruck-outdoor-01", src: foodtruckOutdoor01, category: "food-truck", label: "Food Truck Outdoor", tags: ["outdoor", "casual", "customers"] },
  { id: "foodtruck-night-01", src: foodtruckNight01, category: "food-truck", label: "Food Truck Night", tags: ["night", "lights", "urban"] },
  { id: "food-tacos-01", src: foodTacos01, category: "mexican", label: "Street Tacos", tags: ["tacos", "mexican", "food"] },
  { id: "food-elote-01", src: foodElote01, category: "mexican", label: "Elote", tags: ["corn", "mexican", "street food"] },
  { id: "food-bbq-brisket", src: foodBbqBrisket, category: "bbq", label: "BBQ Brisket", tags: ["bbq", "meat", "southern"] },
  { id: "food-asian-tacos", src: foodAsianTacos, category: "asian", label: "Asian Fusion Tacos", tags: ["korean", "fusion", "tacos"] },
  { id: "food-gyro", src: foodGyro, category: "mediterranean", label: "Gyro", tags: ["gyro", "mediterranean", "wrap"] },
  { id: "office-team-lunch-01", src: officeTeamLunch01, category: "office", label: "Office Team Lunch", tags: ["office", "team", "professional"] },
  { id: "warehouse-breakroom", src: warehouseBreakroom, category: "office", label: "Warehouse Break Room", tags: ["warehouse", "workers", "lunch"] },
  { id: "trucker-cab-01", src: truckerCab01, category: "trucker", label: "Trucker Cab Meal", tags: ["trucker", "cab", "meal"] },
  { id: "trucker-cab-pov", src: truckerCabPov, category: "trucker", label: "Trucker POV", tags: ["highway", "sunset", "road"] },
  { id: "nashville-skyline", src: nashvilleSkyline, category: "nashville", label: "Nashville Skyline", tags: ["nashville", "city", "downtown"] },
  { id: "delivery-handoff", src: deliveryHandoff, category: "delivery", label: "Delivery Handoff", tags: ["delivery", "customer", "happy"] },
  { id: "hatch-nashville-eats", src: hatchNashvilleEats, category: "hatch-print", label: "Nashville Eats Poster", tags: ["hatch", "poster", "nashville"] },
  { id: "hatch-good-food-go", src: hatchGoodFoodGo, category: "hatch-print", label: "Good Food On The Go", tags: ["hatch", "poster", "delivery"] },
  { id: "hatch-driver-connect", src: hatchDriverConnect, category: "hatch-print", label: "Driver Connect Poster", tags: ["hatch", "poster", "trucker"] },
  { id: "hatch-eat-local", src: hatchEatLocal, category: "hatch-print", label: "Eat Local Poster", tags: ["hatch", "poster", "local"] },
  { id: "hatch-trust-layer", src: hatchTrustLayer, category: "hatch-print", label: "Trust Layer Poster", tags: ["hatch", "poster", "brand"] },
];

const PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "bg-blue-600", charLimit: 63206 },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-600 to-pink-500", charLimit: 2200 },
  { id: "x", label: "X", icon: XIcon, color: "bg-black", charLimit: 280 },
  { id: "all", label: "All Platforms", icon: Megaphone, color: "bg-gradient-to-r from-orange-500 to-rose-500", charLimit: 280 },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "food-truck", label: "Food Trucks" },
  { id: "mexican", label: "Mexican" },
  { id: "bbq", label: "BBQ" },
  { id: "asian", label: "Asian" },
  { id: "mediterranean", label: "Mediterranean" },
  { id: "office", label: "Office" },
  { id: "trucker", label: "Trucker" },
  { id: "nashville", label: "Nashville" },
  { id: "delivery", label: "Delivery" },
  { id: "hatch-print", label: "Hatch Print" },
];

const WEEKLY_SCHEDULE = {
  0: { rotation: 'planning', label: 'Sunday - Planning Day', description: 'Review week & plan ahead' },
  1: { rotation: 'A', label: 'Monday', description: 'Food showcase or feature' },
  2: { rotation: 'B', label: 'Tuesday', description: 'Tips or community' },
  3: { rotation: 'A', label: 'Wednesday', description: 'Customer story or review' },
  4: { rotation: 'B', label: 'Thursday', description: 'Behind the scenes' },
  5: { rotation: 'A', label: 'Friday', description: 'Weekend inspiration' },
  6: { rotation: 'B', label: 'Saturday', description: 'Local Nashville love' },
};

const SAMPLE_POSTS = [
  { content: "Hungry on the road? We bring Nashville's best food trucks right to you!", category: "food-truck", platform: "all" },
  { content: "Fresh street tacos from your favorite local vendors. Order now, pick up in minutes!", category: "mexican", platform: "instagram" },
  { content: "Office lunch just got an upgrade. Team ordering made easy with Happy Eats.", category: "office", platform: "facebook" },
  { content: "Long haul? Good food. Happy Eats delivers to truck stops across Nashville.", category: "trucker", platform: "all" },
  { content: "Supporting local food trucks, one order at a time. Eat local, support local!", category: "nashville", platform: "instagram" },
  { content: "BBQ brisket so good, you'll forget you're in a parking lot. Find it on Happy Eats!", category: "bbq", platform: "facebook" },
  { content: "From the food truck to your front door. That's the Happy Eats way.", category: "delivery", platform: "all" },
  { content: "Warehouse crew needs lunch? We've got you covered with group ordering.", category: "office", platform: "facebook" },
];

const AI_PROMPTS = [
  "Write a fun, casual post about food truck tacos",
  "Create an engaging post about team lunch ordering",
  "Write a post targeting truck drivers about hot meals on the road",
  "Create a Nashville-focused local business support post",
  "Write a promotional post about our delivery service",
];

interface MarketingPost {
  id: string;
  tenantId: string;
  content: string;
  platform: string;
  hashtags: string[] | null;
  imageFilename: string | null;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

interface IntegrationStatus {
  facebookConnected: boolean;
  instagramConnected: boolean;
  twitterConnected: boolean;
  facebookPageName?: string;
  instagramUsername?: string;
  twitterUsername?: string;
}

function GlassCard({ children, className = "", onClick, ...props }: { children: React.ReactNode; className?: string; onClick?: () => void } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`bg-[#1e293b]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

function TodaysSuggestedPost({ allImages, bundles }: { allImages: LibraryImage[], bundles: ContentBundle[] }) {
  const { toast } = useToast();
  const today = new Date();
  const dayOfWeek = today.getDay();
  const schedule = WEEKLY_SCHEDULE[dayOfWeek as keyof typeof WEEKLY_SCHEDULE];
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState("");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const suggestion = useMemo(() => {
    if (schedule.rotation === 'planning') return null;
    const categories = schedule.rotation === 'A' 
      ? ['food-truck', 'mexican', 'bbq', 'delivery'] 
      : ['trucker', 'nashville', 'office', 'hatch-print'];
    
    const matchingBundle = bundles.find(b => categories.includes(b.category));
    if (matchingBundle) {
      const img = allImages.find(i => i.id === matchingBundle.imageId);
      return { image: img, message: matchingBundle.message, bundle: matchingBundle };
    }
    
    const matchingImage = allImages.find(img => categories.includes(img.category));
    const samplePost = SAMPLE_POSTS.find(p => categories.includes(p.category));
    return { image: matchingImage, message: samplePost?.content || schedule.description };
  }, [schedule, allImages, bundles]);

  const handleCopy = async () => {
    const msg = isEditing ? editedMessage : suggestion?.message;
    if (msg) {
      await navigator.clipboard.writeText(msg);
      toast({ title: "Copied!", description: "Message copied to clipboard" });
    }
  };

  const handleDownload = async () => {
    const imgId = selectedImageId || suggestion?.image?.id;
    const img = allImages.find(i => i.id === imgId);
    if (img) {
      try {
        const { downloadFileAsset } = await import("@/lib/download-utils");
        await downloadFileAsset(img.src, `happy-eats-${format(today, 'yyyy-MM-dd')}.png`);
        toast({ title: "Downloaded!", description: "Image saved" });
      } catch {
        window.open(img.src, "_blank");
      }
    }
  };

  const handleShareImage = async () => {
    const imgId = selectedImageId || suggestion?.image?.id;
    const img = allImages.find(i => i.id === imgId);
    if (img) {
      try {
        const { shareFileAsset } = await import("@/lib/download-utils");
        await shareFileAsset(img.src, `happy-eats-${format(today, 'yyyy-MM-dd')}.png`);
      } catch {
        window.open(img.src, "_blank");
      }
    }
  };

  const handleEmailImage = async () => {
    const imgId = selectedImageId || suggestion?.image?.id;
    const img = allImages.find(i => i.id === imgId);
    if (img) {
      try {
        const { emailFileAsset } = await import("@/lib/download-utils");
        await emailFileAsset(img.src, `happy-eats-${format(today, 'yyyy-MM-dd')}.png`, "Happy Eats Marketing Image");
      } catch {
        window.open(img.src, "_blank");
      }
    }
  };

  const handleStartEdit = () => {
    setEditedMessage(suggestion?.message || "");
    setSelectedImageId(suggestion?.image?.id || null);
    setIsEditing(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-bl-full" />
      
      <div className="relative p-4 md:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Today's Suggested Post
                <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/30 text-orange-300">
                  {schedule.rotation === 'planning' ? 'Plan Day' : `Rotation ${schedule.rotation}`}
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">{schedule.label}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {schedule.rotation !== 'planning' && !isEditing && (
              <Button variant="ghost" size="icon" className="h-11 w-11" onClick={handleStartEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="min-h-[44px]" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
        
        {schedule.rotation === 'planning' ? (
          <div className="bg-white/5 rounded-lg p-4 border border-white/20">
            <p className="text-sm mb-3"><strong>Sunday Planning Day</strong> - Review this week's performance and prepare next week's content.</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-500/10 rounded-lg p-2 text-center">
                <p className="font-medium text-orange-300">MWF Posts</p>
                <p className="text-muted-foreground">Food & Delivery</p>
              </div>
              <div className="bg-rose-500/10 rounded-lg p-2 text-center">
                <p className="font-medium text-rose-300">TThSat Posts</p>
                <p className="text-muted-foreground">Community & Local</p>
              </div>
            </div>
          </div>
        ) : suggestion ? (
          <div className="space-y-3">
            <div className="flex gap-4">
              {(selectedImageId || suggestion.image) && (
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 border border-white/20">
                    <img 
                      src={allImages.find(i => i.id === (selectedImageId || suggestion.image?.id))?.src} 
                      alt="Suggested" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => {
                        const currentIdx = allImages.findIndex(i => i.id === selectedImageId);
                        const nextIdx = (currentIdx + 1) % allImages.length;
                        setSelectedImageId(allImages[nextIdx].id);
                      }}
                      className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Textarea
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className="text-sm min-h-[60px] bg-white/5 border-white/20"
                    placeholder="Edit your message..."
                  />
                ) : (
                  <p className="text-sm mb-2 line-clamp-2">{suggestion.message}</p>
                )}
                {!isEditing && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {suggestion.image && (
                      <Badge variant="secondary" className="text-xs capitalize">{suggestion.image.category}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      <Instagram className="w-3 h-3 mr-1" /> Best for Instagram
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
        
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <h4 className="text-sm font-medium mb-2">This Week's Schedule</h4>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div 
                  key={i} 
                  className={`py-1.5 rounded text-xs ${
                    i === dayOfWeek 
                      ? 'bg-orange-500 text-white font-bold' 
                      : WEEKLY_SCHEDULE[i as keyof typeof WEEKLY_SCHEDULE].rotation === 'A'
                        ? 'bg-orange-500/20 text-orange-300'
                        : WEEKLY_SCHEDULE[i as keyof typeof WEEKLY_SCHEDULE].rotation === 'B'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-white/10 text-white/50'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> MWF: Food Focus</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> TThSat: Community</span>
            </div>
          </motion.div>
        )}
        
        {schedule.rotation !== 'planning' && (
          <div className="flex gap-2 mt-4">
            {isEditing ? (
              <>
                <Button size="sm" onClick={() => { setIsEditing(false); toast({ title: "Saved!" }); }} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 min-h-[44px]">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 min-h-[44px]">
                  <XIcon className="w-3.5 h-3.5 mr-1.5" /> Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleCopy} className="flex-1 bg-gradient-to-r from-orange-500 to-rose-600 min-h-[44px]">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 min-h-[44px]">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleShareImage} className="min-h-[44px]">
                  <Share2 className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleEmailImage} className="min-h-[44px]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ContentCalendar({ posts, allImages }: { posts: MarketingPost[], allImages: LibraryImage[] }) {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  const getPostsForDay = (date: Date) => {
    return posts.filter(p => {
      const postDate = new Date(p.createdAt);
      return isSameDay(postDate, date);
    });
  };

  return (
    <GlassCard className="p-3 md:p-4">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-orange-500" /> <span className="hidden sm:inline">Content</span> Calendar
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 md:px-3 min-h-[44px]" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</p>
      
      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 scrollbar-none">
      <div className="grid grid-cols-7 gap-1 min-w-[500px] md:min-w-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">{day}</div>
        ))}
        {weekDays.map((day, i) => {
          const dayPosts = getPostsForDay(day);
          const isToday = isSameDay(day, new Date());
          const schedule = WEEKLY_SCHEDULE[day.getDay() as keyof typeof WEEKLY_SCHEDULE];
          return (
            <div 
              key={i} 
              className={`min-h-[80px] border rounded-lg p-1.5 transition-all hover:border-orange-400/50 ${
                isToday ? 'border-orange-500 bg-orange-500/10' : 'border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isToday ? 'text-orange-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                <Badge variant="outline" className={`text-[10px] px-1 py-0 ${
                  schedule.rotation === 'A' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  schedule.rotation === 'B' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-white/10 text-white/60'
                }`}>
                  {schedule.rotation}
                </Badge>
              </div>
              {dayPosts.length > 0 ? (
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post, j) => (
                    <div key={j} className="text-[10px] bg-orange-500/20 text-orange-300 rounded px-1 py-0.5 truncate flex items-center gap-1">
                      <Facebook className="h-2.5 w-2.5 flex-shrink-0" />
                      {post.content.slice(0, 15)}...
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">+{dayPosts.length - 2} more</div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground italic">{schedule.description}</div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </GlassCard>
  );
}

function AnalyticsDashboard({ posts }: { posts: MarketingPost[] }) {
  const stats = useMemo(() => ({
    postsThisWeek: posts.filter(p => {
      const d = new Date(p.createdAt);
      return d >= subDays(new Date(), 7);
    }).length,
    totalPosts: posts.length,
    activePosts: posts.filter(p => p.isActive).length,
    totalUsage: posts.reduce((sum, p) => sum + p.usageCount, 0),
  }), [posts]);

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      <GlassCard className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-orange-400 mb-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="text-[10px] sm:text-xs text-white/50">Posts This Week</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white">{stats.postsThisWeek}</p>
      </GlassCard>
      <GlassCard className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-blue-400 mb-1">
          <LayoutGrid className="h-3.5 w-3.5" />
          <span className="text-[10px] sm:text-xs text-white/50">Library Size</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalPosts}</p>
      </GlassCard>
      <GlassCard className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="text-[10px] sm:text-xs text-white/50">Active Posts</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white">{stats.activePosts}</p>
      </GlassCard>
      <GlassCard className="p-3 sm:p-4">
        <div className="flex items-center gap-1.5 text-violet-400 mb-1">
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="text-[10px] sm:text-xs text-white/50">Total Usage</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsage}x</p>
      </GlassCard>
    </div>
  );
}

function TeamNotesSection({ notes, onAddNote, onDeleteNote }: { 
  notes: TeamNote[], 
  onAddNote: (content: string) => void,
  onDeleteNote: (id: string) => void 
}) {
  const [newNote, setNewNote] = useState("");

  const handleAdd = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote("");
    }
  };

  return (
    <GlassCard className="p-3 md:p-4">
      <h3 className="text-base md:text-lg font-semibold flex items-center gap-2 mb-3 md:mb-4">
        <StickyNote className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" /> Team Notes
      </h3>
      
      <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Leave a message for the team!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className={`p-3 rounded-lg border ${note.pinned ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.author} • {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteNote(note.id)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Leave a note for the team..."
          className="min-h-[60px] resize-none"
        />
        <Button onClick={handleAdd} className="bg-gradient-to-r from-yellow-500 to-orange-500">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  );
}

function ContentBundlesSection({ 
  bundles, 
  allImages, 
  onCreateBundle,
  onDeleteBundle,
  onUpdateMetrics
}: { 
  bundles: ContentBundle[], 
  allImages: LibraryImage[],
  onCreateBundle: (bundle: Omit<ContentBundle, 'id' | 'usageCount'>) => void,
  onDeleteBundle: (id: string) => void,
  onUpdateMetrics: (id: string, metrics: ContentBundle['metrics']) => void
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [message, setMessage] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [category, setCategory] = useState("food-truck");
  const [editingMetrics, setEditingMetrics] = useState<string | null>(null);
  const [metricsForm, setMetricsForm] = useState({
    impressions: 0, reach: 0, clicks: 0, likes: 0, comments: 0, shares: 0, saves: 0
  });
  const { toast } = useToast();

  const handleCreate = () => {
    if (!selectedImage || !message.trim()) {
      toast({ title: "Please select an image and enter a message", variant: "destructive" });
      return;
    }
    onCreateBundle({
      imageId: selectedImage,
      message,
      hashtags: hashtags.split(" ").filter(h => h.startsWith("#")),
      platform,
      category
    });
    setShowCreate(false);
    setSelectedImage("");
    setMessage("");
    setHashtags("");
    toast({ title: "Bundle created!" });
  };

  const startEditMetrics = (bundle: ContentBundle) => {
    setEditingMetrics(bundle.id);
    setMetricsForm(bundle.metrics || { impressions: 0, reach: 0, clicks: 0, likes: 0, comments: 0, shares: 0, saves: 0 });
  };

  const saveMetrics = () => {
    if (editingMetrics) {
      onUpdateMetrics(editingMetrics, metricsForm);
      setEditingMetrics(null);
      toast({ title: "Metrics saved!" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Layers className="h-5 w-5 text-purple-500" /> Content Bundles
        </h3>
        <Button onClick={() => setShowCreate(true)} size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="h-4 w-4 mr-1" /> Create Bundle
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Bundles pair an image with a message so they always post together. Track performance metrics for each bundle.
      </p>

      {bundles.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No bundles yet. Create your first image + message bundle!</p>
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {bundles.map(bundle => {
            const img = allImages.find(i => i.id === bundle.imageId);
            return (
              <GlassCard key={bundle.id} className="p-4">
                <div className="flex gap-3">
                  {img && (
                    <img src={img.src} alt={img.label} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{bundle.message}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">{bundle.platform}</Badge>
                      <Badge variant="secondary" className="text-xs">{bundle.category}</Badge>
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-2.5 w-2.5 mr-1" /> {bundle.usageCount}x
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {bundle.metrics && (
                  <div className="space-y-2 mt-3 pt-3 border-t">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Impr.</p>
                        <p className="text-sm font-semibold">{bundle.metrics.impressions.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Reach</p>
                        <p className="text-sm font-semibold">{bundle.metrics.reach.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="text-sm font-semibold">{bundle.metrics.clicks}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Likes</p>
                        <p className="text-sm font-semibold">{bundle.metrics.likes}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Comments</p>
                        <p className="text-sm font-semibold">{bundle.metrics.comments}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Shares</p>
                        <p className="text-sm font-semibold">{bundle.metrics.shares}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Saves</p>
                        <p className="text-sm font-semibold">{bundle.metrics.saves}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => startEditMetrics(bundle)}>
                    <BarChart3 className="h-3.5 w-3.5 mr-1" /> Metrics
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDeleteBundle(bundle.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Content Bundle</DialogTitle>
            <DialogDescription>Pair an image with a message for consistent posting</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Select Image</Label>
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-[200px] overflow-y-auto">
                {allImages.map(img => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img.id ? 'border-purple-500' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img.src} alt={img.label} className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your post message..."
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <Label>Hashtags</Label>
                <Input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#HappyEats #Nashville"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-500 to-pink-500">
              Create Bundle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMetrics} onOpenChange={() => setEditingMetrics(null)}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle>Update Metrics</DialogTitle>
            <DialogDescription>Enter the performance metrics for this post</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(metricsForm).map(([key, value]) => (
              <div key={key}>
                <Label className="capitalize">{key}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setMetricsForm(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMetrics(null)}>Cancel</Button>
            <Button onClick={saveMetrics}>Save Metrics</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AIGeneratorSection({ onGenerate }: { onGenerate: (content: string) => void }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    
    try {
      const res = await fetch("/api/marketing/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tenantId: "happyeats" })
      });
      const data = await res.json();
      if (data.content) {
        setGeneratedContent(data.content);
      } else {
        const fallback = `${prompt}\n\nBringing Nashville's best food trucks to you! Order now on Happy Eats and taste the difference local makes. 🚚✨ #HappyEats #NashvilleEats #FoodTrucks`;
        setGeneratedContent(fallback);
      }
    } catch {
      const fallback = `Fresh from Nashville's favorite food trucks! ${prompt.includes('taco') ? 'Tacos that hit different.' : 'Good food on the go.'} Order now on Happy Eats! 🚚 #HappyEats #Nashville`;
      setGeneratedContent(fallback);
    }
    
    setIsGenerating(false);
  };

  const handleUse = () => {
    if (generatedContent) {
      onGenerate(generatedContent);
      setGeneratedContent(null);
      setPrompt("");
      toast({ title: "Content added to composer!" });
    }
  };

  return (
    <GlassCard className="p-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Wand2 className="h-5 w-5 text-indigo-500" /> AI Content Generator
      </h3>
      
      <div className="space-y-4">
        <div>
          <Label>Describe what you want to post about</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write a fun post about our new Korean BBQ food truck..."
            className="min-h-[80px]"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <p className="text-xs text-muted-foreground w-full mb-1">Quick prompts:</p>
          {AI_PROMPTS.slice(0, 3).map((p, i) => (
            <Button key={i} variant="outline" size="sm" onClick={() => setPrompt(p)} className="text-xs">
              {p.slice(0, 30)}...
            </Button>
          ))}
        </div>
        
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" /> Generate Content
            </>
          )}
        </Button>
        
        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-lg border border-indigo-500/30"
          >
            <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleUse} className="flex-1">
                <ArrowRight className="h-4 w-4 mr-1" /> Use This
              </Button>
              <Button size="sm" variant="outline" onClick={handleGenerate}>
                <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
}

class MarketingErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[MarketingHub] Crash:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center space-y-4">
          <div className="text-orange-500 text-xl font-bold">Marketing Hub</div>
          <p className="text-white/60">Something went wrong loading this section.</p>
          <p className="text-xs text-red-400/80 font-mono bg-red-500/10 p-3 rounded-lg max-w-lg mx-auto break-all">{this.state.error?.message}</p>
          <Button onClick={() => { this.setState({ hasError: false, error: null }); }} className="bg-orange-500">
            Try Again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MarketingHubInner() {
  const { toast } = useToast();
  const { user } = useAuth();
  const urlTab = new URLSearchParams(window.location.search).get("tab");
  const validTabs = ["dashboard", "compose", "bundles", "library", "images", "brand", "print", "calendar", "notes", "connections"];
  const [activeTab, setActiveTab] = useState(urlTab && validTabs.includes(urlTab) ? urlTab : "dashboard");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [postContent, setPostContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [hashtags, setHashtags] = useState("");
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showQuickPost, setShowQuickPost] = useState(false);
  const tenantId = "happyeats";

  const [bundles, setBundles] = useState<ContentBundle[]>(() => {
    try {
      const saved = localStorage.getItem("happyeats_bundles");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [teamNotes, setTeamNotes] = useState<TeamNote[]>(() => {
    try {
      const saved = localStorage.getItem("happyeats_notes");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("happyeats_bundles", JSON.stringify(bundles));
  }, [bundles]);

  useEffect(() => {
    localStorage.setItem("happyeats_notes", JSON.stringify(teamNotes));
  }, [teamNotes]);

  const { data: posts = [] } = useQuery<MarketingPost[]>({
    queryKey: ["/api/marketing/posts", tenantId],
    queryFn: () => fetch(`/api/marketing/posts?tenantId=${tenantId}`).then(r => r.json()),
  });

  const { data: integration } = useQuery<IntegrationStatus>({
    queryKey: ["/api/marketing/integration", tenantId],
    queryFn: () => fetch(`/api/marketing/integration?tenantId=${tenantId}`).then(r => r.json()),
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      toast({ title: "Post saved to library!" });
      setPostContent("");
      setHashtags("");
      setSelectedImage(null);
      setShowQuickPost(false);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/marketing/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const postNowMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/post-now", data);
      return res.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "Posted!", description: `Post ID: ${result.externalId}` });
        setShowQuickPost(false);
        setPostContent("");
        setHashtags("");
      } else {
        toast({ title: "Post failed", description: result.error, variant: "destructive" });
      }
    },
  });

  const handleSaveToLibrary = () => {
    if (!postContent.trim()) {
      toast({ title: "Please enter post content", variant: "destructive" });
      return;
    }
    createPostMutation.mutate({
      tenantId,
      content: postContent,
      platform: selectedPlatform,
      hashtags: hashtags.split(" ").filter(h => h.startsWith("#")),
      imageFilename: selectedImage,
    });
  };

  const handlePostNow = () => {
    if (!postContent.trim()) {
      toast({ title: "Please enter post content", variant: "destructive" });
      return;
    }
    postNowMutation.mutate({
      tenantId,
      content: postContent + (hashtags ? `\n\n${hashtags}` : ""),
      platform: selectedPlatform,
    });
  };

  const handleCreateBundle = (bundle: Omit<ContentBundle, 'id' | 'usageCount'>) => {
    const newBundle: ContentBundle = {
      ...bundle,
      id: `bundle-${Date.now()}`,
      usageCount: 0
    };
    setBundles(prev => [...prev, newBundle]);
  };

  const handleDeleteBundle = (id: string) => {
    setBundles(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateBundleMetrics = (id: string, metrics: ContentBundle['metrics']) => {
    setBundles(prev => prev.map(b => b.id === id ? { ...b, metrics } : b));
  };

  const handleAddNote = (content: string) => {
    const note: TeamNote = {
      id: `note-${Date.now()}`,
      author: "Kathy",
      content,
      createdAt: new Date().toISOString()
    };
    setTeamNotes(prev => [note, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setTeamNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleAIGenerate = (content: string) => {
    setPostContent(content);
    setActiveTab("compose");
  };

  const filteredImages = selectedCategory === "all" 
    ? LIBRARY_IMAGES 
    : LIBRARY_IMAGES.filter(img => img.category === selectedCategory);

  const selectedImageData = selectedImage ? LIBRARY_IMAGES.find(i => i.id === selectedImage) : null;
  const selectedPlatformData = PLATFORMS.find(p => p.id === selectedPlatform);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <Megaphone className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
            Marketing Hub
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Create, schedule, and track social media content</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => setShowQuickPost(true)} className="bg-gradient-to-r from-orange-500 to-rose-500 min-h-[44px]">
            <Zap className="h-4 w-4 mr-2" /> Quick Post
          </Button>
          {integration?.facebookConnected && (
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Facebook className="h-3 w-3 mr-1" /> Connected
            </Badge>
          )}
          {integration?.instagramConnected && (
            <Badge variant="outline" className="bg-pink-500/20 text-pink-400 border-pink-500/30">
              <Instagram className="h-3 w-3 mr-1" /> Connected
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <a
          href="/media-editor"
          className="group relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-fuchsia-500/10 p-4 hover:border-cyan-400/50 transition-all cursor-pointer block no-underline"
          data-testid="link-media-editor"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/10 group-hover:from-cyan-500/15 group-hover:to-purple-500/20 transition-all" />
          <div className="relative">
            <div className="size-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mb-2.5 shadow-lg shadow-cyan-500/20">
              <Palette className="size-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Media Editor</h3>
            <p className="text-[10px] text-white/50 mt-0.5 leading-tight">TrustVault media & flyers</p>
          </div>
        </a>
        <a
          href="/ai-flyer"
          className="group relative overflow-hidden rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 via-rose-500/10 to-pink-500/10 p-4 hover:border-orange-400/50 transition-all cursor-pointer block no-underline"
          data-testid="link-ai-flyer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-rose-500/10 group-hover:from-orange-500/15 group-hover:to-rose-500/20 transition-all" />
          <div className="relative">
            <div className="size-10 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mb-2.5 shadow-lg shadow-orange-500/20">
              <Wand2 className="size-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Create Flyer</h3>
            <p className="text-[10px] text-white/50 mt-0.5 leading-tight">AI-powered flyer builder</p>
          </div>
        </a>
        <a
          href="/flyer"
          className="group relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-4 hover:border-emerald-400/50 transition-all cursor-pointer block no-underline"
          data-testid="link-flyer-templates"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/10 group-hover:from-emerald-500/15 group-hover:to-teal-500/20 transition-all" />
          <div className="relative">
            <div className="size-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-2.5 shadow-lg shadow-emerald-500/20">
              <FileText className="size-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Flyer Templates</h3>
            <p className="text-[10px] text-white/50 mt-0.5 leading-tight">Ready-made designs</p>
          </div>
        </a>
        <a
          href="/flyer-catalog"
          className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 p-4 hover:border-amber-400/50 transition-all cursor-pointer block no-underline"
          data-testid="link-flyer-catalog"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/10 group-hover:from-amber-500/15 group-hover:to-orange-500/20 transition-all" />
          <div className="relative">
            <div className="size-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2.5 shadow-lg shadow-amber-500/20">
              <BookOpen className="size-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Flyer Catalog</h3>
            <p className="text-[10px] text-white/50 mt-0.5 leading-tight">Pre-made flyers EN/ES</p>
          </div>
        </a>
        <button
          onClick={() => setActiveTab("print")}
          className="group relative overflow-hidden rounded-xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 via-pink-500/10 to-rose-500/10 p-4 hover:border-fuchsia-400/50 transition-all cursor-pointer text-left"
          data-testid="link-print-studio"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-pink-500/10 group-hover:from-fuchsia-500/15 group-hover:to-pink-500/20 transition-all" />
          <div className="relative">
            <div className="size-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center mb-2.5 shadow-lg shadow-fuchsia-500/20">
              <Printer className="size-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white">Print Studio</h3>
            <p className="text-[10px] text-white/50 mt-0.5 leading-tight">Business cards & more</p>
          </div>
        </button>
      </div>

      <div className="flex items-center justify-end mb-2">
        <PageLanguageToggle />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 pb-2 scrollbar-none">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-10 md:max-w-5xl gap-1 min-h-[44px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <BarChart3 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Dashboard</span><span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="compose" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Compose</span><span className="sm:hidden">New</span>
            </TabsTrigger>
            <TabsTrigger value="bundles" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <Layers className="h-3.5 w-3.5" /> Bundles
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <LayoutGrid className="h-3.5 w-3.5" /> Library
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <Camera className="h-3.5 w-3.5" /> Images
            </TabsTrigger>
            <TabsTrigger value="brand" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]" data-testid="tab-brand">
              <Palette className="h-3.5 w-3.5" /> Brand
            </TabsTrigger>
            <TabsTrigger value="print" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]" data-testid="tab-print">
              <Printer className="h-3.5 w-3.5" /> Print
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <Calendar className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Calendar</span><span className="sm:hidden">Cal</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]">
              <StickyNote className="h-3.5 w-3.5" /> Notes
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-1 text-xs whitespace-nowrap px-2 min-h-[44px]" data-testid="tab-connections">
              <LinkIcon className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Connect</span><span className="sm:hidden">⚙</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <TodaysSuggestedPost allImages={LIBRARY_IMAGES} bundles={bundles} />
          <AnalyticsDashboard posts={posts} />
          <MarketingErrorBoundary>
            <SiteAnalyticsDashboard tenantId={user?.id} />
          </MarketingErrorBoundary>
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <ContentCalendar posts={posts} allImages={LIBRARY_IMAGES} />
            <AIGeneratorSection onGenerate={handleAIGenerate} />
          </div>
        </TabsContent>

        <TabsContent value="compose" className="space-y-4 md:space-y-6 mt-4 md:mt-6">
          <PostComposer 
            tenantId={tenantId} 
            libraryImages={LIBRARY_IMAGES}
            onPostCreated={() => queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] })}
          />
        </TabsContent>

        <TabsContent value="bundles" className="mt-6">
          <ContentBundlesSection 
            bundles={bundles} 
            allImages={LIBRARY_IMAGES}
            onCreateBundle={handleCreateBundle}
            onDeleteBundle={handleDeleteBundle}
            onUpdateMetrics={handleUpdateBundleMetrics}
          />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <LayoutGrid className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No posts in your library yet</p>
                <p className="text-sm text-muted-foreground">Create posts in the Compose tab to build your content library</p>
                <Button className="mt-4" onClick={() => setActiveTab("compose")}>
                  <Plus className="h-4 w-4 mr-2" /> Create First Post
                </Button>
              </GlassCard>
            ) : (
              posts.map((post) => (
                <GlassCard key={post.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" /> Used {post.usageCount}x
                        </span>
                        {post.isActive && (
                          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm">{post.content}</p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <p className="text-sm text-blue-500 mt-1">{post.hashtags.join(" ")}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setPostContent(post.content);
                        setSelectedPlatform(post.platform);
                        setHashtags(post.hashtags?.join(" ") || "");
                        setActiveTab("compose");
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePostMutation.mutate(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-4 md:mt-6">
          <div className="space-y-4">
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
              <div className="flex gap-2 min-w-max">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap min-h-[44px]"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredImages.map((img) => (
                <GlassCard 
                  key={img.id} 
                  className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-orange-500 ${
                    selectedImage === img.id ? "ring-2 ring-orange-500" : ""
                  }`}
                  onClick={() => setSelectedImage(img.id)}
                >
                  <img 
                    src={img.src} 
                    alt={img.label}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{img.label}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{img.category}</Badge>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <ContentCalendar posts={posts} allImages={LIBRARY_IMAGES} />
        </TabsContent>

        <TabsContent value="brand" className="mt-6" data-testid="content-brand">
          <BrandAssetsTab />
        </TabsContent>

        <TabsContent value="print" className="mt-6" data-testid="content-print">
          <PrintStudioTab />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <TeamNotesSection 
            notes={teamNotes} 
            onAddNote={handleAddNote} 
            onDeleteNote={handleDeleteNote} 
          />
        </TabsContent>

        <TabsContent value="connections" className="mt-6" data-testid="content-connections">
          <ConnectionsTab tenantId={tenantId} />
        </TabsContent>

      </Tabs>

      <Dialog open={showImagePicker} onOpenChange={setShowImagePicker}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select an Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="overflow-x-auto -mx-2 px-2 pb-2">
              <div className="flex gap-2 min-w-max">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap text-xs"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
              {filteredImages.map((img) => (
                <div
                  key={img.id}
                  className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img.id ? "border-orange-500" : "border-transparent"
                  }`}
                  onClick={() => {
                    setSelectedImage(img.id);
                    setShowImagePicker(false);
                  }}
                >
                  <img 
                    src={img.src} 
                    alt={img.label}
                    className="w-full aspect-square object-cover"
                  />
                  <p className="text-xs p-1 text-center truncate">{img.label}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImagePicker(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuickPost} onOpenChange={setShowQuickPost}>
        <DialogContent className="w-[95vw] max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" /> Quick Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <p.icon className="h-4 w-4" /> {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's happening with Happy Eats today?"
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label>Image (optional)</Label>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setShowQuickPost(false);
                  setShowImagePicker(true);
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {selectedImageData ? selectedImageData.label : "Select an image"}
              </Button>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowQuickPost(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveToLibrary} variant="outline">
              Save Draft
            </Button>
            <Button 
              onClick={handlePostNow} 
              className="bg-gradient-to-r from-orange-500 to-rose-500"
              disabled={postNowMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" /> Post Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function MarketingHub() {
  return (
    <PageLanguageProvider>
      <MarketingErrorBoundary>
        <MarketingHubInner />
      </MarketingErrorBoundary>
    </PageLanguageProvider>
  );
}
