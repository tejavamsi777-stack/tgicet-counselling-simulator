import { TrendingUp } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/60 backdrop-blur-lg backdrop-saturate-150 will-change-transform">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <TrendingUp size={18} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            TG ICET Counselling
          </span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#predict" className="transition-colors hover:text-slate-900">
            Predict
          </a>
          <a href="#results" className="transition-colors hover:text-slate-900">
            Results
          </a>
          <a href="#about" className="transition-colors hover:text-slate-900">
            About
          </a>
        </nav>
      </div>
    </header>
  );
}