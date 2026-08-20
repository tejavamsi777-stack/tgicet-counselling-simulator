import { useState, useEffect, useCallback, useRef } from 'react';

export function useReviewPrompt(hasViewedResults = false, examSlug = 'general') {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef(null);

  const checkEligibility = useCallback(() => {
    try {
      const hasReviewed = localStorage.getItem('tg_has_reviewed');
      if (hasReviewed === 'true') return false;
      return true;
    } catch {
      return false;
    }
  }, []);

  const triggerPrompt = useCallback(() => {
    if (checkEligibility()) {
      setIsOpen(true);
    }
  }, [checkEligibility]);

  const closePrompt = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 15–20s Smart Trigger after student views results
  useEffect(() => {
    if (!hasViewedResults) return;
    if (!checkEligibility()) return;

    timerRef.current = setTimeout(() => {
      if (checkEligibility()) {
        setIsOpen(true);
      }
    }, 18000); // 18 seconds of exploring results

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
