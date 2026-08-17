import { useState, useEffect } from 'react';
import { eapcetApi } from '../lib/eapcetApi';

// Module-level cache so data is only fetched once per session
let _cache = null;

export function useEapcetData() {
  const [data, setData] = useState(_cache);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (_cache) return;
    eapcetApi.getCounsellingData()
      .then(res => {
        _cache = res.data;
        setData(res.data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
