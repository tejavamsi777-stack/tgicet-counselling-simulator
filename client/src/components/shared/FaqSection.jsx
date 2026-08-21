import { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

export default function FaqSection({ title = "Frequently Asked Questions", subtitle, faqs = [], className = "" }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-2">
          <HelpCircle size={14} />
          <span>Have Questions? We Have Answers</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Accordion List (Extended Width & Tightened Space) */}
      <div className="space-y-2.5 w-full mx-auto">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-purple-500/40 bg-gradient-to-r from-purple-950/30 via-black/80 to-purple-950/20 shadow-lg shadow-purple-950/40'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 text-xs font-mono font-black">
                    Q{index + 1}
                  </span>
                  <span>{faq.q}</span>
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${
                    isOpen
                      ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 rotate-180'
                      : 'border-white/10 bg-white/5 text-white/50'
                  }`}
                >
                  <ChevronDown size={15} />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/[0.05]">
                  <p className="whitespace-pre-line">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
