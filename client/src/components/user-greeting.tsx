import { useState } from "react";
import { Info, Copy, Check, User, Hash } from "lucide-react";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface UserGreetingProps {
  name: string;
  userNumber: string | number;
  role?: string;
  compact?: boolean;
}

export function UserGreeting({ name, userNumber, role, compact = false }: UserGreetingProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);
  const greeting = getTimeGreeting();
  const displayNumber = String(userNumber);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={compact ? "" : "mb-4"} data-testid="user-greeting">
      <div className="flex items-center gap-2 flex-wrap">
        <h2 className={`font-bold text-white ${compact ? 'text-sm' : 'text-lg'}`} data-testid="text-greeting">
          {greeting}, {name}!
        </h2>
        {role && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20 font-medium" data-testid="badge-role">
            {role}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <Hash className="size-3 text-amber-400" />
        <span className={`font-mono font-semibold text-amber-300 ${compact ? 'text-xs' : 'text-sm'}`} data-testid="text-user-number">
          {displayNumber}
        </span>
        <button
          onClick={handleCopy}
          className="text-white/30 hover:text-white/60 transition-colors p-0.5"
          data-testid="btn-copy-number"
          title="Copy number"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
        </button>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-white/30 hover:text-cyan-400 transition-colors p-0.5"
          data-testid="btn-number-info"
          title="What is this?"
        >
          <Info className="size-3" />
        </button>
      </div>

      {showInfo && (
        <div className="mt-2 bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3 max-w-md" data-testid="info-user-number">
          <div className="flex items-start gap-2">
            <User className="size-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-cyan-300 mb-1">Your Account / Affiliate Number</p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                This is your personal number across the entire DarkWave ecosystem. Use it when contacting support, reporting issues, or referring others. It works as your affiliate link on all our sites — dwtl.io and any future ecosystem apps.
              </p>
              <p className="text-[11px] text-white/50 leading-relaxed mt-1.5">
                When you contact us about a bug or need help, include this number so we can pull up your account instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
