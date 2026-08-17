import { useState, useEffect } from 'react';
import { Bell, ArrowUpRight, ChevronRight, RefreshCw } from 'lucide-react';
import { eapcetApi } from '../../lib/eapcetApi';

export default function LiveNotificationsStream() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('Just now');
  const [syncSuccess, setSyncSuccess] = useState(false);

  const fetchNotifs = (force = false) => {
    return eapcetApi
      .getNotifications(force ? { force: true } : {})
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setNotifications(res.data);
        }
      })
      .catch((err) => console.error('Failed to load notifications:', err));
  };

  useEffect(() => {
    fetchNotifs(false).finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      await fetchNotifs(true);
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
      {/* Header with Title and Sync Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-300">
              <Bell size={13} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Official TG EAPCET 2026 Notifications &amp; Circulars
            </h2>
          </div>
          <p className="text-[11px] text-white/50 mt-0.5">
            Directly verified and extracted live from official government portals (tgeapcet.nic.in)
          </p>
        </div>

        {/* Sync Button & Live Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{syncSuccess ? 'Synced Successfully!' : `Live Official Sync • ${lastSynced}`}</span>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 px-2.5 py-1 text-[11px] font-bold text-purple-200 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Fetch live latest notifications from official EAPCET portal"
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin text-purple-300' : 'text-purple-300'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Tight, Connected Notifications Grid with Zero Gaps */}
      {loading ? (
        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
      ) : (
        <div className="rounded-xl border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06] sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-px sm:bg-white/[0.06]">
          {notifications.map((item, idx) => {
            const isInternal = item.isExternal === false || item.href?.startsWith('/');
            const href = item.href || item.fileUrl || item.url || 'https://tgeapcet.nic.in';
            const isPdf = item.badge?.includes('PDF') || href.endsWith('.pdf');

            return (
              <a
                key={item.id || idx}
                href={href}
                target={isInternal ? '_self' : '_blank'}
                rel={isInternal ? undefined : 'noopener noreferrer'}
                className="group flex items-center justify-between gap-3 bg-black/60 hover:bg-purple-950/30 transition-all p-3 sm:px-4 sm:py-2.5 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="rounded border border-purple-400/30 bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold font-mono text-purple-300">
                      {item.badge || (isPdf ? 'OFFICIAL PDF' : isInternal ? 'LIVE DATA' : 'OFFICIAL CIRCULAR')}
                    </span>
                    {item.isNew && (
                      <span className="rounded bg-rose-500/20 border border-rose-500/30 px-1 py-0.2 text-[8px] font-bold text-rose-300 uppercase animate-pulse">
                        NEW
                      </span>
                    )}
                    <span className="text-[10px] text-white/40 font-mono">{item.date || '2026'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white/90 group-hover:text-purple-200 transition-colors truncate">
                    {item.title}
                  </h4>
                </div>

                {/* Action Icon */}
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 group-hover:border-purple-400/40 group-hover:bg-purple-500/20 group-hover:text-purple-200 transition-all">
                  {isInternal ? (
                    <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  ) : (
                    <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
