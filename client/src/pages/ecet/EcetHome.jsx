import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowCard } from '../../components/ui/spotlight-card';
import { GlassButton } from '../../components/ui/glass-button';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AdmissionStatusBanner from '../../components/ecet/AdmissionStatusBanner';
import LiveNotificationsStream from '../../components/ecet/LiveNotificationsStream';
import PhaseScheduleTable from '../../components/ecet/PhaseScheduleTable';
import AdmissionConditions from '../../components/ecet/AdmissionConditions';
import EligibilityMatrix from '../../components/ecet/EligibilityMatrix';
import TopCollegesLeaderboard from '../../components/ecet/TopCollegesLeaderboard';
import CutoffTrendAnalyzer from '../../components/ecet/CutoffTrendAnalyzer';
import CommunityAlertsBanner from '../../components/eapcet/CommunityAlertsBanner';
import FaqSection from '../../components/shared/FaqSection';
import { TG_ECET_FAQS } from '../../data/faqsData';
import { useEcetData } from '../../hooks/useEcetData';

import ExamToolsSection from '../../components/shared/ExamToolsSection';

const ECET_TOOLS = [
  {
    icon: Target,
    title: "College Predictor",
    detail: "Find eligible engineering colleges based on diploma rank, category & branch.",
    to: "/exams/tg-ecet/predictor",
    action: "Predict Now",
    tag: "Predictors",
    keywords: ["college predictor", "diploma", "lateral entry", "b.tech", "closing rank", "fdh"],
  },
  {
    icon: ArrowLeftRight,
    title: "Compare Colleges",
    detail: "Compare any two engineering colleges side-by-side across cutoffs & seats.",
    to: "/tg-ecet/compare",
    action: "Compare",
    tag: "Comparison",
    keywords: ["compare", "matrix", "institutions", "fees", "placements", "lateral entry seats"],
  },
  {
    icon: FileCheck,
    title: "HLC Checklist",
    detail: "Interactive document checklist with MeeSeva validity rules & account sync.",
    to: "/tg-ecet/documents",
    action: "Check Docs",
    tag: "Documents",
    keywords: ["documents", "hlc", "verification", "certificates", "diploma marks memo", "caste", "meeseva"],
  },
  {
    icon: Sparkles,
    title: "Create Web Options",
    detail: "Generate optimal Dream, Target & Safe preference lists based on cutoff analytics.",
    to: "/exams/tg-ecet/create-web-options",
    action: "Create Options",
    tag: "Web Options",
    keywords: ["create web options", "smart list", "dream", "target", "safe", "generator", "preferences"],
  },
  {
    icon: ClipboardList,
    title: "Exercise Web Options",
    detail: "Build and reorder your branch-wise college preference list with zero conflicts.",
    to: "/exams/tg-ecet/mock-counselling",
    action: "Exercise Options",
    tag: "Web Options",
    keywords: ["exercise web options", "mock counselling", "simulator", "priority", "reorder", "pdf download"],
  },
  {
    icon: Database,
    title: "Seat Allotments",
    detail: "Official 2026 college-wise allotment lists — every candidate, every seat category.",
    to: "/tg-ecet/allotments",
    action: "Explore Data",
    tag: "Allotments",
    keywords: ["allotments", "candidate wise", "closing ranks", "seat matrix", "tgecet.nic.in"],
  },
];

// Section divider component for clean visual flow

function SectionDivider() {
  return <div className="my-12 border-t border-white/[0.06]" />;
}

function ShimmerBlock({ height = 'h-40' }) {
  return <div className={`animate-pulse bg-white/5 rounded-2xl ${height}`} />;
}

export default function EcetHome() {
  const { data, loading } = useEcetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG ECET College Predictor, Seat Allotments, Cutoffs & Web Options Simulator"
        description="Free TG ECET diploma lateral entry engineering college predictor, mock web options simulator & authentic candidate seat allotments from tgecet.nic.in with verified closing cutoffs."
        path="/tg-ecet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Telangana Admissions 2026
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          TG ECET College Predictor, Seat Allotments, Cutoffs &amp; Web Options Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Everything you need for Telangana Lateral Entry B.Tech / B.Pharm Admissions — predict eligible engineering colleges by diploma rank, explore authentic candidate seat allotments across 200+ colleges, and simulate web options.
        </p>
      </div>

      {/* 6 Core Action Cards Grid with Search Tab */}
      <ExamToolsSection tools={ECET_TOOLS} title="TG ECET Admissions Suite" />

      {/* Passive ad banner */}
      <div className="mt-10 w-full">
        <AdSenseUnit slotName="examBanner" minHeight={90} />
      </div>

      <SectionDivider />

      {/* Admission Status Banner */}
      {loading ? (
        <ShimmerBlock height="h-52" />
      ) : (
        <AdmissionStatusBanner phases={data?.phases || []} year={data?.year || '2026'} />
      )}

      {/* Real-time Scraped Official Circulars */}
      <div className="mt-8">
        <LiveNotificationsStream />
      </div>

      <SectionDivider />

      {/* Top Engineering Colleges Leaderboard */}
      <div>
        <TopCollegesLeaderboard />
      </div>

      <SectionDivider />

      {/* Lateral Cutoff Trajectory & Shifts */}
      <div>
        <CutoffTrendAnalyzer />
      </div>

      <SectionDivider />

      {/* Phase-Wise Schedule */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Phase-Wise Counselling Schedule</h2>
        {loading ? (
          <ShimmerBlock height="h-64" />
        ) : (
          <PhaseScheduleTable phases={data?.phases || []} />
        )}
      </div>

      <SectionDivider />

      {/* Admission Conditions */}
      {loading ? (
        <ShimmerBlock height="h-48" />
      ) : (
        <AdmissionConditions conditions={data?.conditions || []} />
      )}

      <SectionDivider />

      {/* Eligibility Matrix */}
      {loading ? (
        <ShimmerBlock height="h-48" />
      ) : (
        <EligibilityMatrix eligibility={data?.eligibility || {}} />
      )}

      <SectionDivider />

      {/* TG ECET FAQs Section */}
      <div className="w-full mb-12">
        <FaqSection
          title="TG ECET 2026 Lateral Entry Admissions FAQs"
          subtitle="Frequently asked questions about Diploma lateral entry B.Tech admissions, cutoffs, and seat reservations"
          faqs={TG_ECET_FAQS}
        />
      </div>

      {/* Bottom Ad Unit */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
