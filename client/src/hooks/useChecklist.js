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

  const isMutatingRef = useRef(false);

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

  // Authoritative server fetch
  const fetchFromServer = useCallback(async () => {
    if (!isRegisteredUser || !userId || !navigator.onLine || isMutatingRef.current) return;
    try {
      const res = await checklistApi.get(exam);
      const serverList = Array.isArray(res?.ticked)
        ? res.ticked
        : Array.isArray(res?.tickedDocIds)
        ? res.tickedDocIds
        : [];
      
      const serverSet = new Set(serverList);

      // Compare with current set
      const current = tickedRef.current;
      const isDifferent =
        serverSet.size !== current.size ||
        [...serverSet].some((id) => !current.has(id));

      if (isDifferent && !isMutatingRef.current) {
        setTicked(serverSet);
        writeUserLocalStorage(userId, exam, serverSet);
      }

      if (res?.lastSavedAt) {
        setLastSavedAt(res.lastSavedAt);
      }
      setSyncStatus('synced');
    } catch {
      // ignore transient fetch errors
    }
  }, [isRegisteredUser, userId, exam]);

  // Initial load + Real-time 1.5s Polling for Instant Cross-Device Sync
  useEffect(() => {
    if (!isRegisteredUser || !userId) return;

    let isMounted = true;
    setLoading(true);

    fetchFromServer().finally(() => {
      if (isMounted) setLoading(false);
    });

    // 1.5-second polling interval for instant real-time sync between phone & PC
    const pollTimer = setInterval(() => {
      fetchFromServer();
    }, 1500);

    const handleFocus = () => {
      fetchFromServer();
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

  // Toggle document checkbox: IMMEDIATELY saves locally & pushes to backend database
  const toggleDoc = useCallback(
    async (docId) => {
      const current = tickedRef.current;
      const next = new Set(current);
      const nowTicked = !next.has(docId);

      if (nowTicked) {
        next.add(docId);
      } else {
        next.delete(docId);
      }

      // 1. Instant local update
      setTicked(next);
      if (isRegisteredUser && userId) {
        writeUserLocalStorage(userId, exam, next);
      }

      // 2. Instant server update if registered user
      if (isRegisteredUser && userId && navigator.onLine) {
        isMutatingRef.current = true;
        setSyncStatus('syncing');
        setSaveSuccess(false);

        try {
          // Send instant tick update to DB
          await checklistApi.update(exam, docId, nowTicked);
          // Also sync full list to guarantee database consistency
          const res = await checklistApi.sync(exam, [...next]);
          
          if (res?.lastSavedAt) {
            setLastSavedAt(res.lastSavedAt);
          }
          setSyncStatus('synced');
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
          setSyncStatus('error');
        } finally {
          setTimeout(() => {
            isMutatingRef.current = false;
          }, 500);
        }
      }
    },
    [isRegisteredUser, userId, exam]
  );

  // Manual Force Save & Sync Action
  const saveChecklist = useCallback(async () => {
    if (!isRegisteredUser || !userId) return false;
    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }

    setIsSaving(true);
    setSaveError(false);
    isMutatingRef.current = true;

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
      setTimeout(() => {
        isMutatingRef.current = false;
      }, 500);
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
