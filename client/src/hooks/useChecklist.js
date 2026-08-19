import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { checklistApi } from '../lib/eapcetApi';
import { getUserToken } from '../lib/api';
import { supabase } from '../lib/supabase';

const LS_PREFIX = 'tg_l1_checklist_';

function getStorageKey(user, exam) {
  if (user && !user.is_guest) {
    const uid = user.id || user.email || 'user';
    return `${LS_PREFIX}${uid}_${exam}`;
  }
  return `${LS_PREFIX}guest_${exam}`;
}

function getOutboxKey(user, exam) {
  if (user && !user.is_guest) {
    const uid = user.id || user.email || 'user';
    return `${LS_PREFIX}outbox_${uid}_${exam}`;
  }
  return `${LS_PREFIX}outbox_guest_${exam}`;
}

function readLocalItems(user, exam) {
  try {
    const key = getStorageKey(user, exam);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);

    const guestRaw = localStorage.getItem(`${LS_PREFIX}guest_${exam}`);
    if (guestRaw) return JSON.parse(guestRaw);

    // Fallback: check legacy set format
    const legacyRaw = localStorage.getItem(`tg_user_checklist_${exam}`);
    if (legacyRaw) {
      const arr = JSON.parse(legacyRaw);
      const map = {};
      const now = Date.now();
      for (const id of arr) {
        map[id] = { isChecked: true, updatedAt: now };
      }
      return map;
    }

    return {};
  } catch {
    return {};
  }
}

