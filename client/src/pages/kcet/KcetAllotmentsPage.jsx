import { useState } from 'react';
import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import AllotmentExplorer from '../../components/eapcet/AllotmentExplorer';
import { kcetApi } from '../../lib/kcetApi';
import ToolGuideSection from '../../components/shared/ToolGuideSection';

export default function KcetAllotmentsPage() {
  const [hasLoadedData, setHasLoadedData] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="KCET Seat Allotments 2027 | Karnataka Engineering Candidate Cutoffs & Records"
        description="Official KCET (Karnataka CET) college-wise seat allotment records from kea.kar.nic.in. Search RVCE, BMSCE, MSRIT candidate ranks, KEA categories, and closing cutoffs."
        keywords="kcet seat allotments 2027, kea kar nic in candidate allotment list, rvc bmsce msrit cutoffs kcet, kcet 2027 closing ranks"
        path="/kcet/allotments"
        toolType="explorer"
        examName="KCET"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <Database size={13} />
          <span>KEA Karnataka Seat Allotment Analytics · 2025</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          KCET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any Karnataka engineering college (UVCE, BMSCE, RVCE, MSRIT, SJCE, NIE, etc.) and branch to explore candidate allotment records, opening & closing rank spreads, and category analytics.
        </p>
      </div>

      {/* Main Explorer */}
      <AllotmentExplorer
        onDataLoaded={setHasLoadedData}
        apiObj={kcetApi}
        defaultCollege=""
        defaultBranch=""
        examTitle="KCET"
        examSlug="kcet"
        categoryFilters={[
          'ALL',
          'GM',
          '1G',
          '2AG',
          '2BG',
          '3AG',
          '3BG',
          'SCG',
          'STG',
          'GMR',
          'GMK',
          'EWS'
        ]}
      />

      {/* Educational Guide & Allotment Analytics */}
      <ToolGuideSection toolType="allotments" examName="KCET" authorityName="KEA (Karnataka Examinations Authority)" />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
