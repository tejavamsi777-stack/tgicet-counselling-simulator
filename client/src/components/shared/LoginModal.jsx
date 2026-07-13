import { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";

export default function LoginModal({ open, onClose, onAuthenticated }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      onAuthenticated?.();
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-gradient-to-br from-indigo-950/70 via-violet-950/60 to-slate-950/70 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_30px_90px_rgba(79,70,229,0.35)] backdrop-blur-2xl"
              style={{ maxHeight: "90vh" }}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490]" />

              <div className="max-h-[calc(90vh-6px)] overflow-y-auto p-8">
                <button
                  onClick={onClose}
                  className="absolute right-5 top-6 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>

                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] text-white shadow-lg shadow-violet-500/30">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                    Create a free account to unlock downloads and save your counselling data across devices.
                  </h2>
                </div>

                <div className="mb-5 flex justify-center">
                  <GoogleSignInButton
                    onSuccess={() => {
                      onAuthenticated?.();
                      onClose();
                    }}
                    onError={setError}
                  />
                </div>

                <div className="mb-5 flex items-center gap-3 text-xs text-slate-400">
                  <div className="h-px flex-1 bg-slate-200" />
                  or
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  {mode === "register" && (
                    <input
                      type="text"
                      placeholder="Full name"
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
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    required
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
                  </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-500">
                  {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setMode((m) => (m === "login" ? "register" : "login"));
                      setError("");
                    }}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    {mode === "login" ? "Create an account" : "Log in instead"}
                  </button>
                </p>

                <p className="mt-4 text-center text-xs text-slate-400">
                  Or continue browsing as a guest — just close this window.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}