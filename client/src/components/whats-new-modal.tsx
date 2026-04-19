import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, X, MapPin, ShoppingCart, Receipt, ScanLine, 
  Heart, Palette, Hand, CheckCircle2, Truck
} from "lucide-react";

const WHATS_NEW_VERSION = "jan-25-2026";

export function WhatsNewModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("happy-eats-whats-new");
    if (lastSeenVersion !== WHATS_NEW_VERSION) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("happy-eats-whats-new", WHATS_NEW_VERSION);
    setOpen(false);
  };

  const newFeatures = [
    {
      icon: MapPin,
      color: "text-emerald-400",
      title: "GPS Permission System",
      desc: "Asks before enabling, saves & names your locations (Home, Nashville Hub, etc.)"
    },
    {
      icon: ShoppingCart,
      color: "text-orange-400",
      title: "Concierge Order Form",
      desc: "Two-step flow: fill details → review cart → place order with automatic pricing"
    },
    {
      icon: Receipt,
      color: "text-sky-400",
      title: "Automatic Pricing",
      desc: "30% service fee + 10% tax + $4.99 delivery calculated instantly"
    },
    {
      icon: ScanLine,
      color: "text-violet-400",
      title: "Document Scanner",
      desc: "Built-in OCR using Tesseract.js - scan receipts & BOLs, no subscription needed"
    },
    {
      icon: Heart,
      color: "text-rose-400",
      title: "Health & Wellness",
      desc: "Quick access to vedasolus.io for fitness and wellness resources"
    },
    {
      icon: Palette,
      color: "text-amber-400",
      title: "9 Theme Options",
      desc: "Personalize your experience with sports teams, NASCAR, desert sunset & more"
    },
    {
      icon: Hand,
      color: "text-cyan-400",
      title: "Better Navigation",
      desc: "Swipe hints and scroll indicators help users discover all content"
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-orange-500/20 text-foreground max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto">
        <button 
          onClick={handleClose}
          className="absolute right-3 top-3 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-white flex items-center gap-2">
            <Sparkles className="size-5 text-orange-400" />
            What's New, Kathy!
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            January 25, 2026 Update
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Hey Kathy! Jason here. Check out all the new features we added today:
          </p>
          
          <div className="space-y-2">
            {newFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/5 rounded-lg p-3 flex items-start gap-3 border border-white/5"
              >
                <div className={`size-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 ${feature.color}`}>
                  <feature.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm">{feature.title}</p>
                  <p className="text-gray-400 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-lg p-3 border border-orange-500/20">
            <p className="text-white font-medium text-sm flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Coming Soon
            </p>
            <ul className="text-gray-400 text-xs mt-2 space-y-1">
              <li>• Stripe payments for checkout</li>
              <li>• Twilio SMS notifications</li>
              <li>• Email order confirmations</li>
            </ul>
          </div>

          <p className="text-gray-400 text-xs">
            The app is really coming together! Let me know what you think of these updates.
          </p>
        </div>

        <Button 
          onClick={handleClose} 
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white mt-2"
        >
          <Truck className="size-4 mr-2" />
          Let's See It!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
