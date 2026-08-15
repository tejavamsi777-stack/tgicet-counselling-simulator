import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/shared/GoogleSignInButton";
import Logo from "../components/layout/Logo";
import { cn } from "../lib/utils";

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export default function LoginPage({ initialMode }) {
  const { user, loading, login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(() => {
    if (initialMode) return initialMode;
    if (location.pathname === "/forgot-password") return "forgot";
    return "login";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === "/forgot-password") {
      setMode("forgot");
    } else if (location.pathname === "/login" && mode === "forgot") {
      setMode("login");
    }
  }, [location.pathname]);

  const redirectTo = location.state?.from?.pathname || "/";

  if (!loading && user && !success) {
    return <Navigate to={redirectTo} replace />;
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setPassword("");
    setForgotSent(false);
    if (newMode === "login") {
      setFirstName("");
      setLastName("");
      if (location.pathname === "/forgot-password") {
        navigate("/login", { replace: true });
      }
    } else if (newMode === "forgot") {
      if (location.pathname !== "/forgot-password") {
        navigate("/forgot-password", { replace: true });
      }
    }
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
      setSuccess(true);
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-black selection:bg-purple-500 selection:text-white px-4 py-10">
      {/* Background gradient effect - exact vibrant purple from screenshot */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Top & bottom radial glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[60vh] w-[120vh] -translate-x-1/2 rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[90vh] w-[90vh] -translate-x-1/2 rounded-t-full bg-purple-400/20 blur-[60px]" />

      {/* Back to website button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300 transition hover:text-white"
        >
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </div>

      {/* Static Transparent Glass Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="group relative">
          {/* Card border glow */}
          <div className="pointer-events-none absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 opacity-70" />

          {/* Frosted Transparent Glass Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 p-6 shadow-2xl backdrop-blur-xl">
            {/* Inner subtle grid pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                backgroundSize: "30px 30px",
              }}
            />

            {/* Logo & Header */}
            <div className="mb-5 text-center">
              <div className="relative mx-auto mb-3 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-[#312e81]/80 via-[#7c3aed]/80 to-[#0e7490]/80 shadow-md shadow-purple-500/20">
                <Logo size={24} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-40" />
              </div>

              <h1 className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-xl font-bold text-transparent">
                {success
                  ? "You're in!"
                  : mode === "forgot"
                  ? forgotSent
                    ? "Check your email"
                    : "Forgot Password?"
                  : mode === "login"
                  ? "Welcome Back"
                  : "Create Account"}
              </h1>

              <p className="mt-2 text-xs text-white/70 leading-normal">
                {success
                  ? "Taking you to your predictions..."
                  : mode === "forgot"
                  ? forgotSent
                    ? "If an account exists with that email, we've sent you a secure reset link."
                    : "Enter your registered email to receive a password reset link."
                  : mode === "login"
                  ? <>Sign in to continue to <span className="font-semibold text-purple-300">TG Counselling</span></>
                  : "Sign up to save your predictions across devices"}
              </p>
            </div>

            {/* Error badge */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/15 p-2.5 text-xs text-red-200">
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Register Name Inputs */}
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-10 border-transparent bg-white/5 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10"
                      required
                    />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-10 border-transparent bg-white/5 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10"
                    />
                  </motion.div>
                )}

                {/* Email Input */}
                {(!forgotSent || mode !== "forgot") && (
                  <div className="relative">
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Mail
                        className={`absolute left-3 h-4 w-4 transition-colors duration-300 ${
                          focusedInput === "email" ? "text-white" : "text-white/40"
                        }`}
                      />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput("email")}
                        onBlur={() => setFocusedInput(null)}
                        className="h-10 w-full border border-transparent bg-white/5 pl-10 pr-3 text-white placeholder:text-white/30 transition-all duration-300 focus:border-white/20 focus:bg-white/10"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password Input (Only for login and register) */}
                {mode !== "forgot" && (
                  <div className="relative">
                    <div className="relative flex items-center overflow-hidden rounded-lg">
                      <Lock
                        className={`absolute left-3 h-4 w-4 transition-colors duration-300 ${
                          focusedInput === "password" ? "text-white" : "text-white/40"
                        }`}
                      />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={mode === "register" ? "Create Password (min 8 chars)" : "Password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput(null)}
                        className="h-10 w-full border border-transparent bg-white/5 pl-10 pr-10 text-white placeholder:text-white/30 transition-all duration-300 focus:border-white/20 focus:bg-white/10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 text-white/40 transition-colors duration-300 hover:text-white cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember me & Forgot password in Login mode */}
                {mode === "login" && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <div className="relative flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                          className="h-4 w-4 appearance-none rounded border border-white/20 bg-white/5 transition-all duration-200 checked:border-white checked:bg-white focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
                        />
                        {rememberMe && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-black">
                            <Check size={11} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="remember-me"
                        className="cursor-pointer text-xs text-white/60 transition-colors duration-200 hover:text-white/80"
                      >
                        Remember me
                      </label>
                    </div>

                    <div className="relative z-30 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          switchMode("forgot");
                        }}
                        className="relative z-30 cursor-pointer text-xs font-medium text-white/70 hover:text-white transition-colors underline py-1 px-1"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                )}

                {/* Forgot sent confirmation notice */}
                {mode === "forgot" && forgotSent && (
                  <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-center text-xs text-white/80 leading-relaxed">
                    Check your <span className="font-semibold text-white">spam or junk</span> folder. Links are valid for 1 hour.
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group/button relative mt-4 w-full cursor-pointer"
                >
                  <div className="absolute inset-0 rounded-lg bg-white/10 blur-lg opacity-0 transition-opacity duration-300 group-hover/button:opacity-70" />
                  <div className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded-lg bg-white text-sm font-medium text-black transition-all duration-300">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={16} className="animate-spin text-slate-900" />
                          <span>Please wait…</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-sm font-semibold">
                          {mode === "forgot"
                            ? forgotSent
                              ? "Back to Sign In"
                              : "Send Reset Link"
                            : mode === "login"
                            ? "Sign In"
                            : "Create Account"}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </span>
                      )}
                    </AnimatePresence>
                  </div>
                </button>

                {/* Divider and Google Sign In (for login and register) */}
                {mode !== "forgot" && (
                  <>
                    <div className="relative my-3 flex items-center">
                      <div className="flex-grow border-t border-white/10" />
                      <span className="mx-3 text-xs text-white/40">or</span>
                      <div className="flex-grow border-t border-white/10" />
                    </div>

                    <div className="flex justify-center">
                      <GoogleSignInButton
                        onStart={() => setGoogleLoading(true)}
                        onSuccess={() => {
                          setSuccess(true);
                          setTimeout(() => navigate(redirectTo, { replace: true }), 1000);
                        }}
                        onError={(msg) => {
                          setGoogleLoading(false);
                          setError(msg);
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Switch mode links */}
                <div className="mt-4 text-center text-xs text-white/60">
                  {mode === "forgot" ? (
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="group/back relative inline-block font-medium text-white transition-colors duration-300 hover:text-white/80 cursor-pointer"
                    >
                      <span className="relative z-10">Remember your password? Sign in</span>
                      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover/back:w-full" />
                    </button>
                  ) : mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("register")}
                        className="group/signup relative inline-block font-medium text-white transition-colors duration-300 hover:text-white/80 cursor-pointer"
                      >
                        <span className="relative z-10">Sign up</span>
                        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover/signup:w-full" />
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="group/login relative inline-block font-medium text-white transition-colors duration-300 hover:text-white/80 cursor-pointer"
                      >
                        <span className="relative z-10">Log in</span>
                        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover/login:w-full" />
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}