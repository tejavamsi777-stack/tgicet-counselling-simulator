import { useState } from 'react';
import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PgecetAllotmentExplorer from '../../components/pgecet/PgecetAllotmentExplorer';

export default function PgecetAllotmentsPage() {
  const [hasLoadedData, setHasLoadedData] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG PGECET Seat Allotments 2027 | M.Tech & M.Pharm Candidate Records"
        description="Official TG PGECET college-wise provisional seat allotment records. Search every candidate rank, specialization, and closing cutoffs across Telangana PG colleges."
        keywords="tg pgecet seat allotments 2027, ts pgecet college wise candidate allotment list, tg pgecet m.tech allotments, pgecet closing ranks"
        path="/tg-pgecet/allotments"
        toolType="explorer"
        examName="TG PGECET"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Database size={13} />
          <span>TG PGECET Official Admissions · 2026</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG PGECET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Explore official postgraduate seat allotment records, opening & closing rank spreads, and category distributions across 99 colleges and 101 M.Tech/M.E. specializations in Telangana.
        </p>
      </div>

      {/* Main Explorer Component */}
      <PgecetAllotmentExplorer onDataLoaded={setHasLoadedData} />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
