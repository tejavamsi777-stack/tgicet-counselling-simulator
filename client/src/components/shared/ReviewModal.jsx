import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send, CheckCircle2 } from 'lucide-react';
import { reviewApi } from '../../lib/api';
import { GlassButton } from '../ui/glass-button';

const RATING_CONFIG = {
  0: {
    emoji: '✨',
    title: 'How is your experience?',
    desc: 'Tap the stars below to share your rating.',
    color: 'text-purple-300',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
    animation: {
      scale: [1, 1.15, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  1: {
    emoji: '😡',
    title: 'Needs Improvement',
    desc: 'Sorry about that! What went wrong or what can we fix?',
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-500/10',
    animation: {
      x: [-5, 5, -4, 4, 0],
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
      scale: [1, 1.22, 1],
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
      scale: [0.85, 1.3, 1],
      rotate: [-10, 10, -5, 0],
      transition: { duration: 0.45, type: 'spring', stiffness: 350, damping: 15 },
    },
  },
};

export default function ReviewModal({ isOpen, onClose, examSlug = 'general' }) {
  // Initially no stars selected
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeRating = hoverRating || rating;
  const config = RATING_CONFIG[activeRating] || RATING_CONFIG[0];

  const handleDismiss = () => {
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;

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
      } catch {}

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2200);
    } catch {
      try {
        localStorage.setItem('tg_has_reviewed', 'true');
      } catch {}
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
          {/* Hardware-Accelerated Smooth Frosted Backdrop (Zero GPU Glitch) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={handleDismiss}
            style={{ transform: "translateZ(0)", willChange: "opacity" }}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Frosted Glass Floating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#140c26]/90 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.25)] backdrop-blur-3xl text-white"
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
                <p className="mt-1 text-sm text-white/70">
                  Your feedback helps thousands of Telangana students make smarter counselling decisions.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Dynamic Animated Emoji Reaction */}
                <div className="flex flex-col items-center justify-center text-center pt-1">
                  <div className="relative mb-2">
                    <motion.div
                      key={activeRating}
                      animate={config.animation}
                      className="text-6xl select-none cursor-pointer filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                    >
                      {config.emoji}
                    </motion.div>
                  </div>

                  <motion.h3
                    key={`title-${activeRating}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-lg font-bold tracking-tight ${config.color}`}
                  >
                    {config.title}
                  </motion.h3>

                  <p className="mt-0.5 text-xs text-white/60 max-w-xs">
                    {config.desc}
                  </p>
                </div>

                {/* 5-Star Selector (Empty until selected) */}
                <div className="flex items-center justify-center gap-2.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
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
                          size={30}
                          className={`transition-all duration-200 ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                              : 'text-white/30 hover:text-white/60'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Optional Feedback Input Box */}
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
                    className="w-full resize-none rounded-2xl border border-white/15 bg-white/[0.05] p-3.5 text-xs text-white placeholder-white/40 focus:border-purple-400/60 focus:bg-white/[0.08] focus:outline-none transition backdrop-blur-md"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
                  >
                    Maybe Later
                  </button>

                  <GlassButton
                    type="submit"
                    size="sm"
                    disabled={rating === 0 || isSubmitting}
                    className={rating === 0 ? "opacity-50 cursor-not-allowed" : "active:scale-95"}
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
