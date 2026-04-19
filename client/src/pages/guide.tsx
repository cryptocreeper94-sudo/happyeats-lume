import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, ChevronRight, ChevronLeft, Volume2, 
  MapPin, Clock, Truck, ChefHat, ShoppingCart, 
  Settings, CheckCircle, Navigation, ShieldCheck, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";

const CUSTOMER_MANUAL = [
  {
    id: "customer",
    title: "1. The Customer",
    subtitle: "Ordering Your Food",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
    icon: <ShoppingCart className="size-6 text-emerald-400" />,
    text: "Welcome to Happy Eats. As a customer, you simply open the app and hit 'Order Now'. You're placed into a 'Delivery Zone' like the I-24 Corridor.\n\nYou'll only see vendors that are ACTIVE in that specific zone today. Pick your food, add to cart, enter custom instructions, and pay via Stripe. Bam. The order is locked in.",
    voicePrompt: "Welcome to Happy Eats. As a customer, you simply open the app and hit Order Now. You'll be placed into a delivery zone, like the I-24 Corridor. You can only see vendors that are active in that specific zone today. Pick your food, add to cart, and pay via Stripe. Bam. The order is locked in."
  },
  {
    id: "batching",
    title: "2. Batch Windows",
    subtitle: "How delivery times work",
    image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800",
    icon: <Clock className="size-6 text-cyan-400" />,
    text: "We run on Batch Deliveries. This is how we ensure food arrives hot and fast.\n\nOrders have strict cutoffs. For example:\n• 9:30 AM Cutoff for 11:30 AM Delivery.\n• 11:30 AM Cutoff for 1:30 PM Delivery.\n\nYou must order BEFORE the cutoff. If you miss it, you're in the next batch.",
    voicePrompt: "We run on Batch Deliveries. This is how we ensure food arrives hot and fast. Orders have strict cutoffs. For example: 9:30 A M Cutoff for 11:30 A M Delivery. You must order BEFORE the cutoff. If you miss it, you're in the next batch."
  }
];

const VENDOR_MANUAL = [
  {
    id: "vendor",
    title: "Vendor Portal",
    subtitle: "Making food, making money",
    image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80&w=800",
    icon: <ChefHat className="size-6 text-amber-400" />,
    text: "Welcome to the Vendor Portal. Signing up is free — just visit happyeats.app/vendor and click 'Join for Free'. You'll complete a quick signup wizard with your business info, upload your logo, and connect your bank through Stripe.\n\nWhen a batch order arrives, you'll get a loud notification: 'NEW ORDER'. Tap 'Accept'. When it's time, tap 'Preparing'. When it's in the bag, tap 'Ready for Pickup'.\n\nWhat about your money? Instant payouts. You keep 80%, we keep 20%. The moment your order settles, your cut hits your Stripe account — money in your bank the next business day. No waiting for weekly checks.",
    voicePrompt: "Welcome to the Vendor Portal. Signing up is free. Just visit happy eats dot app slash vendor and click Join for Free. You'll complete a quick signup wizard with your business info, upload your logo, and connect your bank through Stripe. When a batch order arrives, you'll get a loud notification: NEW ORDER. Tap Accept. When it's time, tap Preparing. When it's in the bag, tap Ready for Pickup. What about your money? Instant payouts. You keep 80 percent, we keep 20. The moment your order settles, your cut hits your Stripe account. Money in your bank the next business day. No waiting for weekly checks."
  }
];

const DRIVER_MANUAL = [
  {
    id: "driver",
    title: "Driver Dashboard",
    subtitle: "Delivering the goods",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=800",
    icon: <Truck className="size-6 text-violet-400" />,
    text: "Welcome to the Driver Portal. You'll drive to the local Hub to grab the batch orders.\n\nMark 'Picked Up' in the app. The customer gets a text with a live GPS tracking link.\n\nPull up to the building, hand over the food, snap a photo as proof of delivery, and mark it 'Delivered'. Done.",
    voicePrompt: "Welcome to the Driver Portal. You'll drive to the local Hub to grab the batch orders. Mark 'Picked Up' in the app. The customer gets a text with a live GPS tracking link. Pull up to the building, hand over the food, snap a photo as proof of delivery, and mark it 'Delivered'. Done."
  }
];

