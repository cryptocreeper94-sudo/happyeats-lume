import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Truck, Sparkles, Check, ChefHat, ArrowRight } from "lucide-react";
import { Link } from "wouter";

/**
 * Standalone review page accessible via email link.
 * URL: /review/:orderId/:token
 * Token = simple base64(orderId + customerEmail) — just enough to verify ownership.
 * No sign-in required.
 */
export default function ReviewPage() {
  const [, params] = useRoute("/review/:orderId/:token");
  const orderId = parseInt(params?.orderId || "0");
  const token = params?.token || "";

  const [vendorRating, setVendorRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [platformRating, setPlatformRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredVendor, setHoveredVendor] = useState(0);
  const [hoveredDriver, setHoveredDriver] = useState(0);
  const [hoveredPlatform, setHoveredPlatform] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Fetch order details using the token for validation
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["/api/orders/review-token", orderId, token],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}/review-verify?token=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error("Invalid or expired review link");
      return res.json();
    },
    enabled: orderId > 0 && !!token,
    retry: false,
  });

  // Check if already reviewed
  const { data: existingReview } = useQuery({
    queryKey: ["/api/order-reviews/order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/order-reviews/order/${orderId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: orderId > 0,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/order-reviews", {
        orderId,
        foodTruckId: order?.foodTruckId,
        customerId: order?.customerId || undefined,
        vendorRating,
        driverRating: driverRating || undefined,
        platformRating: platformRating || undefined,
        comment: comment.trim() || undefined,
        reviewToken: token,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSubmitted(true);
        toast({ title: "🌟 Thanks for your review!", description: "Your feedback helps us improve!" });
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
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.15 }}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="p-1 touch-manipulation"
              data-testid={`star-${color}-${s}`}
            >
              <Star className={`w-10 h-10 sm:w-8 sm:h-8 transition-all duration-200 ${s <= activeVal ? `${c.active} ${c.glow}` : "text-white/15 hover:text-white/30"}`} />
            </motion.button>
          ))}
        </div>
        {activeVal > 0 && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-medium ${color === "amber" ? "text-amber-400" : color === "cyan" ? "text-cyan-400" : "text-emerald-400"}`}
          >
            {ratingLabels[activeVal]}
          </motion.span>
        )}
      </div>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Invalid token / error
  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <Star className="size-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Review Link Expired</h1>
          <p className="text-sm text-white/50">
            This review link is no longer valid. You can still leave a review from your order history.
          </p>
          <Link href="/order-history">
            <Button className="bg-gradient-to-r from-orange-500 to-rose-500 font-bold">
              Go to Order History <ArrowRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Already reviewed
  if (existingReview || submitted) {
    return (
      <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-sm w-full text-center space-y-5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="size-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30"
          >
            <Check className="size-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">{submitted ? "Thank You!" : "Already Reviewed"}</h1>
          <p className="text-sm text-white/50">
            {submitted
              ? "Your review has been submitted. Thanks for helping us and our vendors improve!"
              : "You've already reviewed this order. Thank you for your feedback!"}
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/explore">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 font-bold min-h-[48px]">
                <ChefHat className="size-4 mr-2" /> Order Again
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Review form
  return (
    <div className="min-h-screen bg-[#070b16] flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-md w-full space-y-5"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="size-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/20"
          >
            <ThumbsUp className="size-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">How Was Your Order?</h1>
          <p className="text-sm text-white/50 mt-1">
            Order #{orderId}{order?.vendorName ? ` · ${order.vendorName}` : ""}
          </p>
        </div>

        {/* Vendor Rating */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
          <label className="text-sm text-white/70 flex items-center gap-2 mb-4 font-medium">
            <Star className="w-5 h-5 text-amber-400" /> Food & Vendor
            {order?.vendorName && <span className="text-white/30">({order.vendorName})</span>}
          </label>
          {renderStars(vendorRating, setVendorRating, hoveredVendor, setHoveredVendor, "amber")}
        </div>

        {/* Driver Rating */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
          <label className="text-sm text-white/70 flex items-center gap-2 mb-4 font-medium">
            <Truck className="w-5 h-5 text-cyan-400" /> Delivery Driver
          </label>
          {renderStars(driverRating, setDriverRating, hoveredDriver, setHoveredDriver, "cyan")}
        </div>

        {/* Platform Rating */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
          <label className="text-sm text-white/70 flex items-center gap-2 mb-4 font-medium">
            <Sparkles className="w-5 h-5 text-emerald-400" /> Happy Eats Experience
          </label>
          {renderStars(platformRating, setPlatformRating, hoveredPlatform, setHoveredPlatform, "emerald")}
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm text-white/70 mb-2 block font-medium">Comments (optional)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            maxLength={500}
            rows={3}
            className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 resize-none text-base min-h-[100px] rounded-xl"
            data-testid="textarea-review-comment"
          />
          <p className="text-[10px] text-white/20 mt-1 text-right">{comment.length}/500</p>
        </div>

        {/* Submit */}
        <Button
          onClick={() => submitReview.mutate()}
          disabled={vendorRating === 0 || submitReview.isPending}
          className="w-full min-h-[56px] bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg font-bold shadow-2xl shadow-amber-500/20 disabled:opacity-40 rounded-xl"
          data-testid="button-submit-review"
        >
          {submitReview.isPending ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Submit Review"
          )}
        </Button>

        <p className="text-[10px] text-center text-white/20">
          Your review helps our vendors improve and helps other customers choose. Thank you!
        </p>
      </motion.div>
    </div>
  );
}
