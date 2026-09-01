import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import CollegeComparisonTool from '../../components/icet/CollegeComparisonTool';
import TopCollegesLeaderboard from '../../components/icet/TopCollegesLeaderboard';
import CutoffTrendAnalyzer from '../../components/icet/CutoffTrendAnalyzer';
import AdSenseUnit from '../../components/ads/AdSenseUnit';

export default function IcetComparePage() {
  const [searchParams] = useSearchParams();
  const c1 = searchParams.get('c1') || 'OUCC';
  const c2 = searchParams.get('c2') || 'CBIT';
  const program = searchParams.get('program') || 'MBA';

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title={c1 && c2 && c1 !== 'OUCC' ? `${c1} vs ${c2} Comparison | TG ICET 2027 MBA & MCA` : `Compare MBA & MCA Colleges | TG ICET 2027 College Comparison Matrix`}
        description={`Side-by-side comparison of TG ICET MBA & MCA institutions covering closing cutoffs, placement packages, NAAC ratings, and tuition fee structures.`}
        keywords="compare mba colleges in hyderabad, cbit vs ou mba fees cutoffs, tg icet college comparison tool, top mca colleges in telangana compare, tg icet 2027 college compare"
        path="/tg-icet/compare"
        toolType="comparison"
        examName="TG ICET"
      />

      {/* Back button */}
      <Link
        to="/tg-icet"
        className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to TG ICET Admissions Suite</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          TG ICET 2027 • College Comparison Engine
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Compare MBA &amp; MCA Colleges 2027
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl">
          Evaluate any two Telangana MBA or MCA colleges side-by-side across cutoff benchmarks, highest/average packages, and government fee tiers.
        </p>
      </div>

      {/* Comparison Engine */}
      <CollegeComparisonTool initialC1={c1} initialC2={c2} initialProgram={program} />

      {/* Ad Banner */}
      <div className="my-10">
        <AdSenseUnit slotName="compareBanner" minHeight={90} />
      </div>

      {/* 4-Year Cutoff Trajectory */}
      <div className="my-10">
        <CutoffTrendAnalyzer />
      </div>

      {/* Top Leaderboard */}
      <div className="my-10">
        <TopCollegesLeaderboard />
      </div>
    </main>
  );
}
