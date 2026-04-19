import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Package, Clock, Sparkles, X } from "lucide-react";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("truckrunner-welcome-seen");
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("truckrunner-welcome-seen", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-white/10 text-foreground max-w-sm sm:max-w-md max-h-[85vh] overflow-y-auto">
        <button 
          onClick={handleClose}
          className="absolute right-3 top-3 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="size-4 text-muted-foreground" />
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-white flex items-center gap-2">
            <Truck className="size-5 text-primary" />
            Hey Kathy!
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            A quick intro to TruckRunner
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            It's Jason! Check out <span className="text-primary font-semibold">TruckRunner</span> — 
            a delivery app for truck drivers during rest breaks.
          </p>
          
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <p className="text-white font-medium text-xs flex items-center gap-2">
              <Sparkles className="size-3 text-violet-400" /> Current Features:
            </p>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li className="flex items-start gap-2">
                <Package className="size-3 mt-0.5 text-sky-400 shrink-0" />
                Order food, parts & supplies to your truck
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-3 mt-0.5 text-violet-400 shrink-0" />
                GPS "Concierge" finds ANY nearby store
              </li>
              <li className="flex items-start gap-2">
                <Clock className="size-3 mt-0.5 text-purple-300 shrink-0" />
                HOS break timer with alarm
              </li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <p className="text-white font-medium text-xs">Future Ideas:</p>
            <ul className="space-y-0.5 text-gray-400 text-[11px]">
              <li>• Load board by GPS/zip code</li>
              <li>• Real-time delivery tracking</li>
              <li>• Fleet management dashboard</li>
              <li>• <span className="text-sky-400">Stripe</span> — secure payment processing for orders</li>
              <li>• <span className="text-violet-400">Twilio</span> — SMS notifications & driver updates</li>
            </ul>
          </div>

          <p className="text-gray-400 text-xs">
            Nashville is a logistics hub with real potential. Let me know what you think!
          </p>
        </div>

        <Button 
          onClick={handleClose} 
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-1"
        >
          Let's Check It Out
        </Button>
      </DialogContent>
    </Dialog>
  );
}
