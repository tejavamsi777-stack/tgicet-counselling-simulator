import { useState, useMemo } from 'react';
import {
  Building,
  GraduationCap,
  Scale,
  Award,
  TrendingUp,
  MapPin,
  CheckCircle,
  XCircle,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';
import { ECET_INSTITUTIONS, ECET_BRANCHES } from '../../data/ecetInstitutions';

export default function EcetCollegeComparisonTool() {
  const [colleges] = useState(ECET_INSTITUTIONS);
  const [branches] = useState(ECET_BRANCHES);

  const [college1Code, setCollege1Code] = useState('CBIT');
  const [college2Code, setCollege2Code] = useState('VASV');
  const [selectedBranch, setSelectedBranch] = useState('CSE');

  const c1 = useMemo(() => colleges.find((c) => c.code === college1Code) || colleges[0], [colleges, college1Code]);
  const c2 = useMemo(() => colleges.find((c) => c.code === college2Code) || colleges[1] || colleges[0], [colleges, college2Code]);

  const c1Cutoffs = c1.cutoffs?.[selectedBranch] || null;
  const c2Cutoffs = c2.cutoffs?.[selectedBranch] || null;

  return (
    <div className="space-y-8">
      {/* ── Selection Matrix Controls ─────────────────────────────────── */}
      <div className="rounded-3xl border border-white/[0.08] bg-black/50 p-5 sm:p-7 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Head-to-Head Lateral Entry Comparison Tool
          </h3>
        </div>

        {/* 3-Column Selector: College 1 | Lateral Entry Branch | College 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* First College */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
              <Building size={14} className="text-cyan-400" />
              First Engineering College
            </label>
            <select
              value={college1Code}
              onChange={(e) => setCollege1Code(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white focus:border-purple-500 focus:bg-purple-950/20 focus:outline-none cursor-pointer"
            >
              {colleges.map((c) => (
                <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                  {c.code} - {c.name} ({c.district})
                </option>
              ))}
            </select>
          </div>

          {/* Lateral Entry Branch (Middle) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
              <GraduationCap size={14} className="text-amber-400" />
              Lateral Entry Branch Stream
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-xl border border-purple-500/30 bg-purple-950/20 px-3.5 py-2.5 text-sm font-bold text-purple-200 focus:border-purple-500 focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.code} value={b.code} className="bg-gray-900 text-white">
                  {b.code} — {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Second College */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2 flex items-center gap-1.5">
              <Building size={14} className="text-pink-400" />
              Second Engineering College
            </label>
            <select
              value={college2Code}
              onChange={(e) => setCollege2Code(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white focus:border-purple-500 focus:bg-purple-950/20 focus:outline-none cursor-pointer"
            >
              {colleges.map((c) => (
                <option key={c.code} value={c.code} className="bg-gray-900 text-white">
                  {c.code} - {c.name} ({c.district})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Comparison Cards Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* College 1 Card */}
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-black/60 to-black/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300">
              {c1.code}
            </span>
            <span className="text-xs font-medium text-white/50">{c1.type}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{c1.name}</h3>
          <p className="text-xs text-white/50 flex items-center gap-1 mb-4">
            <MapPin size={13} className="text-rose-400" /> {c1.place}, {c1.district} ({c1.region} Region)
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-[10px] text-white/40 uppercase font-bold block">Annual Tuition Fee</span>
              <span className="font-mono text-base font-bold text-emerald-400">₹{c1.annualFee?.toLocaleString()}/yr</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-[10px] text-white/40 uppercase font-bold block">Highest Package</span>
              <span className="font-mono text-base font-bold text-cyan-300">{c1.placements?.highestPackage || '—'}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              {selectedBranch} Lateral Entry Cutoff Ranks (2025)
            </h4>
            {c1Cutoffs ? (
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[10px] text-white/40 block">OC</span>
                  <span className="font-bold text-white">#{c1Cutoffs.oc2025}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[10px] text-white/40 block">BC-B</span>
                  <span className="font-bold text-amber-300">#{c1Cutoffs.bcb2025 || '—'}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[10px] text-white/40 block">SC</span>
                  <span className="font-bold text-purple-300">#{c1Cutoffs.sc2025 || '—'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Branch not offered / cutoff data pending.</p>
            )}
          </div>
        </div>

        {/* College 2 Card */}
        <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/20 via-black/60 to-black/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="rounded-md border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 text-xs font-mono font-bold text-pink-300">
              {c2.code}
            </span>
            <span className="text-xs font-medium text-white/50">{c2.type}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{c2.name}</h3>
          <p className="text-xs text-white/50 flex items-center gap-1 mb-4">
            <MapPin size={13} className="text-rose-400" /> {c2.place}, {c2.district} ({c2.region} Region)
          </p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-[10px] text-white/40 uppercase font-bold block">Annual Tuition Fee</span>
              <span className="font-mono text-base font-bold text-emerald-400">₹{c2.annualFee?.toLocaleString()}/yr</span>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-[10px] text-white/40 uppercase font-bold block">Highest Package</span>
              <span className="font-mono text-base font-bold text-pink-300">{c2.placements?.highestPackage || '—'}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              {selectedBranch} Lateral Entry Cutoff Ranks (2025)
            </h4>
            {c2Cutoffs ? (
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[10px] text-white/40 block">OC</span>
                  <span className="font-bold text-white">#{c2Cutoffs.oc2025}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[10px] text-white/40 block">BC-B</span>
                  <span className="font-bold text-amber-300">#{c2Cutoffs.bcb2025 || '—'}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[10px] text-white/40 block">SC</span>
                  <span className="font-bold text-purple-300">#{c2Cutoffs.sc2025 || '—'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Branch not offered / cutoff data pending.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
