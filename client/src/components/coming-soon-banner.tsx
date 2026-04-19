import { Rocket } from "lucide-react";

export function ComingSoonBanner() {
  // Disabled during live test - re-enable when needed
  return null;
}

export function ComingSoonBannerTL() {
  return (
    <div className="bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 border-b border-cyan-500/20 px-3 py-2 flex items-center justify-center gap-2 text-center">
      <Rocket className="size-3.5 text-cyan-400 shrink-0" />
      <span className="text-xs font-semibold text-cyan-300">Coming Soon</span>
      <span className="text-[11px] text-white/50 hidden sm:inline">— Nationwide driver services platform launching soon. Stay tuned!</span>
      <span className="text-[11px] text-white/50 sm:hidden">— Stay tuned!</span>
    </div>
  );
}
