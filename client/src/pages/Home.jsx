
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowRight } from "lucide-react";
import Card from "../components/ui/Card";
import { useSmoothScroll } from "../hooks/useSmoothScroll";


const cards = [
  {
    icon: Target,
    title: "College Predictor",
    subtitle: "Predict colleges using previous year cutoff data.",
    features: ["Safe / Moderate / Risky", "2023 & 2024 data", "PDF & Excel Export"],
    cta: "Launch Predictor",
    path: "/predictor",
  },
  {
    icon: ClipboardList,
    title: "Mock Counselling Simulator",
    subtitle: "Experience a complete counselling process with simulated seat allotment.",
    features: ["Web options", "Seat allotment simulation", "Multiple rounds", "Save & Resume"],
    cta: "Start Mock Counselling",
    path: "/mock-counselling",
  },
];

export default function Home() {
  const navigate = useNavigate();
  useSmoothScroll();
  

  return (
    <>
     

      <main className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 py-24">
        <div className="relative mb-16 w-full text-center">
          {/* Signature element: a rising trajectory arc + glowing dot, echoing
              "rank goes in, placement comes out" — the core idea of the product */}
          <svg
            viewBox="0 0 600 200"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[220px] w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-70"
            aria-hidden
          >
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4c1d95" stopOpacity="0" />
                <stop offset="35%" stopColor="#7c3aed" stopOpacity="0.55" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 20 170 C 180 170, 220 40, 580 20"
              fill="none"
              stroke="url(#arcGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.circle
              r="5"
              fill="#fbbf24"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{ offsetDistance: "100%", opacity: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ offsetPath: "path('M 20 170 C 180 170, 220 40, 580 20')" }}
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <span className="mb-4 inline-block rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700">
              Telangana ICET · MBA &amp; MCA
            </span>
            <h1
              className="text-5xl font-bold tracking-tight sm:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="bg-gradient-to-r from-[#312e81] via-[#7c3aed] to-[#0e7490] bg-clip-text text-transparent">
                Your rank, decoded
              </span>
              <br />
              <span className="text-slate-900">into your next college.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-500">
              Choose how you want to explore your options.
            </p>
          </motion.div>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className="relative"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-[36px] bg-gradient-to-br from-brand-300/40 via-purple-300/30 to-brand-200/40 blur-2xl transition-opacity duration-300"
                />
                <Card
                  className="relative flex h-full flex-col p-8 rounded-[32px] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_60px_rgba(37,99,235,0.12)] transition-shadow duration-300 hover:shadow-[0_28px_80px_rgba(37,99,235,0.2)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white shadow-lg">
                    <Icon size={22} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                    {card.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-500">{card.subtitle}</p>

                  <ul className="mt-5 flex-1 space-y-2">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate(card.path)}
                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 px-5 py-3 text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {card.cta}
                    <ArrowRight size={16} />
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </>
  );
}