import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowRight, GraduationCap, Leaf, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { GlassButton } from '../../components/ui/glass-button';
import Seo from '../../components/shared/Seo';
import AdSenseUnit from '../../components/ads/AdSenseUnit';
import ToolGuideSection from '../../components/shared/ToolGuideSection';

// ─── Calibrated data tables built from authentic 2026 TG EAPCET results ──────
// Anchors:
// 156.6 marks → Rank 1
// 139.8 marks → Rank 10
// 97.15 marks → Rank 570 (Ground truth)
// 80.00 marks → Rank ~2,580 (Below 2,613 benchmark)
// 70.00 marks → Rank ~5,000 (3,996 to 6,104 bracket)
// 60.00 marks → Rank ~11,800 (9,227 to 14,418 bracket)
// 50.00 marks → Rank ~34,000 (24,029 to 44,121 bracket)
// 40.00 marks → Rank ~105,000 (82,344 to 135,462 bracket)

const MPC_DATA = [
  { marks: 160, rank: 1,      lo: 1,      hi: 1,      percentile: '100.00' },
  { marks: 156, rank: 1,      lo: 1,      hi: 1,      percentile: '100.00' },
  { marks: 152, rank: 2,      lo: 1,      hi: 2,      percentile: '99.99' },
  { marks: 148, rank: 2,      lo: 2,      hi: 3,      percentile: '99.99' },
  { marks: 145, rank: 3,      lo: 3,      hi: 4,      percentile: '99.99' },
  { marks: 142, rank: 7,      lo: 6,      hi: 8,      percentile: '99.99' },
  { marks: 140, rank: 10,     lo: 8,      hi: 12,     percentile: '99.99' },
  { marks: 135, rank: 25,     lo: 20,     hi: 30,     percentile: '99.98' },
  { marks: 130, rank: 45,     lo: 38,     hi: 55,     percentile: '99.98' },
  { marks: 125, rank: 85,     lo: 72,     hi: 105,    percentile: '99.96' },
  { marks: 120, rank: 140,    lo: 120,    hi: 168,    percentile: '99.93' },
  { marks: 115, rank: 220,    lo: 190,    hi: 260,    percentile: '99.90' },
  { marks: 110, rank: 320,    lo: 280,    hi: 375,    percentile: '99.85' },
  { marks: 105, rank: 420,    lo: 375,    hi: 485,    percentile: '99.80' },
  { marks: 100, rank: 510,    lo: 460,    hi: 580,    percentile: '99.76' },
  { marks: 97,  rank: 575,    lo: 520,    hi: 640,    percentile: '99.73' },
  { marks: 95,  rank: 690,    lo: 620,    hi: 780,    percentile: '99.68' },
  { marks: 90,  rank: 1180,   lo: 1050,   hi: 1320,   percentile: '99.45' },
  { marks: 85,  rank: 1820,   lo: 1650,   hi: 2020,   percentile: '99.15' },
  { marks: 80,  rank: 2580,   lo: 2420,   hi: 2613,   percentile: '98.80' },
  { marks: 75,  rank: 3600,   lo: 3350,   hi: 3900,   percentile: '98.32' },
  { marks: 70,  rank: 5000,   lo: 4600,   hi: 5500,   percentile: '97.67' },
  { marks: 65,  rank: 7800,   lo: 7200,   hi: 8500,   percentile: '96.37' },
  { marks: 60,  rank: 11800,  lo: 10800,  hi: 12900,  percentile: '94.51' },
  { marks: 55,  rank: 21000,  lo: 19200,  hi: 23000,  percentile: '90.23' },
  { marks: 50,  rank: 34000,  lo: 31000,  hi: 37500,  percentile: '84.19' },
  { marks: 45,  rank: 62000,  lo: 57000,  hi: 68000,  percentile: '71.16' },
  { marks: 40,  rank: 105000, lo: 96000,  hi: 115000, percentile: '51.16' },
  { marks: 35,  rank: 145000, lo: 135000, hi: 155000, percentile: '32.56' },
];

