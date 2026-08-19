import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ShieldCheck, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HlcSyncRibbon({ examTitle = "TG Counselling" }) {
  const { user, openAuthModal } = useAuth();
  const location = useLocation();

  const isGuest = user?.is_guest;
  const isRegisteredUser = Boolean(user && !user.is_guest);

  return (
    <div className="relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/70 via-black/90 to-indigo-950/70 p-1 shadow-lg shadow-purple-950/40 mb-6 group">
      {/* Animated subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-amber-500/10 to-purple-600/15 opacity-80 animate-pulse pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-2.5 w-full">
        {/* Left Badge & Actions on Mobile */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className={`flex h-2 w-2 rounded-full ${isRegisteredUser ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'}`} />
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              isRegisteredUser 
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
            }`}>
              <Sparkles size={12} className={isRegisteredUser ? 'text-emerald-400' : 'text-amber-400'} />
              {isRegisteredUser ? 'Cloud Synced' : 'HLC Notice'}
            </span>
          </div>

          {/* Action Button for Mobile */}
          <div className="sm:hidden shrink-0">
            {isRegisteredUser ? (
              <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2 py-1 rounded-lg">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>Saved</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="inline-flex items-center gap-1 rounded-lg border border-purple-400/40 bg-purple-600 px-2 py-1 text-[11px] font-bold text-white"
              >
                <Lock size={10} />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Text (Responsive Layout) */}
        <div className="flex-1 w-full text-xs font-medium text-purple-100/90 leading-relaxed min-w-0">
          <div className="sm:hidden text-center text-[11px]">
            {isRegisteredUser ? (
              <span className="text-emerald-300">✓ Account Synced: HLC checklist progress is saved to your account across all devices.</span>
            ) : (
              <span className="text-amber-300">Sign in to save your HLC Document checklist permanently across all your devices.</span>
            )}
          </div>
          <div className="hidden sm:block overflow-hidden relative mx-2 select-none">
            <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
              <span className="mx-6 inline-flex items-center gap-2">
                <span>🔔</span>
                {isRegisteredUser ? (
                  <>
                    <strong className="text-emerald-300">Account Synced:</strong>
                    <span>Your {examTitle} HLC checklist progress is saved to your account and accessible across all your logged-in devices.</span>
                  </>
                ) : isGuest ? (
                  <>
                    <strong className="text-amber-300">Guest Mode Active:</strong>
                    <span>Guest progress is temporary and will reset on page refresh. Log in or create a free account to permanently save your checklist across devices!</span>
                  </>
                ) : (
                  <>
                    <strong className="text-amber-300">Save Your Checklist:</strong>
                    <span>Sign in to permanently save your {examTitle} HLC Document verification checklist across all devices. Guest mode resets on refresh!</span>
                  </>
                )}
                <span className="text-purple-400 font-bold">•</span>
                <span className="text-purple-300">Real-time multi-device continuation</span>
                <span className="text-purple-400 font-bold">•</span>
                <span>100% Free for all Telangana students</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button for Desktop */}
        <div className="hidden sm:block shrink-0 z-10">
          {isRegisteredUser ? (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg shadow-sm">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Saved to Account</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-400/40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-900/50 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Lock size={12} />
              <span>Sign in to Save</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
