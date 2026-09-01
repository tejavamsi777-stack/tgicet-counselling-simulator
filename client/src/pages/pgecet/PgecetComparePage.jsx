import { ArrowLeftRight } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PgecetCollegeComparisonTool from '../../components/pgecet/PgecetCollegeComparisonTool';

export default function PgecetComparePage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="Compare M.Tech & M.Pharm Colleges | TG PGECET 2027 College Comparison"
        description="Side-by-side comparison of Telangana PG colleges on specialization cutoffs, AICTE stipends, tuition fees, and research placements."
        keywords="compare m.tech colleges in telangana, ou vs jntuh m.tech fee cutoffs, tg pgecet college comparison tool, tg pgecet 2027 college compare"
        path="/tg-pgecet/compare"
        toolType="comparison"
        examName="TG PGECET"
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
