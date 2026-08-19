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

  // Fetch and sync checklist whenever user or exam changes
  useEffect(() => {
    if (!isRegisteredUser || !userId) {
      // Guest or logged out: in-memory state only
      return;
    }

    let isMounted = true;
    setLoading(true);
    setSyncStatus('syncing');

    // Read initial local cache
    const localSet = readUserLocalStorage(userId, exam);
    if (localSet.size > 0) {
      setTicked(localSet);
    }

    checklistApi.get(exam)
      .then(res => {
        if (!isMounted) return;
        const serverList = Array.isArray(res?.ticked)
          ? res.ticked
          : Array.isArray(res?.tickedDocIds)
          ? res.tickedDocIds
          : [];

        const serverSet = new Set(serverList);

        // Merge any local offline ticks with server ticks
        const merged = new Set([...localSet, ...serverSet]);
        setTicked(merged);
        writeUserLocalStorage(userId, exam, merged);

        // If local had unsynced items not yet on the server, push sync to server
        if (merged.size > serverSet.size) {
          checklistApi.sync(exam, [...merged]).catch(() => {});
        }

        setSyncStatus('synced');
      })
      .catch(() => {
        if (isMounted) setSyncStatus('error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
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

      // Save to localStorage & push to backend if registered user
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
    checkedItems,
    toggleItem: toggleDoc,
    loading,
    isRegisteredUser,
    syncStatus,
  };
}
