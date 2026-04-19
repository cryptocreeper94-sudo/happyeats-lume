import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, Mail, Lock, Building2, MapPin, ChevronRight, Truck, Star, Gift, ShoppingBag } from "lucide-react";
import customerSigninImg from "@/assets/images/customer-signin.jpg";

type AuthMode = "signin" | "signup";
type ForgotStep = "phone" | "code" | "newPassword" | "done";

function useCustomerSession() {
  const getSession = () => {
    try {
      const raw = localStorage.getItem("happyeats_customer") || sessionStorage.getItem("happyeats_customer");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };
  const getToken = (): string | null => localStorage.getItem("happyeats_token") || sessionStorage.getItem("happyeats_token");
  const setSession = (customer: any, token?: string, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("happyeats_customer", JSON.stringify(customer));
    if (token) storage.setItem("happyeats_token", token);
  };
  const clearSession = () => {
    localStorage.removeItem("happyeats_customer");
    localStorage.removeItem("happyeats_token");
    sessionStorage.removeItem("happyeats_customer");
    sessionStorage.removeItem("happyeats_token");
  };
  return { getSession, getToken, setSession, clearSession };
}

export { useCustomerSession };

export default function CustomerAuth() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<AuthMode>("signin");
  const { setSession } = useCustomerSession();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    accountType: "individual" as "individual" | "business",
    businessName: "",
    deliveryAddress: "",
    deliveryInstructions: "",
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: form.name,
        phone: form.phone.replace(/\D/g, ""),
        email: form.email || undefined,
        accountType: form.accountType,
        passwordHash: form.password,
      };
      if (form.accountType === "business" && form.businessName) payload.businessName = form.businessName;
      if (form.deliveryAddress) payload.deliveryAddress = form.deliveryAddress;
      if (form.deliveryInstructions) payload.deliveryInstructions = form.deliveryInstructions;
      payload.rememberMe = rememberMe;
      const res = await apiRequest("POST", "/api/customers/register", payload);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSession(data.customer, data.token, rememberMe);
        toast({ title: "Account created!", description: "Welcome to Happy Eats" });
        navigate("/account");
      } else {
        toast({ title: "Registration failed", description: data.error, variant: "destructive" });
      }
    },
    onError: (err: any) => {
      const msg = err?.message || "Registration failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customers/login", {
        phone: form.phone.replace(/\D/g, ""),
        password: form.password,
        rememberMe,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setSession(data.customer, data.token, rememberMe);
        toast({ title: "Welcome back!" });
        navigate("/account");
      } else {
        toast({ title: "Login failed", description: data.error, variant: "destructive" });
      }
    },
    onError: (err: any) => {
      const msg = err?.message || "Login failed";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customers/forgot-password", {
        phone: forgotPhone.replace(/\D/g, ""),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Reset code sent!", description: "Check your phone for the 6-digit code" });
        setForgotStep("code");
      } else {
        toast({ title: "Failed", description: data.error || "Could not send reset code", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to send reset code", variant: "destructive" });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/customers/reset-password", {
        phone: forgotPhone.replace(/\D/g, ""),
        resetCode,
        newPassword,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Password reset!", description: "You can now sign in with your new password" });
        setForgotStep("done");
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep("phone");
          setForgotPhone("");
          setResetCode("");
          setNewPassword("");
        }, 2000);
      } else {
        toast({ title: "Reset failed", description: data.error || "Invalid code or phone", variant: "destructive" });
      }
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Password reset failed", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone) return toast({ title: "Phone number required", variant: "destructive" });
    if (mode === "signup") {
      if (!form.name) return toast({ title: "Name required", variant: "destructive" });
      if (!form.password || form.password.length < 4) return toast({ title: "Password must be at least 4 characters", variant: "destructive" });
      registerMutation.mutate();
    } else {
      loginMutation.mutate();
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending;

  const benefits = [
    { icon: ShoppingBag, label: "Track all your orders" },
    { icon: Star, label: "Rate vendors & drivers" },
    { icon: Gift, label: "Earn rewards every 10 orders" },
    { icon: Truck, label: "Save delivery addresses" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={customerSigninImg} alt="" className="w-full h-64 object-cover brightness-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/60 via-[#0f172a]/90 to-[#0f172a]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-12">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors" data-testid="link-back-home">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 mb-4 shadow-lg shadow-orange-500/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {mode === "signin" ? "Sign in to your Happy Eats account" : "Join Happy Eats and start ordering"}
            </p>
          </div>

          <GlassCard glow className="p-6 mb-4">
            <div className="flex rounded-lg bg-white/[0.04] border border-white/[0.08] p-1 mb-6">
              {(["signin", "signup"] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md" : "text-white/50 hover:text-white/80"}`}
                  data-testid={`button-${m}`}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div key="signup-fields" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="space-y-4 overflow-hidden">
                    <div>
                      <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name
                      </Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Email (optional)
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> Account Type
                      </Label>
                      <div className="flex gap-2">
                        {(["individual", "business"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm({ ...form, accountType: type })}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${form.accountType === type ? "border-orange-500/50 bg-orange-500/10 text-orange-400" : "border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white/70"}`}
                            data-testid={`button-type-${type}`}
                          >
                            {type === "individual" ? "Personal" : "Business"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {form.accountType === "business" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> Business Name
                        </Label>
                        <Input
                          value={form.businessName}
                          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                          placeholder="Your company name"
                          className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                          data-testid="input-business-name"
                        />
                      </motion.div>
                    )}

                    <div>
                      <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Delivery Address (optional)
                      </Label>
                      <Input
                        value={form.deliveryAddress}
                        onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                        placeholder="123 Main St, Lebanon TN 37087"
                        className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                        data-testid="input-address"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </Label>
                <Input
                  value={formatPhone(form.phone)}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="(615) 555-1234"
                  className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={mode === "signin" ? "Enter password" : "Create a password (4+ chars)"}
                  className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                  data-testid="input-password"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer group" data-testid="label-sms-consent">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.06] text-orange-500 focus:ring-orange-500/30 cursor-pointer"
                  data-testid="checkbox-sms-consent"
                />
                <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                  I agree to receive SMS order updates & notifications.{" "}
                  <a href="/sms-consent" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">
                    SMS Consent Policy
                  </a>
                  . Msg & data rates may apply. Reply STOP to cancel.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer group" data-testid="label-remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.06] text-orange-500 focus:ring-orange-500/30 cursor-pointer"
                />
                <span className="text-xs text-white/50 leading-relaxed group-hover:text-white/70 transition-colors">
                  Keep me signed in for 30 days
                  <span className="block text-[10px] text-white/30 mt-0.5">Anyone with access to this device can use your account. Only use on personal devices.</span>
                </span>
              </label>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all"
                data-testid="button-submit"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "signin" ? "Sign In" : "Create Account"}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>

              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="w-full text-center text-xs text-orange-400/70 hover:text-orange-400 transition-colors mt-2"
                  data-testid="link-forgot-password"
                >
                  Forgot password?
                </button>
              )}
            </form>
          </GlassCard>

          <AnimatePresence>
            {showForgot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard glow className="p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-400" />
                      Reset Password
                    </h3>
                    <button
                      onClick={() => { setShowForgot(false); setForgotStep("phone"); setForgotPhone(""); setResetCode(""); setNewPassword(""); }}
                      className="text-white/40 hover:text-white text-xs"
                      data-testid="button-close-forgot"
                    >
                      Cancel
                    </button>
                  </div>

                  {forgotStep === "phone" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">Enter your phone number to receive a reset code.</p>
                      <div>
                        <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> Phone Number
                        </Label>
                        <Input
                          value={formatPhone(forgotPhone)}
                          onChange={(e) => setForgotPhone(e.target.value)}
                          placeholder="(615) 555-1234"
                          className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                          data-testid="input-forgot-phone"
                        />
                      </div>
                      <Button
                        onClick={() => forgotPasswordMutation.mutate()}
                        disabled={!forgotPhone || forgotPasswordMutation.isPending}
                        className="w-full h-10 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm"
                        data-testid="button-send-code"
                      >
                        {forgotPasswordMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Send Reset Code"}
                      </Button>
                    </div>
                  )}

                  {forgotStep === "code" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">Enter the 6-digit code sent to your phone.</p>
                      <div>
                        <Label className="text-white/70 text-xs mb-1.5">Reset Code</Label>
                        <Input
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11 text-center text-lg tracking-[0.3em] font-mono"
                          data-testid="input-reset-code"
                        />
                      </div>
                      <Button
                        onClick={() => { if (resetCode.length === 6) setForgotStep("newPassword"); }}
                        disabled={resetCode.length !== 6}
                        className="w-full h-10 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm"
                        data-testid="button-verify-code"
                      >
                        Verify Code
                      </Button>
                    </div>
                  )}

                  {forgotStep === "newPassword" && (
                    <div className="space-y-3">
                      <p className="text-xs text-white/50">Create your new password.</p>
                      <div>
                        <Label className="text-white/70 text-xs mb-1.5 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" /> New Password
                        </Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/30 h-11"
                          data-testid="input-new-password"
                        />
                      </div>
                      <Button
                        onClick={() => resetPasswordMutation.mutate()}
                        disabled={!newPassword || newPassword.length < 4 || resetPasswordMutation.isPending}
                        className="w-full h-10 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm"
                        data-testid="button-reset-password"
                      >
                        {resetPasswordMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Reset Password"}
                      </Button>
                    </div>
                  )}

                  {forgotStep === "done" && (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <ChevronRight className="w-6 h-6 text-green-400" />
                      </div>
                      <p className="text-sm text-green-400 font-medium">Password reset successful!</p>
                      <p className="text-xs text-white/40 mt-1">Returning to sign in...</p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "signup" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <GlassCard className="p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Why create an account?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <b.icon className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-xs text-white/70">{b.label}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          <p className="text-center text-white/40 text-xs mt-4">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-orange-400 hover:text-orange-300 transition-colors"
              data-testid="link-toggle-mode"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}