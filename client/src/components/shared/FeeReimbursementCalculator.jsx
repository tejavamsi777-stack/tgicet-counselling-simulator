import { useState, useEffect, useMemo } from 'react';
import { Calculator, CheckCircle2, AlertCircle, Info, Sparkles, Building, GraduationCap, Award, HelpCircle } from 'lucide-react';
import { eapcetApi } from '../../lib/eapcetApi';
import { apEapcetApi } from '../../lib/apEapcetApi';
import SearchableSelect from './SearchableSelect';
import { TELANGANA_ENGINEERING_COLLEGES } from '../../data/telanganaCollegesData';

/**
 * Official TS ePASS & AP Jagananna Vidya Deevena (JVD) Fee Reimbursement Calculator
 */
export function calculateReimbursement({ category, rank, annualFee = 0, incomeUnderThreshold = true, isAp = false }) {
  if (!annualFee) return null;

  const cat = String(category || 'OC').toUpperCase();
  const r = Number(rank) || 999999;
  const fee = Number(annualFee) || 0;

  if (isAp) {
    // ── AP Jagananna Vidya Deevena (JVD) Rules ──────────────────────────
    if (!incomeUnderThreshold) {
      return {
        eligible: false,
        amount: 0,
        netFee: fee,
        floorDeposit: 0,
        reason: 'Family annual income exceeds AP JVD threshold (≤ ₹2.5 Lakh per annum / Valid AP White Rice Card required). Student pays full tuition fee.',
        badge: 'NOT ELIGIBLE',
      };
    }

    // SC / ST / BC / EBC / Kapu / Minority / Differently Abled / EWS: 100% Full Tuition Fee Reimbursement per JVD
    if (cat.includes('SC') || cat.includes('ST') || cat.includes('BC') || cat.includes('EWS') || cat.includes('MIN') || cat.includes('KAPU')) {
      return {
        eligible: true,
        amount: fee,
        netFee: 0,
        floorDeposit: 0,
        reason: '100% Full Tuition Fee Reimbursement granted under Jagananna Vidya Deevena (JVD) Scheme (G.O. Ms. No. 115).',
        badge: '100% FULL JVD REIMBURSEMENT',
      };
    }

    // OC with valid Rice Card / Income ≤ 2.5L
    if (cat === 'OC') {
      return {
        eligible: true,
        amount: fee,
        netFee: 0,
        floorDeposit: 0,
        reason: '100% Full Fee Reimbursement granted per Jagananna Vidya Deevena with valid AP White Rice Card / Income Certificate.',
        badge: '100% FULL JVD REIMBURSEMENT',
      };
    }

    return {
      eligible: false,
      amount: 0,
      netFee: fee,
      floorDeposit: 0,
      reason: 'Candidates without valid AP MeeSeva income certificate or Rice Card pay full tuition fee.',
      badge: 'FULL FEE PAYABLE',
    };
  }

  // ── TG ePASS Rules ──────────────────────────────────────────────────
  if (!incomeUnderThreshold) {
    return {
      eligible: false,
      amount: 0,
      netFee: fee,
      floorDeposit: 10000,
      reason: 'Family annual income exceeds MeeSeva income certificate limit (₹1.5 Lakh rural / ₹2.0 Lakh urban). Student pays full tuition fee.',
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
      reason: 'Standard ₹35,000/year ePASS Reimbursement granted per G.O. Ms. No. 66. Student pays remaining balance.',
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

const FALLBACK_TSCHE_COLLEGES = [
  { code: 'CBIT', name: 'Chaitanya Bharathi Institute of Technology', annualFee: 140000, place: 'Gandipet, Hyderabad' },
  { code: 'VNRV', name: 'VNR Vignana Jyothi Institute of Engineering and Technology', annualFee: 135000, place: 'Bachupally, Hyderabad' },
  { code: 'VASV', name: 'Vasavi College of Engineering', annualFee: 140000, place: 'Ibrahimbagh, Hyderabad' },
  { code: 'GRRR', name: 'Gokaraju Rangaraju Institute of Engineering and Technology', annualFee: 130000, place: 'Bachupally, Hyderabad' },
  { code: 'MGIT', name: 'Mahatma Gandhi Institute of Technology', annualFee: 110000, place: 'Gandipet, Hyderabad' },
  { code: 'CVSR', name: 'Anurag University (CVSR College of Engineering)', annualFee: 125000, place: 'Venkatapur, Ghatkesar' },
  { code: 'KMIT', name: 'Keshav Memorial Institute of Technology', annualFee: 115000, place: 'Narayanguda, Hyderabad' },
  { code: 'BVRI', name: 'BVRIT Hyderabad College of Engineering for Women', annualFee: 120000, place: 'Nizampet, Hyderabad' },
  { code: 'BVRN', name: 'B.V. Raju Institute of Technology', annualFee: 120000, place: 'Narsapur, Medak' },
  { code: 'GCTC', name: 'Geethanjali College of Engineering and Technology', annualFee: 105000, place: 'Cheeryal, Keesara' },
  { code: 'OUCE', name: 'University College of Engineering, Osmania University', annualFee: 35000, place: 'Hyderabad' },
  { code: 'JNTH', name: 'JNTUH University College of Engineering', annualFee: 35000, place: 'Kukatpally, Hyderabad' },
  { code: 'VJEC', name: 'Vardhaman College of Engineering', annualFee: 125000, place: 'Shamshabad, Hyderabad' }
];

export default function FeeReimbursementCalculator({
  collegeCodeProp,
  annualFeeProp,
  branchDetailsProp,
  exam,
  theme = 'dark',
}) {
  const isAp = exam === 'ap-eapcet' || (typeof window !== 'undefined' && window.location.pathname.includes('ap-eapcet'));
  const [collegesList, setCollegesList] = useState(FALLBACK_TSCHE_COLLEGES);
  const [collegeBranchesMap, setCollegeBranchesMap] = useState({});
  const [metaLoading, setMetaLoading] = useState(true);

  // Re-ordered Form State: 1. Rank -> 2. Category -> 3. College -> 4. Branch -> 5. Income Status
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(collegeCodeProp || '');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  // Income status: null = not selected yet, 'VALID' = valid MeeSeva income cert, 'INVALID' = exceeds income limit
  const [incomeStatus, setIncomeStatus] = useState(null);

  // Sync auto-selected college when prop changes
  useEffect(() => {
    if (collegeCodeProp) {
      setSelectedCollege(collegeCodeProp);
    }
  }, [collegeCodeProp]);

  useEffect(() => {
    let isMounted = true;
    const apiCaller = isAp ? apEapcetApi.getAllotmentMeta() : eapcetApi.getAllotmentMeta();
    apiCaller
      .then((res) => {
        if (!isMounted) return;
        const d = res?.data || res || {};
        if (d.colleges && d.colleges.length > 0) {
          setCollegesList(d.colleges);
          setCollegeBranchesMap(d.collegeBranches || {});
        }
      })
      .catch((err) => {
        console.warn('Using fallback college list for Fee Reimbursement Calculator:', err);
      })
      .finally(() => {
        if (isMounted) setMetaLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAp]);

  // Active college object
  const currentCollege = useMemo(() => {
    if (!selectedCollege) return null;
    return collegesList.find((c) => c.code.toUpperCase() === selectedCollege.toUpperCase()) || null;
  }, [collegesList, selectedCollege]);

  // Robust Available branches resolver
  const availableBranches = useMemo(() => {
    if (!selectedCollege) return [];

    // 1. Direct branchDetailsProp passed from CollegeProfilePage
    if (branchDetailsProp && branchDetailsProp.length > 0 && selectedCollege.toUpperCase() === (collegeCodeProp || '').toUpperCase()) {
      return branchDetailsProp;
    }

    // 2. Local master dataset matching college code
    const localTgCol = TELANGANA_ENGINEERING_COLLEGES.find((c) => c.code.toUpperCase() === selectedCollege.toUpperCase());
    if (localTgCol) {
      if (localTgCol.branch_details && localTgCol.branch_details.length > 0) {
        return localTgCol.branch_details;
      }
      if (localTgCol.branches && localTgCol.branches.length > 0) {
        return localTgCol.branches.map((b) => (typeof b === 'string' ? { code: b, name: b, fee: localTgCol.annualFee } : b));
      }
    }

    // 3. API map fallback
    const apiBranches = collegeBranchesMap[selectedCollege.toUpperCase()] || [];
    return apiBranches;
  }, [selectedCollege, collegeCodeProp, branchDetailsProp, collegeBranchesMap]);

  // Annual fee calculation (Branch-wise or College-wise)
  const currentAnnualFee = useMemo(() => {
    if (selectedBranch && availableBranches.length > 0) {
      const match = availableBranches.find((b) => (typeof b === 'string' ? b : b.code).toUpperCase() === selectedBranch.toUpperCase());
      if (match && typeof match === 'object' && match.fee) {
        return Number(match.fee);
      }
    }
    if (annualFeeProp) return Number(annualFeeProp);
    if (currentCollege) {
      return Number(currentCollege.annualFee || currentCollege.fee || (isAp ? 47000 : 95000));
    }
    return 0;
  }, [selectedBranch, availableBranches, annualFeeProp, currentCollege, isAp]);

  // Result calculation triggered ONLY when incomeStatus is selected
  const calcResult = useMemo(() => {
    if (incomeStatus === null || !selectedCollege || !currentAnnualFee) return null;
    return calculateReimbursement({
      category: category || 'OC',
      rank: Number(rank) || 0,
      annualFee: currentAnnualFee,
      incomeUnderThreshold: incomeStatus === 'VALID',
      isAp,
    });
  }, [selectedCollege, currentAnnualFee, category, rank, incomeStatus, isAp]);

  
  const isLight = theme === 'light';

  return (
    <div className={isLight ? "rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-sm text-slate-900 space-y-2.5" : "rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 via-black/80 to-[#0f0a1c] p-3 sm:p-4 backdrop-blur-xl shadow-xl text-white space-y-2.5"}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pb-2 border-b ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <div className="flex items-center gap-1.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-purple-500/20 border-purple-500/30 text-purple-300'}`}>
            <Calculator size={14} />
          </div>
          <div>
            <h3 className={`text-xs sm:text-sm font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isAp ? 'AP Jagananna Vidya Deevena (JVD) Calculator' : 'TS ePASS Fee & Scholarship Calculator'}
            </h3>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Compute official net student fee &amp; scholarship reimbursement eligibility.
            </p>
          </div>
        </div>

        {collegeCodeProp && (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black font-mono border ${isLight ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}>
            Auto-Selected: {collegeCodeProp} (₹{(annualFeeProp || currentAnnualFee).toLocaleString()}/yr)
          </span>
        )}
      </div>

      {/* Step Sequence Inputs: 2 Columns on Mobile, 4 Columns on PC */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Step 1: Rank Input */}
        <div>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-black border font-mono ${isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>1</span>
            {isAp ? 'EAPCET Rank' : 'TG Rank'}
          </label>
          <input
            type="number"
            value={rank}
            onChange={(e) => {
              setRank(e.target.value);
            }}
            placeholder="e.g. 8450"
            className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono focus:outline-none ${isLight ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white' : 'border-white/15 bg-black/60 text-white placeholder-gray-500 focus:border-purple-500'}`}
          />
        </div>

        {/* Step 2: Category Selection */}
        <div>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${isLight ? 'text-indigo-700' : 'text-purple-300'}`}>
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-black border font-mono ${isLight ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-purple-500/20 text-purple-300 border-purple-500/40'}`}>2</span>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            className={`w-full rounded-lg border px-2 py-1.5 text-xs focus:outline-none cursor-pointer ${isLight ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white' : 'border-white/15 bg-black/60 text-white focus:border-purple-500'}`}
          >
            <option value="">-- Select --</option>
            <option value="OC">OC (General)</option>
            <option value="EWS">EWS</option>
            <option value="BC-A">BC-A</option>
            <option value="BC-B">BC-B</option>
            <option value="BC-C">BC-C</option>
            <option value="BC-D">BC-D</option>
            <option value="BC-E">BC-E (Minority)</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        {/* Step 3: Engineering College Selection */}
        <div>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-black border font-mono ${isLight ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'}`}>3</span>
            College
          </label>
          {collegeCodeProp ? (
            <div className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold truncate ${isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-900' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'}`}>
              {collegeCodeProp} — {currentCollege?.name || 'Selected College'}
            </div>
          ) : (
            <SearchableSelect
              value={selectedCollege}
              onChange={(val) => {
                setSelectedCollege(val);
                setSelectedBranch('');
              }}
              disabled={metaLoading}
              placeholder="-- Select College --"
              searchPlaceholder="Search college code or name..."
              options={collegesList.map((c) => {
                const cleanName = (c.name || '').replace(new RegExp(`^${c.code}\\s*[-–—:]\\s*`, 'i'), '').trim();
                return {
                  value: c.code,
                  label: `${c.code} — ${cleanName || c.name}`,
                  sublabel: `Fee: ₹${(c.annualFee || c.fee || (isAp ? 45000 : 95000)).toLocaleString()}`,
                };
              })}
            />
          )}
        </div>

        {/* Step 4: Branch Selection */}
        <div>
          <label className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1 ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-black border font-mono ${isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>4</span>
            Branch
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
            }}
            disabled={!selectedCollege}
            className={`w-full rounded-lg border px-2 py-1.5 text-xs focus:outline-none cursor-pointer disabled:opacity-50 ${isLight ? 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:bg-white' : 'border-white/15 bg-black/60 text-white focus:border-purple-500'}`}
          >
            <option value="">
              {!selectedCollege
                ? '-- Select College First --'
                : availableBranches.length === 0
                ? '-- All Branches --'
                : '-- Select Branch --'}
            </option>
            {availableBranches.map((br) => {
              const code = typeof br === 'string' ? br : br.code;
              const name = typeof br === 'string' ? br : br.name || br.code;
              return (
                <option key={code} value={code} className={isLight ? "bg-white text-slate-900" : "bg-neutral-900 text-white"}>
                  {code} — {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Step 5: MeeSeva Income Certificate Status (LAST STEP - TRIGGERS RESULT) */}
      <div className={`rounded-xl border p-2 sm:p-2.5 space-y-1.5 ${isLight ? 'border-indigo-200 bg-indigo-50/60' : 'border-purple-500/30 bg-purple-950/30'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-black text-white font-mono">5</span>
            <p className={`text-[11px] sm:text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isAp ? 'Valid AP White Rice Card / Income Cert?' : 'MeeSeva Income Certificate Status (Final Step)'}
            </p>
          </div>
          <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            {isAp ? 'Income ≤ ₹2.5L / White Rice Card' : 'Income < ₹1.5L (Rural) / ₹2.0L (Urban)'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setIncomeStatus('VALID')}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              incomeStatus === 'VALID'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : isLight
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CheckCircle2 size={13} className={incomeStatus === 'VALID' ? 'text-white' : 'text-emerald-600'} />
            <span>Valid Cert (&lt; ₹2L)</span>
          </button>

          <button
            type="button"
            onClick={() => setIncomeStatus('INVALID')}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              incomeStatus === 'INVALID'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : isLight
                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <AlertCircle size={13} className={incomeStatus === 'INVALID' ? 'text-white' : 'text-rose-600'} />
            <span>Not Valid / Exceeds Limit</span>
          </button>
        </div>
      </div>

      {/* Result Display Triggered ONLY after Step 5 (Income Status Selection) */}
      {incomeStatus === null ? (
        <div className={`rounded-xl border border-dashed p-2.5 text-center text-[11px] flex items-center justify-center gap-1.5 ${isLight ? 'border-indigo-300 bg-indigo-50/30 text-slate-600' : 'border-purple-500/30 bg-white/[0.02] text-gray-400'}`}>
          <HelpCircle size={14} className="text-indigo-600 shrink-0" />
          <span>
            Select <strong>Step 5 (Income Certificate Status)</strong> above to compute Net Student Fee.
          </span>
        </div>
      ) : calcResult && (
        <div className={`rounded-xl border p-2.5 space-y-2 shadow-xs ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-black/60 shadow-2xl'}`}>
          <div className="grid grid-cols-3 gap-1.5">
            {/* 1. Regulated College Fee */}
            <div className={`rounded-lg border p-2 ${isLight ? 'border-cyan-200 bg-cyan-50' : 'border-cyan-500/30 bg-cyan-950/30'}`}>
              <p className={`text-[9px] font-semibold uppercase truncate ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                {selectedCollege} Fee
              </p>
              <p className={`text-xs sm:text-base font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>₹{currentAnnualFee.toLocaleString()}</p>
              <p className={`text-[8px] mt-0.5 truncate ${isLight ? 'text-cyan-700' : 'text-cyan-200/60'}`}>Regulated Tuition Fee</p>
            </div>

            {/* 2. Government Reimbursement */}
            <div className={`rounded-lg border p-2 ${isLight ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-500/30 bg-emerald-950/30'}`}>
              <p className={`text-[9px] font-semibold uppercase truncate ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>Govt Reimbursement</p>
              <p className="text-xs sm:text-base font-black text-emerald-600 mt-0.5">
                {calcResult.amount > 0 ? `- ₹${calcResult.amount.toLocaleString()}` : '₹0'}
              </p>
              <span className={`inline-block mt-0.5 text-[8px] font-extrabold uppercase rounded px-1 py-0.5 border truncate max-w-full ${isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                {calcResult.badge}
              </span>
            </div>

            {/* 3. Net Payable Fee */}
            <div className={`rounded-lg border p-2 ${isLight ? 'border-amber-200 bg-amber-50' : 'border-amber-500/30 bg-amber-950/40'}`}>
              <p className={`text-[9px] font-semibold uppercase truncate ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>Net Payable Fee</p>
              <p className="text-xs sm:text-base font-black text-amber-700 mt-0.5">
                ₹{calcResult.netFee.toLocaleString()}
              </p>
              <p className={`text-[8px] mt-0.5 truncate ${isLight ? 'text-amber-800/80' : 'text-amber-200/60'}`}>
                Caution Deposit: ₹{calcResult.floorDeposit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={`rounded-lg border p-2 text-[10px] flex items-start gap-1.5 ${isLight ? 'border-indigo-200 bg-indigo-50 text-slate-700' : 'border-purple-500/20 bg-purple-950/20 text-gray-300'}`}>
            <Info size={13} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-tight">{calcResult.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
