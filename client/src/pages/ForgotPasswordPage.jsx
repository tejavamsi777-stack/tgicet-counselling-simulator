import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await forgotPassword(email);
      // Always shows success — the backend never reveals whether the email
      // exists, so the UI shouldn't either.
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-gradient-to-br from-[#312e81] via-[#7c3aed] to-[#0e7490] px-6 py-10">
      <div className="w-full max-w-sm">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
        >
          <ArrowLeft size={15} />
          Back to login
        </Link>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
            <Sparkles size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {sent ? "Check your email" : "Forgot your password?"}
          </h1>
          <p className="mt-1.5 text-sm text-white/70">
            {sent
              ? "If an account exists with that email, we've sent a link to reset your password."
              : "Enter the email on your account and we'll send you a reset link."}
          </p>
        </div>

        {!sent && (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/15 px-4 py-2.5 text-sm text-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-xl bg-white text-sm font-semibold text-[#312e81] shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        {sent && (
          <>
            <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-center text-sm text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-md">
              <Mail size={15} className="shrink-0 text-white/70" />
              Don't see it? Check your <span className="font-semibold text-white">spam</span> or <span className="font-semibold text-white">junk</span> folder.
            </div>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mx-auto block text-sm font-medium text-white underline hover:text-white/90"
            >
              Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
