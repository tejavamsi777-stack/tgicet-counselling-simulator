import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database } from 'lucide-react';
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
        title="TG ECET College Predictor, Seat Allotments, Cutoffs, Web Options Simulator"
        description="Free TG ECET diploma lateral entry college predictor, mock web options simulator & authentic candidate seat allotments from tgecet.nic.in with verified closing cutoffs."
        path="/tg-ecet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Telangana Lateral Entry Admissions 2026
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          TG ECET College Predictor, Seat Allotments, Cutoffs, Web Options Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Everything you need for Telangana Lateral Entry B.Tech Admissions — predict 2nd-year engineering seats by ECET rank, explore official candidate seat allotments across 293 colleges, and practice web options entry.
        </p>
      </div>

      {/* 5 Core Action Cards Grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <FeatureCard
          icon={Target}
          title="College Predictor"
          detail="Find eligible engineering colleges based on diploma rank, category & branch."
          to="/exams/tg-ecet/predictor"
          action="Predict Now"
        />
        <FeatureCard
          icon={Database}
          title="Seat Allotments"
          detail="Official 2026 college-wise allotment lists — every candidate, every seat category."
          to="/tg-ecet/allotments"
          action="Explore Data"
        />
        <FeatureCard
          icon={ClipboardList}
          title="Exercise Web Options"
          detail="Build and reorder your branch-wise college preference list with zero conflicts."
          to="/exams/tg-ecet/mock-counselling"
          action="Exercise Options"
        />
        <FeatureCard
          icon={ArrowLeftRight}
          title="Compare Colleges"
          detail="Compare any two engineering colleges side-by-side across cutoffs & seats."
          to="/tg-ecet/compare"
          action="Compare"
        />
        <FeatureCard
          icon={FileCheck}
          title="HLC Checklist"
          detail="Interactive document checklist with MeeSeva validity rules & account sync."
          to="/tg-ecet/documents"
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
            variant="ghost"
            className="w-full justify-between text-xs font-semibold text-purple-300 group-hover:text-white"
          >
            <span>{action}</span>
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </GlassButton>
        </div>
      </GlowCard>
    </Link>
  );
}