const BIPC_DATA = [
  { marks: 160, rank: 1,     lo: 1,     hi: 1,     percentile: '100.00' },
  { marks: 150, rank: 1,     lo: 1,     hi: 1,     percentile: '100.00' },
  { marks: 145, rank: 2,     lo: 1,     hi: 2,     percentile: '99.99' },
  { marks: 142, rank: 3,     lo: 2,     hi: 3,     percentile: '99.99' },
  { marks: 140, rank: 4,     lo: 3,     hi: 5,     percentile: '99.99' },
  { marks: 137, rank: 5,     lo: 4,     hi: 6,     percentile: '99.99' },
  { marks: 135, rank: 9,     lo: 7,     hi: 11,    percentile: '99.98' },
  { marks: 130, rank: 18,    lo: 14,    hi: 24,    percentile: '99.98' },
  { marks: 125, rank: 40,    lo: 32,    hi: 52,    percentile: '99.95' },
  { marks: 120, rank: 75,    lo: 60,    hi: 95,    percentile: '99.91' },
  { marks: 115, rank: 135,   lo: 110,   hi: 165,   percentile: '99.84' },
  { marks: 110, rank: 220,   lo: 180,   hi: 270,   percentile: '99.74' },
  { marks: 105, rank: 310,   lo: 260,   hi: 370,   percentile: '99.64' },
  { marks: 100, rank: 390,   lo: 330,   hi: 460,   percentile: '99.54' },
  { marks: 97,  rank: 440,   lo: 380,   hi: 520,   percentile: '99.48' },
  { marks: 95,  rank: 510,   lo: 440,   hi: 600,   percentile: '99.40' },
  { marks: 90,  rank: 880,   lo: 780,   hi: 1020,  percentile: '98.96' },
  { marks: 85,  rank: 1650,  lo: 1450,  hi: 1880,  percentile: '98.06' },
  { marks: 80,  rank: 2650,  lo: 2480,  hi: 2726,  percentile: '96.88' },
  { marks: 75,  rank: 4100,  lo: 3750,  hi: 4500,  percentile: '95.18' },
  { marks: 70,  rank: 5800,  lo: 5300,  hi: 6400,  percentile: '93.18' },
  { marks: 65,  rank: 8800,  lo: 8100,  hi: 9600,  percentile: '89.65' },
  { marks: 60,  rank: 12700, lo: 11800, hi: 13800, percentile: '85.06' },
  { marks: 55,  rank: 19000, lo: 17500, hi: 20800, percentile: '77.65' },
  { marks: 50,  rank: 26800, lo: 24800, hi: 29000, percentile: '68.47' },
  { marks: 45,  rank: 39000, lo: 36000, hi: 42500, percentile: '54.12' },
  { marks: 40,  rank: 54000, lo: 50000, hi: 58500, percentile: '36.47' },
  { marks: 35,  rank: 68000, lo: 64000, hi: 72000, percentile: '20.00' },
];

// ─── Linear interpolation helper ───────────────────────────────────────────
function interpolate(data, userMarks) {
  const clamped = Math.max(0, Math.min(160, userMarks));

  // Exact match
  const exact = data.find(d => d.marks === clamped);
  if (exact) return { ...exact };

  // Above top data → rank 1
  if (clamped >= data[0].marks) {
    return { marks: clamped, rank: 1, lo: 1, hi: 1, percentile: '100.00' };
  }

  // Below lowest data
  if (clamped <= data[data.length - 1].marks) {
    const last = data[data.length - 1];
    return { marks: clamped, rank: last.rank, lo: last.lo, hi: last.hi, percentile: '0.00' };
  }

  // Interpolation between neighbouring anchor points
  let upper = null, lower = null;
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].marks >= clamped && data[i + 1].marks <= clamped) {
      upper = data[i];
      lower = data[i + 1];
      break;
    }
  }
  if (!upper || !lower) return data[0];

  const t = (clamped - lower.marks) / (upper.marks - lower.marks); // 0..1
  const lerp = (a, b) => Math.max(1, Math.round(b + t * (a - b)));
  const lerpF = (a, b) => (parseFloat(b) + t * (parseFloat(a) - parseFloat(b))).toFixed(2);

  return {
    marks: clamped,
    rank: lerp(upper.rank, lower.rank),
    lo: lerp(upper.lo, lower.lo),
    hi: lerp(upper.hi, lower.hi),
    percentile: lerpF(upper.percentile, lower.percentile),
  };
}

