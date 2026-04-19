import { useState } from "react";
import { AlertTriangle, X, MessageSquare, Mail, Send } from "lucide-react";

function ContactGate({ mode, onClose }: { mode: "text" | "email"; onClose: () => void }) {
  const [userNumber, setUserNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = userNumber.trim();
    if (!trimmed) {
      setError("Please enter your user number");
      return;
    }
    const body = `Bug Report from User #${trimmed}%0A%0ADescribe the issue:%0A%0A`;
    if (mode === "text") {
      window.open(`sms:+16156012952?body=${body}`, "_self");
    } else {
      window.open(`mailto:team@dwtl.io?subject=Bug Report — User %23${trimmed}&body=${body.replace(/%0A/g, '%0A')}`, "_self");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose} data-testid="contact-gate-overlay">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()} data-testid="contact-gate-modal">
        <div className="flex items-center gap-2 mb-3">
          {mode === "text" ? <MessageSquare className="size-4 text-violet-400" /> : <Mail className="size-4 text-cyan-400" />}
          <h3 className="text-sm font-semibold text-white">{mode === "text" ? "Text Jason" : "Email Jason"}</h3>
        </div>
        <p className="text-xs text-white/50 mb-2">Enter your user/affiliate number to continue. This helps me find your account and fix the issue faster.</p>
        <div className="bg-white/5 rounded-lg p-2 mb-2 border border-white/5">
          <p className="text-[10px] text-cyan-300/70 leading-relaxed">Your user number is the account number you received when you signed up. It's also your affiliate number — the same number works across all DarkWave ecosystem sites (dwtl.io and more).</p>
        </div>
        <input
          value={userNumber}
          onChange={e => { setUserNumber(e.target.value); setError(""); }}
          placeholder="Your user / affiliate number"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 mb-1.5"
          data-testid="input-user-number"
          autoFocus
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className="text-[10px] text-red-400 mb-1.5">{error}</p>}
        <p className="text-[10px] text-white/30 mb-3">Include a screenshot and description of the problem. No wait time — I'll fix it immediately.</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-colors" data-testid="btn-contact-cancel">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 px-3 py-2 rounded-lg text-xs text-white font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-colors flex items-center justify-center gap-1.5" data-testid="btn-contact-send">
            <Send className="size-3" />
            {mode === "text" ? "Open Text" : "Open Email"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { ContactGate };

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [contactMode, setContactMode] = useState<"text" | "email" | null>(null);
  if (dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/20 relative" data-testid="beta-banner">
        <div className="container mx-auto max-w-7xl px-4 py-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-200 font-medium">
                This app is brand new and actively being improved. If you run into any issues, please reach out — I'll get it fixed right away.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <button
                  onClick={() => setContactMode("text")}
                  className="flex items-center gap-1.5 text-[11px] text-violet-300 hover:text-violet-200 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-full px-2.5 py-1 transition-colors"
                  data-testid="beta-text-btn"
                >
                  <MessageSquare className="size-3" />
                  Text Me
                </button>
                <button
                  onClick={() => setContactMode("email")}
                  className="flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-cyan-200 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-full px-2.5 py-1 transition-colors"
                  data-testid="beta-email-btn"
                >
                  <Mail className="size-3" />
                  Send Email
                </button>
                <span className="text-[10px] text-white/30">— Jason, Developer</span>
              </div>
            </div>
            <button onClick={() => setDismissed(true)} className="text-white/30 hover:text-white/60 transition-colors p-0.5 flex-shrink-0" data-testid="beta-dismiss" aria-label="Dismiss">
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
      {contactMode && <ContactGate mode={contactMode} onClose={() => setContactMode(null)} />}
    </>
  );
}
