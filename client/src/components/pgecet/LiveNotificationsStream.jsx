import { useState } from 'react';
import { Bell, ArrowUpRight } from 'lucide-react';

const OFFICIAL_PGECET_NOTICES = [
  {
    id: 'pgecet_allotment_phase1',
    title: 'College-Wise List of Provisionally Selected Candidates (M.E. / M.Tech / M.Arch Phase I)',
    date: '2026',
    badge: 'LIVE ALLOTMENTS',
    isNew: true,
    href: '/tg-pgecet/allotments',
    isExternal: false,
  },
  {
    id: 'pgecet_instructions',
    title: 'Detailed Instructions to Candidates Phase I 2026 Admissions PGECET',
    date: '2026',
    badge: 'OFFICIAL GUIDE',
    isNew: true,
    href: 'https://pgecetadm.tgche.ac.in/pdf/Instructions%20to%20Candidates%20PhaseI%202026%20Admissions%20PGECET.pdf',
    isExternal: true,
  },
  {
    id: 'pgecet_detailed_notif',
    title: 'Detailed Notification for M.E. / M.Tech / M.Arch Admissions Phase 1',
    date: '2026',
    badge: 'OFFICIAL PDF',
    isNew: true,
    href: 'https://pgecetadm.tgche.ac.in/pdf/DN%20ME%20Phase%201.pdf',
    isExternal: true,
  },
  {
    id: 'pgecet_important_dates',
    title: 'Revised Schedule & Important Dates (M.E. / M.Tech. / M.Arch courses)',
    date: '2026',
    badge: 'SCHEDULE',
    isNew: true,
    href: 'https://pgecetadm.tgche.ac.in/pdf/New%20important%20dates%20of%20First%20phase%20M.E.M.%20Tech.M.%20Arch.pdf',
    isExternal: true,
  },
  {
    id: 'pgecet_colleges_intake',
    title: 'Colleges List with Specializations, Intake & Tuition Fee Structure',
    date: '2026',
    badge: 'COLLEGE LIST',
    isNew: false,
    href: 'https://pgecetadm.tgche.ac.in/pdf/Colleges%20List%20with%20Intake%20&%20Tuition%20Fee.pdf',
    isExternal: true,
  },
  {
    id: 'pgecet_sc_rules',
    title: 'Telangana SC (Rationalisation of Reservations) Act Rules 2025-2026',
    date: '2026',
    badge: 'GOVERNMENT ORDER',
    isNew: false,
    href: 'https://pgecetadm.tgche.ac.in/pdf/03_Telangan%20SC%20%20(Rationalisation%20of%20Reservations)%20ACT,%202025,%20RULES.pdf',
    isExternal: true,
  },
  {
    id: 'pgecet_ews_order',
    title: 'G.O.Ms No 244 for EWS 10% Reservation in PG Admissions',
    date: '2026',
    badge: 'EWS NORMS',
    isNew: false,
    href: 'https://pgecetadm.tgche.ac.in/pdf/1a%20G%20O%20Ms%20No%20244%20FOR%20EWS.pdf',
    isExternal: true,
  },
  {
    id: 'pgecet_user_guide',
    title: 'User Guide for Online Certificate Verification (OCV)',
    date: '2026',
    badge: 'USER MANUAL',
    isNew: false,
    href: 'https://pgecetadm.tgche.ac.in/pdf/User%20Guide%20OCV%20PGECET%202024.pdf',
    isExternal: true,
  },
];

export default function LiveNotificationsStream() {
  const [filter, setFilter] = useState('ALL');

  const filteredNotices = filter === 'ALL' ? OFFICIAL_PGECET_NOTICES : OFFICIAL_PGECET_NOTICES.slice(0, 4);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 via-[#180f2d]/90 to-[#0c0616]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2 text-purple-400">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Official TG PGECET Circulars &amp; Directives
            </h3>
            <p className="text-xs text-white/50">
              Synced directly from Telangana Council of Higher Education (pgecetadm.tgche.ac.in)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 divide-y divide-white/[0.06]">
        {filteredNotices.map((item) => (
          <a
            key={item.id}
            href={item.href}
            target={item.isExternal ? '_blank' : '_self'}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            className="group flex items-center justify-between py-3.5 px-2 hover:bg-white/[0.03] rounded-xl transition"
          >
            <div className="flex items-center gap-3">
              {item.isNew && (
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              )}
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="rounded-md bg-purple-500/20 border border-purple-400/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-white/40">{item.date}</span>
                </div>
              </div>
            </div>
            <ArrowUpRight
              size={15}
              className="text-white/30 group-hover:text-cyan-300 transition shrink-0 ml-2"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
