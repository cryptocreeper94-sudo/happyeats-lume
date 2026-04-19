import { Link } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/glass-card";
import { useLanguage } from "@/i18n/context";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center px-4 py-12" style={{ background: "linear-gradient(180deg, #020617, #0c1222, #020617)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <GlassCard glow className="p-6 sm:p-8 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 rounded-xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
          >
            <AlertCircle className="size-8 text-red-400" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-bold text-white mb-2">404</h1>
            <h2 className="text-lg font-semibold text-white/80 mb-2">{t("errors.notFound")}</h2>
            <p className="text-sm text-white/45 mb-6 leading-relaxed">
              {t("errors.notFoundDesc")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/" className="flex-1">
              <Button
                data-testid="button-go-home"
                className="w-full min-h-[44px] bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                <Home className="size-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Link href="/explore" className="flex-1">
              <Button
                data-testid="button-explore"
                variant="outline"
                className="w-full min-h-[44px] bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70"
              >
                <Compass className="size-4 mr-2" />
                Explore
              </Button>
            </Link>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
