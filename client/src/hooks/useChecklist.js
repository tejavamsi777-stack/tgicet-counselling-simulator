import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { checklistApi } from '../lib/eapcetApi';

const LS_KEY_PREFIX = 'tg_user_checklist_';

function readUserLocalStorage(userId, exam) {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(`${LS_KEY_PREFIX}${userId}_${exam}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeUserLocalStorage(userId, exam, set) {
  if (!userId) return;
  try {
    localStorage.setItem(`${LS_KEY_PREFIX}${userId}_${exam}`, JSON.stringify([...set]));
  } catch {
    // ignore quota errors
  }
}

export function useChecklist(exam = 'tg-eapcet') {
  const { user } = useAuth();
  // Only actual signed-in registered users (not guests) persist data
  const isRegisteredUser = Boolean(user && !user.is_guest);
  const userId = isRegisteredUser ? (user.id || user.email) : null;

  // Guest users start with a fresh in-memory Set; registered users load their saved state
  const [ticked, setTicked] = useState(() => (isRegisteredUser ? readUserLocalStorage(userId, exam) : new Set()));
  const [loading, setLoading] = useState(false);

  // Sync state when user logs in or switches account
  useEffect(() => {
    if (!isRegisteredUser || !userId) {
      // Guest or logged out: in-memory state only (resets on refresh / new tab)
      return;
    }

    setLoading(true);
    const localSet = readUserLocalStorage(userId, exam);
    setTicked(localSet);

    checklistApi.get(exam)
      .then(res => {
        const serverIds = Array.isArray(res?.tickedDocIds) ? res.tickedDocIds : [];
        setTicked(prev => {
          const merged = new Set([...prev, ...serverIds]);
          writeUserLocalStorage(userId, exam, merged);
          return merged;
        });
      })
      .catch(() => {
        // silently fallback to local storage
      })
      .finally(() => setLoading(false));
  }, [isRegisteredUser, userId, exam]);

  const toggleDoc = useCallback((docId) => {
    setTicked(prev => {
      const next = new Set(prev);
      const nowTicked = !next.has(docId);
      if (nowTicked) {
        next.add(docId);
      } else {
        next.delete(docId);
      }

      // ONLY save to localStorage & backend if the user is a registered signed-in user
      if (isRegisteredUser && userId) {
        writeUserLocalStorage(userId, exam, next);
        checklistApi.update(exam, docId, nowTicked).catch(() => {});
      }

      return next;
    });
  }, [isRegisteredUser, userId, exam]);

  return { ticked, toggleDoc, loading, isRegisteredUser };
}
