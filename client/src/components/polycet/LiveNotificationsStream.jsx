import { useState, useEffect } from 'react';
import { Bell, ArrowUpRight, ChevronRight, RefreshCw } from 'lucide-react';
import { polycetApi } from '../../lib/polycetApi';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'polycet_allotment_2026',
    title: 'TGPOLYCET 2026 :: College-wise Candidate Allotment Records',
    date: 'August 2026',
    badge: 'LIVE DATA',
    type: 'circular',
    isNew: true,
    href: '/tg-polycet/allotments',
    isExternal: false,
  },
  {
    id: 'tgecet_spot_admissions',
    title: 'SPOT ADMISSION GUIDELINES TO CANDIDATES (INSTITUTIONAL SPOT)',
    date: 'August 2026',
    badge: 'OFFICIAL PDF',
    type: 'notification',
    isNew: false,
    href: 'https://tgpolycetd.nic.in/files/01TGPOLYCET2026SPOTGUIDELINESTOCAND.PDF',
    isExternal: true,
  },
  {
    id: 'tgecet_institute_profile',
    title: 'Institute Profile & Polytechnic College Intake Directory',
    date: 'August 2026',
    badge: 'OFFICIAL CIRCULAR',
    type: 'circular',
    isNew: false,
    href: 'https://tgpolycet.nic.in/institute_profile.aspx',
    isExternal: true,
  },
  {
    id: 'tgecet_courses',
    title: 'List of Polytechnic Engineering Diploma Courses',
    date: 'August 2026',
    badge: 'OFFICIAL CIRCULAR',
    type: 'circular',
    isNew: false,
    href: 'https://tgpolycet.nic.in/Courses_list.aspx',
    isExternal: true,
  },
  {
    id: 'tgecet_ncc_sports',
    title: 'ATTENTION TO SPORTS AND NCC CANDIDATES (MASAB TANK HLC)',
    date: 'August 2026',
    badge: 'OFFICIAL PDF',
    type: 'notification',
    isNew: false,
    href: 'https://tgpolycetd.nic.in/files/ATTENTION_TONCCnSG.pdf',
    isExternal: true,
  },
  {
    id: 'tgecet_manual_option',
    title: 'MANUAL OPTION ENTRY FORM & WEB COUNSELLING WORKSHEET',
    date: 'August 2026',
    badge: 'OFFICIAL PDF',
    type: 'notification',
    isNew: false,
    href: 'https://tgpolycetd.nic.in/files/MANUALOPTIONFORM.PDF',
    isExternal: true,
  },
  {
    id: 'tgecet_special_priorities',
    title: 'Special Category Priorities (CAP, NCC, PH & Sports & Games)',
    date: 'August 2026',
    badge: 'OFFICIAL CIRCULAR',
    type: 'circular',
    isNew: false,
    href: 'https://tgpolycet.nic.in/special_catg_priorities.aspx',
    isExternal: true,
  },
  {
    id: 'tgecet_ncc_quota',
    title: 'PROVISIONAL PRIORITY LIST OF NCC CATEGORY CANDIDATES',
    date: 'August 2026',
    badge: 'OFFICIAL PDF',
    type: 'notification',
    isNew: false,
    href: 'https://tgpolycetd.nic.in/files/TGPOLYCET2026_NCC_QUOTA.pdf',
    isExternal: true,
  },
  {
    id: 'tgecet_sports_quota',
    title: 'PROVISIONAL PRIORITY LIST OF SPORTS CATEGORY CANDIDATES',
    date: 'August 2026',
    badge: 'OFFICIAL PDF',
    type: 'notification',
    isNew: false,
    href: 'https://tgpolycetd.nic.in/files/Sports2026.PDF',
    isExternal: true,
  },
];

export default function LiveNotificationsStream() {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState('Just now');
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Fetch initial live notifications and auto-refresh every 60s
  useEffect(() => {
    const fetchPolycetNotifs = () => {
      polycetApi
        .getNotifications()
        .then((res) => {
          if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
            setNotifications(res.data);
          }
        })
        .catch(() => {});
    };

    fetchPolycetNotifs();
    const interval = setInterval(fetchPolycetNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  // Force Sync with Official Website
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);

    try {
      const res = await polycetApi.refreshNotifications();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
      }
      setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch {
      const res = await polycetApi.getNotifications({ force: true }).catch(() => null);
      if (res?.data?.length > 0) setNotifications(res.data);
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
              Official SBTET Notifications &amp; Circulars
            </h2>
          </div>
          <p className="text-[11px] text-white/50 mt-0.5">
            Directly verified and extracted live from State Board of Technical Education &amp; Training (tgpolycet.nic.in)
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
            title="Fetch live latest notifications from official SBTET portal"
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin text-purple-300' : 'text-purple-300'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
        </div>
      </div>

      {/* Tight, Connected Notifications Grid with Zero Gaps */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06] sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-px sm:bg-white/[0.06]">
        {notifications.map((n, idx) => {
          const isExternal = n.isExternal !== false && (n.href?.startsWith('http') || n.href?.endsWith('.pdf'));

          return (
            <a
              key={n.id || idx}
              href={n.href}
              target={isExternal ? '_blank' : '_self'}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="group flex items-center justify-between gap-3 bg-black/60 hover:bg-purple-950/30 transition-all p-3 sm:px-4 sm:py-2.5 cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="rounded border border-purple-400/30 bg-purple-500/10 px-1.5 py-0.2 text-[9px] font-bold font-mono text-purple-300">
                    {n.badge || (isExternal ? 'OFFICIAL PDF' : 'LIVE DATA')}
                  </span>
                  {n.isNew && (
                    <span className="rounded bg-rose-500/20 border border-rose-500/30 px-1 py-0.2 text-[8px] font-bold text-rose-300 uppercase animate-pulse">
                      NEW
                    </span>
                  )}
                  <span className="text-[10px] text-white/40 font-mono">{n.date || '2026'}</span>
                </div>
                <h4 className="text-xs font-semibold text-white/90 group-hover:text-purple-200 transition-colors truncate">
                  {n.title}
                </h4>
              </div>

              {/* Action Icon */}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/50 group-hover:border-purple-400/40 group-hover:bg-purple-500/20 group-hover:text-purple-200 transition-all">
                {isExternal ? (
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                ) : (
                  <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
