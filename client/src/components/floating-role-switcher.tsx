import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { SandboxRoleModal } from "./sandbox-role-modal";

export function FloatingRoleSwitcher() {
  const { isAuthenticated, user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!isAuthenticated || !user || !["owner", "developer"].includes(user.role)) return null;

  return (
    <>
      <SandboxRoleModal open={showModal} onClose={() => setShowModal(false)} />
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 md:bottom-6 left-4 z-50 w-11 h-11 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center border border-violet-400/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-shadow"
          data-testid="button-floating-role-switch"
          title="Switch Role"
        >
          <Sparkles className="size-5 text-white" />
        </motion.button>
      </AnimatePresence>
    </>
  );
}
