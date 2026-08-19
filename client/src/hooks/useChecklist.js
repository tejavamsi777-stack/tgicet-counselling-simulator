import { useState, useCallback, useMemo } from 'react';

const LS_KEY = (exam) => `tg_hlc_checklist_${exam}`;

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

export function useChecklist(exam = 'tg-eapcet') {
  // Synchronous initialization from device permanent storage
  const [ticked, setTicked] = useState(() => readLocal(exam));

  // Toggle document: saves instantly and permanently to this device
  const toggleDoc = useCallback(
    (docId) => {
      setTicked((prev) => {
        const next = new Set(prev);
        if (next.has(docId)) {
          next.delete(docId);
        } else {
          next.add(docId);
        }
        writeLocal(exam, next);
        return next;
      });
    },
    [exam]
  );

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
    toggleItem: toggleDoc,
    checkedItems,
    saveChecklist: () => Promise.resolve(true),
    refreshChecklist: () => {},
    loading: false,
    isSaving: false,
    saveSuccess: false,
    saveError: false,
    lastSavedAt: null,
    isOffline: false,
    isRegisteredUser: true,
    syncStatus: 'synced',
    isLiveConnected: true,
  };
}

export const useChecklistSync = useChecklist;
