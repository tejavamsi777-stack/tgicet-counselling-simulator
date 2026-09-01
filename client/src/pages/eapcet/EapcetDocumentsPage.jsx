import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/shared/Seo';
import CertificateChecklist from '../../components/eapcet/CertificateChecklist';
import HlcSyncRibbon from '../../components/shared/HlcSyncRibbon';
import { useEapcetData } from '../../hooks/useEapcetData';

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
  const { data, loading, error } = useEapcetData();

  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG EAPCET 2027 Certificate Verification Documents | HLC Checklist & Rules"
        description="Mandatory certificates checklist for TG EAPCET 2027 Help Line Centre (HLC) verification. Full TS ePASS fee reimbursement criteria and MeeSeva certificate validity rules."
        keywords="tg eapcet certificate verification documents list 2027, ts eamcet hlc documents required, tg eapcet income certificate cutoff date, fee reimbursement eligibility tg eapcet"
        path="/tg-eapcet/documents"
        toolType="guide"
        examName="TG EAPCET"
      />

      {/* Back link */}
      <Link
        to="/tg-eapcet"
        className="no-print inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to TG EAPCET
      </Link>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          TG EAPCET 2027 Certificate Verification Checklist
        </h1>
        <p className="mt-2 text-white/50 text-sm sm:text-base max-w-2xl">
          Official document requirements for TG EAPCET 2027 Help Line Centre (HLC) certificate verification
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
        <CertificateChecklist documents={data?.documents || []} examSlug="tg-eapcet" />
      )}
    </main>
  );
}
