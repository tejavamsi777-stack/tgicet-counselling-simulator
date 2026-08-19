import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checklistApi } from '../lib/eapcetApi';
import { getUserToken } from '../lib/api';
import { supabase } from '../lib/supabase';

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
  const userId = user?.id || (token ? 'active_user' : null);

  const [ticked, setTicked] = useState(() => readLocalChecklist(user, exam));
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  const tickedRef = useRef(ticked);
  tickedRef.current = ticked;

  const userRef = useRef(user);
  userRef.current = user;

  const lastMutationTimeRef = useRef(0);

  // Online / offline tracking
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

  // Sync initial local cache when user profile mounts
  useEffect(() => {
    const local = readLocalChecklist(user, exam);
    if (local.size > 0) {
      setTicked(local);
    }
  }, [user, exam]);

  // Fetch authoritative state from backend server
  const fetchFromServer = useCallback(
    async (force = false) => {
      const activeToken = getUserToken();
      if (!activeToken || !navigator.onLine) return;
      if (!force && Date.now() - lastMutationTimeRef.current < 2500) return;

      try {
        const res = await checklistApi.get(exam);
        const serverList = Array.isArray(res?.ticked)
          ? res.ticked
          : Array.isArray(res?.tickedDocIds)
          ? res.tickedDocIds
          : [];

        const serverSet = new Set(serverList);

        // Apply server state if no recent local click
        if (force || Date.now() - lastMutationTimeRef.current >= 2500) {
          if (!areSetsEqual(serverSet, tickedRef.current)) {
            setTicked(serverSet);
            writeLocalChecklist(userRef.current, exam, serverSet);
          }
        }

        if (res?.lastSavedAt) {
          setLastSavedAt(res.lastSavedAt);
        }
        setSyncStatus('synced');
        setIsLiveConnected(true);
      } catch (err) {
        // ignore
      }
    },
    [exam]
  );

  // Supabase Realtime Channel Subscription (Postgres Changes & Broadcast)
  useEffect(() => {
    if (!userId || userId === 'active_user') return;

    const channelName = `checklist_sync_${userId}_${exam}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false },
      },
    });

    // 1. Listen for Supabase Realtime Broadcast from peer devices
    channel.on('broadcast', { event: 'tick_update' }, ({ payload }) => {
      if (!payload || !payload.tickedDocIds) return;
      if (Date.now() - lastMutationTimeRef.current < 1500) return;

      const incomingSet = new Set(payload.tickedDocIds);
      if (!areSetsEqual(incomingSet, tickedRef.current)) {
        setTicked(incomingSet);
        writeLocalChecklist(userRef.current, exam, incomingSet);
        if (payload.lastSavedAt) setLastSavedAt(payload.lastSavedAt);
      }
    });

    // 2. Listen for Supabase Postgres Changes on checklist_progress table
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'checklist_progress',
        filter: `user_id=eq.${userId}`,
      },
      (change) => {
        if (Date.now() - lastMutationTimeRef.current < 2000) return;
        fetchFromServer(true);
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsLiveConnected(true);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, exam, fetchFromServer]);

  // Initial load + Real-time 1.5-second Heartbeat
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const local = readLocalChecklist(user, exam);
    if (local.size > 0) {
      setTicked(local);
    }

    fetchFromServer(true).finally(() => {
      if (isMounted) setLoading(false);
    });

    const pollTimer = setInterval(() => {
      fetchFromServer(false);
    }, 1500);

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
  }, [user, exam, fetchFromServer]);

  // Toggle document checkbox: IMMEDIATELY persists locally, syncs to DB, and broadcasts in Realtime
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
      writeLocalChecklist(userRef.current, exam, next);

      // 2. Broadcast immediately over Realtime channel to other tabs/devices
      const currentUserId = userRef.current?.id;
      if (currentUserId) {
        try {
          const channelName = `checklist_sync_${currentUserId}_${exam}`;
          supabase.channel(channelName).send({
            type: 'broadcast',
            event: 'tick_update',
            payload: {
              tickedDocIds: [...next],
              lastSavedAt: new Date().toISOString(),
            },
          });
        } catch {
          // ignore
        }
      }

      // 3. Instant server sync to PostgreSQL
      const activeToken = getUserToken();
      if (activeToken && navigator.onLine) {
        setSyncStatus('syncing');
        setSaveSuccess(false);

        try {
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
      writeLocalChecklist(userRef.current, exam, serverSet);
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
