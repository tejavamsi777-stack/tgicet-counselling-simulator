import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/shared/Seo';
import CertificateChecklist from '../../components/pgecet/CertificateChecklist';
import HlcSyncRibbon from '../../components/shared/HlcSyncRibbon';

export default function PgecetDocumentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG PGECET 2026 Document Checklist | HLC Certificate Verification Guide"
        description="Official document requirements for TG PGECET Help Line Centre (HLC) certificate verification. Interactive checklist for GATE, GPAT, and PGECET candidates."
        path="/tg-pgecet/documents"
      />

      <Link
        to="/tg-pgecet"
        className="no-print inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to TG PGECET
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          PG Certificate Verification Checklist
        </h1>
        <p className="mt-2 text-white/50 text-sm sm:text-base max-w-2xl">
          Official document requirements for Telangana Council of Higher Education (TGCHE) Help Line Centre verification for M.Tech, M.E., M.Arch &amp; M.Pharmacy admissions.
        </p>
      </div>

      <HlcSyncRibbon examSlug="tg-pgecet" />

      <div className="mt-8">
        <CertificateChecklist />
      </div>
    </main>
  );
}
