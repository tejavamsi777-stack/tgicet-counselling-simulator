import { useState } from 'react';
import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import IcetAllotmentExplorer from '../../components/icet/IcetAllotmentExplorer';
import ToolGuideSection from '../../components/shared/ToolGuideSection';

export default function IcetAllotmentsPage() {
  const [hasLoadedData, setHasLoadedData] = useState(false);

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG ICET Seat Allotments 2027 | College-Wise Candidate Records & Cutoffs"
        description="Explore official TG ICET college-wise provisional seat allotment lists from tgicet.nic.in. Search every candidate rank, reservation category, and closing cutoffs across 344 MBA/MCA colleges."
        keywords="tg icet seat allotments 2027, ts icet college wise seat allotment list, tgicet candidate wise allotment records, tg icet 2027 closing cutoffs mba mca"
        path="/tg-icet/allotments"
        toolType="explorer"
        examName="TG ICET"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Database size={13} />
          <span>TG ICET Seat Allotment Analytics · 2027</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG ICET 2027 College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any MBA or MCA college and course to explore authentic candidate allotment records, opening &amp; closing ranks, and category distribution directly from the official portal.
        </p>
      </div>

      {/* Main Explorer */}
      <IcetAllotmentExplorer onDataLoaded={setHasLoadedData} />

      {/* Educational Guide & Allotment Analytics */}
      <ToolGuideSection toolType="allotments" examName="TG ICET" authorityName="TSCHE" />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
