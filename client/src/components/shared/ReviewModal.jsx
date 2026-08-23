import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, ExternalLink } from 'lucide-react';
import { reviewApi } from '../../lib/api';
import { TRUSTPILOT_CONFIG } from '../../config/trustpilot';
import { TrustpilotStar } from './TrustpilotBadge';

const RATING_CHIPS = {
  0: [
    "🎯 Accurate Cutoffs",
    "⚡ Super Fast & Smooth",
    "✨ Clean & Easy UI",
    "📋 Loved Web Options",
    "💡 Helpful Insights",
    "🎉 100% Free & Authentic",
  ],
  1: [
    "⚠️ Data / Cutoff Inaccurate",
    "🐌 Very Slow Loading",
    "📱 Mobile Layout Glitch",
    "🔍 Missing College / Branch",
    "😕 Confusing Navigation",
    "❌ Need Better Support",
  ],
  2: [
    "📉 Need More Past Years",
    "🔄 Filter Not Working Well",
    "📱 Needs Better Mobile UI",
    "⚡ Needs Faster Speed",
    "📋 Web Options Confusing",
    "💡 Add More College Info",
  ],
  3: [
    "👍 Decent Features",
    "📊 Add More Visual Charts",
    "📈 Better Rank Prediction",
    "⚡ Improve Loading Speed",
    "🔍 Better Search Filters",
    "📱 Good on Mobile",
  ],
  4: [
    "🎯 Accurate Cutoffs",
    "⚡ Super Fast & Smooth",
    "✨ Clean & Easy UI",
    "📋 Great Web Options Tool",
    "💡 Very Helpful Insights",
    "🎓 Saved Me Time",
  ],
  5: [
    "🤩 Best Counselling Tool!",
    "🎯 100% Accurate Cutoffs",
    "⚡ Lightning Fast UI",
    "🏆 Essential for All Students",
    "📋 Loved Web Options Simulator",
    "🎉 100% Free & Authentic",
  ],
};

const RATING_CONFIG = {
  0: {
    title: 'Rate Vuela Learn on Trustpilot',
    desc: 'Select your rating below to leave a review.',
    color: 'text-emerald-300',
  },
  1: {
    title: 'Needs Improvement',
    desc: 'Sorry about that! Share your feedback.',
    color: 'text-rose-400',
  },
  2: {
    title: 'Could Be Better',
    desc: 'What can we improve for you?',
    color: 'text-emerald-400',
  },
  3: {
    title: 'Good Experience',
    desc: 'What feature would make Vuela Learn great for you?',
    color: 'text-emerald-300',
  },
  4: {
    title: 'Great Experience!',
    desc: 'Glad you liked it! Share your review.',
    color: 'text-emerald-400',
  },
  5: {
    title: 'Loved It! Super Helpful',
    desc: 'Awesome! Leave a verified review on Trustpilot.',
    color: 'text-emerald-300',
  },
};

