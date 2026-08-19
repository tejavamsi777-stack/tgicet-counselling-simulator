import { useState, useEffect, useMemo } from 'react';
import { Calculator, CheckCircle2, AlertCircle, Info, Sparkles, Building, GraduationCap, DollarSign } from 'lucide-react';
import { eapcetApi } from '../../lib/eapcetApi';
import SearchableSelect from './SearchableSelect';

/**
 * Official TS ePASS Fee Reimbursement & Scholarship Eligibility Calculator
 */
export function calculateReimbursement({ category, rank, annualFee = 0, incomeUnderThreshold = true }) {
  if (!annualFee) return null;

  const cat = String(category || 'OC').toUpperCase();
  const r = Number(rank) || 999999;
  const fee = Number(annualFee) || 0;

  if (!incomeUnderThreshold) {
    return {
      eligible: false,
      amount: 0,
      netFee: fee,
      floorDeposit: 10000,
      reason: 'Family annual income exceeds MeeSeva income certificate limit (₹1.5 Lakh rural / ₹2.0 Lakh urban).',
      badge: 'NOT ELIGIBLE',
    };
  }

  // SC / ST Candidates: 100% Full Tuition Fee Reimbursement
  if (cat.includes('SC') || cat.includes('ST')) {
    return {
      eligible: true,
      amount: fee,
      netFee: 0,
      floorDeposit: 5000,
      reason: '100% Full Fee Reimbursement granted per G.O. Ms. No. 33 (SC/ST Quota).',
      badge: '100% FULL REIMBURSEMENT',
    };
  }

  // Rank <= 10,000 for BC / EWS / Minority / OC: 100% Full Reimbursement
  if (r <= 10000 && (cat.includes('BC') || cat.includes('EWS') || cat.includes('MIN') || cat === 'OC')) {
    return {
      eligible: true,
      amount: fee,
      netFee: 0,
      floorDeposit: 10000,
      reason: '100% Full Fee Reimbursement granted for TG EAPCET Rank ≤ 10,000 per G.O. Ms. No. 244.',
      badge: '100% FULL REIMBURSEMENT (RANK ≤ 10K)',
    };
  }

  // Rank > 10,000 for BC / EWS / Minority: Standard ₹35,000/year
  if (cat.includes('BC') || cat.includes('EWS') || cat.includes('MIN')) {
    const amount = Math.min(35000, fee);
    return {
      eligible: true,
      amount,
      netFee: Math.max(0, fee - amount),
      floorDeposit: 10000,
      reason: 'Standard ₹35,000/year ePASS Reimbursement granted. Student pays remaining balance.',
      badge: '₹35,000 / YR REIMBURSEMENT',
    };
  }

  // OC Candidates without EWS or rank > 10k: 0%
  return {
    eligible: false,
    amount: 0,
    netFee: fee,
    floorDeposit: 10000,
    reason: 'OC candidates without EWS or rank > 10,000 pay full tuition fee.',
    badge: 'FULL FEE PAYABLE',
  };
}

