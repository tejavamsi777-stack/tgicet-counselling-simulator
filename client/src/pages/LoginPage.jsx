import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/shared/GoogleSignInButton";

// --- ANIMATED MONSTERS WITH CURSOR TRACKING, CENTERED POSITION & TALL RED MONSTER ---
function AnimatedMonsters({ emailFocused, passwordFocused, showPassword, success }) {
  // 1. Track live mouse position across the screen
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
    animationState = "hidePassword";
  } else if (passwordFocused && showPassword) {
    animationState = "showPassword";
  } else if (emailFocused) {
    animationState = "email";
  }

  const springTransition = { type: "spring", stiffness: 140, damping: 14, mass: 1 };
  const eyeSpring = { type: "spring", stiffness: 250, damping: 15 };
  const mouthSpring = { type: "spring", stiffness: 200, damping: 12 };

  // Dramatic body tilting for the centered characters
  const containerVariants = {
    default: { x: 0, y: 0, rotate: 0, scale: 1 },
    email: { x: 40, y: 5, rotate: 8, scale: 1.05 },
    hidePassword: { x: -55, y: 15, rotate: -14, scale: 0.92 },
    showPassword: { x: 15, y: -5, rotate: 4, scale: 1.06 },
    success: { x: 0, y: -35, rotate: 0, scale: 1.1 },
  };

  const backMonsterVariants = {
    default: { x: 0, rotate: 0 },
    email: { x: -15, rotate: -4 },
    hidePassword: { x: 20, rotate: 6 },
    showPassword: { x: -5, rotate: -1 },
    success: { y: -20 },
  };

  const frontMonsterVariants = {
    default: { x: 0, y: 0 },
    email: { x: 15, y: -5 },
    hidePassword: { x: -20, y: 8 },
    showPassword: { x: 10, y: -10 },
    success: { y: -25, scale: 1.1 },
  };

  // 2. Calculate Eye Positions
  const getEyeOffset = () => {
    if (animationState === "success") return { x: 0, y: -6 };
    if (animationState === "hidePassword") return { x: -14, y: 10 };
    if (animationState === "showPassword") return { x: 8, y: -2 };
    if (animationState === "email") {
      return { x: 10 + mousePos.x * 3, y: 2 + mousePos.y * 3 };
    }
    return { x: mousePos.x * 12, y: mousePos.y * 10 };
  };

  const eyeOffset = getEyeOffset();

  // 3. Dynamic Mouth Path Definitions for Big Pink Monster
  const getPinkMouthPath = () => {
    switch (animationState) {
      case "success":
        return "M 220 215 Q 255 260 285 215 Z";
      case "hidePassword":
        return "M 245 235 C 245 220, 265 220, 265 235 C 265 250, 245 250, 245 235 Z";
      case "showPassword":
        return "M 235 230 Q 255 245 275 230 Z";
      case "email":
        return "M 240 230 A 18 18 0 0 1 275 230 Z";
      default:
        return "M 240 230 A 15 15 0 0 1 270 230 Z";
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
          {/* Tall Red/Pink Monster (Back Layer) - Stretched TALLER to tower above pink dome! */}
          <motion.g id="tall-pink" variants={backMonsterVariants} transition={springTransition}>
            <path d="M 40 55 L 180 55 A 25 25 0 0 1 205 80 A 25 25 0 0 1 180 105 L 110 105 L 90 350 L 55 350 L 75 105 L 40 105 A 25 25 0 0 1 15 80 A 25 25 0 0 1 40 55 Z" fill="#cf4372" />
            <circle cx="120" cy="45" r="14" fill="#fff" />
            <motion.circle cx="122" cy="45" r="6" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="155" cy="45" r="14" fill="#fff" />
            <motion.circle cx="153" cy="45" r="6" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="45" cy="80" r="8" fill="#802341" />
          </motion.g>

          {/* Big Light Pink Monster (Right) */}
          <motion.g id="big-pink" transition={springTransition}>
            <path d="M 140 350 L 140 160 A 80 80 0 0 1 300 160 L 300 350 Z" fill="#eea8c9" />
            <circle cx="230" cy="180" r="32" fill="#fff" />
            <motion.circle cx="235" cy="180" r="16" fill="#333" animate={{ x: eyeOffset.x * 1.5, y: eyeOffset.y * 1.5, scale: animationState === "hidePassword" ? 0.8 : 1 }} transition={eyeSpring} />
            <circle cx="240" cy="173" r="5" fill="#fff" />
            
            <motion.path
              d={getPinkMouthPath()}
              fill="#7a3b58" 
              animate={{ d: getPinkMouthPath() }}
              transition={mouthSpring}
            />
            
            <motion.g animate={{ opacity: animationState === "hidePassword" || animationState === "success" ? 0 : 1 }} transition={{ duration: 0.15 }}>
              <rect x="246" y="228" width="6" height="8" rx="2" fill="#fff" />
              <rect x="256" y="228" width="6" height="8" rx="2" fill="#fff" />
            </motion.g>
          </motion.g>

          {/* Teal Fluffy Monster (Left) */}
          <motion.g id="teal-fluff" variants={frontMonsterVariants} transition={springTransition}>
            <path d="M 50 350 L 70 240 L 100 240 L 80 350 Z" fill="#80c8ca" />
            <path d="M 20 350 L 60 240 L 80 240 L 40 350 Z" fill="#58a3a5" />
            <circle cx="75" cy="210" r="45" fill="#80c8ca" />
            <circle cx="40" cy="190" r="20" fill="#80c8ca" />
            <circle cx="45" cy="225" r="20" fill="#80c8ca" />
            <circle cx="110" cy="190" r="20" fill="#80c8ca" />
            <circle cx="105" cy="225" r="20" fill="#80c8ca" />
            <circle cx="75" cy="165" r="20" fill="#80c8ca" />
            <circle cx="60" cy="195" r="12" fill="#fff" />
            <motion.circle cx="62" cy="195" r="5" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="90" cy="195" r="12" fill="#fff" />
            <motion.circle cx="88" cy="195" r="5" fill="#222" animate={eyeOffset} transition={eyeSpring} />
            
            <motion.rect 
              x="60" 
              y="215" 
              width="30" 
              fill="#3c7374" 
              animate={{ 
                height: animationState === "success" ? 22 : animationState === "hidePassword" ? 4 : animationState === "showPassword" ? 20 : 16, 
                y: animationState === "success" ? 210 : animationState === "hidePassword" ? 222 : 215,
                rx: animationState === "hidePassword" ? 2 : 8,
                width: animationState === "hidePassword" ? 20 : 30,
                x: animationState === "hidePassword" ? 65 : 60
              }} 
              transition={mouthSpring} 
            />
          </motion.g>

          {/* Blue Monster (Bottom Center) */}
          <motion.g id="blue-round" variants={frontMonsterVariants} transition={springTransition}>
            <path d="M 115 350 L 130 280 L 150 280 L 135 350 Z" fill="#2d6ecf" />
            <path d="M 165 350 L 165 280 L 185 280 L 185 350 Z" fill="#448ef6" />
            <circle cx="160" cy="270" r="48" fill="#448ef6" />
            <circle cx="145" cy="255" r="13" fill="#fff" />
            <motion.circle cx="148" cy="255" r="6" fill="#111" animate={eyeOffset} transition={eyeSpring} />
            <circle cx="175" cy="250" r="13" fill="#fff" />
            <motion.circle cx="172" cy="250" r="6" fill="#111" animate={eyeOffset} transition={eyeSpring} />
            
            <motion.circle 
              cx="185" 
              cy="278" 
              fill="#1b4585" 
              animate={{ 
                r: animationState === "success" ? 15 : animationState === "hidePassword" ? 4 : animationState === "email" ? 11 : 8,
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
    <div className="flex min-h-screen w-full flex-row" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%' }}>
      
      {/* LEFT PANEL: Characters */}
      <div 
        className="relative flex w-1/2 flex-col justify-between overflow-hidden bg-slate-50 p-12 text-slate-900"
        style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '3rem' }}
      >
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

      {/* RIGHT PANEL: Form */}
      <div 
        className="flex w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] px-6 py-12"
        style={{ width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}
      >
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white">
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {!success && (
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold leading-snug tracking-tight text-white">
                Your rank, decoded into your next college.
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