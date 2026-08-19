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
    // ignore quota errors
  }
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [conflictNotice, setConflictNotice] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const hasUnsavedRef = useRef(hasUnsavedChanges);
  hasUnsavedRef.current = hasUnsavedChanges;

  const lastSavedAtRef = useRef(lastSavedAt);
  lastSavedAtRef.current = lastSavedAt;

  // Track online/offline status
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

  // Fetch latest ticks from server
  const fetchLatestFromServer = useCallback(async (isInitial = false) => {
    if (!isRegisteredUser || !userId || !navigator.onLine) return;
    try {
      const res = await checklistApi.get(exam);
      const serverList = Array.isArray(res?.ticked)
        ? res.ticked
        : Array.isArray(res?.tickedDocIds)
        ? res.tickedDocIds
        : [];
      const serverSet = new Set(serverList);
      const serverTimestamp = res?.lastSavedAt || null;

      if (isInitial) {
        setTicked(serverSet);
        writeUserLocalStorage(userId, exam, serverSet);
        if (serverTimestamp) setLastSavedAt(serverTimestamp);
        setHasUnsavedChanges(false);
      } else {
        // If server timestamp is newer than our last saved timestamp
        if (serverTimestamp && lastSavedAtRef.current && new Date(serverTimestamp) > new Date(lastSavedAtRef.current)) {
          if (!hasUnsavedRef.current) {
            setTicked(serverSet);
            writeUserLocalStorage(userId, exam, serverSet);
            setLastSavedAt(serverTimestamp);
            setConflictNotice(false);
          } else {
            setConflictNotice(true);
          }
        }
      }
    } catch {
      // Keep local state on background fetch failure
    }
  }, [isRegisteredUser, userId, exam]);

  // Initial load & 4-second background poll for real-time cross-device sync
  useEffect(() => {
    if (!isRegisteredUser || !userId) return;

    let isMounted = true;
    setLoading(true);

    fetchLatestFromServer(true).finally(() => {
      if (isMounted) setLoading(false);
    });

    const pollInterval = setInterval(() => {
      fetchLatestFromServer(false);
    }, 4000);

    const handleFocus = () => {
      fetchLatestFromServer(false);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isRegisteredUser, userId, exam, fetchLatestFromServer]);

  // Toggle document checkbox in local memory only (prevents DB writes per click)
  const toggleDoc = useCallback((docId) => {
    setTicked(prev => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }

      if (isRegisteredUser && userId) {
        writeUserLocalStorage(userId, exam, next);
        setHasUnsavedChanges(true);
      }

      return next;
    });
  }, [isRegisteredUser, userId, exam]);

  // Explicit Save & Sync Action ("Save & Sync Across Devices")
  const saveChecklist = useCallback(async () => {
    if (!isRegisteredUser || !userId) return false;
    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }

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
      const serverTimestamp = res?.lastSavedAt || new Date().toISOString();

      setTicked(serverSet);
      writeUserLocalStorage(userId, exam, serverSet);
      setLastSavedAt(serverTimestamp);
      setHasUnsavedChanges(false);
      setConflictNotice(false);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch (err) {
      setSaveError(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isRegisteredUser, userId, exam, ticked]);

  // Force reload latest server version (to resolve conflict)
  const reloadLatestServerState = useCallback(() => {
    fetchLatestFromServer(true);
    setConflictNotice(false);
  }, [fetchLatestFromServer]);

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
    reloadLatestServerState,
    refreshChecklist: fetchLatestFromServer,
    checkedItems,
    toggleItem: toggleDoc,
    loading,
    isSaving,
    saveSuccess,
    saveError,
    lastSavedAt,
    hasUnsavedChanges,
    conflictNotice,
    isOffline,
    isRegisteredUser,
  };
}
