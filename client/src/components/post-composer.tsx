import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ImageIcon, Wand2, Upload, X, Loader2, CheckCircle,
  Send, Clock, DollarSign, Hash, ChevronRight, ArrowLeft,
  Camera, FileText, Zap, Eye, Plus, Trash2, Target, Users,
  Play, BarChart3, Calendar, RefreshCw
} from "lucide-react";
import { PLATFORM_REGISTRY, type ConnectedPlatform } from "./connections-tab";

// ═══════════════════════════════════════════════════════════════
// POST COMPOSER — Step-by-step post creation
// ═══════════════════════════════════════════════════════════════

interface PostComposerProps {
  tenantId: string;
  libraryImages: { id: string; src: string; category: string; label: string }[];
  onPostCreated?: () => void;
}

type ComposerStep = "image" | "message" | "publish";
type AIMode = "message" | "image" | "both";
type Tone = "casual" | "professional" | "fun" | "promotional" | "inspiring";

const TONES: { id: Tone; label: string; emoji: string }[] = [
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "fun", label: "Fun & Playful", emoji: "🎉" },
  { id: "promotional", label: "Promotional", emoji: "🔥" },
  { id: "inspiring", label: "Inspiring", emoji: "✨" },
];

function GlassCard({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={`bg-[#1e293b]/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i < current ? "bg-emerald-500 text-white" :
            i === current ? "bg-gradient-to-r from-orange-500 to-rose-600 text-white ring-2 ring-orange-400/50 shadow-lg shadow-orange-500/30" :
            "bg-white/10 text-white/40"
          }`}>
            {i < current ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:inline ${i === current ? "text-white" : "text-white/40"}`}>{step}</span>
          {i < steps.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-white/20" />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DRAG & DROP IMAGE ZONE
// ═══════════════════════════════════════════════════════════════

function ImageDropZone({
  imagePreview,
  onImageSelect,
  onImageRemove,
  libraryImages,
  onAIGenerate,
  isGenerating,
}: {
  imagePreview: string | null;
  onImageSelect: (dataUrl: string) => void;
  onImageRemove: () => void;
  libraryImages: { id: string; src: string; category: string; label: string }[];
  onAIGenerate: () => void;
  isGenerating: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      return; // silently skip >5MB
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        onImageSelect(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (imagePreview) {
    return (
      <div className="relative group">
        <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
          <img src={imagePreview} alt="Selected" className="w-full max-h-[300px] object-contain bg-black/50" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/70" onClick={() => fileInputRef.current?.click()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onImageRemove}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-8 text-center ${
          isDragging
            ? "border-orange-500 bg-orange-500/20 scale-[1.02] shadow-xl shadow-orange-500/20"
            : "border-white/20 hover:border-orange-400/50 hover:bg-white/5"
        }`}
      >
        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div key="drag" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <Upload className="h-12 w-12 mx-auto mb-3 text-orange-500 animate-bounce" />
              <p className="text-orange-400 font-medium">Drop your image here!</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 flex items-center justify-center">
                <Camera className="h-7 w-7 text-orange-400" />
              </div>
              <p className="text-white font-medium mb-1">Drag & drop an image</p>
              <p className="text-xs text-white/40">or click to browse · PNG, JPG up to 5MB</p>
            </motion.div>
          )}
        </AnimatePresence>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5 text-xs border-white/10 hover:bg-white/5"
          onClick={() => setShowLibrary(true)}
        >
          <ImageIcon className="h-4 w-4 text-blue-400" />
          <span>Library</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5 text-xs border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30"
          onClick={onAIGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-purple-400" /> : <Wand2 className="h-4 w-4 text-purple-400" />}
          <span>AI Image</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-3 flex-col gap-1.5 text-xs border-white/10 hover:bg-white/5"
          onClick={() => {/* skip image */}}
        >
          <FileText className="h-4 w-4 text-white/40" />
          <span>Text Only</span>
        </Button>
      </div>

      {/* Library Modal */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Library</DialogTitle>
            <DialogDescription>Select an image from your marketing library</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {libraryImages.map(img => (
              <button
                key={img.id}
                onClick={() => {
                  // Use the src directly since it's an imported asset
                  onImageSelect(img.src);
                  setShowLibrary(false);
                }}
                className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all"
              >
                <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                  <span className="text-[10px] text-white font-medium truncate">{img.label}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOOST DIALOG
// ═══════════════════════════════════════════════════════════════

function BoostDialog({
  open,
  onOpenChange,
  postContent,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  tenantId: string;
}) {
  const { toast } = useToast();
  const [budget, setBudget] = useState("10");
  const [duration, setDuration] = useState("3");
  const [audience, setAudience] = useState("auto");

  const budgetPresets = [
    { value: "5", label: "$5" },
    { value: "10", label: "$10" },
    { value: "25", label: "$25" },
    { value: "50", label: "$50" },
    { value: "100", label: "$100" },
  ];

  const durationOptions = [
    { value: "1", label: "1 Day" },
    { value: "3", label: "3 Days" },
    { value: "7", label: "7 Days" },
    { value: "14", label: "14 Days" },
  ];

  const boostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/boost", data);
      return res.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "🚀 Post Boosted!", description: `Campaign ID: ${result.campaignId}` });
        onOpenChange(false);
      } else {
        toast({ title: "Boost failed", description: result.error, variant: "destructive" });
      }
    },
  });

  const estimatedReach = Math.round(parseInt(budget) * 150 * parseInt(duration) * 0.7);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" /> Boost as Paid Ad
          </DialogTitle>
          <DialogDescription>Turn this post into a Meta ad campaign</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-xs text-white/60 line-clamp-2">{postContent}</p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label className="text-sm">Daily Budget</Label>
            <div className="flex gap-1.5">
              {budgetPresets.map(p => (
                <Button
                  key={p.value}
                  variant={budget === p.value ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 min-h-[40px] ${budget === p.value ? "bg-emerald-600" : ""}`}
                  onClick={() => setBudget(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/40">Custom:</span>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-24 h-8 text-xs bg-white/5 border-white/10"
                min="1"
              />
              <span className="text-xs text-white/40">/ day</span>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm">Duration</Label>
            <div className="flex gap-1.5">
              {durationOptions.map(d => (
                <Button
                  key={d.value}
                  variant={duration === d.value ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 min-h-[40px] ${duration === d.value ? "bg-blue-600" : ""}`}
                  onClick={() => setDuration(d.value)}
                >
                  {d.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label className="text-sm">Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">🎯 Auto (Recommended)</SelectItem>
                <SelectItem value="local">📍 Local Area (25 mi)</SelectItem>
                <SelectItem value="state">🗺️ State-wide</SelectItem>
                <SelectItem value="national">🌎 National</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Results */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-lg p-3">
            <p className="text-xs font-medium text-emerald-400 mb-2">Estimated Results</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-white">{estimatedReach.toLocaleString()}</p>
                <p className="text-[10px] text-white/40">People Reached</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">${parseInt(budget) * parseInt(duration)}</p>
                <p className="text-[10px] text-white/40">Total Spend</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{parseInt(duration)}d</p>
                <p className="text-[10px] text-white/40">Duration</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => boostMutation.mutate({ tenantId, content: postContent, budget: parseInt(budget), duration: parseInt(duration), audience })}
            disabled={boostMutation.isPending}
            className="bg-gradient-to-r from-emerald-600 to-teal-600"
          >
            {boostMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            Launch Campaign (${parseInt(budget) * parseInt(duration)})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN POST COMPOSER
// ═══════════════════════════════════════════════════════════════

export default function PostComposer({ tenantId, libraryImages, onPostCreated }: PostComposerProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<ComposerStep>("image");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);
  const [tone, setTone] = useState<Tone>("casual");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiMode, setAiMode] = useState<AIMode>("message");
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");

  // Get connected platforms
  const { data: integration } = useQuery<any>({
    queryKey: ["/api/marketing/integration", tenantId],
    queryFn: () => fetch(`/api/marketing/integration?tenantId=${tenantId}`).then(r => r.json()),
  });

  const connectedPlatforms: ConnectedPlatform[] = (() => {
    if (!integration) return [];
    if (integration.platforms) {
      try { return JSON.parse(integration.platforms); } catch { return []; }
    }
    // Legacy
    const result: ConnectedPlatform[] = [];
    if (integration.facebookConnected) result.push({ platformId: "facebook", enabled: true, credentials: {} });
    if (integration.instagramConnected) result.push({ platformId: "instagram", enabled: true, credentials: {} });
    if (integration.twitterConnected) result.push({ platformId: "x", enabled: true, credentials: {} });
    return result;
  })();

  const activePlatforms = connectedPlatforms.filter(p => p.enabled);

  // AI Generation — Message
  const generateMessage = async () => {
    setIsGeneratingMessage(true);
    try {
      const res = await apiRequest("POST", "/api/marketing/ai-generate", {
        tenantId,
        tone,
        platform: selectedPlatforms[0] || "facebook",
        prompt: aiPrompt || undefined,
        imageCategory: imagePreview ? "food" : undefined,
      });
      const data = await res.json();
      if (data.message) {
        setMessage(data.message);
        if (data.hashtags) setHashtags(data.hashtags);
        toast({ title: "✨ AI generated your post!" });
      }
    } catch (e) {
      toast({ title: "AI generation failed", variant: "destructive" });
    }
    setIsGeneratingMessage(false);
  };

  // AI Generation — Image
  const generateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await apiRequest("POST", "/api/marketing/ai-image", {
        tenantId,
        prompt: aiPrompt || "Professional food truck marketing image, appetizing food photography, Nashville style",
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImagePreview(data.imageUrl);
        toast({ title: "🎨 AI generated your image!" });
      }
    } catch (e) {
      toast({ title: "Image generation failed", variant: "destructive" });
    }
    setIsGeneratingImage(false);
  };

  // AI Both
  const generateBoth = async () => {
    toast({ title: "🤖 Generating image and message...", description: "This may take a moment" });
    await generateImage();
    await generateMessage();
  };

  // Add hashtag
  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#*/, "");
    if (tag && !hashtags.includes(`#${tag}`)) {
      setHashtags([...hashtags, `#${tag}`]);
      setHashtagInput("");
    }
  };

  // Post mutations
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/posts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing/posts"] });
      toast({ title: "📝 Added to content library!" });
      resetComposer();
      onPostCreated?.();
    },
  });

  const postNowMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/post-now", data);
      return res.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({ title: "🚀 Posted!", description: `Post ID: ${result.externalId}` });
        resetComposer();
        onPostCreated?.();
      } else {
        toast({ title: "Post failed", description: result.error, variant: "destructive" });
      }
    },
  });

  const schedulePostMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/marketing/scheduled", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "📅 Scheduled!", description: `Post will go out at ${new Date(scheduledFor).toLocaleString()}` });
      resetComposer();
      onPostCreated?.();
    },
  });

  const resetComposer = () => {
    setStep("image");
    setImagePreview(null);
    setMessage("");
    setHashtags([]);
    setAiPrompt("");
    setScheduledFor("");
  };

  const fullMessage = [message, ...hashtags].join("\n");
  const stepIndex = step === "image" ? 0 : step === "message" ? 1 : 2;

  return (
    <div className="space-y-4">
      <StepIndicator current={stepIndex} steps={["Image", "Message", "Publish"]} />

      <AnimatePresence mode="wait">
        {/* ══════════ STEP 1: IMAGE ══════════ */}
        {step === "image" && (
          <motion.div key="image" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-4 md:p-5">
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-500" /> Add an Image
              </h3>
              <p className="text-xs text-white/50 mb-4">Upload, choose from library, or let AI create one</p>

              {/* AI Prompt for image gen */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <Input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe the image you want AI to create (optional)..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm"
                  />
                </div>
              </div>

              <ImageDropZone
                imagePreview={imagePreview}
                onImageSelect={setImagePreview}
                onImageRemove={() => setImagePreview(null)}
                libraryImages={libraryImages}
                onAIGenerate={generateImage}
                isGenerating={isGeneratingImage}
              />

              <div className="flex justify-between mt-4">
                <Button variant="ghost" className="text-white/50 text-sm" onClick={() => setStep("message")}>
                  Skip (text only) →
                </Button>
                <Button
                  onClick={() => setStep("message")}
                  className="bg-gradient-to-r from-orange-500 to-rose-600 min-h-[44px]"
                >
                  Next: Write Message <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ══════════ STEP 2: MESSAGE ══════════ */}
        {step === "message" && (
          <motion.div key="message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-4 md:p-5">
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" /> Write Your Message
              </h3>
              <p className="text-xs text-white/50 mb-4">Write manually or let AI craft the perfect post</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left: Image preview (if set) + editor */}
                <div className="md:col-span-2 space-y-3">
                  {imagePreview && (
                    <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-[160px]">
                      <img src={imagePreview} alt="Selected" className="w-full max-h-[160px] object-contain bg-black/30" />
                    </div>
                  )}

                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="What do you want to say? Your message goes here..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />

                  {/* Hashtags */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={hashtagInput}
                        onChange={(e) => setHashtagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHashtag())}
                        placeholder="Add hashtag..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs"
                      />
                      <Button size="sm" variant="outline" onClick={addHashtag} className="px-3">
                        <Hash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {hashtags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-red-500/20" onClick={() => setHashtags(hashtags.filter((_, j) => j !== i))}>
                            {tag} <X className="h-2.5 w-2.5 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: AI Panel */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-purple-300 flex items-center gap-1.5 mb-3">
                      <Wand2 className="h-4 w-4" /> AI Assistant
                    </h4>

                    <div className="space-y-2">
                      <Label className="text-xs text-white/50">Tone</Label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {TONES.map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTone(t.id)}
                            className={`text-xs py-1.5 px-2 rounded-md transition-all ${
                              tone === t.id 
                                ? "bg-purple-500/30 border border-purple-500/50 text-purple-300" 
                                : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                            }`}
                          >
                            {t.emoji} {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Optional: guide the AI..."
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs"
                    />

                    <div className="grid grid-cols-1 gap-1.5 mt-3">
                      <Button
                        size="sm"
                        onClick={generateMessage}
                        disabled={isGeneratingMessage}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-xs min-h-[36px]"
                      >
                        {isGeneratingMessage ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                        Generate Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={generateBoth}
                        disabled={isGeneratingMessage || isGeneratingImage}
                        className="w-full text-xs min-h-[36px] border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1.5" /> Generate Image + Message
                      </Button>
                    </div>
                  </div>

                  {/* Character counts */}
                  <div className="bg-white/5 rounded-lg p-2 space-y-1">
                    <p className="text-[10px] text-white/40 font-medium">Character Counts</p>
                    {PLATFORM_REGISTRY.filter(p => p.charLimit).slice(0, 4).map(p => (
                      <div key={p.id} className="flex items-center justify-between text-[10px]">
                        <span className="text-white/50">{p.name}</span>
                        <span className={fullMessage.length > (p.charLimit || Infinity) ? "text-red-400" : "text-emerald-400"}>
                          {fullMessage.length}/{p.charLimit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <Button variant="ghost" onClick={() => setStep("image")} className="text-white/50 text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
                <Button
                  onClick={() => setStep("publish")}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-orange-500 to-rose-600 min-h-[44px]"
                >
                  Next: Publish <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ══════════ STEP 3: PUBLISH ══════════ */}
        {step === "publish" && (
          <motion.div key="publish" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-4 md:p-5">
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-500" /> Publish
              </h3>
              <p className="text-xs text-white/50 mb-4">Choose where and when to publish</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Preview */}
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-full max-h-[200px] object-contain bg-black/30" />
                    )}
                    <div className="p-3">
                      <p className="text-sm text-white whitespace-pre-line">{message}</p>
                      {hashtags.length > 0 && (
                        <p className="text-xs text-blue-400 mt-2">{hashtags.join(" ")}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Platform & Action Selection */}
                <div className="space-y-4">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Platforms</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {activePlatforms.length > 0 ? (
                        activePlatforms.map(cp => {
                          const config = PLATFORM_REGISTRY.find(r => r.id === cp.platformId);
                          if (!config) return null;
                          const isSelected = selectedPlatforms.includes(cp.platformId);
                          return (
                            <button
                              key={cp.platformId}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPlatforms(selectedPlatforms.filter(p => p !== cp.platformId));
                                } else {
                                  setSelectedPlatforms([...selectedPlatforms, cp.platformId]);
                                }
                              }}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${
                                isSelected
                                  ? `border-orange-500/50 bg-orange-500/10 text-white`
                                  : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                              }`}
                            >
                              <div className={`w-6 h-6 rounded ${config.bgColor} flex items-center justify-center`}>
                                {config.icon}
                              </div>
                              {config.name}
                              {isSelected && <CheckCircle className="h-3 w-3 ml-auto text-orange-400" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-4 text-xs text-white/40">
                          No platforms connected.{" "}
                          <span className="text-orange-400 cursor-pointer">Go to Connections tab</span>
                        </div>
                      )}
                    </div>
                    {/* Select All */}
                    {activePlatforms.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-white/40"
                        onClick={() => setSelectedPlatforms(activePlatforms.map(p => p.platformId))}
                      >
                        Select All ({activePlatforms.length})
                      </Button>
                    )}
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Schedule (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-sm"
                    />
                    {scheduledFor && (
                      <p className="text-[10px] text-white/40">
                        Will post on {new Date(scheduledFor).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <Button
                      onClick={() => {
                        if (scheduledFor) {
                          schedulePostMutation.mutate({
                            tenantId,
                            platform: selectedPlatforms.join(","),
                            content: fullMessage,
                            imageUrl: imagePreview || undefined,
                            scheduledFor,
                          });
                        } else {
                          postNowMutation.mutate({
                            tenantId,
                            platform: selectedPlatforms.length === 1 ? selectedPlatforms[0] : "all",
                            content: fullMessage,
                            imageUrl: imagePreview || undefined,
                          });
                        }
                      }}
                      disabled={postNowMutation.isPending || schedulePostMutation.isPending || selectedPlatforms.length === 0}
                      className="bg-gradient-to-r from-orange-500 to-rose-600 min-h-[48px] text-base"
                    >
                      {(postNowMutation.isPending || schedulePostMutation.isPending) ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : scheduledFor ? (
                        <Clock className="h-5 w-5 mr-2" />
                      ) : (
                        <Send className="h-5 w-5 mr-2" />
                      )}
                      {scheduledFor ? "Schedule Post" : "Post Now"}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          createPostMutation.mutate({
                            tenantId,
                            content: fullMessage,
                            platform: selectedPlatforms[0] || "all",
                            hashtags: hashtags,
                            imageFilename: imagePreview ? "uploaded" : undefined,
                          });
                        }}
                        disabled={createPostMutation.isPending}
                        className="min-h-[44px] text-xs"
                      >
                        <Plus className="h-4 w-4 mr-1.5" /> Add to Library
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowBoost(true)}
                        className="min-h-[44px] text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <DollarSign className="h-4 w-4 mr-1.5" /> Boost as Ad
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-start mt-4">
                <Button variant="ghost" onClick={() => setStep("message")} className="text-white/50 text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <BoostDialog
        open={showBoost}
        onOpenChange={setShowBoost}
        postContent={fullMessage}
        tenantId={tenantId}
      />
    </div>
  );
}