// ─── College admission outlook helper ──────────────────────────────────────
function getOutlook(stream, rank) {
  if (stream === 'mpc') {
    if (rank <= 200)    return { label: '🏆 Premier Government Institutions', color: 'text-yellow-300', desc: 'Direct shot at JNTUH Campus, OU College of Engineering — Top CSE / AI / ECE branches.' };
    if (rank <= 1200)   return { label: '🥇 Top Tier-1 Autonomous Colleges', color: 'text-orange-300', desc: 'CBIT, Vasavi, VNR VJIET, CVR — High probability for CSE core and specialization branches.' };
    if (rank <= 3000)   return { label: '🥈 Reputed Tier-2 Colleges', color: 'text-purple-300', desc: 'Gokaraju Rangaraju (GRIET), KMIT, MGIT, Sreenidhi, Vardhaman — Strong CSE, IT, and ECE seats.' };
    if (rank <= 8000)   return { label: '🎯 Good Engineering Colleges', color: 'text-blue-300', desc: 'BVRIT, MVSR, Keshav Memorial, Malla Reddy Autonomous — Tech branches widely accessible.' };
    if (rank <= 20000)  return { label: '📚 Established Engineering Colleges', color: 'text-cyan-300', desc: 'Wide range across 60+ colleges. Core branches (ECE, EEE, Mech) and emerging tech available.' };
    if (rank <= 50000)  return { label: '📋 Mid-Tier Private Colleges', color: 'text-green-300', desc: 'Government quota seats available across recognized regional colleges.' };
    if (rank <= 110000) return { label: '⚠️ Affiliated Regional Colleges', color: 'text-amber-300', desc: 'Seats available in core branches and select tech specializations.' };
    return { label: '❌ Below General Qualifying Threshold', color: 'text-red-400', desc: 'Minimum 40 marks (25%) needed to qualify for OC / BC / EWS categories.' };
  } else {
    if (rank <= 50)    return { label: '🏆 Top Agricultural & Veterinary Universities', color: 'text-yellow-300', desc: 'PJTSAU Hyderabad, PVNRTVU Veterinary & Agriculture seats accessible.' };
    if (rank <= 300)   return { label: '🥇 Premier Pharmacy & Agriculture Colleges', color: 'text-orange-300', desc: 'Osmania Univ College of Tech/Pharm, BITS Hyderabad B.Pharm, Kakatiya University.' };
    if (rank <= 1200)  return { label: '🥈 Top Private Pharmacy Institutions', color: 'text-purple-300', desc: 'Sultan-ul-Uloom, G. Pulla Reddy, St. Peter’s, CMR — Top B.Pharm / Pharm.D seats.' };
    if (rank <= 3500)  return { label: '🎯 Good Regional Pharmacy Colleges', color: 'text-blue-300', desc: 'Solid government quota seats in recognized pharmacy institutions across Telangana.' };
    if (rank <= 10000) return { label: '📚 Established Allied Health & Pharmacy', color: 'text-cyan-300', desc: 'Decent college options for B.Pharmacy, Food Science, and Allied Agriculture.' };
    if (rank <= 28000) return { label: '📋 Mid-Tier Pharmacy Options', color: 'text-green-300', desc: 'Private pharmacy colleges with government quota seats.' };
    return { label: '⚠️ Limited Options', color: 'text-amber-300', desc: 'Below qualifying mark threshold for most regular counseling rounds in OC/BC.' };
  }
}

function fmt(n) {
  return Math.round(n).toLocaleString('en-IN');
}

