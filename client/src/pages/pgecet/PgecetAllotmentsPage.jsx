import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import PgecetAllotmentExplorer from '../../components/pgecet/PgecetAllotmentExplorer';
import { useReviewPrompt } from '../../hooks/useReviewPrompt';
import ReviewModal from '../../components/shared/ReviewModal';

export default function PgecetAllotmentsPage() {
  const { isOpen: isReviewOpen, closePrompt: closeReview } = useReviewPrompt(
    true,
    'tg-pgecet'
  );

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={closeReview}
        examSlug="tg-pgecet"
      />
      <Seo
        title="TG PGECET College-Wise Seat Allotment Explorer | M.Tech & M.E. Cutoffs"
        description="Explore TG PGECET post graduate engineering seat allotment data by college and specialization. View candidate ranks, percentiles, categories, and closing cutoffs."
        path="/tg-pgecet/allotments"
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
      <PgecetAllotmentExplorer />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
