import { ArrowLeftRight } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PolycetCollegeComparisonTool from '../../components/polycet/PolycetCollegeComparisonTool';
import ToolGuideSection from '../../components/shared/ToolGuideSection';

export default function PolycetComparePage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="Compare Polytechnic Colleges | TG POLYCET 2027 College Comparison Matrix"
        description="Compare any two polytechnic colleges across fees (₹3.8k Govt vs ₹15.5k Private), seat intakes, hostels, and diploma branch offerings."
        keywords="compare polytechnic colleges in hyderabad, govt polytechnic vs private fees hostels, tg polycet college comparison tool, tg polycet 2027 college compare"
        path="/tg-polycet/compare"
        toolType="comparison"
        examName="TG POLYCET"
      />

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <ArrowLeftRight size={13} />
          <span>Institutional Matrix · 114 Polytechnics</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG POLYCET College Comparison Matrix
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Evaluate tuition fees, diploma branches, intake capacity, and campus facilities side-by-side before exercising your web options.
        </p>
      </div>

      <PolycetCollegeComparisonTool />

      {/* Educational Guide & Comparison Methodology */}
      <ToolGuideSection toolType="compare" examName="TG POLYCET" authorityName="SBTET Telangana" />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
