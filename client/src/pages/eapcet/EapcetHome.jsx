import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database, Building2, ExternalLink, ChevronRight, BarChart3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowCard } from '../../components/ui/spotlight-card';
import { GlassButton } from '../../components/ui/glass-button';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import TopEngineeringCollegesExplorer from '../../components/eapcet/TopEngineeringCollegesExplorer';
import LiveNotificationsStream from '../../components/eapcet/LiveNotificationsStream';
import PhaseScheduleTable from '../../components/eapcet/PhaseScheduleTable';
import AdmissionConditions from '../../components/eapcet/AdmissionConditions';
import EligibilityMatrix from '../../components/eapcet/EligibilityMatrix';
import TopCollegesLeaderboard from '../../components/eapcet/TopCollegesLeaderboard';
import FeeReimbursementCalculator from '../../components/shared/FeeReimbursementCalculator';
import CutoffTrendAnalyzer from '../../components/eapcet/CutoffTrendAnalyzer';
import CommunityAlertsBanner from '../../components/eapcet/CommunityAlertsBanner';
import FaqSection from '../../components/shared/FaqSection';
import { TG_EAPCET_FAQS } from '../../data/faqsData';
import { useEapcetData } from '../../hooks/useEapcetData';

import ExamToolsSection from '../../components/shared/ExamToolsSection';

const EAPCET_TOOLS = [
  {
    icon: BarChart3,
    title: "Marks vs Rank",
    detail: "Estimate your 2027 rank from TG EAPCET score — MPC & BiPC streams.",
    to: "/exams/tg-eapcet/marks-vs-rank",
    action: "Check Rank",
    tag: "Rank & Marks",
    keywords: ["marks", "rank", "score", "percentile", "calculator", "estimator", "mpc", "bipc", "2027"],
  },
  {
    icon: Target,
    title: "College Predictor",
    detail: "Find eligible engineering colleges based on rank, category & gender.",
    to: "/exams/tg-eapcet/predictor",
    action: "Predict Now",
    tag: "Predictors",
    keywords: ["college predictor", "admission", "chances", "branch", "engineering", "b.tech", "closing rank"],
  },
  {
    icon: ArrowLeftRight,
    title: "Compare Colleges",
    detail: "Compare any two engineering colleges across cutoffs, fees & placement CTCs.",
    to: "/tg-eapcet/compare",
    action: "Compare",
    tag: "Comparison",
    keywords: ["compare", "matrix", "cbit vs vnr", "institutions", "fees", "placements", "packages"],
  },
  {
    icon: FileCheck,
    title: "HLC Checklist",
    detail: "Interactive document checklist with MeeSeva validity rules & account sync.",
    to: "/tg-eapcet/documents",
    action: "Check Docs",
    tag: "Documents",
    keywords: ["documents", "hlc", "verification", "certificates", "income certificate", "caste", "meeseva"],
  },
  {
    icon: Sparkles,
    title: "Create Web Options",
    detail: "Generate optimal Dream, Target & Safe preference lists based on cutoff analytics.",
    to: "/exams/tg-eapcet/create-web-options",
    action: "Create Options",
    tag: "Web Options",
    keywords: ["create web options", "smart list", "dream", "target", "safe", "generator", "preferences"],
  },
  {
    icon: ClipboardList,
    title: "Exercise Web Options",
    detail: "Build and reorder your branch-wise college preference list with zero conflicts.",
    to: "/exams/tg-eapcet/mock-counselling",
    action: "Exercise Options",
    tag: "Web Options",
    keywords: ["exercise web options", "mock counselling", "simulator", "priority", "reorder", "pdf download"],
  },
  {
    icon: Database,
    title: "Seat Allotments",
    detail: "Official college-wise allotment lists — every candidate, every seat category.",
    to: "/tg-eapcet/allotments",
    action: "Explore Data",
    tag: "Allotments",
    keywords: ["allotments", "candidate wise", "closing ranks", "seat matrix", "tgeapcet.nic.in"],
  },
];

function SectionDivider() {
  return <div className="my-12 border-t border-white/[0.06]" />;
}

function ShimmerBlock({ height = 'h-40' }) {
  return <div className={`animate-pulse bg-white/5 rounded-2xl ${height}`} />;
}

export default function EapcetHome() {
  const { data, loading } = useEapcetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG EAPCET 2027 College Predictor, Seat Allotments, Cutoffs, Web Options Simulator"
        description="Free TG EAPCET 2027 Engineering & Pharmacy college predictor, mock web options simulator, certificate verification rules & authentic candidate seat allotments from tgeapcet.nic.in with verified closing cutoffs."
        path="/tg-eapcet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Telangana Admissions 2027
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          TG EAPCET (EAMCET) 2027
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
          Counselling tools which guide you till it&apos;s over — from marks and rank predictions to conflict-free web options and seat allotments.
        </p>
      </div>

      {/* 7 Core Action Cards Grid with Search Tab */}
      <ExamToolsSection tools={EAPCET_TOOLS} title="TG EAPCET 2027 Admissions Suite" />

      {/* Passive ad banner */}
      <div className="mt-10 w-full">
        <AdSenseUnit slotName="examBanner" minHeight={90} />
      </div>

      <SectionDivider />

      {/* Top Engineering Colleges Directory & Profiles Explorer */}
      <div className="relative z-30">
        <TopEngineeringCollegesExplorer />
      </div>

      {/* Real-time Scraped Official Circulars */}
      <div className="mt-8">
        <LiveNotificationsStream />
      </div>

      <SectionDivider />

      {/* TS ePASS Fee Reimbursement & Scholarship Calculator */}
      <div className="relative z-30 mb-6">
        <FeeReimbursementCalculator />
      </div>

      {/* Top 5 Engineering Colleges Leaderboard */}
      <div className="relative z-10">
        <TopCollegesLeaderboard />
      </div>

      {/* 3-Year Cutoff Trajectory & Shifts */}
      <div className="my-8">
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

      {/* TG EAPCET FAQs Section */}
      <div className="w-full mb-12">
        <FaqSection
          title="TG EAPCET 2027 Admissions & Counselling FAQs"
          subtitle="Frequently asked questions about Telangana engineering counselling, TS ePASS fee reimbursement, cutoffs, and web options"
          faqs={TG_EAPCET_FAQS}
        />
      </div>

      {/* Bottom Ad Unit */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