const OWNER_MANUAL = [
  {
    id: "intro",
    title: "Welcome to the Chaos",
    subtitle: "A No-Nonsense Guide to Happy Eats",
    image: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=800",
    icon: <ShieldCheck className="size-6 text-orange-400" />,
    text: "Hey Kathy. Welcome to Happy Eats. Take a breath because we're about to demystify this entire beast.\n\nYou act as the brain. The customers order the food. The food trucks cook it. And drivers deliver it. Sound simple? It is, if you follow the rules.",
    voicePrompt: "Hey Kathy. Welcome to Happy Eats. Take a breath because we're about to demystify this entire beast. You act as the brain. The customers order the food. The food trucks cook it. And drivers deliver it. Sound simple? It is, if you follow the rules."
  },
  {
    id: "command",
    title: "Command Center",
    subtitle: "Where you pull the strings.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    icon: <Settings className="size-6 text-rose-400" />,
    text: "You watch the magic happen in the Command Center.\n\nNeed to pause a zone because a truck broke down? Go to 'Zone Map' and toggle it off. Need to check payroll? Go to 'Orbit Staffing'. Need to verify a driver's background check? Open Guardian Screener.\n\nYour Owner Dashboard shows everything — revenue, orders, vendor performance. The Revenue Split panel gives you the full breakdown: you get 50%, Jason gets 40%, 10% goes to expenses. Every single order is tracked and synced to Orbit for bookkeeping.\n\nYou are the orchestrator. Let the system do the heavy lifting. You just manage the exceptions.",
    voicePrompt: "You watch the magic happen in the Command Center. Need to pause a zone because a truck broke down? Go to Zone Map and toggle it off. Need to check payroll? Go to Orbit Staffing. Need to verify a driver's background check? Open Guardian Screener. Your Owner Dashboard shows everything. Revenue, orders, vendor performance. The Revenue Split panel gives you the full breakdown: you get 50 percent, Jason gets 40 percent, 10 percent goes to expenses. Every single order is tracked and synced to Orbit for bookkeeping. You are the orchestrator. Let the system do the heavy lifting. You just manage the exceptions."
  }
];

