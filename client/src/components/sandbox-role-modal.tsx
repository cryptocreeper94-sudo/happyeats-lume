import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, ChefHat, Shield, ArrowRight, Sparkles, X, Truck } from "lucide-react";

interface SandboxRoleModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_PAGES_KEY = "sandbox-role-pages";

const CUSTOMER_PREFIXES = ["/order", "/sandbox", "/tracking", "/kitchen", "/menu/", "/explore"];
const VENDOR_PREFIXES = ["/vendor-portal", "/vendor-orders", "/vendor-menu", "/vendor/", "/vendors"];
const DRIVER_PREFIXES = ["/driver-orders", "/driver/"];
const ADMIN_PREFIXES = ["/command-center", "/invite-codes", "/operations-manual", "/marketing", "/team", "/developer", "/zones", "/franchise", "/affiliate", "/investors"];

function getRoleFromPath(path: string): "customer" | "vendor" | "driver" | "admin" {
  if (VENDOR_PREFIXES.some(p => path.startsWith(p))) return "vendor";
  if (DRIVER_PREFIXES.some(p => path.startsWith(p))) return "driver";
  if (CUSTOMER_PREFIXES.some(p => path.startsWith(p))) return "customer";
  if (ADMIN_PREFIXES.some(p => path.startsWith(p))) return "admin";
  return "admin";
}

function getSavedPages(): Record<string, string> {
  try { const s = sessionStorage.getItem(ROLE_PAGES_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}

function savePage(role: string, path: string) {
  const pages = getSavedPages();
  pages[role] = path;
  sessionStorage.setItem(ROLE_PAGES_KEY, JSON.stringify(pages));
}

const roles = [
  {
    id: "customer",
    label: "Customer",
    description: "Browse menus, place orders, and track deliveries",
    icon: ShoppingCart,
    gradient: "from-orange-500 to-rose-500",
    glow: "shadow-[0_0_30px_rgba(249,115,22,0.4)]",
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    defaultHref: "/sandbox",
  },
  {
    id: "vendor",
    label: "Vendor",
    description: "Manage your truck, menus, and incoming orders",
    icon: ChefHat,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.4)]",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    defaultHref: "/vendor-portal",
  },
  {
    id: "driver",
    label: "Driver",
    description: "Follow delivery routes and manage live runs",
    icon: Truck,
    gradient: "from-cyan-500 to-blue-500",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.4)]",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10",
    defaultHref: "/driver-orders/i24-corridor",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Full command center — operations, analytics, and settings",
    icon: Shield,
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.4)]",
    border: "border-violet-500/40",
    bg: "bg-violet-500/10",
    defaultHref: "/command-center",
  },
];

export function SandboxRoleModal({ open, onClose }: SandboxRoleModalProps) {
  const [location, setLocation] = useLocation();

  const handleRoleSelect = (roleId: string, defaultHref: string) => {
    const currentRole = getRoleFromPath(location);
    savePage(currentRole, location);

    const saved = getSavedPages();
    const targetPath = saved[roleId] || defaultHref;

    onClose();
    if (targetPath !== location) {
      setLocation(targetPath);
    }
  };

  if (!open) return null;

  const savedPages = getSavedPages();
  const currentRole = getRoleFromPath(location);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-testid="sandbox-role-modal"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg"
          >
            <div className="backdrop-blur-xl bg-gradient-to-br from-[#0d1f35]/95 to-[#162840]/95 border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-orange-500/5 pointer-events-none" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                data-testid="button-close-role-modal"
              >
                <X className="size-4 text-white/60" />
              </button>

              <div className="relative p-6 pb-2 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-orange-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4"
                >
                  <Sparkles className="size-7 text-white/80" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-1">Choose Your Role</h2>
                <p className="text-sm text-white/50">Experience the sandbox as any user type</p>
              </div>

              <div className="relative p-6 pt-4 space-y-3">
                {roles.map((role, i) => {
                  const Icon = role.icon;
                  const isActive = role.id === currentRole;
                  const savedPath = savedPages[role.id];
                  const resumeLabel = savedPath && savedPath !== role.defaultHref
                    ? savedPath.split("/").filter(Boolean).join(" / ")
                    : null;

                  return (
                    <motion.button
                      key={role.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role.id, role.defaultHref)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl backdrop-blur-md ${role.bg} border ${isActive ? "border-white/30 ring-1 ring-white/10" : role.border} hover:border-white/30 transition-all duration-200 group cursor-pointer text-left`}
                      data-testid={`button-role-${role.id}`}
                    >
                      <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center ${role.glow} group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="size-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white group-hover:text-white/90">{role.label}</h3>
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">Current</span>
                          )}
                        </div>
                        <p className="text-xs text-white/45 group-hover:text-white/60 transition-colors">{role.description}</p>
                        {resumeLabel && !isActive && (
                          <p className="text-[10px] text-white/30 mt-0.5 truncate">Resume: /{resumeLabel}</p>
                        )}
                      </div>
                      <ArrowRight className="size-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all shrink-0" />
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative px-6 pb-5 pt-1">
                <p className="text-center text-[10px] text-white/30">Sandbox mode — no real charges or data affected</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
