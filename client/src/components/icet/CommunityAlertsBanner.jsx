import { Bell, MessageSquare, Send, Sparkles, Users } from 'lucide-react';

export default function CommunityAlertsBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-black/60 to-purple-900/20 p-6 sm:p-8 backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300 mb-3">
            <Sparkles size={12} />
            <span>Instant Admissions Intelligence</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Never miss an MBA/MCA seat allotment, sliding date, or fee deadline.
          </h3>
          <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
            Join thousands of Telangana MBA &amp; MCA aspirants in our official live updates channels. Get real-time alerts when Phase allotments, vacancy statements, and university reporting schedules drop.
          </p>

          <div className="flex items-center gap-4 mt-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-purple-300" />
              <span>8,500+ Active Aspirants</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Bell size={14} className="text-emerald-400" />
              <span>Zero-Spam Official Alerts</span>
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <a
            href="https://whatsapp.com/channel/example"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-all duration-200 shadow-lg shadow-emerald-950/50"
          >
            <MessageSquare size={15} />
            <span>Join WhatsApp Channel</span>
          </a>

          <a
            href="https://t.me/tgcounselling_alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/40 px-5 py-3 text-xs font-bold text-blue-300 hover:bg-blue-900/50 transition-all duration-200 shadow-lg shadow-blue-950/50"
          >
            <Send size={15} />
            <span>Join Telegram Alerts</span>
          </a>
        </div>
      </div>
    </div>
  );
}
