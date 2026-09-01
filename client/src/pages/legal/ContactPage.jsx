import Seo from "../../components/shared/Seo";
import { Mail, HelpCircle, MessageSquare, Clock, MapPin, Send, CheckCircle2, RefreshCw, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", exam: "TG EAPCET", message: "" });

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const subject = `[${formData.exam}] Support Inquiry - ${formData.name}`;
    const body = `Hi Vuela Learn Team,\n\nName: ${formData.name}\nEmail: ${formData.email}\nExam: ${formData.exam}\n\nMessage:\n${formData.message}\n\n---\nSent via Vuela Learn Admissions Portal (https://vuelalearn.in)`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=vuelalearn@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const standardMailto = `mailto:vuelalearn@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setLoading(true);

    // 1. Try opening Gmail compose in new tab directly
    const opened = window.open(gmailUrl, "_blank");
    
    // 2. If browser blocked popup or on mobile native email, fallback to mailto
    if (!opened || opened.closed || typeof opened.closed === "undefined") {
      window.location.href = standardMailto;
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 400);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-16 text-gray-300">
      <Seo
        title="Contact Us &amp; Student Support — Vuela Learn"
        description="Get in touch with the Vuela Learn support team for feedback, data inquiries, technical assistance, or institutional updates."
        path="/contact"
      />

      <div className="mb-8 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-3">
          <HelpCircle size={14} />
          <span>Support &amp; Feedback</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Have a question about cutoffs, noticed an anomaly, or want to suggest a new feature? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Direct Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail size={18} className="text-purple-400" />
              Direct Support Email
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Our support team monitors inquiries daily and typically responds within 24 business hours.
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-purple-300 break-all">
              <a href="mailto:vuelalearn@gmail.com" className="hover:underline flex items-center justify-between">
                <span>vuelalearn@gmail.com</span>
                <ExternalLink size={12} className="text-purple-400 shrink-0 ml-1" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Clock size={15} className="text-cyan-400" />
              <span>Response Window</span>
            </div>
            <p>Monday through Saturday • 9:00 AM – 7:00 PM IST</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-2 text-white font-semibold">
              <MapPin size={15} className="text-emerald-400" />
              <span>Regional Coverage</span>
            </div>
            <p>Hyderabad, Telangana &amp; Vijayawada, Andhra Pradesh • Serving Aspirants Across South India</p>
          </div>
        </div>

        {/* Right Column: Contact Feedback Form */}
        <div className="md:col-span-7">
          <div className="rounded-2xl border border-white/10 bg-[#121118]/80 p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare size={18} className="text-cyan-400" />
              Send Us a Message
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Fill out the form below and we will get back to your email address.
            </p>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center space-y-4">
                <div className="h-12 w-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-bold text-white text-lg">Thank you, {formData.name}!</h3>
                <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                  Your message regarding <strong className="text-purple-300">{formData.exam}</strong> has been logged. Our student support team will review and reply to <strong className="text-white">{formData.email}</strong> shortly.
                </p>
                
                <div className="pt-3 flex flex-wrap gap-2 justify-center">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=vuelalearn@gmail.com&su=${encodeURIComponent(`[${formData.exam}] Support Inquiry - ${formData.name}`)}&body=${encodeURIComponent(`Hi Vuela Learn Team,\n\nName: ${formData.name}\nEmail: ${formData.email}\nExam: ${formData.exam}\n\nMessage:\n${formData.message}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/20 hover:bg-purple-500/30 px-4 py-2 text-xs font-semibold text-purple-200 transition-colors"
                  >
                    <Mail size={13} />
                    <span>Open in Gmail</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", exam: "TG EAPCET", message: "" });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-semibold text-gray-300 transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Send Another Message</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1.5">Related Examination</label>
                  <select
                    value={formData.exam}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-[#161224] px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="TG EAPCET">TG EAPCET (Engineering/Pharmacy)</option>
                    <option value="TG ICET">TG ICET (MBA &amp; MCA)</option>
                    <option value="AP EAPCET">AP EAPCET (Andhra Pradesh)</option>
                    <option value="TG ECET">TG ECET (Lateral Entry)</option>
                    <option value="TG POLYCET">TG POLYCET (Polytechnic)</option>
                    <option value="TG PGECET">TG PGECET (M.Tech/M.Pharm)</option>
                    <option value="General Inquiry">General / Other Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-1.5">Your Message / Feedback *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your question, data feedback, or suggestions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 py-3 font-semibold text-white transition-colors cursor-pointer shadow-lg shadow-purple-600/25"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
        <Link to="/" className="text-purple-300 hover:text-white transition-colors">← Back to Homepage</Link>
        <Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us →</Link>
      </div>
    </main>
  );
}
