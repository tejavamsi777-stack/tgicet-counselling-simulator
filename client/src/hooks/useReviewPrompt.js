import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'vuela_feedback_state';
const SESSION_KEY = 'vuela_session_start';
const SESSION_SHOWN_KEY = 'vuela_feedback_shown_session';

// Configuration: Show once per session after user has engaged, with 24h+ cooldowns
const CONFIG = {
  minTimeOnSiteMs: 120 * 1000, // 120 seconds (2 minutes)
  checkIntervalMs: 5 * 1000,   // Check every 5 seconds
  closedCooldownMs: 24 * 60 * 60 * 1000, // 24 hours if closed
  laterCooldownMs: 24 * 60 * 60 * 1000,  // 24 hours if 'Maybe Later'
  reviewCooldownMs: 30 * 24 * 60 * 60 * 1000, // 30 days if reviewed
};

let globalShownInSession = false;

export function useReviewPrompt() {
  const [isOpen, setIsOpen] = useState(false);

  // Check if user has already interacted with modal recently or in this session
  const isEligible = useCallback(() => {
    if (globalShownInSession) return false;

    try {
      if (sessionStorage.getItem(SESSION_SHOWN_KEY) === 'true') {
        globalShownInSession = true;
        return false;
      }
    } catch {
      // ignore
    }

    try {
      const stateStr = localStorage.getItem(STORAGE_KEY);
      if (stateStr) {
        const state = JSON.parse(stateStr);
        const elapsed = Date.now() - (state.timestamp || 0);

        if (state.action === 'closed' && elapsed < CONFIG.closedCooldownMs) {
          return false;
        }
        if (state.action === 'later' && elapsed < CONFIG.laterCooldownMs) {
          return false;
        }
        if (state.action === 'review' && elapsed < CONFIG.reviewCooldownMs) {
          return false;
        }
      }
    } catch (e) {
      console.warn('Failed to parse feedback state:', e);
    }

    // Check time spent on site in this session
    try {
      let sessionStart = Number(sessionStorage.getItem(SESSION_KEY));
      if (!sessionStart) {
        sessionStart = Date.now();
        sessionStorage.setItem(SESSION_KEY, String(sessionStart));
      }
      const timeOnSite = Date.now() - sessionStart;
      return timeOnSite >= CONFIG.minTimeOnSiteMs;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isEligible()) {
        setIsOpen(true);
        globalShownInSession = true;
        try {
          sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
        } catch {
          // ignore
        }
      }
    }, CONFIG.checkIntervalMs);

    return () => clearInterval(interval);
  }, [isEligible]);

  const closePrompt = useCallback((action = 'closed') => {
    globalShownInSession = true;
    try {
      sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          action,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Failed to save feedback state:', e);
    }

    setIsOpen(false);
  }, []);

  const triggerPrompt = useCallback(() => {
    setIsOpen(true);
  }, []);

  return { isOpen, closePrompt, triggerPrompt };
}
