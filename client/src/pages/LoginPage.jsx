import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/shared/GoogleSignInButton";

// --- CLEAN, STUDIO-GRADE ANIMATED MONSTERS (DESKTOP ONLY) ---
function AnimatedMonsters({ emailFocused, passwordFocused, showPassword, success }) {
  // 1. Live Mouse Tracking across the screen
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Determine active animation state
  let animationState = "default";
  if (success) {
    animationState = "success";
  } else if (passwordFocused && !showPassword) {
    animationState = "hidePassword"; // Smooth tilt away for privacy
  } else if (passwordFocused && showPassword) {
    animationState = "showPassword"; // Curious forward tilt when revealed
  } else if (emailFocused) {
    animationState = "email"; // Eager lean toward the email input
  }

  // Smooth, organic spring physics
  const springTransition = { type: "spring", stiffness: 140, damping: 14, mass: 1 };
  const eyeSpring = { type: "spring", stiffness: 250, damping: 16 };
  const mouthSpring = { type: "spring", stiffness: 200, damping: 14 };

  // Overall character group tilting mechanics (Bug-free curves)
  const containerVariants = {
    default: { x: 0, y: 0, rotate: 0, scale: 1 },
    email: { x: 35, y: 5, rotate: 7, scale: 1.04 },
    hidePassword: { x: -45, y: 12, rotate: -12, scale: 0.95 },
    showPassword: { x: 15, y: -5, rotate: 3, scale: 1.05 },
    success: { x: 0, y: -30, rotate: 0, scale: 1.08 },
  };

  // Parallax layering so characters move independently with natural depth
  const tallPinkVariants = {
    default: { x: 0, rotate: 0 },
    email: { x: -10, rotate: -3 },
    hidePassword: { x: 20, rotate: 6 },
    showPassword: { x: -5, rotate: -1 },
    success: { y: -20 },
  };

  const frontMonsterVariants = {
    default: { x: 0, y: 0 },
    email: { x: 14, y: -5 },
    hidePassword: { x: -18, y: 8 },
    showPassword: { x: 8, y: -8 },
    success: { y: -25, scale: 1.08 },
  };

  // 2. Natural Eye Tracking (Looks down and away respectfully during password entry)
  const getEyeOffset = () => {
    if (animationState === "success") return { x: 0, y: -6 };
    if (animationState === "hidePassword") return { x: -14, y: 10 }; // Look down & away
    if (animationState === "showPassword") return { x: 8, y: -2 }; // Look toward form
    if (animationState === "email") {
      return { x: 10 + mousePos.x * 3, y: 2 + mousePos.y * 3 };
    }
    return { x: mousePos.x * 12, y: mousePos.y * 10 };
  };

  const eyeOffset = getEyeOffset();

  // 3. Clean, Glitch-Free Mouth Morphing Paths
  const getPinkMouthPath = () => {
    switch (animationState) {
      case "success": return "M 220 215 Q 255 260 285 215 Z"; // Big happy celebration smile
      case "hidePassword": return "M 248 235 A 7 7 0 0 1 262 235 Z"; // Cute, tiny surprised "Ooh" mouth
      case "showPassword": return "M 238 230 Q 255 245 272 230 Z"; // Curious grin
      case "email": return "M 240 230 A 18 18 0 0 1 275 230 Z"; // Wide eager smile
      default: return "M 240 230 A 15 15 0 0 1 270 230 Z"; // Resting smile
    }
  };

  return (
    <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-visible my-auto">
      <motion.div
        className="w-[85%] max-w-[440px] origin-bottom"
        style={{ height: "auto" }}
        variants={containerVariants}
        initial="default"
        animate={animationState}
        transition={springTransition}
      >
        <svg viewBox="0 0 300 350" className="h-auto w-full drop-shadow-2xl overflow-visible" xmlns="http://www.w3.org/2000/svg">
          {/* Studio Gradients for 3D Polish */}
          <defs>
            <linearGradient id="tallPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#de5285" />
              <stop offset="100%" stopColor="#b8325f" />
            </linearGradient>
            <linearGradient id="bigPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5b8d5" />
              <stop offset="100%" stopColor="#e391b8" />
            </linearGradient>
            <linearGradient id="tealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#96d8da" />
              <stop offset="100%" stopColor="#68b5b8" />
            </linearGradient>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ca0ff" />
              <stop offset="100%" stopColor="#1f5bc0" />
            </linearGradient>
          </defs>

          {/* 1. Tall Red/Pink Monster (Back Layer) */}
          <motion.g id="tall-pink" variants={tallPinkVariants} transition={springTransition}>
            <path d="M 40 55 L 180 55 A 25 25 0 0 1 205 80 A 25 25 0 0 1 180 105 L 110 105 L 90 350 L 55 350 L 75 105 L 40 105 A 25 25 0 0 1 15 80 A 25 25 0 0 1 40 55 Z" fill="url(#tallPinkGrad)" />
            <circle cx="120" cy="45" r="14" fill="#fff" />
            <motion.circle cx="122" cy="45" r="6" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="155" cy="45" r="14" fill="#fff" />
            <motion.circle cx="153" cy="45" r="6" fill="#222" animate={eyeOffset} transition={eyeSpring} />
          </motion.g>

          {/* 2. Big Light Pink Monster (Right Midground) */}
          <motion.g id="big-pink" transition={springTransition}>
            <path d="M 140 350 L 140 160 A 80 80 0 0 1 300 160 L 300 350 Z" fill="url(#bigPinkGrad)" />
            <circle cx="230" cy="180" r="32" fill="#fff" />
            <motion.circle cx="235" cy="180" r="16" fill="#333" animate={{ x: eyeOffset.x * 1.5, y: eyeOffset.y * 1.5 }} transition={eyeSpring} />
            <circle cx="240" cy="173" r="5" fill="#fff" />
            
            {/* Subtle Blushing Cheek when shy */}
            <motion.circle cx="195" cy="210" r="14" fill="#e06c9f" animate={{ opacity: animationState === "hidePassword" ? 0.5 : 0 }} transition={springTransition} />

            {/* Clean, Glitch-Free Mouth Morphing */}
            <motion.path d={getPinkMouthPath()} fill="#7a3b58" animate={{ d: getPinkMouthPath() }} transition={mouthSpring} />
            
            {/* Teeth hide neatly during "Ooh" mouth or success smile */}
            <motion.g animate={{ opacity: animationState === "hidePassword" || animationState === "success" ? 0 : 1 }} transition={{ duration: 0.15 }}>
              <rect x="246" y="228" width="6" height="8" rx="2" fill="#fff" />
              <rect x="256" y="228" width="6" height="8" rx="2" fill="#fff" />
            </motion.g>
          </motion.g>

          {/* 3. Teal Fluffy Monster (Left Foreground) */}
          <motion.g id="teal-fluff" variants={frontMonsterVariants} transition={springTransition}>
            <path d="M 50 350 L 70 240 L 100 240 L 80 350 Z" fill="#68b5b8" />
            <path d="M 20 350 L 60 240 L 80 240 L 40 350 Z" fill="#4d9699" />
            <circle cx="75" cy="210" r="45" fill="url(#tealGrad)" />
            <circle cx="40" cy="190" r="20" fill="url(#tealGrad)" />
            <circle cx="45" cy="225" r="20" fill="url(#tealGrad)" />
            <circle cx="110" cy="190" r="20" fill="url(#tealGrad)" />
            <circle cx="105" cy="225" r="20" fill="url(#tealGrad)" />
            <circle cx="75" cy="165" r="20" fill="url(#tealGrad)" />
            
            <circle cx="60" cy="195" r="12" fill="#fff" />
            <motion.circle cx="62" cy="195" r="5" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="90" cy="195" r="12" fill="#fff" />
            <motion.circle cx="88" cy="195" r="5" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            
            {/* Clean Mouth Morphing */}
            <motion.rect 
              x="60" y="215" width="30" fill="#2d5e60" 
              animate={{ 
                height: animationState === "success" ? 22 : animationState === "hidePassword" ? 6 : animationState === "showPassword" ? 20 : 16, 
                y: animationState === "success" ? 210 : animationState === "hidePassword" ? 220 : 215,
                rx: animationState === "hidePassword" ? 3 : 8,
                width: animationState === "hidePassword" ? 22 : 30,
                x: animationState === "hidePassword" ? 64 : 60
              }} 
              transition={mouthSpring} 
            />
          </motion.g>

          {/* 4. Blue Round Monster (Bottom Center Foreground) */}
          <motion.g id="blue-round" variants={frontMonsterVariants} transition={springTransition}>
            <path d="M 115 350 L 130 280 L 150 280 L 135 350 Z" fill="#1f5bc0" />
            <path d="M 165 350 L 165 280 L 185 280 L 185 350 Z" fill="#2d6ecf" />
            <circle cx="160" cy="270" r="48" fill="url(#blueGrad)" />
            
            <circle cx="145" cy="255" r="13" fill="#fff" />
            <motion.circle cx="148" cy="255" r="6" fill="#111" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="175" cy="250" r="13" fill="#fff" />
            <motion.circle cx="172" cy="250" r="6" fill="#111" animate={eyeOffset} transition={eyeSpring} />
            
            <motion.circle 
              cx="185" cy="278" fill="#0f347a" 
              animate={{ 
                r: animationState === "success" ? 15 : animationState === "hidePassword" ? 5 : animationState === "email" ? 11 : 8,
                cy: animationState === "success" ? 275 : 278
              }} 
              transition={mouthSpring} 
            />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
}

// --- MAIN LOGIN PAGE COMPONENT ---
export default function LoginPage() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  if (!loading && user && !success) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1100);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-row bg-slate-50">
      
      {/* LEFT PANEL: Characters — HIDDEN ON MOBILE (hidden lg:flex) so login form is immediately visible! */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden bg-slate-50 p-12 text-slate-900 shrink-0 min-h-screen">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full flex-1 flex-col justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] text-white shadow-md">
              <Sparkles size={18} />
            </div>
            TG Counselling
          </Link>

          {/* Centered wrapper for the characters */}
          <div className="flex flex-1 items-center justify-center py-4">
            <AnimatedMonsters
              emailFocused={emailFocused}
              passwordFocused={passwordFocused}
              showPassword={showPassword}
              success={success}
            />
          </div>

          <p className="text-sm text-slate-400">TG ICET · MBA &amp; MCA Counselling</p>
        </div>
      </div>

      {/* RIGHT PANEL: Form — Takes 100% screen width on Mobile, 50% on Desktop */}
      <div className="flex w-full lg:w-1/2 flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] px-6 py-10 min-h-screen">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {!success && (
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold leading-snug tracking-tight text-white">
                Your rank, Your future.
              </h1>
            </div>
          )}

          <h2 className="text-center text-2xl font-bold tracking-tight text-white">
            {success ? "You're in!" : mode === "login" ? "Welcome back!" : "Create your account"}
          </h2>
          <p className="mt-1.5 text-center text-sm text-white/70">
            {success
              ? "Taking you to your dashboard..."
              : mode === "login"
              ? "Sign in to continue to your predictions."
              : "Sign up to start predicting and save your progress."}
          </p>

          {!success && (
            <>
              <div className="mt-6">
                <GoogleSignInButton
                  onSuccess={() => {
                    setSuccess(true);
                    setTimeout(() => navigate(redirectTo, { replace: true }), 1100);
                  }}
                  onError={setError}
                />
              </div>

              <div className="my-6 flex items-center gap-3 text-xs text-white/50">
                <div className="h-px flex-1 bg-white/20" />
                or
                <div className="h-px flex-1 bg-white/20" />
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-2.5 text-sm text-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <input
                    type="text"
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => { setEmailFocused(true); setPasswordFocused(false); }}
                  onBlur={() => setEmailFocused(false)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Create password" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => { setPasswordFocused(true); setEmailFocused(false); }}
                    onBlur={() => setPasswordFocused(false)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm outline-none text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {mode === "register" && (
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => { setPasswordFocused(true); setEmailFocused(false); }}
                    onBlur={() => setPasswordFocused(false)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    required
                  />
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-[#312e81] shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-white/70">
                {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setMode((m) => (m === "login" ? "register" : "login"));
                    setError("");
                    setConfirmPassword("");
                  }}
                  className="font-medium text-white underline hover:text-white/90"
                >
                  {mode === "login" ? "Create an account" : "Log in instead"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}