import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ glow, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-white/[0.08] bg-[rgba(12,18,36,0.65)] backdrop-blur-2xl shadow-2xl transition-all duration-300",
          glow && "hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
