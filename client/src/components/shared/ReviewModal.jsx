import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { reviewApi } from '../../lib/api';

const RATING_CONFIG = {
  1: {
    emoji: '😡',
    title: 'Needs Improvement',
    desc: 'Sorry about that! What went wrong or what can we fix?',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-500/10',
    animation: {
      x: [-4, 4, -3, 3, 0],
      transition: { duration: 0.4 },
    },
  },
  2: {
    emoji: '🙁',
    title: 'Could Be Better',
    desc: 'What can we improve to make your experience better?',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-500/10',
    animation: {
      rotate: [-8, 4, 0],
      y: [0, 4, 0],
      transition: { duration: 0.35 },
    },
  },
  3: {
    emoji: '😐',
    title: 'It Was Okay',
    desc: 'What feature would make TG Counselling great for you?',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    animation: {
      y: [-4, 3, 0],
      transition: { duration: 0.3 },
    },
  },
  4: {
    emoji: '😊',
    title: 'Great Experience!',
    desc: 'Glad you liked it! Any suggestions for the upcoming rounds?',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    animation: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.35 },
    },
  },
  5: {
    emoji: '🤩',
    title: 'Loved It! Super Helpful',
    desc: 'Awesome! Tell us what you liked most about TG Counselling.',
    color: 'text-purple-300',
    borderColor: 'border-purple-500/50',
    bgColor: 'bg-purple-500/15',
    animation: {
      scale: [0.8, 1.28, 1],
      rotate: [-10, 10, -5, 0],
      transition: { duration: 0.45, type: 'spring', stiffness: 350, damping: 15 },
    },
  },
};

export default function ReviewModal({ isOpen, onClose, examSlug = 'general' }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeRating = hoverRating || rating;
  const config = RATING_CONFIG[activeRating] || RATING_CONFIG[5];

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('tg_review_dismissed_session', 'true');
    } catch {}
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await reviewApi.submit({
        rating,
        feedback: feedback.trim(),
        examSlug,
        source: 'predictor_popup',
      });

      try {
        localStorage.setItem('tg_has_reviewed', 'true');
        sessionStorage.setItem('tg_review_dismissed_session', 'true');
      } catch {}

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch {
      // If error, still close gracefully after recording
      try {
        localStorage.setItem('tg_has_reviewed', 'true');
      } catch {}
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-neutral-900/95 via-black/95 to-neutral-950/95 p-6 sm:p-7 shadow-2xl shadow-purple-950/50"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute right-4 top-4 rounded-full p-2 text-white/40 hover:bg-white/10 hover:text-white transition"
              aria-label="Close review modal"
            >
              <X size={16} />
            </button>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                >
                  <CheckCircle2 size={36} />
                </motion.div>
                <h3 className="text-xl font-bold text-white">Thank You!</h3>
                <p className="mt-1 text-sm text-white/60">
                  Your feedback helps thousands of Telangana students make smarter counselling decisions.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Dynamic Animated Emoji Reaction */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative mb-2">
                    <motion.div
                      key={activeRating}
                      animate={config.animation}
                      className="text-6xl select-none cursor-pointer filter drop-shadow-md"
                    >
                      {config.emoji}
                    </motion.div>
                  </div>

                  <motion.h3
                    key={`title-${activeRating}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-lg font-bold ${config.color}`}
                  >
                    {config.title}
                  </motion.h3>

                  <p className="mt-0.5 text-xs text-white/50 max-w-xs">
                    {config.desc}
                  </p>
                </div>

                {/* 5-Star Selector */}
                <div className="flex items-center justify-center gap-2.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isSelected = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="group relative p-1.5 focus:outline-none transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={28}
                          className={`transition-all duration-200 ${
                            isSelected
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                              : 'text-white/20 hover:text-white/40'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Input Box */}
                <div>
                  <label htmlFor="review-feedback" className="sr-only">
                    Feedback comment
                  </label>
                  <textarea
                    id="review-feedback"
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you liked or how we can improve (optional)..."
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 text-xs text-white placeholder-white/30 focus:border-purple-500/60 focus:bg-white/[0.06] focus:outline-none transition"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white transition cursor-pointer"
                  >
                    Maybe Later
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-400/40 bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-950/50 hover:brightness-110 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
