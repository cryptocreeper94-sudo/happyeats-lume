import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

const AD_CLIENT = "ca-pub-7386731030203849";

function getCustomerIdFromSession(): number | null {
  try {
    const raw = localStorage.getItem("happyeats_customer") || sessionStorage.getItem("happyeats_customer");
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.id || null;
    }
  } catch {}
  return null;
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
  showUpgrade?: boolean;
  customerId?: number | null;
}

export function AdUnit({ slot, format = "auto", className = "", showUpgrade = true, customerId: propCustomerId }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const [adLoaded, setAdLoaded] = useState(false);

  const customerId = useMemo(() => propCustomerId ?? getCustomerIdFromSession(), [propCustomerId]);

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/stripe/subscription-status", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/subscription-status/${customerId}`);
      return res.json();
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });

  const isAdFree = customerId
    ? subscriptionStatus?.adFreeSubscription === true
    : localStorage.getItem("ad_free_subscription") === "true";

  const checkAdFilled = useCallback(() => {
    if (!adRef.current) return false;
    const ins = adRef.current.querySelector("ins.adsbygoogle");
    if (!ins) return false;
    const status = ins.getAttribute("data-ad-status");
    if (status === "unfilled") return false;
    if (status === "filled" && (ins as HTMLElement).offsetHeight > 10) return true;
    return false;
  }, []);

  useEffect(() => {
    if (isAdFree) return;
    if (pushed.current) return;
    try {
      if (adRef.current && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (e) {
    }
  }, [isAdFree]);

  useEffect(() => {
    if (isAdFree) return;
    if (!adRef.current) return;
    const observer = new MutationObserver(() => {
      if (checkAdFilled()) {
        setAdLoaded(true);
        observer.disconnect();
      }
      const ins = adRef.current?.querySelector("ins.adsbygoogle");
      if (ins?.getAttribute("data-ad-status") === "unfilled") {
        observer.disconnect();
      }
    });
    observer.observe(adRef.current, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-ad-status", "style"] });
    if (checkAdFilled()) setAdLoaded(true);
    const timeout = setTimeout(() => {
      if (!checkAdFilled()) observer.disconnect();
    }, 5000);
    return () => { observer.disconnect(); clearTimeout(timeout); };
  }, [checkAdFilled, isAdFree]);

  if (isAdFree) return null;

  return (
    <div
      className={adLoaded ? `relative ${className}` : ""}
      style={adLoaded ? undefined : { height: 0, overflow: "hidden", margin: 0, padding: 0 }}
      aria-hidden={!adLoaded}
      data-testid={`ad-unit-${slot}`}
    >
      <div ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
      {adLoaded && showUpgrade && (
        <div className="flex items-center justify-center mt-1">
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Sparkles className="size-3" />
            <span>Go ad-free for $5/mo</span>
          </span>
        </div>
      )}
    </div>
  );
}

export function AdBanner({ className = "", customerId: propCustomerId }: { className?: string; customerId?: number | null }) {
  const customerId = useMemo(() => propCustomerId ?? getCustomerIdFromSession(), [propCustomerId]);

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/stripe/subscription-status", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/subscription-status/${customerId}`);
      return res.json();
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  });

  const isAdFree = customerId
    ? subscriptionStatus?.adFreeSubscription === true
    : localStorage.getItem("ad_free_subscription") === "true";

  if (isAdFree) return null;

  return null;
}
