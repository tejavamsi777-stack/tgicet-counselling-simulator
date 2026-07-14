import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/shared/GoogleSignInButton";
import LoginCharacters from "../components/shared/LoginCharacters";

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
    <div className="flex min-h-[100dvh">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-50 p-12 text-slate-900 lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] text-white shadow-md">
              <Sparkles size={18} />
            </div>
            TG Counselling
          </Link>

          <div className="mt-5">
            <LoginCharacters
              emailFocused={emailFocused}
              passwordFocused={passwordFocused}
              showPassword={showPassword}
              success={success}
            />
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-400">TG ICET · MBA &amp; MCA Counselling</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>

          {!success && (
            <div className="mb-6 text-center">
              <h1
                className="text-xl font-bold leading-snug tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your rank, decoded into your next college.
              </h1>
            </div>
          )}

          <h2 className="text-center text-2xl font-bold tracking-tight text-white">
            {success
              ? "You're in!"
              : mode === "login"
              ? "Welcome back!"
              : "Create your account"}
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Create password" : "Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
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