import Seo from "../../components/shared/Seo";
import { Info, Sparkles, Database, Target, Award, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300">
      <Seo
        title="About Us — Vuela Learn Admissions Navigator"
        description="Learn about Vuela Learn, India's leading 100% free educational counselling simulation platform for TG EAPCET, TG ICET, AP EAPCET and polytechnic admissions."
        path="/about"
      />

      <div className="mb-8 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
          <Info size={14} />
          <span>Our Mission &amp; Purpose</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          About Vuela Learn
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Democratizing state educational admissions counselling through authentic data and predictive analytics.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            1. Why Vuela Learn Was Built
          </h2>
          <p>
            State entrance examination counselling in Andhra Pradesh and Telangana is complex. With multiple rounds, regional local jurisdictions (OU, AU, SVU), dozens of reservation categories (OC, EWS, BC-A/B/C/D/E, SC, ST), and shifting tuition fee structures, students often make sub-optimal web option choices or fall prey to misleading private college agents.
          </p>
          <p>
            <strong className="text-white">Vuela Learn</strong> was created as an independent, 100% free counseling simulation suite. We give students and parents institutional transparency, reliable closing rank cutoffs, and AI-driven priority ordering tools to navigate engineering, MBA, MCA, and diploma admissions with confidence.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database size={18} className="text-cyan-400" />
            2. Our Core Features &amp; Supported Exams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-bold text-white text-base mb-1 text-purple-300">TG EAPCET &amp; AP EAPCET</h3>
              <p className="text-xs text-gray-400">Engineering, Agriculture &amp; Pharmacy predictors, closing ranks archive, and Smart Web Option Generators for B.Tech.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-bold text-white text-base mb-1 text-cyan-300">TG ICET (MBA &amp; MCA)</h3>
              <p className="text-xs text-gray-400">Unified rank calculators, Marks vs Rank predictors, and seat allotment closing statistics for postgraduate management.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-bold text-white text-base mb-1 text-emerald-300">TG ECET (Diploma Lateral Entry)</h3>
              <p className="text-xs text-gray-400">2nd-year B.Tech admission prediction and choice simulators tailored for polytechnic diploma holders.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-bold text-white text-base mb-1 text-pink-300">TG POLYCET &amp; PGECET</h3>
              <p className="text-xs text-gray-400">Diploma admissions after 10th class, and postgraduate M.Tech / M.Pharm specialization analyzers.</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award size={18} className="text-emerald-400" />
            3. Data Authenticity &amp; Neutrality
          </h2>
          <p>
            All cutoffs, fee structures, and allotment statistics displayed on Vuela Learn are derived directly from verified official gazettes and candidate seat allotment archives published by TSCHE (Telangana State Council of Higher Education), APSCHE (Andhra Pradesh State Council of Higher Education), and APCFSS.
          </p>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-gray-300 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} /> Open Access Guarantee
            </div>
            <p>
              Vuela Learn is completely free and independent. We are not a broker, agent, or commercial counseling intermediary. We do not accept sponsored cutoff modifications from any institution.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <Link to="/" className="text-purple-300 hover:text-white transition-colors">← Back to Homepage</Link>
        <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Support →</Link>
      </div>
    </main>
  );
}
