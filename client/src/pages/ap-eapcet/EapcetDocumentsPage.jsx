import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/shared/Seo';
import CertificateChecklist from '../../components/ap-eapcet/CertificateChecklist';
import HlcSyncRibbon from '../../components/shared/HlcSyncRibbon';
import { useApEapcetData } from '../../hooks/useApEapcetData';

function ShimmerRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-white/5 rounded-xl h-12" />
      ))}
    </div>
  );
}

export default function EapcetDocumentsPage() {
  const { data, loading, error } = useApEapcetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="AP EAPCET 2027 Certificate Verification Documents | HLC Checklist & Post Matric Scholarships (RTF) Rules"
        description="Mandatory certificates checklist for AP EAPCET 2027 Help Line Centre (HLC) verification. Post Matric Scholarships (RTF) fee reimbursement eligibility and MeeSeva rules."
        keywords="ap eapcet certificate verification documents 2027, ap eamcet hlc checklist, jagananna vidya deevena documents required, ap eapcet required certificates"
        path="/ap-eapcet/documents"
        toolType="guide"
        examName="AP EAPCET"
      />

      {/* Back link */}
      <Link
        to="/ap-eapcet"
        className="no-print inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to AP EAPCET
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Certificate Verification Checklist
        </h1>
        <p className="mt-2 text-white/50 text-sm sm:text-base max-w-2xl">
          Official document requirements for AP EAPCET Help Line Centre (HLC) certificate verification
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
        <CertificateChecklist documents={data?.documents || []} examSlug="ap-eapcet" />
      )}
    </main>
  );
}
