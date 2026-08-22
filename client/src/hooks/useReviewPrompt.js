import { useState, useEffect, useCallback, useRef } from 'react';

export function useReviewPrompt(hasViewedResults = false, examSlug = 'general') {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);

  // Check if device is eligible for automatic pop-up
  const checkEligibility = useCallback(() => {
    try {
      // 1. If already reviewed on this device, NEVER show automatic popup again
      const vuelaReviewed = localStorage.getItem('vuela_has_reviewed');
      const tgReviewed = localStorage.getItem('tg_has_reviewed');
      if (vuelaReviewed === 'true' || tgReviewed === 'true') return false;

      // 2. If user dismissed/snoozed today, do not annoy on every page switch
      const snoozedUntil = localStorage.getItem('vuela_review_snooze');
      if (snoozedUntil && Number(snoozedUntil) > Date.now()) return false;

      return true;
    } catch {
      return false;
    }
  }, []);

  const triggerPrompt = useCallback(() => {
    // Manual trigger always opens
    setIsOpen(true);
  }, []);

  const closePrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Smart 18-second timer — ONLY runs when student has actually viewed results/data table
  useEffect(() => {
    if (!hasViewedResults) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (!checkEligibility()) return;

    timerRef.current = setTimeout(() => {
      if (checkEligibility()) {
        setIsOpen(true);
      }
    }, 18000); // 18 seconds after seeing data

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hasViewedResults, checkEligibility]);

  return {
    isOpen,
    triggerPrompt,
    closePrompt,
    examSlug,
  };
}
