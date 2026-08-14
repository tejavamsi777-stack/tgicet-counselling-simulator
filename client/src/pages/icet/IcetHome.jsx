import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowRight } from "lucide-react";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import { useSmoothScroll } from "../../hooks/useSmoothScroll";
import { useAuth } from "../../context/AuthContext";
import Seo from "../../components/shared/Seo";

const cards = [
  {
    icon: Target,
    title: "College Predictor",
    subtitle: "Predict colleges using previous year cutoff data.",
    features: ["Safe / Moderate / Risky", "2023 & 2024 data", "PDF & Excel Export"],
    cta: "Launch Predictor",
    path: "/icet/predictor",
  },
  {
    icon: ClipboardList,
    title: "Mock Counselling Simulator",
    subtitle: "Experience a complete counselling process with simulated seat allotment.",
    features: ["Web options", "Seat allotment simulation", "Multiple rounds", "Save & Resume"],
    cta: "Start Mock Counselling",
    path: "/icet/mock-counselling",
  },
];

export default function IcetHome() {
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
    <main className="relative mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <Seo
        title="TG ICET Counselling Simulator | MBA & MCA College Predictor"
        description="Predict TG ICET MBA and MCA colleges using your rank, category, gender and previous cutoff data."
        path="/tg-icet"
      />
      <div className="relative z-10 mb-12 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <span className="mb-4 inline-block rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
            Telangana ICET · MBA &amp; MCA
          </span>
          <h1
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span>Your rank, decoded into your next college.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-gray-300 sm:text-lg">
            Choose how you want to explore your options.
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.path}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <GlowCard customSize={true} glowColor="purple" className="flex h-full flex-col justify-between p-6 sm:p-8">
                <div>
                  <div className="glass-button-wrap relative mb-5 inline-flex">
                    <div className="glass-button flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                      <Icon size={22} className="text-purple-300" />
                    </div>
                    <div className="glass-button-shadow rounded-2xl"></div>
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-white tracking-tight">
                    {card.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-gray-300/90 leading-relaxed">{card.subtitle}</p>

                  <ul className="mt-6 space-y-2.5">
                    {card.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <GlassButton
                    size="default"
                    className="w-full"
                    contentClassName="flex items-center justify-center gap-2"
                    onClick={() => handleCardClick(card.path)}
                  >
                    <span>{card.cta}</span>
                    <ArrowRight size={16} />
                  </GlassButton>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
