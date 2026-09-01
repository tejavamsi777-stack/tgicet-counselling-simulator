import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../../components/shared/Seo';
import CertificateChecklist from '../../components/pgecet/CertificateChecklist';


export default function PgecetDocumentsPage() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-10 lg:px-14 sm:py-12">
      <Seo
        title="TG PGECET 2027 Certificate Verification Documents | PG HLC Checklist"
        description="Complete document checklist for TG PGECET 2027 certificate verification at Help Line Centres (HLC). GATE/GPAT scorecards, B.Tech provisional certificate rules."
        keywords="tg pgecet certificate verification documents 2027, ts pgecet hlc checklist, gate scorecard b.tech pc verification, pgecet documents required"
        path="/tg-pgecet/documents"
        toolType="guide"
        examName="TG PGECET"
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



      <div className="mt-8">
        <CertificateChecklist />
      </div>
    </main>
  );
}
