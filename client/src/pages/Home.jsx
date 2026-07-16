import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowRight } from "lucide-react";
import Card from "../components/ui/Card";
import { useSmoothScroll } from "../hooks/useSmoothScroll";
import { useAuth } from "../context/AuthContext";
import MagneticButton from "../components/effects/MagneticButton";

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

// --- NEW: Mega-Expanded 24 Page-Specific Whitespace Animations ---
function WhitespaceAnimations() {
  const emojis = [
    // --- TOP BANNER & HEADER AREA ---
    {
      char: "🔮",
      label: "Cutoff Crystal Ball",
      pos: { top: "6%", left: "6%" },
      // Hypnotic floating and glowing pulse
      animate: { y: [0, -14, 0, 8, 0], scale: [0.95, 1.1, 0.95], opacity: [0.6, 1, 0.6] },
      duration: 5.0,
    },
    {
      char: "🔥",
      label: "Hot Predictor Fire",
      pos: { top: "8%", right: "6%" },
      // Flickers, scales rapidly, and wobbles upward like a burning flame
      animate: {
        scale: [1, 1.25, 0.9, 1.3, 1],
        y: [0, -10, -3, -14, 0],
        rotate: [-6, 6, -4, 8, 0],
        filter: ["brightness(1)", "brightness(1.3)", "brightness(0.9)", "brightness(1.4)", "brightness(1)"],
      },
      duration: 2.2,
    },
    {
      char: "📚",
      label: "ICET Syllabus Books",
      pos: { top: "4%", left: "30%" },
      // Stacking bounce (moving up and settling down heavily)
      animate: { y: [0, -8, 0, -3, 0], rotate: [0, -4, 0] },
      duration: 4.0,
    },
    {
      char: "🥇",
      label: "Top Rank Medal",
      pos: { top: "4%", right: "30%" },
      // Gentle pendulum swing like hanging on a ribbon around a neck
      animate: { rotate: [-12, 12, -8, 8, 0], x: [-3, 3, -2, 2, 0] },
      duration: 3.6,
    },
    {
      char: "🎓",
      label: "Graduation Cap Toss",
      pos: { top: "14%", left: "18%" },
      // Tosses high up into the air and spins triumphantly
      animate: { y: [0, -35, 0], rotate: [0, -20, 20, 0], scale: [1, 1.15, 1] },
      duration: 3.8,
    },
    {
      char: "🏛️",
      label: "Dream College Campus",
      pos: { top: "14%", right: "18%" },
      // Majestic, heavy grounded thud and proud scale
      animate: { scale: [1, 1.08, 1], y: [0, -4, 0] },
      duration: 4.5,
    },

    // --- MID-LEFT & MID-RIGHT SIDE GUTTERS ---
    {
      char: "⚡",
      label: "Fast Results Lightning",
      pos: { top: "26%", left: "5%" },
      // Rapid electric jitter and bright flash opacity
      animate: { scale: [1, 1.4, 0.8, 1.3, 1], rotate: [0, -15, 15, -10, 0], opacity: [0.4, 1, 0.3, 1, 0.6], x: [0, -4, 4, -2, 0] },
      duration: 1.8,
    },
    {
      char: "📈",
      label: "Rank Growth Chart",
      pos: { top: "26%", right: "5%" },
      // Bounces upward step-by-step like a rising market graph
      animate: { x: [0, 6, 12, 18, 0], y: [0, -6, -12, -18, 0], scale: [1, 1.05, 1.1, 1.15, 1] },
      duration: 3.5,
    },
    {
      char: "🤞",
      label: "Fingers Crossed for Seat",
      pos: { top: "38%", left: "3%" },
      // Rapid nervous trembling / shivering back and forth in anticipation
      animate: { x: [-3, 3, -3, 3, -2, 2, 0], rotate: [-8, 8, -6, 6, 0] },
      duration: 1.5,
    },
    {
      char: "✅",
      label: "Safe College Checkmark",
      pos: { top: "38%", right: "3%" },
      // Stamp-down effect: slams down from high scale with a pop
      animate: { scale: [1, 1.3, 0.9, 1.05, 1], opacity: [0.7, 1, 1] },
      duration: 2.8,
    },
    {
      char: "💼",
      label: "MBA Briefcase",
      pos: { top: "50%", left: "4%" },
      // Pendulum swing back and forth like walking into a corporate interview
      animate: { rotate: [-15, 15, -10, 10, 0], y: [0, -6, 0] },
      duration: 3.2,
    },
    {
      char: "🖥️",
      label: "MCA Coding Desktop",
      pos: { top: "50%", right: "4%" },
      // "Typing" keyboard vibration and screen glow pulse
      animate: { x: [-1, 1, -1, 1, 0], scale: [1, 1.06, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] },
      duration: 2.4,
    },
    {
      char: "💡",
      label: "Strategy Lightbulb",
      pos: { top: "62%", left: "3%" },
      // Flashes on and off with an idea "ding!" upward hop
      animate: { scale: [0.9, 1.25, 0.9], opacity: [0.4, 1, 0.4], y: [0, -10, 0] },
      duration: 2.6,
    },
    {
      char: "💺",
      label: "Allotted Seat",
      pos: { top: "62%", right: "3%" },
      // Cushion bounce: drops down and squashes like claiming a seat
      animate: { y: [0, 12, -4, 6, 0], scaleY: [1, 0.85, 1.05, 0.95, 1] },
      duration: 3.0,
    },

    // --- CENTER GAP (BETWEEN TITLE & CARDS) ---
    {
      char: "✨",
      label: "Magic Prediction Sparkles",
      pos: { top: "42%", left: "48%" },
      // Twinkling fade in and out with rotation
      animate: { scale: [0.7, 1.3, 0.7], opacity: [0.3, 1, 0.3], rotate: [0, 180, 360] },
      duration: 3.5,
    },

    // --- LOWER FLANKS & BOTTOM CORNERS ---
    {
      char: "📑",
      label: "Web Options Document",
      pos: { bottom: "24%", left: "4%" },
      // Page-turn tilt and floating up/down
      animate: { rotate: [0, -12, 0, 12, 0], y: [0, -8, 0] },
      duration: 4.2,
    },
    {
      char: "🎯",
      label: "Cutoff Target Bullseye",
      pos: { bottom: "24%", right: "4%" },
      // Dart hit! Quick zoom-in shake and spin
      animate: { rotate: [0, 90, 180, 270, 360], scale: [0.9, 1.2, 0.9] },
      duration: 5.5,
    },
    {
      char: "⏳",
      label: "Counselling Rounds Hourglass",
      pos: { bottom: "12%", left: "6%" },
      // Ticks periodically, then executes a clean 180-degree flip
      animate: { rotate: [0, 0, 180, 180, 360], y: [0, -4, 0, -4, 0] },
      duration: 4.5,
    },
    {
      char: "🏆",
      label: "Allotment Trophy",
      pos: { bottom: "12%", right: "6%" },
      // Celebratory rocking side-to-side
      animate: { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.12, 1] },
      duration: 3.2,
    },
    {
      char: "🚀",
      label: "Career Launch Rocket",
      pos: { bottom: "4%", left: "15%" },
      // Shakes engines, blasts off upward diagonally, resets
      animate: { x: [0, -2, 2, -2, 25, 0], y: [0, 2, -2, 2, -25, 0], scale: [1, 1.1, 1] },
      duration: 3.0,
    },
    {
      char: "🎉",
      label: "Seat Allotment Party Popper",
      pos: { bottom: "4%", right: "15%" },
      // Exploding pop shake
      animate: { scale: [0.8, 1.3, 0.9, 1.1, 1], rotate: [0, -25, 15, -10, 0], x: [0, -8, 8, -4, 0] },
      duration: 2.8,
    },
    {
      char: "🔄",
      label: "Multiple Rounds Spin",
      pos: { bottom: "2%", left: "47%" },
      // Continuous smooth 360 rotation representing counselling rounds
      animate: { rotate: [0, 360] },
      duration: 6.0,
    },
    {
      char: "🎲",
      label: "Probability Cutoff Dice",
      pos: { bottom: "6%", left: "30%" },
      // Rolling tumble (spin + bounce)
      animate: { rotate: [0, 180, 360], x: [0, 10, 0, -10, 0], y: [0, -12, 0] },
      duration: 4.0,
    },
    {
      char: "📊",
      label: "Previous Year Data Bars",
      pos: { bottom: "6%", right: "30%" },
      // Pulsing bar growth
      animate: { scaleY: [1, 1.25, 0.85, 1.1, 1], y: [0, -6, 0] },
      duration: 3.4,
    },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {emojis.map((item, index) => (
        <motion.div
          key={index}
          className="absolute select-none text-2xl sm:text-3xl md:text-4xl"
          style={item.pos}
          animate={item.animate}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (index % 5) * 0.25,
          }}
          whileHover={{
            scale: 1.6,
            rotate: 360,
            transition: { type: "spring", stiffness: 400, damping: 10 },
          }}
        >
          {item.char}
        </motion.div>
      ))}
    </div>
  );
}
// ---------------------------------------------------------------------

export default function Home() {
  const navigate = useNavigate();
  useSmoothScroll();
  const { user } = useAuth();

  function handleCardClick(path) {
    if (user) {
      navigate(path);
      return;
    }
    navigate("/login", { state: { from: { pathname: path } } });
  }

  return (
    <main className="relative mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center px-6 py-24">
      {/* NEW: 24 Animations positioned securely in the whitespace around the page */}
      <WhitespaceAnimations />

      <div className="relative z-10 mb-16 w-full text-center">
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

      <div className="relative z-10 grid w-full grid-cols-1 gap-8 sm:grid-cols-2">
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
               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] text-white shadow-lg">
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

                <MagneticButton
  onClick={() => handleCardClick(card.path)}
className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3B82F6] via-[#4F46E5] to-[#7C3AED] px-5 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:from-[#2563EB] hover:via-[#4338CA] hover:to-[#6D28D9] hover:scale-[1.02] active:scale-[0.98]">
  {card.cta}
  <ArrowRight size={16} />
</MagneticButton>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}