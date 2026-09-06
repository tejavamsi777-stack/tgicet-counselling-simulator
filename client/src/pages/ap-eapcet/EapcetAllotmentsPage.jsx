import { useState } from 'react';
import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AllotmentExplorer from '../../components/ap-eapcet/AllotmentExplorer';
import ToolGuideSection from '../../components/shared/ToolGuideSection';

export default function EapcetAllotmentsPage() {
  const [hasLoadedData, setHasLoadedData] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="AP EAPCET Seat Allotments 2027 | College-Wise Candidate Records & Cutoffs"
        description="Official AP EAPCET college-wise provisional seat allotment records. Search all candidates, closing cutoffs, and seat categories across 411 Andhra Pradesh colleges."
        keywords="ap eapcet seat allotments 2027, ap eamcet college wise candidate allotment list, ap eapcet cutoffs 411 colleges, eapcet-sche.aptonline.in allotment records"
        path="/ap-eapcet/allotments"
        toolType="explorer"
        examName="AP EAPCET"
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
          AP EAPCET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any college and branch to explore candidate allotment records, opening & closing rank spreads, and demographic category analytics.
        </p>
      </div>

      {/* Main Explorer */}
      <AllotmentExplorer onDataLoaded={setHasLoadedData} />

      {/* Educational Guide & Allotment Analytics */}
      <ToolGuideSection toolType="allotments" examName="AP EAPCET" authorityName="APSCHE" />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
