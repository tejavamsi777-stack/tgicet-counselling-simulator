import { useState } from 'react';
import { Database, ShieldCheck, Sparkles } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PolycetAllotmentExplorer from '../../components/polycet/PolycetAllotmentExplorer';

export default function PolycetAllotmentsPage() {
  const [hasLoadedData, setHasLoadedData] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG POLYCET College-Wise Seat Allotment Explorer | Candidate Records"
        description="Explore TG POLYCET polytechnic seat allotment data by college and diploma branch. View candidate ranks, category distribution, closing cutoffs, and comprehensive admission analytics."
        path="/tg-polycet/allotments"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Database size={13} />
          <span>Seat Allotment Analytics · 2026</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG POLYCET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any polytechnic institution and branch to explore candidate allotment records, opening & closing rank spreads, and category analytics.
        </p>
      </div>

      {/* Main Explorer Component */}
      <PolycetAllotmentExplorer onDataLoaded={setHasLoadedData} />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
