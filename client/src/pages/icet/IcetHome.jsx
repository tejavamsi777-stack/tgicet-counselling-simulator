import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, ClipboardList, ArrowRight } from "lucide-react";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import { useAuth } from "../../context/AuthContext";
import Seo from "../../components/shared/Seo";

export default function IcetHome() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <Seo
        title="TG ICET Counselling Simulator | MBA & MCA College Predictor"
        description="Predict TG ICET MBA and MCA colleges using your rank, category, gender and previous cutoff data."
        path="/tg-icet"
      />
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
            Telangana ICET · MBA &amp; MCA
          </span>
          <h1
            className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Your rank, decoded into your next college.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-300 sm:text-lg">
            Explore TG ICET cutoffs, predict eligible MBA &amp; MCA colleges, and simulate your counselling process.
          </p>
        </motion.div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <FeatureCard
            icon={Target}
            title="College Predictor"
            detail="Use rank, category, gender and MBA / MCA course to view eligible college options based on previous year cutoff data."
            to="/icet/predictor"
            action="Launch Predictor"
            requiresAuth
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <FeatureCard
            icon={ClipboardList}
            title="Mock Counselling Simulator"
            detail="Experience a complete counselling process with simulated seat allotment, web options and multiple rounds."
            to="/icet/mock-counselling"
            action="Start Mock Counselling"
            requiresAuth
          />
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, detail, to, action, requiresAuth }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleClick(e) {
    if (requiresAuth && !user) {
      e.preventDefault();
      navigate("/login", { state: { from: { pathname: to } } });
    }
  }

  return (
    <a
      href={to}
      onClick={handleClick}
      className="group relative block h-full w-full outline-none"
    >
      <GlowCard customSize={true} tilt={true} glowColor="purple" className="flex h-full flex-col justify-between p-6 sm:p-8">
        <div>
          <div className="glass-button-wrap relative mb-5 inline-flex">
            <div className="glass-button flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              <Icon size={22} className="text-purple-300" />
            </div>
            <div className="glass-button-shadow rounded-2xl"></div>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-300/90">{detail}</p>
        </div>
        <div className="mt-8">
          <GlassButton
            size="default"
            className="w-full"
            contentClassName="flex items-center justify-center gap-2"
          >
            <span>{action}</span>
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </GlassButton>
        </div>
      </GlowCard>
    </a>
  );
}
