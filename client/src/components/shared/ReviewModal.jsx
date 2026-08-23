import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2, ExternalLink } from 'lucide-react';
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
    emoji: '✨',
    title: 'How is your experience?',
    desc: 'Tap the stars below to rate Vuela Learn on Trustpilot.',
    color: 'text-emerald-300',
  },
  1: {
    emoji: '😡',
    title: 'Needs Improvement',
    desc: 'Sorry about that! What can we fix for you?',
    color: 'text-rose-400',
  },
  2: {
    emoji: '🙁',
    title: 'Could Be Better',
    desc: 'What can we improve to make your experience better?',
    color: 'text-emerald-400',
  },
  3: {
    emoji: '😐',
    title: 'It Was Okay',
    desc: 'What feature would make Vuela Learn great for you?',
    color: 'text-emerald-300',
  },
  4: {
    emoji: '😊',
    title: 'Great Experience!',
    desc: 'Glad you liked it! Share your review on Trustpilot.',
    color: 'text-emerald-300',
  },
  5: {
    emoji: '🤩',
    title: 'Loved It! Super Helpful',
    desc: 'Awesome! Share your feedback on Trustpilot.',
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

  const handleRateNow = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Immediately open Trustpilot review page in a new tab
    try {
      window.open(TRUSTPILOT_CONFIG.reviewUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to open Trustpilot link', err);
    }

    setIsSubmitting(true);
    try {
      const combinedFeedback = [
        selectedChips.join(', '),
        feedback.trim(),
      ]
        .filter(Boolean)
        .join(' — ');

      await reviewApi.submit({
        rating: rating || 5,
        feedback: combinedFeedback,
        examSlug,
        source: 'trustpilot_modal',
      });

      try {
        localStorage.setItem('vuela_has_reviewed', 'true');
        localStorage.setItem('tg_has_reviewed', 'true');
      } catch {}

      setIsSubmitted(true);
    } catch (err) {
      console.error('[ReviewModal]: Failed to submit review:', err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
          {/* Frosted Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Floating Card - Trustpilot Green Theme (No Blue, Yellow, or Purple) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#00b67a]/30 bg-[#07130e]/98 p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,182,122,0.15)] backdrop-blur-2xl text-white"
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
                    Thank You for Your Review!
                  </h3>
                  <p className="mt-1 text-xs text-white/70 max-w-xs mx-auto">
                    Your feedback on Trustpilot helps thousands of students across AP &amp; Telangana.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={TRUSTPILOT_CONFIG.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00b67a] hover:bg-[#009e6a] text-white font-extrabold text-xs py-3 px-4 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-white">
                      <TrustpilotStar size={10} className="text-[#00b67a]" />
                    </div>
                    <span>Open Trustpilot Review Page ↗</span>
                    <ExternalLink size={13} />
                  </a>
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
              <form onSubmit={handleRateNow} className="space-y-4">
                {/* Header Emoji & Trustpilot Badge */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full border border-[#00b67a]/30 bg-[#00b67a]/10">
                    <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-[#00b67a]">
                      <TrustpilotStar size={10} className="text-white" />
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-300 tracking-wide uppercase">
                      Trustpilot Review
                    </span>
                  </div>

                  <div className="h-12 w-12 flex items-center justify-center select-none">
                    <span className="text-4xl transition-transform duration-200 transform hover:scale-110">
                      {config.emoji}
                    </span>
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

                {/* 5-Star Selector (Trustpilot Green #00b67a Stars) */}
                <div className="flex items-center justify-center gap-2 py-0.5 select-none">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onPointerEnter={(e) => {
                          if (e.pointerType === 'mouse') setHoverRating(star);
                        }}
                        onPointerLeave={(e) => {
                          if (e.pointerType === 'mouse') setHoverRating(0);
                        }}
                        className="p-1 focus:outline-none transition-transform active:scale-90 cursor-pointer"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={28}
                          className={`transition-colors duration-150 ${
                            isFilled
                              ? 'fill-[#00b67a] text-[#00b67a] drop-shadow-[0_0_8px_rgba(0,182,122,0.6)]'
                              : 'text-white/20 hover:text-white/40'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Quick Feedback Tags */}
                <div>
                  <label className="text-[11px] font-semibold text-white/50 block mb-1.5">
                    Quick feedback tags:
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[58px]">
                    {(RATING_CHIPS[activeRating] || RATING_CHIPS[0]).map((chip) => {
                      const isSelected = selectedChips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => toggleChip(chip)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium select-none ${
                            isSelected
                              ? 'bg-[#00b67a] border-[#00b67a] text-white shadow-sm shadow-emerald-950/50'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Comment Input */}
                <div>
                  <textarea
                    id="review-feedback"
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add specific comments for Trustpilot review (optional)..."
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.05] p-3 text-xs text-white placeholder-white/40 focus:border-[#00b67a]/60 focus:bg-white/[0.08] focus:outline-none transition backdrop-blur-md"
                  />
                </div>

                {/* Action Buttons: Maybe Later & Highlighted Rate Now */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Maybe Later
                  </button>

                  <button
                    type="button"
                    onClick={handleRateNow}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-full border border-[#00b67a]/50 bg-[#00b67a] hover:bg-[#009e6a] px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-950/60 transition active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-white">
                      <TrustpilotStar size={10} className="text-[#00b67a]" />
                    </div>
                    <span>Rate Now ↗</span>
                  </button>
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
