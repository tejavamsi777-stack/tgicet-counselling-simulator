import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checklistApi } from '../lib/eapcetApi';
import { getUserToken } from '../lib/api';
import { supabase } from '../lib/supabase';

const LS_KEY = (exam) => `tg_hlc_checked_${exam}`;

function readLocal(exam) {
  try {
    const raw = localStorage.getItem(LS_KEY(exam));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
      if (typeof parsed === 'object' && parsed !== null) {
        const checked = Object.entries(parsed)
          .filter(([_, v]) => v?.isChecked ?? v === true)
          .map(([k]) => k);
        return new Set(checked);
      }
    }
  } catch {
    // fallback
  }
  return new Set();
}

function writeLocal(exam, set) {
  try {
    localStorage.setItem(LS_KEY(exam), JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

function areEqual(a, b) {
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
  const userId = user?.id || null;

  const [ticked, setTicked] = useState(() => readLocal(exam));
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

  const lastUserClickTimeRef = useRef(0);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsLiveConnected(true);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setIsLiveConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch from server
  const fetchFromServer = useCallback(
    async (force = false) => {
      const activeToken = getUserToken();
      if (!activeToken || !navigator.onLine) return;

      // Don't overwrite if user clicked locally within 4 seconds
      if (!force && Date.now() - lastUserClickTimeRef.current < 4000) return;

      try {
        const res = await checklistApi.get(exam);
        const serverList = Array.isArray(res?.ticked)
          ? res.ticked
          : Array.isArray(res?.tickedDocIds)
          ? res.tickedDocIds
          : [];

        const serverSet = new Set(serverList);
        const serverTimestamp = res?.lastSavedAt || null;

        // If server has items or if force load
        if (serverSet.size > 0 || force) {
          if (!areEqual(serverSet, tickedRef.current)) {
            setTicked(serverSet);
            writeLocal(exam, serverSet);
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
      } catch {
        // ignore
      }
    },
    [exam]
  );

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channelName = `checklist_sync_${userId}_${exam}`;
    const channel = supabase.channel(channelName);

    channel.on('broadcast', { event: 'delta_sync' }, ({ payload }) => {
      if (!payload || !payload.tickedList) return;
      if (Date.now() - lastUserClickTimeRef.current < 2000) return;

      const remoteSet = new Set(payload.tickedList);
      if (!areEqual(remoteSet, tickedRef.current)) {
        setTicked(remoteSet);
        writeLocal(exam, remoteSet);
        if (payload.lastSavedAt) {
          setLastSavedAt(payload.lastSavedAt);
        }
      }
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsLiveConnected(true);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, exam]);

  // Initial mount & Background Polling
  useEffect(() => {
    fetchFromServer(true);

    const timer = setInterval(() => {
      fetchFromServer(false);
    }, 2000);

    const onFocus = () => {
      fetchFromServer(false);
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [exam, fetchFromServer]);

  // Toggle document checkbox: GUARANTEED INSTANT CLICK + BACKGROUND PERSISTENCE
  const toggleDoc = useCallback(
    (docId) => {
      lastUserClickTimeRef.current = Date.now();
      const nowIso = new Date().toISOString();

      // 1. Instant local optimistic update
      const current = tickedRef.current;
      const next = new Set(current);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }

      setTicked(next);
      writeLocal(exam, next);
      setLastSavedAt(nowIso);
      try {
        localStorage.setItem(`tg_saved_at_${exam}`, nowIso);
      } catch {}

      // 2. Broadcast via Supabase Realtime
      const currentUserId = userRef.current?.id;
      if (currentUserId) {
        try {
          const channelName = `checklist_sync_${currentUserId}_${exam}`;
          supabase.channel(channelName).send({
            type: 'broadcast',
            event: 'delta_sync',
            payload: {
              tickedList: [...next],
              lastSavedAt: nowIso,
            },
          });
        } catch {
          // ignore
        }
      }

      // 3. Background server sync
      const activeToken = getUserToken();
      if (activeToken && navigator.onLine) {
        setSyncStatus('syncing');
        setSaveSuccess(false);

        checklistApi
          .sync(exam, [...next])
          .then((res) => {
            const confirmedTime = res?.lastSavedAt || nowIso;
            setLastSavedAt(confirmedTime);
            try {
              localStorage.setItem(`tg_saved_at_${exam}`, confirmedTime);
            } catch {}
            setSyncStatus('synced');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
          })
          .catch(() => {
            setSyncStatus('error');
          });
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

    lastUserClickTimeRef.current = Date.now();
    const nowIso = new Date().toISOString();
    setIsSaving(true);
    setSaveError(false);

    try {
      const res = await checklistApi.sync(exam, [...tickedRef.current]);
      const confirmedTime = res?.lastSavedAt || nowIso;
      setLastSavedAt(confirmedTime);
      try {
        localStorage.setItem(`tg_saved_at_${exam}`, confirmedTime);
      } catch {}

      setSyncStatus('synced');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return true;
    } catch {
      setSaveError(true);
      setSyncStatus('error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [exam]);

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
