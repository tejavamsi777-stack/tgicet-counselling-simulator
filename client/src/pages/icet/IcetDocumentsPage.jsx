import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/shared/Seo';
import CertificateChecklist from '../../components/icet/CertificateChecklist';
import HlcSyncRibbon from '../../components/shared/HlcSyncRibbon';
import { useIcetData } from '../../hooks/useIcetData';

function ShimmerRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-white/5 rounded-xl h-12" />
      ))}
    </div>
  );
}

export default function IcetDocumentsPage() {
  const { data, loading, error } = useIcetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG ICET Document Checklist | Certificate Verification Guide"
        description="Official document requirements for TG ICET Help Line Centre (HLC) certificate verification. Interactive checklist with category filters."
        path="/tg-icet/documents"
      />

      {/* Back link */}
      <Link
        to="/tg-icet"
        className="no-print inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to TG ICET
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Certificate Verification Checklist
        </h1>
        <p className="mt-2 text-white/50 text-sm sm:text-base max-w-2xl">
          Official document requirements for TG ICET Help Line Centre (HLC) certificate verification
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <ShimmerRows />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-6 text-red-300 text-sm">
          Failed to load document list: {error}
        </div>
      ) : (
        <CertificateChecklist documents={data?.documents || []} examSlug="tg-icet" />
      )}
    </main>
  );
}
