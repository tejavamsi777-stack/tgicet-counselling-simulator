import { useState, useEffect, useCallback, useMemo } from 'react';
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
  // Only actual signed-in registered users (not guests) persist data to server
  const isRegisteredUser = Boolean(user && !user.is_guest);
  const userId = isRegisteredUser ? (user.id || user.email) : null;

  // Initial state from localStorage if available
  const [ticked, setTicked] = useState(() => (isRegisteredUser ? readUserLocalStorage(userId, exam) : new Set()));
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'

  // Fetch latest ticks from server (silent background sync)
  const fetchLatestFromServer = useCallback(async () => {
    if (!isRegisteredUser || !userId) return;
    try {
      const res = await checklistApi.get(exam);
      const serverList = Array.isArray(res?.ticked)
        ? res.ticked
        : Array.isArray(res?.tickedDocIds)
        ? res.tickedDocIds
        : [];
      const serverSet = new Set(serverList);
      setTicked(serverSet);
      writeUserLocalStorage(userId, exam, serverSet);
      setSyncStatus('synced');
    } catch {
      // keep existing state on background fetch error
    }
  }, [isRegisteredUser, userId, exam]);

  // Fetch and sync checklist whenever user or exam changes
  useEffect(() => {
    if (!isRegisteredUser || !userId) return;

    let isMounted = true;
    setLoading(true);

    // Initial load: fetch authoritative server state
    checklistApi.get(exam)
      .then(res => {
        if (!isMounted) return;
        const serverList = Array.isArray(res?.ticked)
          ? res.ticked
          : Array.isArray(res?.tickedDocIds)
          ? res.tickedDocIds
          : [];

        const serverSet = new Set(serverList);
        setTicked(serverSet);
        writeUserLocalStorage(userId, exam, serverSet);
        setSyncStatus('synced');
      })
      .catch(() => {
        if (isMounted) {
          const localSet = readUserLocalStorage(userId, exam);
          if (localSet.size > 0) setTicked(localSet);
          setSyncStatus('error');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Real-time synchronization: poll server every 3 seconds for instant mobile <-> PC sync
    const pollInterval = setInterval(() => {
      fetchLatestFromServer();
    }, 3000);

    const handleFocus = () => {
      fetchLatestFromServer();
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

  const toggleDoc = useCallback((docId) => {
    setTicked(prev => {
      const next = new Set(prev);
      const nowTicked = !next.has(docId);
      if (nowTicked) {
        next.add(docId);
      } else {
        next.delete(docId);
      }

      if (isRegisteredUser && userId) {
        writeUserLocalStorage(userId, exam, next);
        setSyncStatus('syncing');
        checklistApi
          .update(exam, docId, nowTicked)
          .then(() => setSyncStatus('synced'))
          .catch(() => setSyncStatus('error'));
      }

      return next;
    });
  }, [isRegisteredUser, userId, exam]);

  // Explicit Save & Sync Across Devices Action
  const saveChecklist = useCallback(async () => {
    if (!isRegisteredUser || !userId) return false;
    setSyncStatus('syncing');
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
      setSyncStatus('synced');
      return true;
    } catch (err) {
      setSyncStatus('error');
      return false;
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
    refreshChecklist: fetchLatestFromServer,
    checkedItems,
    toggleItem: toggleDoc,
    loading,
    isRegisteredUser,
    syncStatus,
  };
}
