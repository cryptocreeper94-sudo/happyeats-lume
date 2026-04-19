import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Printer, Mail, FileText, Palette, HelpCircle } from "lucide-react";

const STORAGE_KEY = "flyer-editor-tips-seen";

export function FlyerTipsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white/60 hover:bg-white/20 transition-all"
        data-testid="button-flyer-tips"
        title="Flyer Editor Tips"
      >
        <HelpCircle className="size-3.5" />
        Tips
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="w-[92vw] max-w-md mx-auto rounded-2xl bg-slate-900 border-slate-700 p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white text-center">
              Flyer Editor — Quick Tips
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <TipRow
              icon={<Palette className="size-5 text-purple-400 shrink-0" />}
              title="Edit Your Flyer"
              desc='Tap "Edit" to change text, colors, logos, and background images. Switch to "Preview" to see the final version.'
            />
            <TipRow
              icon={<Download className="size-5 text-cyan-400 shrink-0" />}
              title="Download Image"
              desc="Saves a full-page PNG image to your device. Great for posting on social media or sending to a print shop."
            />
            <TipRow
              icon={<FileText className="size-5 text-orange-400 shrink-0" />}
              title="Download PDF"
              desc="Creates a print-ready PDF file. Take this to any print shop — it's sized for standard letter paper (8.5 x 11)."
            />
            <TipRow
              icon={<Printer className="size-5 text-green-400 shrink-0" />}
              title="Print"
              desc='Opens a print window with your flyer. For best results, set margins to "None" or "Minimum" in the print settings.'
            />
            <TipRow
              icon={<Mail className="size-5 text-rose-400 shrink-0" />}
              title="Email"
              desc="Downloads the flyer image first, then opens your email app. Just attach the downloaded file to your email."
            />

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 text-center">
              <p className="text-xs text-cyan-300 leading-relaxed">
                You can reopen these tips anytime by tapping the <strong>"Tips"</strong> button in the toolbar.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm hover:brightness-110 transition-all"
            data-testid="button-close-tips"
          >
            Got It!
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TipRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
