import { ArrowLeft, ArrowRight, ClipboardList, Sparkles, Target } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getExamBySlug } from "../../config/exams";
import { GlowCard } from "../../components/ui/spotlight-card";
import { GlassButton } from "../../components/ui/glass-button";
import Seo from "../../components/shared/Seo";
import AdSenseUnit from "../../components/ads/AdSenseUnit";

export default function ExamLandingPage() {
  const { examSlug } = useParams();
  const exam = getExamBySlug(examSlug);

  if (!exam) return <Navigate to="/" replace />;
  if (exam.slug === "tg-icet") return <Navigate to="/tg-icet" replace />;

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <Seo
        title={`${exam.shortName} | Telangana Entrance Exams Platform`}
        description={`${exam.name}: ${exam.description} Verified predictor and counselling information will be published when official data is available.`}
        path={`/exams/${exam.slug}`}
      />
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 transition hover:text-white">
        <ArrowLeft size={16} /> All entrance exams
      </Link>
      <section className="mt-7">
        <GlowCard customSize={true} glowColor="purple" className="p-8 sm:p-12">
          <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300 backdrop-blur-sm">
            Coming soon
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
            {exam.shortName}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
            {exam.name}. {exam.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <InfoCard icon={Target} title="Programs" text={exam.programs.join(", ")} />
            <InfoCard icon={Sparkles} title="Predictor" text="Verified cutoff data coming soon" />
            <InfoCard icon={ClipboardList} title="Mock counselling" text="Available only after official rules are added" />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to={`/exams/${exam.slug}/predictor`}>
              <GlassButton size="default" contentClassName="flex items-center justify-center gap-2">
                <span>Explore Predictor</span>
                <ArrowRight size={16} />
              </GlassButton>
            </Link>
            <Link to={`/exams/${exam.slug}/mock-counselling`}>
              <GlassButton size="default" contentClassName="flex items-center justify-center gap-2">
                <span>Mock Counselling</span>
                <ClipboardList size={16} />
              </GlassButton>
            </Link>
          </div>

          <p className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-xs leading-relaxed text-amber-200">
            This page is intentionally not showing prediction, counselling, cutoff, or allotment results until verified official data and rules are available.
          </p>
        </GlowCard>
      </section>

      {/* Passive, non-intrusive exam page ad banner */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="examBanner" minHeight={90} />
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <Icon size={20} className="text-purple-300" />
      <h2 className="mt-3 font-semibold text-white text-base">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-gray-300">{text}</p>
    </div>
  );
}
