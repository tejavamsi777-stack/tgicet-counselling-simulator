import Seo from "../../components/shared/Seo";
import { FileCheck, ShieldAlert, Scale, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300">
      <Seo
        title="Terms of Service &amp; Legal Disclaimer — Vuela Learn"
        description="Official Terms of Service, User Agreement, and Disclaimer for Vuela Learn educational counselling simulators."
        path="/terms"
      />

      <div className="mb-8 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
          <Scale size={14} />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Last Updated: September 1, 2026 • Effective Date: September 1, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck size={18} className="text-purple-400" />
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and utilizing <strong className="text-white">Vuela Learn</strong> (<a href="https://vuelalearn.in" className="text-purple-300 underline">https://vuelalearn.in</a>), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any portion of these terms, please discontinue use of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-400" />
            2. Educational &amp; Simulation Nature of Predictions
          </h2>
          <p>
            Vuela Learn provides educational counseling simulations, historical seat allotment explorers, and college prediction tools. All algorithms are constructed using statistical analysis of past government closing ranks.
          </p>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-gray-300 space-y-2">
            <div className="font-bold text-amber-300">Important Disclaimer:</div>
            <p>
              Simulated web options, risk indicators (Safe, Target, Reach), and closing ranks are for guidance and preparation purposes only. Actual seat allotments during official state counselling are conducted exclusively by government convenor authorities (TSCHE, APSCHE, APCFSS) subject to real-time candidate choices, seat matrix revisions, and statutory reservation mandates.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale size={18} className="text-cyan-400" />
            3. Intellectual Property &amp; Acceptable Use
          </h2>
          <p>
            The software interface, interactive simulator designs, priority generation logic, and visual assets of Vuela Learn are proprietary. You agree not to attempt to reverse engineer, scrape at abusive automated rates, or commercially resell the platform's algorithms without express written authorization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle size={18} className="text-emerald-400" />
            4. Modifications to the Service
          </h2>
          <p>
            We reserve the right to modify, refine, or update datasets, college fee metrics, and platform features at any time to reflect newly released government notifications and gazettes.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <Link to="/" className="text-purple-300 hover:text-white transition-colors">← Back to Homepage</Link>
        <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy →</Link>
      </div>
    </main>
  );
}
