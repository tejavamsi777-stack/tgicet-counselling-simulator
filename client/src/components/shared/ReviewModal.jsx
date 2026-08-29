import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TRUSTPILOT_CONFIG } from '../../config/trustpilot';
import { TrustpilotStar } from './TrustpilotBadge';
import { reviewApi } from '../../lib/api';
import AdmitOneTicket from '../ui/admit-one-ticket';

// Ticket width that fits on most screens nicely inside a modal
function useTicketWidth() {
  const [width, setWidth] = useState(480);
  useEffect(() => {
    const update = () => {
      // max 520, min 280, leaves padding on mobile
      setWidth(Math.min(520, Math.max(280, window.innerWidth - 64)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
}

export default function ReviewModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const ticketWidth = useTicketWidth();
  const autoCloseTimerRef = useRef(null);

  // Auto-close after user sees the Thank You card
  useEffect(() => {
    if (submitted && isOpen) {
      autoCloseTimerRef.current = setTimeout(() => {
        onClose('review');
      }, 3500);
    }
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, [submitted, isOpen, onClose]);

  const handleDismiss = (action = 'closed') => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    onClose(action);
  };

  const handleRate = async () => {
    if (submitting) return;
    try {
      window.open(TRUSTPILOT_CONFIG.reviewUrl, '_blank', 'noopener,noreferrer');
    } catch {}
    setSubmitting(true);
    try {
      await reviewApi.submit({ rating: 5, feedback: '', examSlug: 'general', source: 'time_on_site' });
    } catch {}
    setSubmitting(false);
    setSubmitted(true);
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleDismiss('closed')}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex flex-col items-center gap-4"
          >
            {/* Close button floating above the ticket */}
            <button
              type="button"
              onClick={() => handleDismiss('closed')}
              className="self-end rounded-full p-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>

            {submitted ? (
              /* ── Thank-you state (Styled with AdmitOneTicket) ───────────────── */
              <div className="flex flex-col items-center gap-3 w-full">
                <AdmitOneTicket
                  tilt={false}
                  width={ticketWidth}
                  name={"Thank\nYou ❤️\nFor Supporting Us"}
                  presenter="Vuela Learn · Student Community"
                  event="Review Recorded 🙌"
                  venue="Trustpilot"
                  dates="Free Forever"
                  stubText="Vuela"
                  watermark="♥"
                />

                {/* Actions & Auto-close status */}
                <div className="flex flex-col gap-2 w-full" style={{ maxWidth: ticketWidth }}>
                  <a
                    href={TRUSTPILOT_CONFIG.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#172554] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white font-bold text-xs py-3 shadow-lg shadow-blue-950/60 border border-blue-400/20 transition active:scale-[0.98] cursor-pointer"
                  >
                    <div className="h-4 w-4 rounded-[4px] bg-white flex items-center justify-center">
                      <TrustpilotStar size={10} className="text-[#00b67a]" />
                    </div>
                    Open Trustpilot <ExternalLink size={12} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDismiss('review')}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 py-2.5 text-xs font-medium text-white/80 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
                  >
                    <span>Done</span>
                    <span className="text-[11px] text-white/60">(Closing automatically...)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ── Ticket review card ───────────────────────────────── */
              <div className="flex flex-col items-center gap-3 w-full">
                {/* The admit-one ticket (no tilt/3D) */}
                <AdmitOneTicket
                  tilt={false}
                  width={ticketWidth}
                  name="Your Review Keeps Us Free"
                  presenter="Free · Accurate · Student-First"
                  event="Leave Us a Review"
                  venue="Trustpilot"
                  dates="Takes < 60 sec"
                  stubText="Vuela"
                  watermark="5★"
                />

                {/* Action buttons below the ticket */}
                <div className="flex flex-col gap-2.5 w-full" style={{ maxWidth: ticketWidth }}>
                  <button
                    type="button"
                    onClick={handleRate}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1e3a8a] to-[#172554] hover:from-[#1d4ed8] hover:to-[#1e3a8a] text-white font-bold text-sm py-3.5 shadow-lg shadow-blue-950/60 border border-blue-400/30 transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <div className="h-4 w-4 rounded-[4px] bg-white flex items-center justify-center">
                      <TrustpilotStar size={10} className="text-[#00b67a]" />
                    </div>
                    Leave a Review on Trustpilot ↗
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismiss('later')}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 py-3 text-sm font-semibold text-gray-200 hover:text-white transition active:scale-[0.98] cursor-pointer backdrop-blur-md shadow-sm"
                  >
                    💔 Maybe Later
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
