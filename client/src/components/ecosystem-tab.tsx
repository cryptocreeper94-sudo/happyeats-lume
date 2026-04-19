import { Zap } from "lucide-react";

export function EcosystemTab() {
  return (
    <a
      href="https://dwtl.io/ecosystem"
      target="_blank"
      rel="noopener noreferrer"
      data-testid="tab-ecosystem"
      className="fixed right-0 top-[40%] z-[9999]"
      style={{ transform: 'translateX(0)' }}
    >
      <div className="flex flex-col items-center gap-1 bg-gradient-to-b from-cyan-500 to-violet-600 px-1.5 py-2.5 rounded-l-md shadow-lg shadow-black/30 min-h-[44px]">
        <Zap className="size-3 text-white shrink-0" />
        <span className="text-[8px] font-bold text-white tracking-widest uppercase" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
          Ecosystem
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.6)] shrink-0" />
      </div>
    </a>
  );
}
