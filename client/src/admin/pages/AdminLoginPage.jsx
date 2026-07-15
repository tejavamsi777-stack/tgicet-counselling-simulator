import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function AdminLoginPage() {
  const { admin, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) {
    const redirectTo = location.state?.from?.pathname || "/admin";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || "/admin";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#070913] px-4 overflow-hidden">
      {/* Decorative Floating Blurs Behind Portal */}
      <div className="absolute top-[30%] left-[20%] h-96 w-96 rounded-full bg-brand-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[30%] right-[20%] h-96 w-96 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none" />

      {/* Glowing Border Wrap around Card Container */}
      <div className="relative w-full max-w-md rounded-3xl p-px bg-gradient-to-b from-white/10 via-white/5 to-transparent">
        <Card className="w-full bg-slate-950/40 backdrop-blur-2xl border-0 p-8 shadow-3xl text-slate-100 rounded-[23px]">
          <div className="mb-8 flex flex-col items-center text-center">
            {/* Glow Shield Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <ShieldCheck size={26} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Console Portal</h1>
            <p className="mt-1.5 text-xs text-slate-400">
              Sign in to securely orchestrate college operations.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-400 backdrop-blur-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Input
                id="admin-email"
                label="Email Address"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/[0.03] border-white/10 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1.5">
              <Input
                id="admin-password"
                label="Security Key"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.03] border-white/10 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full justify-center h-11 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.25)] border-0 transition-transform active:scale-98"
            >
              {submitting ? "Establishing Handshake…" : "Authenticate Account"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}