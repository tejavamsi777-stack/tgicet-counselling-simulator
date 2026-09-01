import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import CollegeComparisonTool from '../../components/ecet/CollegeComparisonTool';
import TopCollegesLeaderboard from '../../components/ecet/TopCollegesLeaderboard';
import CutoffTrendAnalyzer from '../../components/ecet/CutoffTrendAnalyzer';
import AdSenseUnit from '../../components/ads/AdSenseUnit';

export default function EcetComparePage() {
  const [searchParams] = useSearchParams();
  const c1 = searchParams.get('c1') || 'CBIT';
  const c2 = searchParams.get('c2') || 'VASV';
  const branch = searchParams.get('branch') || 'CSE';

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title={c1 && c2 && c1 !== 'CBIT' ? `${c1} vs ${c2} Comparison | TG ECET 2027 Engineering` : `Compare Lateral Entry Colleges | TG ECET 2027 College Comparison Matrix`}
        description={`Side-by-side comparison of Telangana lateral entry colleges on cutoffs, lateral entry seat capacity, tuition fees, and placements.`}
        keywords="compare lateral entry engineering colleges, tg ecet college comparison tool, ecet lateral entry intake comparison, tg ecet 2027 college compare"
        path="/tg-ecet/compare"
        toolType="comparison"
        examName="TG ECET"
      />

      {/* Back button */}
      <Link
        to="/tg-ecet"
        className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Back to TG ECET Admissions Suite</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Lateral Entry Institution Comparison Engine
        </span>
        <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Engineering College Matrix
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl">
          Evaluate any two Telangana engineering colleges side-by-side across lateral entry cutoff benchmarks, highest/average packages, and government fee tiers.
        </p>
      </div>

      {/* Comparison Engine */}
      <CollegeComparisonTool initialC1={c1} initialC2={c2} initialBranch={branch} />

      {/* Ad Banner */}
      <div className="my-10">
        <AdSenseUnit slotName="compareBanner" minHeight={90} />
      </div>

      {/* Lateral Cutoff Trajectory */}
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
