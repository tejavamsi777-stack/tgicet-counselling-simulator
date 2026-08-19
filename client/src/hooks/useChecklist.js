import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    // ignore
  }
}

function areSetsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export function useChecklist(exam = 'tg-eapcet') {
  const { user } = useAuth();
  const isRegisteredUser = Boolean(user && !user.is_guest);
  const userId = isRegisteredUser ? (user.id || user.email) : null;

  const [ticked, setTicked] = useState(() => (isRegisteredUser ? readUserLocalStorage(userId, exam) : new Set()));
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const tickedRef = useRef(ticked);
  tickedRef.current = ticked;

  // Track when user last modified checkboxes locally so polling does NOT stomp on active clicks
  const lastMutationTimeRef = useRef(0);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Server fetch for real-time background sync
  const fetchFromServer = useCallback(async (force = false) => {
    if (!isRegisteredUser || !userId || !navigator.onLine) return;
    // Don't overwrite if user clicked a checkbox in the last 4 seconds
    if (!force && Date.now() - lastMutationTimeRef.current < 4000) return;

    try {
      const res = await checklistApi.get(exam);
      const serverList = Array.isArray(res?.ticked)
        ? res.ticked
        : Array.isArray(res?.tickedDocIds)
        ? res.tickedDocIds
        : [];
      
      const serverSet = new Set(serverList);

      // Only update state if different and not recently mutated
      if (force || Date.now() - lastMutationTimeRef.current >= 4000) {
        if (!areSetsEqual(serverSet, tickedRef.current)) {
          setTicked(serverSet);
          writeUserLocalStorage(userId, exam, serverSet);
        }
      }

      if (res?.lastSavedAt) {
        setLastSavedAt(res.lastSavedAt);
      }
      setSyncStatus('synced');
    } catch {
      // ignore
    }
  }, [isRegisteredUser, userId, exam]);

  // Initial load + Real-time 2s Polling
  useEffect(() => {
    if (!isRegisteredUser || !userId) return;

    let isMounted = true;
    setLoading(true);

    fetchFromServer(true).finally(() => {
      if (isMounted) setLoading(false);
    });

    const pollTimer = setInterval(() => {
      fetchFromServer(false);
    }, 2000);

    const handleFocus = () => {
      fetchFromServer(false);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isRegisteredUser, userId, exam, fetchFromServer]);

  // Toggle document checkbox: IMMEDIATELY persists locally & to backend
  const toggleDoc = useCallback(
    async (docId) => {
      lastMutationTimeRef.current = Date.now();

      const current = tickedRef.current;
      const next = new Set(current);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }

      // 1. Instant local optimistic update
      setTicked(next);
      if (isRegisteredUser && userId) {
        writeUserLocalStorage(userId, exam, next);
      }

      // 2. Instant server sync if registered user
      if (isRegisteredUser && userId && navigator.onLine) {
        setSyncStatus('syncing');
        setSaveSuccess(false);

        try {
          // Sync full state to DB
          const res = await checklistApi.sync(exam, [...next]);
          lastMutationTimeRef.current = Date.now();
          if (res?.lastSavedAt) {
            setLastSavedAt(res.lastSavedAt);
          }
          setSyncStatus('synced');
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
          setSyncStatus('error');
        }
      }
    },
    [isRegisteredUser, userId, exam]
  );

  // Manual Force Save & Sync
  const saveChecklist = useCallback(async () => {
    if (!isRegisteredUser || !userId) return false;
    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }

    lastMutationTimeRef.current = Date.now();
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
      writeUserLocalStorage(userId, exam, serverSet);
      if (res?.lastSavedAt) setLastSavedAt(res.lastSavedAt);
      
      lastMutationTimeRef.current = Date.now();
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
  }, [isRegisteredUser, userId, exam, ticked]);

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
  };
}
