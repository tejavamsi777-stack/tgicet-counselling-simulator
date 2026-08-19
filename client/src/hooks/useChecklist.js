import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checklistApi } from '../lib/eapcetApi';
import { getUserToken } from '../lib/api';

const LS_KEY_PREFIX = 'tg_user_checklist_';

function getStorageKey(user, exam) {
  if (user && !user.is_guest) {
    const uid = user.id || user.email || 'user';
    return `${LS_KEY_PREFIX}${uid}_${exam}`;
  }
  return `${LS_KEY_PREFIX}guest_${exam}`;
}

function readLocalChecklist(user, exam) {
  try {
    const key = getStorageKey(user, exam);
    const raw = localStorage.getItem(key);
    if (raw) return new Set(JSON.parse(raw));

    const guestRaw = localStorage.getItem(`${LS_KEY_PREFIX}guest_${exam}`);
    if (guestRaw) return new Set(JSON.parse(guestRaw));

    return new Set();
  } catch {
    return new Set();
  }
}

function writeLocalChecklist(user, exam, set) {
  try {
    const key = getStorageKey(user, exam);
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

function areSetsEqual(a, b) {
  if (!a || !b) return false;
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export function useChecklist(exam = 'tg-eapcet') {
  const { user } = useAuth();
  const token = getUserToken();
  const isRegisteredUser = Boolean((user && !user.is_guest) || token);

  const [ticked, setTicked] = useState(() => readLocalChecklist(user, exam));
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(() => {
    try {
      return localStorage.getItem(`tg_saved_at_${exam}`) || null;
    } catch {
      return null;
    }
  });
  const [syncStatus, setSyncStatus] = useState('synced');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  const tickedRef = useRef(ticked);
  tickedRef.current = ticked;

  const userRef = useRef(user);
  userRef.current = user;

  const lastSavedAtRef = useRef(lastSavedAt);
  lastSavedAtRef.current = lastSavedAt;

  const lastLocalMutationTimeRef = useRef(0);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsLiveConnected(true);
    };
    const handleOffline = () => {
      setIsOffline(false);
      setIsLiveConnected(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync initial local cache when user profile mounts
  useEffect(() => {
    const local = readLocalChecklist(user, exam);
    if (local.size > 0) {
      setTicked(local);
    }
  }, [user, exam]);

  // Fetch authoritative state from backend server
  const fetchFromServer = useCallback(
    async () => {
      const activeToken = getUserToken();
      if (!activeToken || !navigator.onLine) return;

      // Lock out server overwrite if user clicked on this device in last 5 seconds
      if (Date.now() - lastLocalMutationTimeRef.current < 5000) return;

      try {
        const res = await checklistApi.get(exam);
        const serverList = Array.isArray(res?.ticked)
          ? res.ticked
          : Array.isArray(res?.tickedDocIds)
          ? res.tickedDocIds
          : [];

        const serverSet = new Set(serverList);
        const serverTimestamp = res?.lastSavedAt || null;

        // Never wipe out non-empty local state with empty server response
        if (serverSet.size === 0 && tickedRef.current.size > 0) {
          // Push local state to server to populate database
          checklistApi.sync(exam, [...tickedRef.current]).catch(() => {});
          return;
        }

        // If server has items and differs from local state (and user is not currently clicking)
        if (serverSet.size > 0 && !areSetsEqual(serverSet, tickedRef.current)) {
          if (Date.now() - lastLocalMutationTimeRef.current >= 5000) {
            setTicked(serverSet);
            writeLocalChecklist(userRef.current, exam, serverSet);
          }
        }

        if (serverTimestamp) {
          setLastSavedAt(serverTimestamp);
          try {
            localStorage.setItem(`tg_saved_at_${exam}`, serverTimestamp);
          } catch {}
        }

        setSyncStatus('synced');
        setIsLiveConnected(true);
      } catch (err) {
        // ignore network hiccups
      }
    },
    [exam]
  );

  // Real-time 2-second Polling for Instant Cross-Device Sync
  useEffect(() => {
    const pollTimer = setInterval(() => {
      fetchFromServer();
    }, 2000);

    const handleFocus = () => {
      fetchFromServer();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user, exam, fetchFromServer]);

  // Toggle document checkbox: IMMEDIATELY persists locally & syncs to DB
  const toggleDoc = useCallback(
    async (docId) => {
      lastLocalMutationTimeRef.current = Date.now();
      const nowIso = new Date().toISOString();

      const current = tickedRef.current;
      const next = new Set(current);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }

      // 1. Instant local optimistic update
      setTicked(next);
      writeLocalChecklist(userRef.current, exam, next);
      setLastSavedAt(nowIso);
      try {
        localStorage.setItem(`tg_saved_at_${exam}`, nowIso);
      } catch {}

      // 2. Instant server sync
      const activeToken = getUserToken();
      if (activeToken && navigator.onLine) {
        setSyncStatus('syncing');
        setSaveSuccess(false);

        try {
          const res = await checklistApi.sync(exam, [...next]);
          const confirmedTimestamp = res?.lastSavedAt || nowIso;
          setLastSavedAt(confirmedTimestamp);
          try {
            localStorage.setItem(`tg_saved_at_${exam}`, confirmedTimestamp);
          } catch {}

          setSyncStatus('synced');
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
          setSyncStatus('error');
        }
      }
    },
    [exam]
  );

  // Manual Force Save & Sync
  const saveChecklist = useCallback(async () => {
    const activeToken = getUserToken();
    if (!activeToken) return false;
    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }

    lastLocalMutationTimeRef.current = Date.now();
    const nowIso = new Date().toISOString();
    setIsSaving(true);
    setSaveError(false);

    try {
      const res = await checklistApi.sync(exam, [...ticked]);
      const serverList = Array.isArray(res?.ticked)
        ? res.ticked
        : Array.isArray(res?.tickedDocIds)
        ? res.tickedDocIds
        : [...ticked];
      const serverSet = new Set(serverList);

      setTicked(serverSet);
      writeLocalChecklist(userRef.current, exam, serverSet);
      
      const confirmedTimestamp = res?.lastSavedAt || nowIso;
      setLastSavedAt(confirmedTimestamp);
      try {
        localStorage.setItem(`tg_saved_at_${exam}`, confirmedTimestamp);
      } catch {}

      setSyncStatus('synced');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (err) {
      setSaveError(true);
      setSyncStatus('error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [exam, ticked]);

  // Backward compatibility object mapping
  const checkedItems = useMemo(() => {
    const obj = {};
    for (const id of ticked) {
      obj[id] = true;
    }
    return obj;
  }, [ticked]);

  return {
    ticked,
    toggleDoc,
    saveChecklist,
    refreshChecklist: fetchFromServer,
    checkedItems,
    toggleItem: toggleDoc,
    loading,
    isSaving,
    saveSuccess,
    saveError,
    lastSavedAt,
    isOffline,
    isRegisteredUser,
    syncStatus,
    isLiveConnected,
  };
}

export const useChecklistSync = useChecklist;
