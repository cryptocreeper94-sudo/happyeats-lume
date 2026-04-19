import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

function getSessionId(): string {
  let sid = sessionStorage.getItem("analytics_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", sid);
  }
  return sid;
}

function getCurrentTenantId(): number | null {
  try {
    const stored = localStorage.getItem("authUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.id && parsed.id > 0) return parsed.id;
    }
  } catch {}
  return null;
}

export function useAnalytics() {
  const [location] = useLocation();
  const lastPage = useRef<string | null>(null);
  const lastTime = useRef<number>(Date.now());
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    if (lastPage.current && lastPage.current !== location) {
      const duration = Math.round((Date.now() - lastTime.current) / 1000);
      if (duration > 0 && duration < 1800) {
        const tenantId = getCurrentTenantId();
        navigator.sendBeacon(
          "/api/analytics/track",
          new Blob(
            [JSON.stringify({
              page: lastPage.current,
              sessionId: sessionId.current,
              duration,
              referrer: document.referrer || null,
              tenantId,
            })],
            { type: "application/json" }
          )
        );
      }
    }

    lastPage.current = location;
    lastTime.current = Date.now();

    const tenantId = getCurrentTenantId();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: location,
        sessionId: sessionId.current,
        referrer: document.referrer || null,
        tenantId,
      }),
    }).catch(() => {});
  }, [location]);

  useEffect(() => {
    const handleUnload = () => {
      if (lastPage.current) {
        const duration = Math.round((Date.now() - lastTime.current) / 1000);
        if (duration > 0 && duration < 1800) {
          const tenantId = getCurrentTenantId();
          navigator.sendBeacon(
            "/api/analytics/track",
            new Blob(
              [JSON.stringify({
                page: lastPage.current,
                sessionId: sessionId.current,
                duration,
                referrer: document.referrer || null,
                tenantId,
              })],
              { type: "application/json" }
            )
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);
}

export function AnalyticsTracker() {
  useAnalytics();
  return null;
}