export default function ReviewModal({ isOpen, onClose, examSlug = 'general' }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedChips, setSelectedChips] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeRating = hoverRating || rating;
  const config = RATING_CONFIG[activeRating] || RATING_CONFIG[0];

  const toggleChip = (chip) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('vuela_review_snooze', String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {}
    onClose();
  };

  const openTrustpilot = () => {
    window.open(TRUSTPILOT_CONFIG.reviewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const combinedFeedback = [
        selectedChips.join(', '),
        feedback.trim(),
      ]
        .filter(Boolean)
        .join(' — ');

      if (rating > 0) {
        await reviewApi.submit({
          rating,
          feedback: combinedFeedback,
          examSlug,
          source: 'trustpilot_modal',
        });
      }

      try {
        localStorage.setItem('vuela_has_reviewed', 'true');
        localStorage.setItem('tg_has_reviewed', 'true');
      } catch {}

      setIsSubmitted(true);
      // Open Trustpilot review page in new tab
      openTrustpilot();
    } catch (err) {
      console.error('[ReviewModal]: Error:', err);
      setIsSubmitted(true);
      openTrustpilot();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
          {/* Dark Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Floating Trustpilot-Branded Emerald Card (No blue, yellow, or purple) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#00b67a]/30 bg-[#07130c]/98 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-white"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
              aria-label="Close review modal"
            >
              <X size={16} />
            </button>

            {isSubmitted ? (
              <div className="py-4 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#00b67a]/20 border border-[#00b67a]/40 text-[#00b67a]">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    Redirecting to Trustpilot...
                  </h3>
                  <p className="mt-1 text-xs text-white/70 max-w-xs mx-auto">
                    Your feedback has been saved. Leaving a review on Trustpilot helps thousands of AP &amp; TG students!
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={openTrustpilot}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00b67a] hover:bg-[#009e6a] text-white font-extrabold text-xs py-3 px-4 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-white">
                      <TrustpilotStar size={10} className="text-[#00b67a]" />
                    </div>
                    <span>Open Trustpilot Review Page ↗</span>
                    <ExternalLink size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header Badge */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00b67a]/40 bg-[#00b67a]/15 px-3 py-1 text-[11px] font-extrabold text-[#00b67a] mb-3">
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-xs bg-[#00b67a]">
                      <TrustpilotStar size={9} className="text-white" />
                    </div>
                    <span>Trustpilot Verified Reviews</span>
                  </div>

                  <div className="min-h-[44px] flex flex-col items-center justify-center">
                    <h3 className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-150 ${config.color}`}>
                      {config.title}
                    </h3>
                    <p className="text-[11px] text-white/60 max-w-xs mt-0.5 line-clamp-1">
                      {config.desc}
                    </p>
                  </div>
                </div>

                {/* 5 Trustpilot Green Star Selector (No yellow/purple/blue) */}
                <div className="flex items-center justify-center gap-2 py-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                        }}
                        onPointerEnter={(e) => {
                          if (e.pointerType === 'mouse') setHoverRating(star);
                        }}
                        onPointerLeave={(e) => {
                          if (e.pointerType === 'mouse') setHoverRating(0);
                        }}
                        className="p-1 focus:outline-none transition-transform active:scale-90 cursor-pointer"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                          isFilled
                            ? 'bg-[#00b67a] shadow-[0_0_12px_rgba(0,182,122,0.5)] scale-105'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}>
                          <TrustpilotStar
                            size={18}
                            className={isFilled ? 'text-white' : 'text-white/30'}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Quick Tags */}
                <div>
                  <label className="text-[11px] font-semibold text-white/50 block mb-1.5">
                    Quick feedback tags:
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[52px]">
                    {(RATING_CHIPS[activeRating] || RATING_CHIPS[0]).map((chip) => {
                      const isSelected = selectedChips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => toggleChip(chip)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium select-none ${
                            isSelected
                              ? 'bg-[#00b67a] border-[#00b67a] text-white font-bold shadow-sm'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Comments */}
                <div>
                  <textarea
                    id="review-feedback"
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add specific comments (optional)..."
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.05] p-3 text-xs text-white placeholder-white/40 focus:border-[#00b67a] focus:bg-white/[0.08] focus:outline-none transition backdrop-blur-md"
                  />
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00b67a] hover:bg-[#009e6a] text-white font-extrabold text-xs py-3 px-4 shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-white">
                      <TrustpilotStar size={10} className="text-[#00b67a]" />
                    </div>
                    <span>{isSubmitting ? 'Opening Trustpilot...' : 'Review Vuela Learn on Trustpilot ↗'}</span>
                    <ExternalLink size={13} />
                  </button>

                  <div className="flex items-center justify-between px-1">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="text-[11px] font-semibold text-white/40 hover:text-white transition cursor-pointer"
                    >
                      Maybe Later
                    </button>
                    <span className="text-[10px] text-white/30">Verified by Trustpilot</span>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
