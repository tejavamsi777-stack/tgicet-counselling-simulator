import { Database } from 'lucide-react';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import IcetAllotmentExplorer from '../../components/icet/IcetAllotmentExplorer';
import { useReviewPrompt } from '../../hooks/useReviewPrompt';
import ReviewModal from '../../components/shared/ReviewModal';

export default function IcetAllotmentsPage() {
  const { isOpen: isReviewOpen, closePrompt: closeReview } = useReviewPrompt(
    true,
    'tg-icet'
  );

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={closeReview}
        examSlug="tg-icet"
      />
      <Seo
        title="TG ICET Seat Allotment List 2026 | MBA & MCA College-Wise Candidates"
        description="Explore TG ICET MBA & MCA college and branch seat allotments from tgicet.nic.in. View candidate ranks, category distribution, closing cutoffs, and live admission analytics across 344 colleges."
        path="/tg-icet/allotments"
      />

      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Database size={13} />
          <span>TG ICET Seat Allotment Analytics · 2026</span>
        </div>
        <h1
          className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG ICET College-Wise Seat Allotment Explorer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl">
          Select any MBA or MCA college and course to explore authentic candidate allotment records, opening &amp; closing ranks, and category distribution directly from the official portal.
        </p>
      </div>

      {/* Main Explorer */}
      <IcetAllotmentExplorer />

      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
