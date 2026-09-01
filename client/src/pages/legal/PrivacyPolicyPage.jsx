import Seo from "../../components/shared/Seo";
import { Shield, Lock, Eye, Mail, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300">
      <Seo
        title="Privacy Policy — Vuela Learn"
        description="Official Privacy Policy for Vuela Learn. Learn how we handle student data, cookies, Google AdSense, and protect user privacy."
        path="/privacy-policy"
      />

      <div className="mb-8 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
          <Shield size={14} />
          <span>Legal &amp; Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Last Updated: September 1, 2026 • Effective Date: September 1, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock size={18} className="text-purple-400" />
            1. Introduction &amp; Commitment to Privacy
          </h2>
          <p>
            Welcome to <strong className="text-white">Vuela Learn</strong> (<a href="https://vuelalearn.in" className="text-purple-300 underline">https://vuelalearn.in</a>). Protecting your privacy and maintaining the security of your personal data is one of our primary commitments. This Privacy Policy document outlines the types of information collected and recorded by Vuela Learn and how we utilize it.
          </p>
          <p>
            Vuela Learn operates as an open-access educational counseling simulator and cutoff analytics platform for state-level entrance examinations including TG EAPCET, TG ICET, AP EAPCET, TG ECET, TG POLYCET, TG PGECET, and KCET.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye size={18} className="text-cyan-400" />
            2. Information We Do NOT Collect
          </h2>
          <p>
            Unlike commercial coaching lead aggregators, <strong className="text-white">we do not sell, rent, trade, or distribute student phone numbers, email addresses, or ranks to private colleges or telemarketers</strong>.
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-gray-400">
            <li>Rank inputs, percentile calculations, and category filters are processed live in your browser memory.</li>
            <li>We do not require mandatory registration or payments to view standard college predictions, cutoffs, or fee structures.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            3. Google AdSense &amp; Third-Party Advertising Cookies
          </h2>
          <p>
            Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to <strong className="text-white">vuelalearn.in</strong> and other sites on the internet.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
            <div className="font-semibold text-white">Google Advertising Principles &amp; Opt-Out:</div>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-300">
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google Ads Settings</a>.</li>
              <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">aboutads.info</a>.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-pink-400" />
            4. Log Files &amp; Web Analytics
          </h2>
          <p>
            Vuela Learn follows a standard procedure of using log files and lightweight anonymous analytics (such as Vercel Web Analytics and PostHog). The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking user navigation on the simulator, and gathering demographic metrics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail size={18} className="text-purple-400" />
            5. Contact Information
          </h2>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact our administrative team via email:
          </p>
          <div className="inline-block rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 font-mono text-purple-300">
            <a href="mailto:vuelalearn@gmail.com">vuelalearn@gmail.com</a>
          </div>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <Link to="/" className="text-purple-300 hover:text-white transition-colors">← Back to Homepage</Link>
        <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service →</Link>
      </div>
    </main>
  );
}
