import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Truck, Sparkles } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  foodTruckId: number;
  vendorName?: string;
}

export function ReviewModal({ open, onOpenChange, orderId, foodTruckId, vendorName }: ReviewModalProps) {
  const [vendorRating, setVendorRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [platformRating, setPlatformRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredVendor, setHoveredVendor] = useState(0);
  const [hoveredDriver, setHoveredDriver] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState(0);
  const queryClient = useQueryClient();

  let customerId: number | undefined;
  try {
    const raw = localStorage.getItem("happyeats_customer");
    if (raw) customerId = JSON.parse(raw)?.id;
  } catch {}

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/order-reviews", {
        orderId,
        foodTruckId,
        customerId: customerId || undefined,
        vendorRating,
        driverRating: driverRating || undefined,
        platformRating: platformRating || undefined,
        comment: comment.trim() || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "🌟 Thanks for your review!", description: "Your feedback helps us improve!" });
        queryClient.invalidateQueries({ queryKey: ["/api/order-reviews"] });
        onOpenChange(false);
      } else {
        toast({ title: data.error || "Failed to submit review", variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Failed to submit review", variant: "destructive" }),
  });

  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Amazing!"];

  const renderStars = (
    rating: number,
    setRating: (n: number) => void,
    hovered: number,
    setHovered: (n: number) => void,
    color: "amber" | "cyan" | "emerald"
  ) => {
    const colorMap = {
      amber: { active: "text-amber-400 fill-amber-400", glow: "drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" },
      cyan: { active: "text-cyan-400 fill-cyan-400", glow: "drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]" },
      emerald: { active: "text-emerald-400 fill-emerald-400", glow: "drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" },
    };
    const c = colorMap[color];
    const activeVal = hovered || rating;

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.15 }}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="p-0.5"
              data-testid={`star-${color}-${s}`}
            >
              <Star
                className={`w-8 h-8 transition-all duration-200 ${
                  s <= activeVal
                    ? `${c.active} ${c.glow}`
                    : "text-white/15 hover:text-white/30"
                }`}
              />
            </motion.button>
          ))}
        </div>
        {activeVal > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-medium ${color === "amber" ? "text-amber-400" : color === "cyan" ? "text-cyan-400" : "text-emerald-400"}`}
          >
            {ratingLabels[activeVal]}
          </motion.span>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f172a] border-white/10 max-w-sm mx-auto" data-testid="dialog-review">
        <DialogTitle className="sr-only">Rate Your Order</DialogTitle>
        <div className="space-y-5 py-2">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20"
            >
              <ThumbsUp className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-lg font-bold text-white">Rate Your Order</h2>
            <p className="text-sm text-white/50 mt-0.5">Order #{orderId}{vendorName ? ` · ${vendorName}` : ""}</p>
          </div>

          {/* Vendor Rating */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <label className="text-sm text-white/70 flex items-center gap-1.5 mb-3">
              <Star className="w-4 h-4 text-amber-400" /> Food & Vendor {vendorName && <span className="text-white/30">({vendorName})</span>}
            </label>
            {renderStars(vendorRating, setVendorRating, hoveredVendor, setHoveredVendor, "amber")}
          </div>

          {/* Driver Rating */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <label className="text-sm text-white/70 flex items-center gap-1.5 mb-3">
              <Truck className="w-4 h-4 text-cyan-400" /> Delivery Driver
            </label>
            {renderStars(driverRating, setDriverRating, hoveredDriver, setHoveredDriver, "cyan")}
          </div>

          {/* Platform Rating */}
          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.06]">
            <label className="text-sm text-white/70 flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Happy Eats Experience
            </label>
            {renderStars(platformRating, setPlatformRating, hoveredPlatform, setHoveredPlatform, "emerald")}
          </div>

          <div>
            <label className="text-sm text-white/70 mb-1.5 block">Comments (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              maxLength={500}
              rows={3}
              className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none"
              data-testid="textarea-review-comment"
            />
            <p className="text-[10px] text-white/20 mt-1 text-right">{comment.length}/500</p>
          </div>

          <Button
            onClick={() => submitReview.mutate()}
            disabled={vendorRating === 0 || submitReview.isPending}
            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20 disabled:opacity-40"
            data-testid="button-submit-review"
          >
            {submitReview.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}