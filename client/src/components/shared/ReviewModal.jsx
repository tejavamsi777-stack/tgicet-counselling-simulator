import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { reviewApi } from '../../lib/api';
import { GlassButton } from '../ui/glass-button';

const ALL_CHIPS = [
  "🎯 Accurate Cutoffs",
  "⚡ Super Fast & Smooth",
  "✨ Clean & Easy UI",
  "📋 Loved Web Options",
  "💡 Helpful Insights",
  "🎉 100% Free & Authentic",
];

const RATING_CONFIG = {
  0: {
    emoji: '✨',
    title: 'How is your experience?',
    desc: 'Tap the stars below to share your rating.',
    color: 'text-purple-300',
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
    color: 'text-orange-400',
  },
  3: {
    emoji: '😐',
    title: 'It Was Okay',
    desc: 'What feature would make Vuela Learn great for you?',
    color: 'text-amber-400',
  },
  4: {
    emoji: '😊',
    title: 'Great Experience!',
    desc: 'Glad you liked it! Tell us your thoughts.',
    color: 'text-emerald-400',
  },
  5: {
    emoji: '🤩',
    title: 'Loved It! Super Helpful',
    desc: 'Awesome! Tell us what you liked most about Vuela Learn.',
    color: 'text-purple-300',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const combinedFeedback = [
        selectedChips.join(', '),
        feedback.trim(),
      ]
        .filter(Boolean)
        .join(' — ');

      await reviewApi.submit({
        rating,
        feedback: combinedFeedback,
        examSlug,
        source: 'predictor_popup',
      });

      try {
        localStorage.setItem('vuela_has_reviewed', 'true');
        localStorage.setItem('tg_has_reviewed', 'true');
      } catch {}

      setIsSubmitted(true);
    } catch {
      try {
        localStorage.setItem('vuela_has_reviewed', 'true');
        localStorage.setItem('tg_has_reviewed', 'true');
      } catch {}
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    'Hey! Check out Vuela Learn — 100% free AP & TG College Predictors, authentic Seat Allotments, and Web Options Simulators! Try it here: https://vuelalearn.vercel.app'
  )}`;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#120a22]/95 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl text-white"
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
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {rating >= 4 ? '🎉 Thank You for the Love!' : 'Thank You for Your Feedback!'}
                  </h3>
                  <p className="mt-1 text-xs text-white/70 max-w-xs mx-auto">
                    {rating >= 4
                      ? 'Your support helps thousands of AP & TG students find the right college. Share Vuela Learn with your classmates!'
                      : 'We appreciate your suggestions and will work hard to make Vuela Learn even better.'}
                  </p>
                </div>

                {/* WhatsApp Share Button on 4 & 5 Stars */}
                {rating >= 4 && (
                  <div className="pt-2">
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs py-3 px-4 shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
                    >
                      <MessageCircle size={16} className="fill-black" />
                      <span>Share Vuela Learn on WhatsApp</span>
                    </a>
                  </div>
                )}

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
                {/* Fixed-Height Emoji Area (Prevents height shifts) */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-14 w-14 flex items-center justify-center mb-1 select-none">
                    <span className="text-5xl transition-transform duration-200 transform hover:scale-110">
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

                {/* Stable 5-Star Selector */}
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
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                              : 'text-white/25 hover:text-white/50'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Stable One-Tap Tags */}
                <div>
                  <label className="text-[11px] font-semibold text-white/50 block mb-1.5">
                    Quick feedback tags:
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[58px]">
                    {ALL_CHIPS.map((chip) => {
                      const isSelected = selectedChips.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => toggleChip(chip)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium select-none ${
                            isSelected
                              ? 'bg-purple-600 border-purple-400 text-white shadow-sm shadow-purple-900/50'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Feedback Input Box */}
                <div>
                  <textarea
                    id="review-feedback"
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add specific comments or requests (optional)..."
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/[0.05] p-3 text-xs text-white placeholder-white/40 focus:border-purple-400/60 focus:bg-white/[0.08] focus:outline-none transition backdrop-blur-md"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Maybe Later
                  </button>

                  <GlassButton
                    type="submit"
                    size="sm"
                    disabled={rating === 0 || isSubmitting}
                    className={rating === 0 ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                    contentClassName="flex items-center gap-2 px-5 py-2 text-xs font-bold"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </GlassButton>
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
