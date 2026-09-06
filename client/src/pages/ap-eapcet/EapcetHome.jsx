import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database, Building2, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowCard } from '../../components/ui/spotlight-card';
import { GlassButton } from '../../components/ui/glass-button';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AdmissionStatusBanner from '../../components/ap-eapcet/AdmissionStatusBanner';
import LiveNotificationsStream from '../../components/ap-eapcet/LiveNotificationsStream';
import PhaseScheduleTable from '../../components/ap-eapcet/PhaseScheduleTable';
import AdmissionConditions from '../../components/ap-eapcet/AdmissionConditions';
import EligibilityMatrix from '../../components/ap-eapcet/EligibilityMatrix';
import TopCollegesLeaderboard from '../../components/ap-eapcet/TopCollegesLeaderboard';
import FeeReimbursementCalculator from '../../components/shared/FeeReimbursementCalculator';
import OfficialCollegeProfileViewer from '../../components/ap-eapcet/OfficialCollegeProfileViewer';
import ExamDocumentsOverview from '../../components/shared/ExamDocumentsOverview';
import CommunityAlertsBanner from '../../components/ap-eapcet/CommunityAlertsBanner';
import FaqSection from '../../components/shared/FaqSection';
import { AP_EAPCET_FAQS } from '../../data/faqsData';
import { useApEapcetData } from '../../hooks/useApEapcetData';

import ExamToolsSection from '../../components/shared/ExamToolsSection';

const AP_EAPCET_TOOLS = [
  {
    icon: Target,
    title: "College Predictor",
    detail: "Find eligible engineering colleges based on rank, category & gender.",
    to: "/exams/ap-eapcet/predictor",
    action: "Predict Now",
    tag: "Predictors",
    keywords: ["college predictor", "andhra pradesh", "engineering", "b.tech", "closing rank", "au", "jntuk", "jntua"],
  },
  {
    icon: ArrowLeftRight,
    title: "Compare Colleges",
    detail: "Compare any two engineering colleges across cutoffs, fees & placement CTCs.",
    to: "/ap-eapcet/compare",
    action: "Compare",
    tag: "Comparison",
    keywords: ["compare", "matrix", "auce vs gvpx", "institutions", "fees", "placements", "packages"],
  },
  {
    icon: FileCheck,
    title: "HLC Checklist",
    detail: "Interactive document checklist with MeeSeva validity rules & account sync.",
    to: "/ap-eapcet/documents",
    action: "Check Docs",
    tag: "Documents",
    keywords: ["documents", "hlc", "verification", "certificates", "income certificate", "caste", "meeseva"],
  },
  {
    icon: Sparkles,
    title: "Create Web Options",
    detail: "Generate optimal Dream, Target & Safe preference lists based on cutoff analytics.",
    to: "/exams/ap-eapcet/create-web-options",
    action: "Create Options",
    tag: "Web Options",
    keywords: ["create web options", "smart list", "dream", "target", "safe", "generator", "preferences"],
  },
  {
    icon: ClipboardList,
    title: "Exercise Web Options",
    detail: "Build and reorder your branch-wise college preference list with zero conflicts.",
    to: "/exams/ap-eapcet/mock-counselling",
    action: "Exercise Options",
    tag: "Web Options",
    keywords: ["exercise web options", "mock counselling", "simulator", "priority", "reorder", "pdf download"],
  },
  {
    icon: Database,
    title: "Seat Allotments",
    detail: "Official college-wise allotment lists — every candidate, every seat category.",
    to: "/ap-eapcet/allotments",
    action: "Explore Data",
    tag: "Allotments",
    keywords: ["allotments", "candidate wise", "closing ranks", "seat matrix", "eapcet-sche.aptonline.in"],
  },
];

function SectionDivider() {
  return <div className="my-12 border-t border-white/[0.06]" />;
}

function ShimmerBlock({ height = 'h-40' }) {
  return <div className={`animate-pulse bg-white/5 rounded-2xl ${height}`} />;
}

export default function EapcetHome() {
  const { data, loading } = useApEapcetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="AP EAPCET College Predictor, Seat Allotments, Cutoffs & Web Options Simulator"
        description="Free AP EAPCET engineering college predictor, mock web options simulator & authentic candidate seat allotments across 411 Andhra Pradesh colleges with verified APSCHE cutoffs."
        path="/ap-eapcet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Andhra Pradesh Admissions
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          AP EAPCET College Predictor, Seat Allotments, Cutoffs &amp; Web Options Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Everything you need for Andhra Pradesh Engineering &amp; Pharmacy Admissions — predict eligible colleges by AP rank, explore official candidate seat allotments across 411 colleges, and practice mock web options entry.
        </p>
      </div>

      {/* 6 Core Action Cards Grid with Search Tab */}
      <ExamToolsSection tools={AP_EAPCET_TOOLS} title="AP EAPCET Admissions Suite" />

      <SectionDivider />

      {/* AP Post Matric Scholarships (RTF) Fee & Scholarship Calculator */}
      <div className="relative z-30">
        <FeeReimbursementCalculator exam="ap-eapcet" />
      </div>

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
      <div className="relative z-20">
        <LiveNotificationsStream />
      </div>

      <SectionDivider />

      {/* Documents Needed & HLC Checklist */}
      <div className="relative z-20">
        <ExamDocumentsOverview examName="AP EAPCET" checklistPath="/ap-eapcet/documents" />
      </div>

      {/* Top 5 Engineering Colleges Leaderboard */}
      <div className="relative z-20 mb-8">
        <TopCollegesLeaderboard />
      </div>

      <SectionDivider />

      {/* Official College Profiles & Branch Fee Details (Scraped from cap.apcfss.in) */}
      <div className="relative z-10 mb-8">
        <OfficialCollegeProfileViewer />
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

      {/* AP EAPCET FAQs Section */}
      <div className="w-full mb-12">
        <FaqSection
          title="AP EAPCET 2026 Admissions & Counselling FAQs"
          subtitle="Frequently asked questions about AP EAPCET web counselling, Post Matric Scholarships (RTF) fee reimbursement, certificate verification, and local area quotas"
          faqs={AP_EAPCET_FAQS}
        />
      </div>

      {/* Bottom Ad Unit */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