export default function KathyManual() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { user } = useAuth();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferMapRef = useRef<Record<string, AudioBuffer>>({});
  const playStateRef = useRef({ playing: false, slideId: "" });

  const searchParams = new URLSearchParams(window.location.search);
  const roleParam = searchParams.get("role") || user?.role || "customer";

  // Build the manual based on role
  // Owner gets the Complete Manual. Vendor gets Vendor, etc.
  let MANUAL_CHAPTERS = CUSTOMER_MANUAL;
  if (roleParam === "vendor") MANUAL_CHAPTERS = VENDOR_MANUAL;
  if (roleParam === "driver") MANUAL_CHAPTERS = DRIVER_MANUAL;
  if (roleParam === "owner" || roleParam === "developer") {
    MANUAL_CHAPTERS = [...OWNER_MANUAL.slice(0, 1), ...CUSTOMER_MANUAL, ...VENDOR_MANUAL, ...DRIVER_MANUAL, ...OWNER_MANUAL.slice(1)];
  }

  useEffect(() => {
    // Initialize Web Audio API on first interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener("click", initAudio, { once: true });
    return () => {
      window.removeEventListener("click", initAudio);
      stopAudio();
    };
  }, []);

  const fetchTTS = async (text: string, slideId: string) => {
    if (audioBufferMapRef.current[slideId]) return audioBufferMapRef.current[slideId];
    
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voiceId: "21m00Tcm4TlvDq8ikWAM" })
      });
      if (!res.ok) throw new Error("TTS fetch failed");
      const arrayBuffer = await res.arrayBuffer();
      
      // Init audio context if not yet done
      if (!audioContextRef.current) {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      audioBufferMapRef.current[slideId] = audioBuffer;
      return audioBuffer;
    } catch (e) {
      console.error(e);
      // Fallback to browser TTS if ElevenLabs fails
      fallbackTTS(text);
      return null;
    }
  };

  const playSlideAudio = async (index: number) => {
    stopAudio();
    setIsPlaying(true);
    setIsLoadingAudio(true);
    const slide = MANUAL_CHAPTERS[index];
    playStateRef.current = { playing: true, slideId: slide.id };

    const buffer = await fetchTTS(slide.voicePrompt, slide.id);
    setIsLoadingAudio(false);

    if (buffer && playStateRef.current.playing && playStateRef.current.slideId === slide.id) {
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current!.destination);
      source.onended = () => {
        if (playStateRef.current.slideId === slide.id) {
          setIsPlaying(false);
          // Auto advance
          if (index < MANUAL_CHAPTERS.length - 1) {
            setCurrentSlide(index + 1);
            playSlideAudio(index + 1);
          }
        }
      };
      source.start();
      audioSourceRef.current = source;
    } else if (!buffer && playStateRef.current.playing) {
      // It's using fallback TTS which handles its own state
    }
    
    // Preload next slide
    if (index < MANUAL_CHAPTERS.length - 1) {
      const nextSlide = MANUAL_CHAPTERS[index + 1];
      fetchTTS(nextSlide.voicePrompt, nextSlide.id);
    }
  };

  const stopAudio = () => {
    playStateRef.current = { playing: false, slideId: "" };
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e){}
      audioSourceRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  };

  const fallbackTTS = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsPlaying(false);
      if (currentSlide < MANUAL_CHAPTERS.length - 1) {
        setCurrentSlide(prev => {
          const nextIndex = prev + 1;
          setTimeout(() => playSlideAudio(nextIndex), 50);
          return nextIndex;
        });
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayback = () => {
    if (isPlaying || isLoadingAudio) {
      stopAudio();
      setIsLoadingAudio(false);
    } else {
      playSlideAudio(currentSlide);
    }
  };

  const handleNext = () => {
    stopAudio();
    if (currentSlide < MANUAL_CHAPTERS.length - 1) {
      setCurrentSlide(prev => prev + 1);
      // Don't auto-play next slide unless they manually clicked Play earlier
    }
  };

  const handlePrev = () => {
    stopAudio();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const slide = MANUAL_CHAPTERS[currentSlide];

  return (
    <div className="fixed inset-0 bg-[#050810] z-[100] flex flex-col overflow-hidden text-white font-sans safe-top safe-bottom">
      <div className="flex items-center justify-between p-4 z-20 absolute top-0 left-0 right-0 bg-gradient-to-b from-[#050810]/90 to-transparent">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md">
            <ChevronLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex gap-1.5 px-4 flex-1 max-w-[200px] justify-center">
          {MANUAL_CHAPTERS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${idx === currentSlide ? "bg-gradient-to-r from-orange-400 to-rose-400" : idx < currentSlide ? "bg-white/40" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex-1 bg-black overflow-hidden flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050810] via-[#050810]/60 to-transparent" />
        
        <div className="relative z-10 p-6 pb-[120px]">
          <AnimatePresence mode="wait">
            <motion.div key={slide.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shrink-0 shadow-xl">
                  {slide.icon}
                </div>
                <div>
                  <Badge className="bg-white/10 text-white/70 border-white/20 mb-1 backdrop-blur-md text-[10px]">
                    {slide.subtitle}
                  </Badge>
                  <h1 className="text-2xl font-black loading-tight leading-none drop-shadow-md">
                    {slide.title}
                  </h1>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl">
                <p className="text-[15px] leading-relaxed text-white/90 whitespace-pre-wrap font-medium">
                  {slide.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30">
        <div className="p-2 rounded-full bg-[#1e293b]/80 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePrev} disabled={currentSlide === 0} className="rounded-full hover:bg-white/10 text-white">
            <ChevronLeft className="size-6" />
          </Button>

          <Button onClick={togglePlayback} disabled={isLoadingAudio} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isPlaying ? "bg-white text-black hover:bg-slate-200" : "bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600"}`}>
             {isLoadingAudio ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : isPlaying ? <Pause className="size-6 ml-0.5" /> : <Play className="size-6 ml-1" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleNext} disabled={currentSlide === MANUAL_CHAPTERS.length - 1} className="rounded-full hover:bg-white/10 text-white">
            <ChevronRight className="size-6" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-white/40 mt-3 font-medium tracking-wide">
          <Volume2 className="size-3 inline-block mr-1 mb-0.5" /> ELEVENLABS AUDIO ENABLED
        </p>
      </div>
    </div>
  );
}
