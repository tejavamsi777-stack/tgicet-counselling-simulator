import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AllotmentExplorer from '../../components/eapcet/AllotmentExplorer';

export default function EapcetAllotmentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG EAPCET 2025 & 2026 Official College-Wise Seat Allotment | TSCHE Candidate Records"
        description="Search official TG EAPCET 2025 and 2026 seat allotment data by college and branch. View every candidate's hall ticket, rank, gender, region, category, and allotted seat quota directly from TSCHE verified records."
        path="/tg-eapcet/allotments"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Database size={13} />
          <span>Official TSCHE Data · 2026</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG EAPCET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any college and branch to instantly view every candidate allotted a seat — verified directly from the official TSCHE portal
          (<a href="https://tgeapcet.nic.in" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">tgeapcet.nic.in</a>).
        </p>
      </div>

      {/* Main Explorer */}
      <AllotmentExplorer />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
