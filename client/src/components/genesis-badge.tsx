import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, X, ExternalLink } from "lucide-react";

function getDefaultHallmarkId(): string {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes("trustlayer") || hostname.includes("tldriverconnect")) {
    return "DC-00000001";
  }
  return "HE-00000001";
}

export default function GenesisBadge() {
  const [expanded, setExpanded] = useState(false);

  const { data: hallmarks } = useQuery({
    queryKey: ["/api/hallmark/genesis"],
    queryFn: async () => {
      const res = await fetch("/api/hallmark/genesis");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const defaultId = getDefaultHallmarkId();
  const hallmark = Array.isArray(hallmarks)
    ? hallmarks.find((h: any) => h.thId === defaultId) || hallmarks[0]
    : null;

  if (!hallmark) return null;

  const meta = hallmark.metadata || {};

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        data-testid="button-genesis-badge"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl text-white/60 hover:text-white hover:border-[#FF7849]/40 transition-all text-xs cursor-pointer"
      >
        <Shield className="size-3.5 text-[#FF7849]" />
        <span className="font-medium">Genesis Hallmark</span>
        <span className="text-white/30">{hallmark.thId}</span>
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
          data-testid="genesis-badge-overlay"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#FF7849] to-orange-400" />

            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#FF7849]/20 flex items-center justify-center">
                    <Shield className="size-4 text-[#FF7849]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Genesis Hallmark</h3>
                    <p className="text-[11px] text-white/40">{hallmark.thId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  data-testid="button-close-genesis-badge"
                  className="size-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <Section title="Application Info">
                <Row label="App Name" value={hallmark.appName} />
                <Row label="Domain" value={meta.domain} />
                <Row label="Operator" value={meta.operator} />
              </Section>

              <Section title="Blockchain Record">
                <Row label="Data Hash" value={hallmark.dataHash} mono />
                <Row label="Tx Hash" value={hallmark.txHash} mono />
                <Row label="Block Height" value={hallmark.blockHeight} />
                <Row label="Created" value={hallmark.createdAt} />
              </Section>

              <Section title="Ecosystem Details">
                <Row label="Chain" value={meta.chain} />
                <Row label="Consensus" value={meta.consensus} />
                <Row label="Native Asset" value={meta.nativeAsset} />
                <Row label="Utility Token" value={meta.utilityToken} />
              </Section>

              <div className="mt-4 p-3 rounded-xl bg-[#1e293b]/60 border border-white/5">
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">Parent Genesis</p>
                <a
                  href="#"
                  data-testid="link-parent-genesis"
                  className="text-xs text-[#FF7849] hover:text-orange-300 transition-colors flex items-center gap-1"
                >
                  TH-00000001
                  <ExternalLink className="size-3" />
                </a>
              </div>

              {hallmark.verificationUrl && (
                <div className="mt-3 p-3 rounded-xl bg-[#1e293b]/60 border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">Verification</p>
                  <a
                    href={hallmark.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="link-verification-url"
                    className="text-xs text-[#FF7849] hover:text-orange-300 transition-colors flex items-center gap-1 break-all"
                  >
                    {hallmark.verificationUrl}
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="space-y-1.5 p-3 rounded-xl bg-[#1e293b]/60 border border-white/5">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string | number; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3" data-testid={`text-genesis-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <span className="text-[11px] text-white/40 shrink-0">{label}</span>
      <span className={`text-[11px] text-white/70 text-right break-all ${mono ? 'font-mono text-[10px]' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}
