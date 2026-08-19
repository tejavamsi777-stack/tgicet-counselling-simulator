import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";
import Logo from "../layout/Logo";

export default function LoginModal({
  open,
  onClose,
  initialMode = "login",
  onAuthenticated,
}) {
  const { login, register, loginAsGuest, forgotPassword } = useAuth();
  const [mode, setMode] = useState(initialMode); // "login" | "register" | "forgot"
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMode(initialMode || "login");
      setError("");
      setForgotSent(false);
    }
  }, [open, initialMode]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && open) {
        onClose?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setPassword("");
    setForgotSent(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "forgot") {
      if (forgotSent) {
        switchMode("login");
        return;
      }
      setIsLoading(true);
      try {
        await forgotPassword(email);
        setForgotSent(true);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === "register") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (!firstName.trim()) {
        setError("First name is required");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ firstName, lastName, email, password });
      }
      onAuthenticated?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleGuestLogin() {
    loginAsGuest();
    onAuthenticated?.();
    onClose?.();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Frosted Liquid Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/15 backdrop-blur-md backdrop-saturate-150"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.12] bg-[#24133d]/95 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white"
          >
            {/* Subtle inner ambient glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-60 rounded-full bg-purple-500/20 blur-3xl" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header / Logo */}
            <div className="mb-5 text-center">
              <div className="mb-3 flex justify-center">
                <Logo size={42} shape="circle" variant="purple" />
              </div>

              <h2 className="text-xl font-bold tracking-tight text-white">
                {mode === "forgot"
                  ? forgotSent
                    ? "Check your email"
                    : "Forgot Password?"
                  : mode === "login"
                  ? "Welcome Back"
                  : "Create Account"}
              </h2>

              <p className="mt-1 text-xs text-white/70">
                {mode === "forgot"
                  ? forgotSent
                    ? "Check your inbox for a secure password reset link."
                    : "Enter your registered email to receive a password reset link."
                  : mode === "login"
                  ? (
                    <>
                      Sign in to continue to{" "}
                      <span className="font-semibold text-purple-300">TG Counselling</span>
                    </>
                  )
                  : "Sign up to save your predictions and college preferences"}
              </p>
            </div>

            {/* Error badge */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 p-2.5 text-xs text-red-200">
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Register name inputs */}
                {mode === "register" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/35 focus:border-purple-400/50 focus:bg-white/10 focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/35 focus:border-purple-400/50 focus:bg-white/10 focus:outline-none"
                    />
                  </div>
                )}

                {/* Email input */}
                {(!forgotSent || mode !== "forgot") && (
                  <div className="relative flex items-center">
                    <Mail
                      className={`absolute left-3.5 h-4 w-4 transition-colors ${
                        focusedInput === "email" ? "text-purple-300" : "text-white/40"
                      }`}
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput("email")}
                      onBlur={() => setFocusedInput(null)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3.5 text-xs text-white placeholder:text-white/35 transition-all focus:border-purple-400/50 focus:bg-white/10 focus:outline-none"
                      required
                    />
                  </div>
                )}

                {/* Password input */}
                {mode !== "forgot" && (
                  <div className="relative flex items-center">
                    <Lock
                      className={`absolute left-3.5 h-4 w-4 transition-colors ${
                        focusedInput === "password" ? "text-purple-300" : "text-white/40"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={mode === "register" ? "Password (min 8 chars)" : "Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput("password")}
                      onBlur={() => setFocusedInput(null)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 text-xs text-white placeholder:text-white/35 transition-all focus:border-purple-400/50 focus:bg-white/10 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}

                {/* Continue as Guest & Forgot password in Login mode */}
                {mode === "login" && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      className="group/guest inline-flex items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/15 hover:bg-purple-500/25 px-3.5 py-1.5 text-xs sm:text-[13px] font-semibold text-purple-200 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm hover:shadow-purple-500/10"
                      title="Explore instantly without creating an account"
                    >
                      <span>Continue as Guest</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        switchMode("forgot");
                      }}
                      className="text-xs font-medium text-white/70 hover:text-white transition-colors underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Forgot sent notice */}
                {mode === "forgot" && forgotSent && (
                  <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center text-xs text-white/80 leading-relaxed">
                    Check your <span className="font-semibold text-white">spam or junk</span> folder. Reset links are valid for 1 hour.
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/btn relative mt-2 w-full h-10 rounded-xl bg-white hover:bg-white/95 text-black text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-slate-900" />
                      <span>Please wait…</span>
                    </div>
                  ) : (
                    <>
                      <span>
                        {mode === "forgot"
                          ? forgotSent
                            ? "Back to Sign In"
                            : "Send Reset Link"
                          : mode === "login"
                          ? "Sign In"
                          : "Create Account"}
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>

                {/* Divider & Google Sign In */}
                {mode !== "forgot" && (
                  <>
                    <div className="relative my-2.5 flex items-center">
                      <div className="flex-grow border-t border-white/10" />
                      <span className="mx-3 text-[11px] text-white/40">or</span>
                      <div className="flex-grow border-t border-white/10" />
                    </div>

                    <div className="flex justify-center">
                      <GoogleSignInButton
                        onSuccess={() => {
                          onAuthenticated?.();
                          onClose?.();
                        }}
                        onError={(msg) => setError(msg)}
                      />
                    </div>
                  </>
                )}

                {/* Mode Switcher Footer */}
                <div className="mt-3 text-center text-xs text-white/60">
                  {mode === "forgot" ? (
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-medium text-white hover:underline cursor-pointer"
                    >
                      Remember your password? Sign in
                    </button>
                  ) : mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="font-semibold text-white hover:underline cursor-pointer"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="font-semibold text-white hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}