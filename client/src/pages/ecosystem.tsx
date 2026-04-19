import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Globe, Fingerprint, Code2, Zap } from "lucide-react";

export default function Ecosystem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '<div id="dw-ecosystem-directory"></div>';

    const existingScript = document.querySelector(
      'script[src="https://dwtl.io/api/ecosystem/directory.js"]'
    );
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.src = "https://dwtl.io/api/ecosystem/directory.js";
    script.setAttribute("data-theme", "dark");
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      const s = document.querySelector(
        'script[src="https://dwtl.io/api/ecosystem/directory.js"]'
      );
      if (s) s.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[150px] md:h-[300px] bg-cyan-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

        <div className="max-w-[960px] mx-auto px-4 py-6 md:py-8 relative z-10">

          <div className="mb-6 md:mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-300 transition-colors mb-5 min-h-[44px]"
              data-testid="link-back-home"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="flex items-start gap-3 md:gap-4 mb-4">
              <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex-shrink-0 flex items-center justify-center border border-cyan-500/30"
                style={{
                  background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))",
                  boxShadow: "0 8px 24px rgba(6,182,212,0.1)",
                }}
              >
                <Shield className="w-5 h-5 md:w-7 md:h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                    Trust Layer
                  </span>{" "}
                  <span className="text-white/80">Ecosystem</span>
                </h1>
                <p className="text-[11px] md:text-sm text-white/40 mt-0.5">
                  Powered by DarkWave Studios
                </p>
              </div>
            </div>

            <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-xl">
              Happy Eats &amp; TL Driver Connect are part of the Trust Layer ecosystem — a network of apps built on
              verified identity, shared credentials, and blockchain-backed trust. Your single
              login works across every connected platform.
            </p>
          </div>

          <div
            className="rounded-xl p-4 md:p-6 mb-6 md:mb-10"
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(6,182,212,0.15)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs md:text-sm font-semibold uppercase text-cyan-400 tracking-wider">
                Connected Apps
              </h2>
            </div>
            <div ref={containerRef} className="min-h-[200px]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-10">
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}
              >
                <Fingerprint className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5 text-white">Single Sign-On</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                One set of credentials across all DarkWave apps. No redirects — each app
                has its own login, synced behind the scenes.
              </p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <Zap className="w-4 h-4 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5 text-white">Blockchain Verified</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Identity and credentials anchored on Solana. Tamper-proof verification
                for users, organizations, and digital assets.
              </p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5 text-white">Open API</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Ecosystem API lets connected apps share data and alerts securely
                via JWT-authenticated endpoints.
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-white/20 pb-4">
            <a href="https://dwtl.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400/50 transition-colors min-h-[44px] inline-flex items-center">
              dwtl.io
            </a>
            <span className="mx-2">&bull;</span>
            <a href="https://tlid.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400/50 transition-colors min-h-[44px] inline-flex items-center">
              tlid.io
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
