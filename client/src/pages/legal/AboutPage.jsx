import Seo from "../../components/shared/Seo";
import { Info, Sparkles, Database, Target, Award, CheckCircle2, ShieldCheck, Mail, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300">
      <Seo
        title="About Us — Vuela Learn Admissions Analytics"
        description="Learn about Vuela Learn, an independent educational technology platform providing free counselling simulation tools, cutoffs analysis, and admission analytics."
        path="/about"
      />

      {/* Header */}
      <div className="mb-10 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
          <Info size={14} />
          <span>Platform Overview &amp; Principles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          About Vuela Learn
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-3xl leading-relaxed">
          An independent admissions research and counselling simulation platform dedicated to making higher education selection transparent, accessible, and merit-focused.
        </p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed">
        {/* 1. Purpose & Vision */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles size={20} className="text-purple-400 shrink-0" />
            <span>1. Our Vision &amp; Purpose</span>
          </h2>
          <p>
            Navigating state-level professional admissions involves understanding nuanced multi-round seat allocations, institutional affiliations, statutory reservation categories, and regulated fee structures. In many cases, students and parents face information fragmentation or unsubstantiated guidance during critical counselling windows.
          </p>
          <p>
            <strong className="text-white">Vuela Learn</strong> was developed to address this challenge by providing a unified, data-backed simulation environment. Our predictive calculators, seat allotment archives, and choice ordering engines help candidates explore options with confidence, objectivity, and clarity.
          </p>
        </section>

        {/* 2. Supported Admissions Streams */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Database size={20} className="text-cyan-400 shrink-0" />
            <span>2. Supported Admissions Streams</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h3 className="font-bold text-white text-base text-purple-300">TG EAPCET &amp; AP EAPCET</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Undergraduate Engineering, Agriculture, and Pharmacy predictive analytics, multi-year closing rank trajectory, and 3-Tier Smart Web Options choice generation.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h3 className="font-bold text-white text-base text-cyan-300">KCET (Karnataka Admissions)</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Karnataka Engineering Admissions seat matrix analysis, institutional profile insights, and category-specific closing rank evaluation for state engineering institutions.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h3 className="font-bold text-white text-base text-emerald-300">TG ICET &amp; TG ECET</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Postgraduate management (MBA/MCA) and diploma lateral entry B.Tech admission simulators calibrated against state convenor allotment parameters.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
              <h3 className="font-bold text-white text-base text-pink-300">TG POLYCET &amp; TG PGECET</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Polytechnic diploma programs following Class 10 and postgraduate engineering/technology (M.Tech/M.Pharm) specialization analyzers.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Methodology & Public Information Standards */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <span>3. Information Verification &amp; Public Records Integrity</span>
          </h2>
          <p>
            All cutoffs, fee structures, and allotment statistics accessible through the platform are compiled and verified using official public gazettes, candidate allotment notifications, and government records published by respective state councils and examining authorities:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300 pt-1">
            <li className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-purple-400 shrink-0" />
              <span>TSCHE (Telangana State Council of Higher Education)</span>
            </li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
              <span>APSCHE (Andhra Pradesh State Council of Higher Education)</span>
            </li>
            <li className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>KEA (Karnataka Examinations Authority)</span>
            </li>
          </ul>
        </section>

        {/* 4. The Research & Development Initiative */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Users size={20} className="text-amber-400 shrink-0" />
            <span>4. The Research &amp; Engineering Team</span>
          </h2>
          <p>
            Vuela Learn is operated by an independent collective of software engineers, data specialists, and higher education researchers. Our primary focus is developing modern educational technology that promotes equal opportunity and transparency in state admission counselling.
          </p>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 text-xs text-gray-300 space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
              <CheckCircle2 size={16} /> Open Access &amp; Independence Commitment
            </div>
            <p className="leading-relaxed">
              Vuela Learn is 100% free and open to all students. We maintain strict editorial neutrality: we do not accept sponsored college placements, operate as commercial admission agents, or modify cutoff calculations for promotional purposes.
            </p>
          </div>
        </section>

        {/* 5. Contact / Communications */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Mail size={16} className="text-purple-400" />
            <span>Official Communications &amp; Support</span>
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            For general inquiries, suggestions, data clarifications, or support regarding our simulation tools, you can reach our team at:
          </p>
          <div className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 font-mono text-xs text-purple-300">
            <Mail size={13} />
            <a href="mailto:vuelalearn@gmail.com" className="hover:underline">vuelalearn@gmail.com</a>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <Link to="/" className="text-purple-300 hover:text-white transition-colors">← Back to Homepage</Link>
        <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Support →</Link>
      </div>
    </main>
  );
}