export default function FeeReimbursementCalculator({
  collegeCodeProp,
  annualFeeProp,
}) {
  const [collegesList, setCollegesList] = useState([]);
  const [collegeBranchesMap, setCollegeBranchesMap] = useState({});
  const [metaLoading, setMetaLoading] = useState(true);

  // Form State — NO DEFAULTS SELECTED
  const [selectedCollege, setSelectedCollege] = useState(collegeCodeProp || '');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [category, setCategory] = useState('');
  const [rank, setRank] = useState('');
  const [incomeValid, setIncomeValid] = useState(true);

  useEffect(() => {
    let isMounted = true;
    eapcetApi
      .getAllotmentMeta()
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          setCollegesList(res.data.colleges || []);
          setCollegeBranchesMap(res.data.collegeBranches || {});
        }
      })
      .catch((err) => console.error('Failed to load allotment meta:', err))
      .finally(() => {
        if (isMounted) setMetaLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Get active college object & offered branches
  const currentCollege = useMemo(() => {
    if (!selectedCollege) return null;
    return collegesList.find((c) => c.code.toUpperCase() === selectedCollege.toUpperCase()) || null;
  }, [collegesList, selectedCollege]);

  const availableBranches = useMemo(() => {
    if (!selectedCollege) return [];
    const list = collegeBranchesMap[selectedCollege.toUpperCase()] || [];
    return list;
  }, [collegeBranchesMap, selectedCollege]);

  const currentAnnualFee = useMemo(() => {
    if (annualFeeProp) return annualFeeProp;
    if (currentCollege) return currentCollege.annualFee || currentCollege.fee || 95000;
    return 0;
  }, [annualFeeProp, currentCollege]);

  const calcResult = useMemo(() => {
    if (!selectedCollege || !currentAnnualFee) return null;
    return calculateReimbursement({
      category: category || 'OC',
      rank: Number(rank) || 0,
      annualFee: currentAnnualFee,
      incomeUnderThreshold: incomeValid,
    });
  }, [selectedCollege, currentAnnualFee, category, rank, incomeValid]);

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-black/70 to-purple-900/20 p-5 sm:p-6 backdrop-blur-xl shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300">
            <Calculator size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              TS ePASS Fee &amp; Scholarship Calculator
            </h3>
            <p className="text-xs text-white/50">
              Select your College, Branch &amp; Caste Category to compute official net student fee
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          <Sparkles size={12} />
          TS ePASS G.O. Ms Rules
        </span>
      </div>

      {/* Input Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* 1. College Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1">
            <Building size={13} className="text-cyan-400" />
            Engineering College
          </label>
          <SearchableSelect
            value={selectedCollege}
            onChange={(val) => {
              setSelectedCollege(val);
              setSelectedBranch('');
            }}
            disabled={metaLoading}
            placeholder="-- Search / Select College --"
            searchPlaceholder="Search college code or name..."
            options={collegesList.map((c) => {
              const cleanName = (c.name || '').replace(new RegExp(`^${c.code}\\s*[-–—:]\\s*`, 'i'), '').trim();
              return {
                value: c.code,
                label: `${c.code} — ${cleanName || c.name}`,
                sublabel: `Official Annual Fee: ₹${(c.annualFee || c.fee || 95000).toLocaleString()}`,
              };
            })}
          />
        </div>

        {/* 2. Branch Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 flex items-center gap-1">
            <GraduationCap size={13} className="text-amber-400" />
            Branch / Stream
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={!selectedCollege || availableBranches.length === 0}
            className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">
              {!selectedCollege
                ? '-- Select College First --'
                : availableBranches.length === 0
                ? '-- General Engineering Stream --'
                : '-- Select Branch --'}
            </option>
            {availableBranches.map((br) => {
              const code = typeof br === 'string' ? br : br.code;
              const name = typeof br === 'string' ? br : br.name || br.code;
              return (
                <option key={code} value={code} className="bg-neutral-900 text-white">
                  {code} — {name}
                </option>
              );
            })}
          </select>
        </div>

        {/* 3. Caste / Category Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 block">
            Caste / Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2.5 text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer"
          >
            <option value="">-- Select Caste / Category --</option>
            <option value="OC">OC (Open Competition)</option>
            <option value="EWS">EWS (Economically Weaker Section)</option>
            <option value="BC-A">BC-A</option>
            <option value="BC-B">BC-B</option>
            <option value="BC-C">BC-C</option>
            <option value="BC-D">BC-D</option>
            <option value="BC-E">BC-E (Minority)</option>
            <option value="SC">SC (Scheduled Caste)</option>
            <option value="ST">ST (Scheduled Tribe)</option>
          </select>
        </div>

        {/* 4. TG EAPCET Rank Input */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 block">
            TG EAPCET Rank
          </label>
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            placeholder="e.g. 12500"
            className="w-full rounded-xl border border-white/15 bg-black/60 px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Income Certificate Segmented Toggle */}
      <div className="mb-5 flex flex-wrap items-center justify-between sm:justify-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold text-white">MeeSeva Income Certificate Valid?</p>
          <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setIncomeValid(true)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                incomeValid
                  ? 'bg-emerald-500 text-black shadow-md font-extrabold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Yes</span>
            </button>
            <button
              type="button"
              onClick={() => setIncomeValid(false)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                !incomeValid
                  ? 'bg-rose-500 text-white shadow-md font-extrabold'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <AlertCircle size={13} />
              <span>No</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] text-white/50 w-full sm:w-auto sm:ml-auto">
          Income &lt; ₹1.5 Lakh (Rural) / ₹2.0 Lakh (Urban)
        </p>
      </div>

      {/* Calculation Display Matrix */}
      {!selectedCollege ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center text-xs text-white/50 flex items-center justify-center gap-2">
          <Info size={15} className="text-purple-400" />
          <span>Select an <strong>Engineering College</strong> above to view its official annual tuition fee and compute TS ePASS Fee Reimbursement.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
            {/* 1. Official College Fee */}
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5">
              <p className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
                {selectedCollege} {selectedBranch ? `(${selectedBranch})` : ''} Annual Fee
              </p>
              <p className="text-xl font-extrabold text-white mt-0.5">₹{currentAnnualFee.toLocaleString()}</p>
              <p className="text-[10px] text-cyan-200/60 mt-0.5">Official TSCHE Regulated Tuition Fee</p>
            </div>

            {/* 2. Govt Reimbursement */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3.5">
              <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Govt Reimbursement</p>
              {!category ? (
                <p className="text-xs text-emerald-200/70 mt-1">Select Caste Category to Calculate</p>
              ) : (
                <>
                  <p className="text-xl font-extrabold text-emerald-400 mt-0.5">- ₹{calcResult?.amount.toLocaleString()}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5">
                    {calcResult?.badge}
                  </span>
                </>
              )}
            </div>

            {/* 3. Net Payable Fee */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/40 p-3.5">
              <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">Net Student Payable Fee</p>
              {!category ? (
                <p className="text-xs text-purple-200/70 mt-1">Select Caste Category to Calculate</p>
              ) : (
                <>
                  <p className="text-xl font-extrabold text-amber-300 mt-0.5">₹{calcResult?.netFee.toLocaleString()}/yr</p>
                  <p className="text-[10px] text-purple-300/70 mt-0.5">Floor Deposit: ₹{calcResult?.floorDeposit.toLocaleString()}</p>
                </>
              )}
            </div>
          </div>

          {category && calcResult && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-white/70 flex items-start gap-2">
              <Info size={14} className="text-purple-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{calcResult.reason}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
