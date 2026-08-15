import { ArrowRight, ClipboardList, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import Seo from "../../components/shared/Seo";

export default function EcetHome() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <Seo
        title="TG ECET 2025 | Predictor & Lateral Entry Web Options"
        description="Explore TG ECET 2025 B.E. / B.Tech / B.Pharmacy lateral-entry cutoff ranks, predict eligible colleges, and practice web options."
        path="/exams/tg-ecet"
      />
      <div className="text-center">
        <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
          TG ECET 2025 · Diploma Lateral Entry
        </span>
        <h1
          className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Lateral Entry Options, made clearer.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-300 sm:text-lg">
          Explore TG ECET branch cutoffs, predict eligible colleges for Diploma &amp; B.Sc. candidates, and prepare your web-options preference list.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <FeatureCard
          icon={Target}
          title="College Predictor"
          detail="Enter rank, category, gender and diploma branch to view eligible 2nd-year B.E. / B.Tech / B.Pharmacy options."
          to="/exams/tg-ecet/predictor"
          action="Predict colleges"
        />
        <FeatureCard
          icon={ClipboardList}
          title="Branch-wise Web Options"
          detail="Select your district(s) and diploma branch to build your web options list."
          to="/exams/tg-ecet/mock-counselling"
          action="Build web options"
        />
      </div>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, detail, to, action }) {
  return (
    <Link to={to} className="group relative block h-full w-full outline-none">
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
    </Link>
  );
}
