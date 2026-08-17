import { Database, ShieldCheck, Sparkles } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PolycetAllotmentExplorer from '../../components/polycet/PolycetAllotmentExplorer';

export default function PolycetAllotmentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG POLYCET 2026 Official College-Wise Seat Allotments & Candidate Records"
        description="Explore verified TG POLYCET 2026 polytechnic seat allotment data by college and diploma branch. View every candidate's hall ticket, rank, caste category, region, and allocated quota directly from SBTET records."
        path="/tg-polycet/allotments"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Database size={13} />
          <span>Official SBTET Data · 2026 Admissions</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG POLYCET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any polytechnic institution and branch to view every candidate allotted a seat in real-time — verified directly from the official State Board portal (
          <a
            href="https://tgpolycet.nic.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:underline"
          >
            tgpolycet.nic.in
          </a>
          ).
        </p>
      </div>

      {/* Main Explorer Component */}
      <PolycetAllotmentExplorer />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
