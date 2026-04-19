import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Lock, Users, ArrowRight, Eye, EyeOff, Check, X, Shield, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";

interface Tenant {
  id: number;
  name: string;
  slug: string;
  ownerName: string;
  pin: string;
  needsPasswordSetup?: boolean;
}

export default function Team() {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginMode, setLoginMode] = useState<"pin" | "password">("pin");
  const [setupMode, setSetupMode] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [showPinReset, setShowPinReset] = useState(false);
  const [resetPin, setResetPin] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasCapital: /[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    matches: password === confirmPassword && password.length > 0
  };

  const allRequirementsMet = passwordRequirements.minLength && 
    passwordRequirements.hasCapital && 
    passwordRequirements.hasSpecial && 
    passwordRequirements.matches;

  const authMutation = useMutation({
    mutationFn: async (data: { pin?: string; password?: string }) => {
      const res = await fetch("/api/tenants/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Authentication failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.needsPasswordSetup) {
        // Store tenant info and show password setup screen instead of navigating away
        setTenant({ id: data.id, name: data.name, slug: data.slug, ownerName: data.ownerName, pin: data.pin });
        setSetupMode(true);
        setPin("");
        setPassword("");
        setError("");
        return;
      }
      login({ ...data, role: data.role || "owner", needsPasswordSetup: false });
      sessionStorage.setItem("showRoleSelector", "true");
      setLocation("/command-center");
    },
    onError: (error: Error) => {
      setError(error.message);
      setPin("");
      setPassword("");
    }
  });

  const setPasswordMutation = useMutation({
    mutationFn: async (data: { password: string; pin: string; tenantId: number }) => {
      const res = await fetch(`/api/tenants/${data.tenantId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.password, pin: data.pin })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to set password");
      }
      return res.json();
    },
    onSuccess: () => {
      if (tenant) {
        login({ ...tenant, role: (tenant as any).role || "owner" });
      }
      sessionStorage.setItem("showRoleSelector", "true");
      setLocation("/command-center");
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handlePinLogin = () => {
    authMutation.mutate({ pin });
  };

  const handlePasswordLogin = () => {
    authMutation.mutate({ password });
  };

  const handleSetPassword = () => {
    if (!tenant) return;
    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }
    setPasswordMutation.mutate({ 
      password, 
      pin: tenant.pin, 
      tenantId: tenant.id 
    });
  };

  const resetPasswordViaPinMutation = useMutation({
    mutationFn: async (data: { pin: string; newPassword: string }) => {
      const res = await fetch("/api/tenants/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Password reset failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setResetSuccess(true);
      setTimeout(() => {
        setShowPinReset(false);
        setResetPin("");
        setResetNewPassword("");
        setResetConfirmPassword("");
        setResetSuccess(false);
      }, 2500);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const resetPwRequirements = {
    minLength: resetNewPassword.length >= 8,
    hasCapital: /[A-Z]/.test(resetNewPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(resetNewPassword),
    matches: resetNewPassword === resetConfirmPassword && resetNewPassword.length > 0
  };

  const allResetReqsMet = resetPwRequirements.minLength && resetPwRequirements.hasCapital && resetPwRequirements.hasSpecial && resetPwRequirements.matches;

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setPin(numericValue);
    setError("");
  };

  if (setupMode && tenant) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-purple-500/[0.03] pointer-events-none" />
          <div className="relative p-6 pb-2 text-center">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Shield className="size-8 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">Secure Your Account</h2>
            <p className="text-sm text-white/50 mt-2">
              Welcome, {tenant.name}! Please create a secure password.
            </p>
          </div>
          <div className="relative p-6 pt-4 space-y-5">
            <Badge className="w-full justify-center bg-amber-500/15 text-amber-300 border-amber-500/25 py-2">
              Your PIN will still work for account recovery
            </Badge>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/30" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="pl-11 pr-11 bg-white/[0.03] border-white/[0.08] h-12 focus:border-cyan-500/40 transition-colors"
                  data-testid="input-new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/30" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  className="pl-11 bg-white/[0.03] border-white/[0.08] h-12 focus:border-cyan-500/40 transition-colors"
                  data-testid="input-confirm-password"
                />
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-xl p-3 space-y-2 border border-white/[0.06]">
              <p className="text-xs font-medium text-white/40 mb-2">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${passwordRequirements.minLength ? "text-emerald-400" : "text-white/30"}`}>
                  {passwordRequirements.minLength ? <Check className="size-3" /> : <X className="size-3" />}
                  8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRequirements.hasCapital ? "text-emerald-400" : "text-white/30"}`}>
                  {passwordRequirements.hasCapital ? <Check className="size-3" /> : <X className="size-3" />}
                  1 capital letter
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRequirements.hasSpecial ? "text-emerald-400" : "text-white/30"}`}>
                  {passwordRequirements.hasSpecial ? <Check className="size-3" /> : <X className="size-3" />}
                  1 special character
                </div>
                <div className={`flex items-center gap-1.5 ${passwordRequirements.matches ? "text-emerald-400" : "text-white/30"}`}>
                  {passwordRequirements.matches ? <Check className="size-3" /> : <X className="size-3" />}
                  Passwords match
                </div>
              </div>
            </div>

            {error && (
              <p data-testid="text-error" className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              onClick={handleSetPassword}
              disabled={!allRequirementsMet || setPasswordMutation.isPending}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-12 text-base font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              data-testid="button-set-password"
            >
              {setPasswordMutation.isPending ? "Setting Password..." : "Set Password & Continue"}
              <ArrowRight className="size-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-2xl w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] to-purple-500/[0.03] pointer-events-none" />
        <div className="relative p-6 pb-2 text-center">
          <div className="size-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Users className="size-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-transparent">Team Login</h2>
          <p className="text-sm text-white/50 mt-2">
            {loginMode === "pin" ? "Enter your 4-digit PIN to access your dashboard" : "Enter your password to login"}
          </p>
        </div>
        <div className="relative p-6 pt-4 space-y-6">
          <div className="flex gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <button
              onClick={() => { setLoginMode("pin"); setError(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                loginMode === "pin" 
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                  : "text-white/40 hover:text-white"
              }`}
              data-testid="button-pin-mode"
            >
              PIN Login
            </button>
            <button
              onClick={() => { setLoginMode("password"); setError(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                loginMode === "password" 
                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                  : "text-white/40 hover:text-white"
              }`}
              data-testid="button-password-mode"
            >
              Password
            </button>
          </div>

          {loginMode === "pin" ? (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/30" />
                <Input
                  data-testid="input-pin"
                  type="password"
                  placeholder="Enter PIN or Temp Password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === 'Enter' && pin.length >= 4 && handlePinLogin()}
                  className="pl-11 text-center text-xl tracking-[0.2em] font-mono bg-white/[0.03] border-white/[0.08] h-14 focus:border-cyan-500/40 transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-white/30" />
                <Input
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === 'Enter' && password && handlePasswordLogin()}
                  className="pl-11 pr-11 bg-white/[0.03] border-white/[0.08] h-14 focus:border-cyan-500/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <p data-testid="text-error" className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            data-testid="button-login"
            onClick={loginMode === "pin" ? handlePinLogin : handlePasswordLogin}
            disabled={(loginMode === "pin" ? pin.length < 4 : !password) || authMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-12 text-base font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            {authMutation.isPending ? "Logging in..." : "Login"} 
            <ArrowRight className="size-5 ml-2" />
          </Button>

          <button
            onClick={() => setShowPinReset(true)}
            className="w-full text-xs text-center text-cyan-400/60 hover:text-cyan-400 transition-colors"
            data-testid="link-forgot-password-pin"
          >
            Forgot Password? Use your PIN
          </button>

          <div className="pt-2">
            <Link href="/guide" className="flex items-center justify-center gap-2 w-full text-center py-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <span className="text-lg">🎧</span> Kathy's Interactive Manual
            </Link>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-white/30 text-center leading-relaxed">
              Your login stays active for 30 days on this device. Anyone with access to your phone or device can use your account. Only use on personal devices. Clearing browser data will require you to log in again.
            </p>
          </div>

          {showPinReset && (
            <div className="mt-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound className="size-4 text-cyan-400" />
                  Reset Password with PIN
                </h3>
                <button
                  onClick={() => { setShowPinReset(false); setResetPin(""); setResetNewPassword(""); setResetConfirmPassword(""); setError(""); }}
                  className="text-xs text-white/30 hover:text-white transition-colors"
                  data-testid="button-close-pin-reset"
                >
                  Cancel
                </button>
              </div>

              {resetSuccess ? (
                <div className="text-center py-4">
                  <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Check className="size-6 text-emerald-400" />
                  </div>
                  <p className="text-sm text-emerald-400 font-medium">Password reset successful!</p>
                  <p className="text-xs text-white/40 mt-1">You can now login with your new password.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs">Your 4-digit PIN</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                      <Input
                        type="password"
                        placeholder="Enter PIN or Temp Password"
                        value={resetPin}
                        onChange={(e) => { setResetPin(e.target.value); setError(""); }}
                        className="pl-10 text-center text-lg tracking-[0.2em] font-mono bg-white/[0.03] border-white/[0.08] h-12 focus:border-cyan-500/40 transition-colors"
                        data-testid="input-reset-pin"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs">New Password</Label>
                    <Input
                      type="password"
                      placeholder="New password"
                      value={resetNewPassword}
                      onChange={(e) => { setResetNewPassword(e.target.value); setError(""); }}
                      className="bg-white/[0.03] border-white/[0.08] h-11 focus:border-cyan-500/40 transition-colors"
                      data-testid="input-reset-new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs">Confirm Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={resetConfirmPassword}
                      onChange={(e) => { setResetConfirmPassword(e.target.value); setError(""); }}
                      className="bg-white/[0.03] border-white/[0.08] h-11 focus:border-cyan-500/40 transition-colors"
                      data-testid="input-reset-confirm-password"
                    />
                  </div>

                  <div className="bg-white/[0.03] rounded-xl p-3 space-y-2 border border-white/[0.06]">
                    <p className="text-xs font-medium text-white/40 mb-1">Requirements:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className={`flex items-center gap-1.5 ${resetPwRequirements.minLength ? "text-emerald-400" : "text-white/30"}`}>
                        {resetPwRequirements.minLength ? <Check className="size-3" /> : <X className="size-3" />} 8+ characters
                      </div>
                      <div className={`flex items-center gap-1.5 ${resetPwRequirements.hasCapital ? "text-emerald-400" : "text-white/30"}`}>
                        {resetPwRequirements.hasCapital ? <Check className="size-3" /> : <X className="size-3" />} 1 capital letter
                      </div>
                      <div className={`flex items-center gap-1.5 ${resetPwRequirements.hasSpecial ? "text-emerald-400" : "text-white/30"}`}>
                        {resetPwRequirements.hasSpecial ? <Check className="size-3" /> : <X className="size-3" />} 1 special char
                      </div>
                      <div className={`flex items-center gap-1.5 ${resetPwRequirements.matches ? "text-emerald-400" : "text-white/30"}`}>
                        {resetPwRequirements.matches ? <Check className="size-3" /> : <X className="size-3" />} Passwords match
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-sm text-destructive text-center" data-testid="text-reset-error">{error}</p>}

                  <Button
                    onClick={() => resetPasswordViaPinMutation.mutate({ pin: resetPin, newPassword: resetNewPassword })}
                    disabled={!allResetReqsMet || resetPin.length !== 4 || resetPasswordViaPinMutation.isPending}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-11 font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    data-testid="button-submit-pin-reset"
                  >
                    {resetPasswordViaPinMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