function writeLocalItems(user, exam, map) {
  try {
    const key = getStorageKey(user, exam);
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

function readOutbox(user, exam) {
  try {
    const key = getOutboxKey(user, exam);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOutbox(user, exam, queue) {
  try {
    const key = getOutboxKey(user, exam);
    localStorage.setItem(key, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

export function useChecklist(exam = 'tg-eapcet') {
  const { user } = useAuth();
  const token = getUserToken();
  const isRegisteredUser = Boolean((user && !user.is_guest) || token);
  const userId = user?.id || null;

  // Local-First Item Map: { [docId]: { isChecked: boolean, updatedAt: number } }
  const [itemsMap, setItemsMap] = useState(() => readLocalItems(user, exam));
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

  const itemsMapRef = useRef(itemsMap);
  itemsMapRef.current = itemsMap;

  const userRef = useRef(user);
  userRef.current = user;

  const isFlushingOutboxRef = useRef(false);

  // Derived set of checked document IDs
  const ticked = useMemo(() => {
    const set = new Set();
    for (const [docId, item] of Object.entries(itemsMap)) {
      if (item?.isChecked) {
        set.add(docId);
      }
    }
    return set;
  }, [itemsMap]);

  // Flush persistent outbox queue with exponential retry
  const flushOutbox = useCallback(async () => {
    const activeToken = getUserToken();
    if (!activeToken || !navigator.onLine || isFlushingOutboxRef.current) return;

    const queue = readOutbox(userRef.current, exam);
    if (queue.length === 0) return;

    isFlushingOutboxRef.current = true;
    setSyncStatus('syncing');

    const remaining = [...queue];
    try {
      while (remaining.length > 0) {
        const item = remaining[0];
        await checklistApi.update(exam, item.docId, item.isChecked);
        remaining.shift();
        writeOutbox(userRef.current, exam, remaining);
      }
      setSyncStatus('synced');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setSyncStatus('error');
    } finally {
      isFlushingOutboxRef.current = false;
    }
  }, [exam]);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsLiveConnected(true);
      flushOutbox();
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
  }, [flushOutbox]);

  // Initial local storage hydration when user changes
  useEffect(() => {
    const local = readLocalItems(user, exam);
    if (Object.keys(local).length > 0) {
      setItemsMap(local);
    }
  }, [user, exam]);

  // Pull server changes and merge using Last-Write-Wins (LWW) per item
  const fetchFromServer = useCallback(
    async () => {
      const activeToken = getUserToken();
      if (!activeToken || !navigator.onLine) return;

      try {
        const res = await checklistApi.get(exam);
        const serverItems = res?.items || {};
        const serverTimestamp = res?.lastSavedAt || null;

        // If server sent legacy array without items map
        if (Object.keys(serverItems).length === 0 && Array.isArray(res?.ticked)) {
          const now = Date.now();
          for (const docId of res.ticked) {
            serverItems[docId] = { isChecked: true, updatedAt: now };
          }
        }

        // LWW Delta Merge: Merge each doc individually based on timestamp
        let hasChanges = false;
        const merged = { ...itemsMapRef.current };

        for (const [docId, serverRecord] of Object.entries(serverItems)) {
          const localRecord = merged[docId];
          const serverTime = new Date(serverRecord.updatedAt || 0).getTime();
          const localTime = localRecord?.updatedAt || 0;

          // If server record is newer than local, apply it
          if (!localRecord || serverTime > localTime) {
            merged[docId] = {
              isChecked: Boolean(serverRecord.isChecked ?? serverRecord.is_checked),
              updatedAt: serverTime,
            };
            hasChanges = true;
          }
        }

        if (hasChanges) {
          setItemsMap(merged);
          writeLocalItems(userRef.current, exam, merged);
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

  // Supabase Realtime Delta Subscription
  useEffect(() => {
    if (!userId) return;

    const channelName = `checklist_sync_${userId}_${exam}`;
    const channel = supabase.channel(channelName);

    // Listen for delta broadcast from peer devices
    channel.on('broadcast', { event: 'delta_mutation' }, ({ payload }) => {
      if (!payload || !payload.docId) return;

      const { docId, isChecked, timestamp } = payload;
      const remoteTime = new Date(timestamp || Date.now()).getTime();

      setItemsMap((prev) => {
        const local = prev[docId];
        const localTime = local?.updatedAt || 0;

        // Apply only if remote timestamp is strictly newer
        if (!local || remoteTime > localTime) {
          const nextMap = {
            ...prev,
            [docId]: { isChecked, updatedAt: remoteTime },
          };
          writeLocalItems(userRef.current, exam, nextMap);
          return nextMap;
        }
        return prev;
      });

      if (payload.lastSavedAt) {
        setLastSavedAt(payload.lastSavedAt);
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

  // Polling Heartbeat
  useEffect(() => {
    fetchFromServer();

    const pollTimer = setInterval(() => {
      fetchFromServer();
      flushOutbox();
    }, 2000);

    const handleFocus = () => {
      fetchFromServer();
      flushOutbox();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [user, exam, fetchFromServer, flushOutbox]);

  // Local-First Toggle: Instant 0ms update + Outbox Queue + Realtime Broadcast
  const toggleDoc = useCallback(
    (docId) => {
      const now = Date.now();
      const nowIso = new Date(now).toISOString();

      // 1. Instant optimistic update
      const current = itemsMapRef.current;
      const currentlyChecked = Boolean(current[docId]?.isChecked);
      const newChecked = !currentlyChecked;

      const nextMap = {
        ...current,
        [docId]: {
          isChecked: newChecked,
          updatedAt: now,
        },
      };

      setItemsMap(nextMap);
      writeLocalItems(userRef.current, exam, nextMap);
      setLastSavedAt(nowIso);
      try {
        localStorage.setItem(`tg_saved_at_${exam}`, nowIso);
      } catch {}

      // 2. Queue mutation in persistent outbox
      const queue = readOutbox(userRef.current, exam);
      queue.push({ docId, isChecked: newChecked, timestamp: nowIso });
      writeOutbox(userRef.current, exam, queue);

      // 3. Broadcast delta over Supabase Realtime channel
      const currentUserId = userRef.current?.id;
      if (currentUserId) {
        try {
          const channelName = `checklist_sync_${currentUserId}_${exam}`;
          supabase.channel(channelName).send({
            type: 'broadcast',
            event: 'delta_mutation',
            payload: {
              docId,
              isChecked: newChecked,
              timestamp: nowIso,
              lastSavedAt: nowIso,
            },
          });
        } catch {
          // ignore
        }
      }

      // 4. Trigger background outbox flush
      flushOutbox();
    },
    [exam, flushOutbox]
  );

  // Manual Force Save & Sync
  const saveChecklist = useCallback(async () => {
    const activeToken = getUserToken();
    if (!activeToken) return false;
    if (!navigator.onLine) {
      setIsOffline(true);
      return false;
    }

    setIsSaving(true);
    setSaveError(false);

    try {
      const tickedList = [];
      for (const [docId, item] of Object.entries(itemsMapRef.current)) {
        if (item?.isChecked) tickedList.push(docId);
      }

      const res = await checklistApi.sync(exam, tickedList);
      const confirmedTimestamp = res?.lastSavedAt || new Date().toISOString();
      setLastSavedAt(confirmedTimestamp);
      try {
        localStorage.setItem(`tg_saved_at_${exam}`, confirmedTimestamp);
      } catch {}

      // Clear outbox as full sync succeeded
      writeOutbox(userRef.current, exam, []);

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
    for (const [docId, item] of Object.entries(itemsMap)) {
      if (item?.isChecked) obj[docId] = true;
    }
    return obj;
  }, [itemsMap]);

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
