import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database, Building2, ExternalLink, ChevronRight } from 'lucide-react';
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
import CommunityAlertsBanner from '../../components/ap-eapcet/CommunityAlertsBanner';
import FaqSection from '../../components/shared/FaqSection';
import { AP_EAPCET_FAQS } from '../../data/faqsData';
import { useApEapcetData } from '../../hooks/useApEapcetData';

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
        description="Free AP EAPCET college predictor, mock web options simulator & authentic candidate seat allotments across 411 colleges with verified APSCHE cutoffs."
        path="/ap-eapcet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Andhra Pradesh Admissions 2026
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          AP EAPCET College Predictor, Seat Allotments, Cutoffs &amp; Web Options Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Everything you need for Andhra Pradesh Engineering &amp; Pharmacy Admissions — predict eligible colleges by AP rank, explore official candidate seat allotments across 411 colleges, and practice mock web options entry.
        </p>
      </div>

      {/* 5 Core Action Cards Grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <FeatureCard
          icon={Target}
          title="College Predictor"
          detail="Find eligible engineering colleges based on rank, category & gender."
          to="/exams/ap-eapcet/predictor"
          action="Predict Now"
        />
        <FeatureCard
          icon={Database}
          title="Seat Allotments"
          detail="Official 2025 college-wise allotment lists — every candidate, every seat category."
          to="/ap-eapcet/allotments"
          action="Explore Data"
        />
        <FeatureCard
          icon={ClipboardList}
          title="Exercise Web Options"
          detail="Build and reorder your branch-wise college preference list with zero conflicts."
          to="/exams/ap-eapcet/mock-counselling"
          action="Exercise Options"
        />
        <FeatureCard
          icon={ArrowLeftRight}
          title="Compare Colleges"
          detail="Compare any two engineering colleges across cutoffs, fees & placement CTCs."
          to="/ap-eapcet/compare"
          action="Compare"
        />
        <FeatureCard
          icon={FileCheck}
          title="HLC Checklist"
          detail="Interactive document checklist with MeeSeva validity rules & account sync."
          to="/ap-eapcet/documents"
          action="Check Docs"
        />
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
      <div className="mt-8">
        <LiveNotificationsStream />
      </div>

      <SectionDivider />

      {/* AP Jagananna Vidya Deevena (JVD) Fee & Scholarship Calculator */}
      <div className="relative z-30 mb-6">
        <FeeReimbursementCalculator exam="ap-eapcet" />
      </div>

      {/* Top 5 Engineering Colleges Leaderboard */}
      <div className="relative z-20 mb-10">
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
          subtitle="Frequently asked questions about AP EAPCET web counselling, JVD fee reimbursement, certificate verification, and local area quotas"
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

function FeatureCard({ icon: Icon, title, detail, to, action }) {
  return (
    <Link to={to} className="group relative block h-full w-full outline-none">
      <GlowCard customSize={true} tilt={false} glowColor="purple" className="flex h-full flex-col justify-between p-5">
        <div>
          <div className="glass-button-wrap relative mb-3.5 inline-flex">
            <div className="glass-button flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
              <Icon size={18} className="text-purple-300" />
            </div>
            <div className="glass-button-shadow rounded-xl"></div>
          </div>
          <h2 className="text-base font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-1.5 text-xs font-medium leading-relaxed text-gray-300/90">{detail}</p>
        </div>
        <div className="mt-5">
          <GlassButton
            size="sm"
            className="w-full text-xs"
            contentClassName="flex items-center justify-center gap-1.5"
          >
            <span>{action}</span>
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
          </GlassButton>
        </div>
      </GlowCard>
    </Link>
  );
}