export default function EapcetMarksVsRankPage() {
  const navigate = useNavigate();
  const [stream, setStream] = useState('mpc'); // 'mpc' | 'bipc'
  const [marks, setMarks] = useState('');
  const [category, setCategory] = useState('OC');
  const [showTable, setShowTable] = useState(false);

  const marksNum = parseFloat(marks);
  const isValid = !isNaN(marksNum) && marksNum >= 0 && marksNum <= 160;

  const data = stream === 'mpc' ? MPC_DATA : BIPC_DATA;
  const result = useMemo(() => {
    if (!isValid) return null;
    return interpolate(data, marksNum);
  }, [data, marksNum, isValid]);

  const outlook = result ? getOutlook(stream, result.rank) : null;
  const qualifies = isValid && (category === 'SC' || category === 'ST' || marksNum >= 40);

  function handlePredictColleges() {
    if (!result) return;
    navigate(`/exams/tg-eapcet/predictor?rank=${result.rank}&category=${category}`);
  }

  const tableData = [...data].sort((a, b) => b.marks - a.marks);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
      <Seo
        title="TG EAPCET Marks vs Rank 2027 | MPC & BiPC Accurate Rank Predictor"
        description="Estimate your TG EAPCET 2027 rank from raw marks instantly. Calibrated for Engineering (MPC) and Agriculture & Pharmacy (BiPC) streams with verified multi-year normalisation trends."
        keywords="tg eapcet marks vs rank 2027, ts eamcet marks vs rank 2027, tg eapcet rank predictor from marks, eamcet mpc marks vs rank, eapcet bipc marks vs rank, tg eapcet 2027 rank analysis"
        path="/exams/tg-eapcet/marks-vs-rank"
        toolType="calculator"
        examName="TG EAPCET"
      />

      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300">
          <Sparkles size={13} className="text-purple-400" />
          TG EAPCET 2027 • Marks vs Rank Estimator
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
          TG EAPCET Marks vs Rank 2027
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
          Enter your estimated raw marks (out of 160) to instantly calculate your expected rank, precise confidence corridor,
          and admission opportunities across Telangana colleges.
        </p>
      </div>

      {/* Stream Selector */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => setStream('mpc')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            stream === 'mpc'
              ? 'bg-purple-600/30 border-purple-500/70 text-purple-200 shadow-lg shadow-purple-900/30'
              : 'bg-white/5 border-white/15 text-gray-400 hover:border-white/30 hover:text-gray-200'
          }`}
        >
          <GraduationCap size={17} />
          Engineering (MPC)
        </button>
        <button
          type="button"
          onClick={() => setStream('bipc')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            stream === 'bipc'
              ? 'bg-emerald-600/30 border-emerald-500/70 text-emerald-200 shadow-lg shadow-emerald-900/30'
              : 'bg-white/5 border-white/15 text-gray-400 hover:border-white/30 hover:text-gray-200'
          }`}
        >
          <Leaf size={17} />
          Agriculture &amp; Pharmacy (BiPC)
        </button>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-6 mb-6 shadow-xl">
        <div className="grid gap-6 sm:grid-cols-2 items-start">
          {/* Marks Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-2">
              Raw Score / Expected Marks <span className="text-purple-400 font-normal">(0 – 160)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="160"
                step="any"
                value={marks}
                onChange={e => setMarks(e.target.value)}
                onWheel={e => e.currentTarget.blur()}
                placeholder="e.g. 97.15"
                className="w-full rounded-xl border border-white/20 bg-white/10 pl-4 pr-16 py-3 text-white placeholder-gray-500 text-base font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 select-none">
                / 160
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Enter your raw score. No separate normalization calculation needed.
            </p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-200 mb-2">
              Category <span className="text-gray-400 font-normal">(for qualifying check)</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-[#160d2e] px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="OC">OC (Open Competition / General)</option>
              <option value="BC_A">BC-A</option>
              <option value="BC_B">BC-B</option>
              <option value="BC_C">BC-C</option>
              <option value="BC_D">BC-D</option>
              <option value="BC_E">BC-E</option>
              <option value="EWS">EWS</option>
              <option value="SC">SC (No Min. Qualifying Marks)</option>
              <option value="ST">ST (No Min. Qualifying Marks)</option>
            </select>
            <p className="mt-1.5 text-[11px] text-gray-400">
              Qualifying cutoff is 40/160 (25%) for OC/BC/EWS; No minimum for SC/ST.
            </p>
          </div>
        </div>
      </div>

      {/* Result Card */}
      {isValid && result && (
        <div className="rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur-md p-6 mb-6 space-y-5 shadow-2xl">

          {/* Qualification warning */}
          {!qualifies && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              <Info size={16} className="mt-0.5 shrink-0 text-red-400" />
              <span>
                <strong>Below qualifying marks (40/160):</strong> As per TG EAPCET rules, OC, BC, and EWS candidates
                must score at least 40 marks to be assigned a rank. SC/ST candidates are exempt from minimum qualifying criteria.
              </span>
            </div>
          )}

          {/* Main stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5 text-center">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Most Likely Rank</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-white font-mono">{fmt(result.rank)}</p>
              <p className="text-[11px] text-purple-300 font-medium mt-1">for {marksNum} raw marks</p>
            </div>

            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5 text-center">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Expected Rank Range</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-200 font-mono leading-tight mt-1">
                {fmt(result.lo)} – {fmt(result.hi)}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Shift variation corridor</p>
            </div>

            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5 text-center">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Estimated Percentile</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-mono">{result.percentile}%</p>
              <p className="text-[11px] text-gray-400 mt-1">{stream === 'mpc' ? '~2.15 Lakh' : '~85,000'} test takers</p>
            </div>
          </div>

          {/* Centered White Predict Button directly above Admission Outlook */}
          <div className="flex justify-center py-1.5">
            <button
              type="button"
              onClick={handlePredictColleges}
              className="group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-3 text-sm sm:text-base font-bold text-gray-950 shadow-[0_4px_24px_0_rgba(255,255,255,0.28)] transition-all duration-300 hover:bg-gray-100 hover:shadow-[0_6px_32px_0_rgba(255,255,255,0.45)] active:scale-[0.98] cursor-pointer"
            >
              <BarChart3 size={18} className="text-purple-600 transition-transform duration-300 group-hover:scale-110" />
              <span className="tracking-tight">Predict Eligible Colleges with Rank {fmt(result.rank)}</span>
              <ArrowRight size={17} className="text-gray-900 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Admission Outlook */}
          <div className="rounded-xl bg-white/[0.05] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Admissions Outlook</span>
            </div>
            <p className={`text-base font-bold ${outlook.color}`}>{outlook.label}</p>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{outlook.desc}</p>
          </div>

          {/* Normalization & Shift Variation Note */}
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 text-xs text-amber-200/90 leading-relaxed">
            <Info size={15} className="mt-0.5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300 mb-0.5">Note on Raw Marks &amp; Shift Normalization:</p>
              <p>
                TG EAPCET conducts exams across multiple sessions. Session normalization typically shifts raw scores by only ±2 to 3 marks.
                This tool directly maps your raw marks with a calibrated confidence corridor to predict your 2027 rank.
                Official rank cards issued by TGCHE remain the final authority for counselling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mid Banner Ad */}
      <div className="my-8 w-full">
        <AdSenseUnit slotName="examBanner" minHeight={90} />
      </div>

      {/* Reference Table toggle */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] backdrop-blur-md overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowTable(prev => !prev)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <div>
            <p className="text-sm font-bold text-white">
              Full 2026 Calibrated Marks vs Rank Benchmark Table
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {stream === 'mpc' ? 'Engineering Stream (MPC)' : 'Agriculture & Pharmacy Stream (BiPC)'} — Key anchor mark thresholds
            </p>
          </div>
          {showTable ? <ChevronUp size={19} className="text-gray-400" /> : <ChevronDown size={19} className="text-gray-400" />}
        </button>

        {showTable && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-t border-b border-white/10 bg-white/[0.06]">
                  <th className="px-5 py-3 text-left text-gray-300 font-semibold">Marks (out of 160)</th>
                  <th className="px-5 py-3 text-right text-gray-300 font-semibold">Expected Rank</th>
                  <th className="px-5 py-3 text-right text-gray-300 font-semibold">Rank Range</th>
                  <th className="px-5 py-3 text-right text-gray-300 font-semibold">Percentile</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => {
                  const isCurrent = isValid && Math.round(marksNum) === row.marks;
                  return (
                    <tr
                      key={row.marks}
                      className={`border-b border-white/[0.05] transition-colors ${
                        isCurrent
                          ? 'bg-purple-500/20 border-purple-500/40'
                          : i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-5 py-3 font-bold text-white">
                        {row.marks}
                        {isCurrent && (
                          <span className="ml-2 inline-block rounded bg-purple-500/40 px-1.5 py-0.5 text-[10px] text-purple-200 font-semibold">
                            ← Your Score
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-white">{fmt(row.rank)}</td>
                      <td className="px-5 py-3 text-right font-mono text-gray-300">
                        {fmt(row.lo)} – {fmt(row.hi)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-emerald-300">{row.percentile}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Educational Guide & Marks vs Rank Dynamics */}
      <ToolGuideSection toolType="marks_vs_rank" examName="TG EAPCET" authorityName="TSCHE" />

      {/* Bottom Ad */}
      <div className="mt-12 w-full">
        <AdSenseUnit slotName="bottomBanner" minHeight={90} />
      </div>
    </main>
  );
}
