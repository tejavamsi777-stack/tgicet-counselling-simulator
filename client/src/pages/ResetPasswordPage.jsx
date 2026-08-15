import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message || "This reset link is invalid or has expired.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-black selection:bg-purple-500 selection:text-white px-4 py-10">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/40 via-purple-700/50 to-black" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Top and bottom radial glows */}
      <div className="absolute left-1/2 top-0 h-[50vh] w-[100vh] -translate-x-1/2 rounded-b-[50%] bg-purple-400/20 blur-[80px]" />
      <div className="absolute bottom-0 left-1/2 h-[50vh] w-[80vh] -translate-x-1/2 rounded-t-full bg-purple-500/20 blur-[80px]" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#121118]/85 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
          {/* Back link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300 transition hover:text-white mb-6"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/15 text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              {success ? <CheckCircle2 size={28} className="text-emerald-400" /> : <KeyRound size={28} />}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              {success ? "Password Updated!" : "Set New Password"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
              {success
                ? "Your password has been successfully reset. Redirecting to sign in…"
                : "Choose a new password (minimum 8 characters) for your account."}
            </p>
          </div>

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs font-semibold text-rose-300">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-4 pr-11 text-sm text-white placeholder-gray-400 outline-none backdrop-blur-md transition focus:border-white/50 focus:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="h-11 w-full rounded-xl border border-white/20 bg-white/5 px-4 text-sm text-white placeholder-gray-400 outline-none backdrop-blur-md transition focus:border-white/50 focus:bg-white/10"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black shadow-[0_4px_20px_rgba(255,255,255,0.25)] transition hover:bg-gray-100 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-black" />
                    <span>Updating password…</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
