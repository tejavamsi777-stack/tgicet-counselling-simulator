import { ArrowLeftRight } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PgecetCollegeComparisonTool from '../../components/pgecet/PgecetCollegeComparisonTool';

export default function PgecetComparePage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="Compare TG PGECET M.Tech Colleges 2026 | Cutoffs & Specializations"
        description="Compare any two postgraduate engineering institutions side-by-side. View cutoffs, M.Tech branches, university affiliations, and seat matrix across 99 colleges in Telangana."
        path="/tg-pgecet/compare"
      />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <ArrowLeftRight size={13} />
          <span>Postgraduate Institutional Matrix · 99 Institutions</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG PGECET College Comparison Matrix
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Evaluate M.Tech, M.E. and M.Arch specializations, opening &amp; closing cutoffs, and university affiliations side-by-side.
        </p>
      </div>

      <PgecetCollegeComparisonTool />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
