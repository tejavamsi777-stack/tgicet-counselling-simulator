import { ArrowRight, ClipboardList, Target, FileCheck, ArrowLeftRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlowCard } from '../../components/ui/spotlight-card';
import { GlassButton } from '../../components/ui/glass-button';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AdmissionStatusBanner from '../../components/pgecet/AdmissionStatusBanner';
import LiveNotificationsStream from '../../components/pgecet/LiveNotificationsStream';
import PhaseScheduleTable from '../../components/pgecet/PhaseScheduleTable';
import TopCollegesLeaderboard from '../../components/pgecet/TopCollegesLeaderboard';
import CutoffTrendAnalyzer from '../../components/pgecet/CutoffTrendAnalyzer';
import AdmissionConditions from '../../components/pgecet/AdmissionConditions';
import EligibilityMatrix from '../../components/pgecet/EligibilityMatrix';
import CertificateChecklist from '../../components/pgecet/CertificateChecklist';
import FaqSection from '../../components/shared/FaqSection';
import { TG_PGECET_FAQS } from '../../data/faqsData';

function SectionDivider() {
  return <div className="my-12 border-t border-white/[0.06]" />;
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
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </GlassButton>
        </div>
      </GlowCard>
    </Link>
  );
}

export default function PgecetHome() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG PGECET College Predictor, Seat Allotments, Cutoffs, Web Options Simulator"
        description="Free TG PGECET M.Tech & M.Pharm college predictor, mock web options simulator & authentic candidate seat allotments from pgecet.tsche.ac.in with verified closing cutoffs."
        path="/tg-pgecet"
      />

      {/* Hero Header */}
      <div>
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Telangana Postgraduate Admissions 2026
        </span>
        <h1
          className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG PGECET College Predictor, Seat Allotments, Cutoffs, Web Options Simulator
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Everything you need for Telangana Postgraduate Admissions — predict M.Tech &amp; M.Pharm seats by GATE/PGECET rank, explore official candidate seat allotments, and practice web options entry.
        </p>
      </div>

      {/* 5 Core Action Cards Grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={Target}
          title="College Predictor"
          detail="Find eligible M.Tech/M.E. colleges based on PGECET or GATE rank, category & specialization."
          to="/tg-pgecet/predictor"
          action="Predict Now"
        />
        <FeatureCard
          icon={Database}
          title="Seat Allotments"
          detail="Official 2026 college-wise allotment lists — every candidate, percentile, and category quota."
          to="/tg-pgecet/allotments"
          action="Explore Data"
        />
        <FeatureCard
          icon={ArrowLeftRight}
          title="Top PG Colleges"
          detail="Compare top Telangana institutions (OUCE, JNTUH, CBIT, VNR, Vasavi) across PG specializations."
          to="/tg-pgecet/compare"
          action="View Ranking"
        />
        <FeatureCard
          icon={FileCheck}
          title="HLC Checklist"
          detail="Interactive document checklist for Online Certificate Verification with MeeSeva rules."
          to="/tg-pgecet/documents"
          action="Check Docs"
        />
      </div>

      {/* Passive ad banner */}
      <div className="mt-10 w-full">
        <AdSenseUnit slotName="examBanner" minHeight={90} />
      </div>

      <SectionDivider />

      {/* Admission Status Banner */}
      <AdmissionStatusBanner year="2026" />

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

      {/* Specialization Cutoff Trajectory & Trends */}
      <div>
        <CutoffTrendAnalyzer />
      </div>

      <SectionDivider />

      {/* Phase-Wise Schedule */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Phase-Wise Counselling Schedule</h2>
        <PhaseScheduleTable />
      </div>

      <SectionDivider />

      {/* Admission Conditions */}
      <div>
        <AdmissionConditions />
      </div>

      <SectionDivider />

      {/* Feeder Eligibility Matrix */}
      <div>
        <EligibilityMatrix />
      </div>

      <SectionDivider />

      {/* HLC Certificate Checklist */}
      <div>
        <CertificateChecklist />
      </div>

      <SectionDivider />

      {/* TG PGECET FAQs Section */}
      <div className="w-full mb-12">
        <FaqSection
          title="TG PGECET 2026 M.Tech & M.Pharm Admissions FAQs"
          subtitle="Frequently asked questions about GATE/GPAT priorities, postgraduate cutoffs, and seat allotments"
          faqs={TG_PGECET_FAQS}
        />
      </div>

      {/* Bottom Ad Unit */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
