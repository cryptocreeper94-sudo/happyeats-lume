import { useState } from "react";
import { HelpCircle, X, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/context";

interface InfoBubbleProps {
  title: { en: string; es: string };
  content: { en: string; es: string };
  link?: { href: string; label: { en: string; es: string } };
  manualSection?: string;
  size?: "sm" | "md";
}

export function InfoBubble({ title, content, link, manualSection, size = "sm" }: InfoBubbleProps) {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className={`inline-flex items-center justify-center rounded-full text-white/30 hover:text-orange-400 hover:bg-orange-500/10 transition-all ${
          size === "sm" ? "size-5" : "size-6"
        }`}
        data-testid={`info-bubble-${title.en.toLowerCase().replace(/\s+/g, '-')}`}
        aria-label={`Help: ${title[lang]}`}
      >
        <HelpCircle className={size === "sm" ? "size-3.5" : "size-4"} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-gradient-to-br from-[#0d1f35] to-[#162840] border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 pb-3 bg-gradient-to-b from-[#0d1f35] to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <HelpCircle className="size-4 text-orange-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{title[lang]}</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="size-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                  data-testid="button-close-info"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="w-12 h-1 rounded-full bg-white/10 mx-auto -mt-1 mb-3 sm:hidden" />

              <div className="px-4 pb-4 space-y-3">
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{content[lang]}</p>

                {(link || manualSection) && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    {link && (
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/15 transition-all text-xs font-medium"
                        data-testid="link-info-action"
                      >
                        <ExternalLink className="size-3.5 shrink-0" />
                        {link.label[lang]}
                      </Link>
                    )}
                    {manualSection && (
                      <Link
                        href={`/operations-manual?section=${manualSection}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all text-xs font-medium"
                        data-testid="link-info-manual"
                      >
                        <HelpCircle className="size-3.5 shrink-0" />
                        {lang === "es" ? "Ver en el Manual de Operaciones" : "View in Operations Manual"}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
