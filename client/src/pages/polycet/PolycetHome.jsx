import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowCard } from '../../components/ui/spotlight-card';
import { GlassButton } from '../../components/ui/glass-button';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AdmissionStatusBanner from '../../components/polycet/AdmissionStatusBanner';
import LiveNotificationsStream from '../../components/polycet/LiveNotificationsStream';
import PhaseScheduleTable from '../../components/polycet/PhaseScheduleTable';
import AdmissionConditions from '../../components/polycet/AdmissionConditions';
import EligibilityMatrix from '../../components/polycet/EligibilityMatrix';
import TopCollegesLeaderboard from '../../components/polycet/TopCollegesLeaderboard';
import CutoffTrendAnalyzer from '../../components/polycet/CutoffTrendAnalyzer';
import CommunityAlertsBanner from '../../components/eapcet/CommunityAlertsBanner';
import FaqSection from '../../components/shared/FaqSection';
import { TG_POLYCET_FAQS } from '../../data/faqsData';
import { usePolycetData } from '../../hooks/usePolycetData';

import ExamToolsSection from '../../components/shared/ExamToolsSection';

const POLYCET_TOOLS = [
  {
    icon: Target,
    title: "College Predictor",
    detail: "Find eligible polytechnic colleges based on 10th rank, category & gender.",
    to: "/exams/tg-polycet/predictor",
    action: "Predict Now",
    tag: "Predictors",
    keywords: ["college predictor", "polytechnic", "diploma", "ssc", "10th", "closing rank", "masab tank"],
  },
  {
    icon: ArrowLeftRight,
    title: "Compare Colleges",
    detail: "Compare any two polytechnic colleges across fees (₹3.8k vs ₹15.5k), intakes & hostels.",
    to: "/tg-polycet/compare",
    action: "Compare",
    tag: "Comparison",
    keywords: ["compare", "matrix", "institutions", "fees", "hostels", "diploma branches"],
  },
  {
    icon: FileCheck,
    title: "HLC Checklist",
    detail: "Interactive document checklist with MeeSeva validity rules & account sync.",
    to: "/tg-polycet/documents",
    action: "Check Docs",
    tag: "Documents",
    keywords: ["documents", "hlc", "verification", "certificates", "ssc hallticket", "caste", "meeseva"],
  },
  {
    icon: Sparkles,
    title: "Create Web Options",
    detail: "Generate optimal Dream, Target & Safe preference lists based on cutoff analytics.",
    to: "/exams/tg-polycet/create-web-options",
    action: "Create Options",
    tag: "Web Options",
    keywords: ["create web options", "smart list", "dream", "target", "safe", "generator", "preferences"],
  },
  {
    icon: ClipboardList,
    title: "Exercise Web Options",
    detail: "Build and reorder your diploma branch-wise college preference list with zero conflicts.",
    to: "/exams/tg-polycet/mock-counselling",
    action: "Exercise Options",
    tag: "Web Options",
    keywords: ["exercise web options", "mock counselling", "simulator", "priority", "reorder", "pdf download"],
  },
  {
    icon: Database,
    title: "Seat Allotments",
    detail: "Official 2026 college-wise allotment lists — 20,939 candidate records across 114 colleges.",
    to: "/tg-polycet/allotments",
    action: "Explore Data",
    tag: "Allotments",
    keywords: ["allotments", "candidate wise", "closing ranks", "seat matrix", "tgpolycet.nic.in"],
  },
];

function SectionDivider() {
  return <div className="my-12 border-t border-white/[0.06]" />;
}

function ShimmerBlock({ height = 'h-40' }) {
  return <div className={`animate-pulse bg-white/5 rounded-2xl ${height}`} />;
}

export default function PolycetHome() {
  const { data, loading } = usePolycetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG POLYCET College Predictor, Seat Allotments, Cutoffs & Web Options Simulator"
        description="Free TG POLYCET polytechnic diploma college predictor, mock web options simulator & authentic candidate seat allotments from tgpolycet.nic.in with verified closing cutoffs."
        path="/tg-polycet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Telangana Polytechnic Admissions 2026
        </span>
        <h1
          className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG POLYCET College Predictor, Seat Allotments, Cutoffs &amp; Web Options Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Everything you need for Telangana Polytechnic Diploma Admissions — predict polytechnic seats by SSC/POLYCET rank, explore official candidate seat allotments across 114 colleges, and practice web options entry.
        </p>
      </div>

      {/* 6 Core Action Cards Grid with Search Tab */}
      <ExamToolsSection tools={POLYCET_TOOLS} title="TG POLYCET Admissions Suite" />

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

      {/* Top Government Polytechnics Leaderboard */}
      <div>
        <TopCollegesLeaderboard />
      </div>

      <SectionDivider />

      {/* 4-Year Cutoff Trajectory & Shifts */}
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

      {/* TG POLYCET FAQs Section */}
      <div className="w-full mb-12">
        <FaqSection
          title="TG POLYCET 2026 Diploma Admissions FAQs"
          subtitle="Frequently asked questions about 10th-based Polytechnic Diploma counselling, government polytechnic cutoffs, and reservations"
          faqs={TG_POLYCET_FAQS}
        />
      </div>

      {/* Bottom Ad Unit */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
