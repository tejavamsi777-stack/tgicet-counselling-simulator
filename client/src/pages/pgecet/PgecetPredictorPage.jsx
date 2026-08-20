import { useState } from 'react';
import {
  Sparkles,
  Search,
  Building,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Seo from '../../components/shared/Seo';
import { GlassButton } from '../../components/ui/glass-button';
import { pgecetApi } from '../../lib/pgecetApi';
import { PGECET_BRANCHES } from '../../data/pgecetInstitutions';
import { useReviewPrompt } from '../../hooks/useReviewPrompt';
import ReviewModal from '../../components/shared/ReviewModal';

const CATEGORIES = ['OC', 'EWS', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'ST'];

export default function PgecetPredictorPage() {
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('OC');
  const [gender, setGender] = useState('M');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isOpen: isReviewOpen, closePrompt: closeReview } = useReviewPrompt(
    hasPredicted,
    'tg-pgecet'
  );

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!rank || Number(rank) <= 0) return;

    setLoading(true);
    try {
      const res = await pgecetApi.predict(rank, category, gender, selectedBranch);
      setPredictions(res.data || []);
      setHasPredicted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:px-10 sm:py-12">
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={closeReview}
        examSlug="tg-pgecet"
      />
      <Seo
        title="TG PGECET College Predictor 2026 | M.Tech / M.E. Admission Chances"
        description="Predict your M.Tech, M.E., and M.Arch admission chances in Osmania University, JNTU Hyderabad, and top engineering colleges based on your TG PGECET / GATE rank."
        path="/tg-pgecet/predictor"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
          <Sparkles size={14} className="text-cyan-400" />
          <span>AI-Powered 2026 Rank Analysis</span>
        </div>
        <h1
          className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          TG PGECET College Predictor
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-300">
          Enter your TG PGECET or GATE rank to discover your admission chances for M.Tech, M.E. and M.Arch specializations across Telangana universities & private institutions.
        </p>
      </div>

      {/* Predictor Input Form Card */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-[#130b24]/90 via-[#180f2d]/90 to-[#0d0718]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl max-w-2xl mx-auto">
        <form onSubmit={handlePredict} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Your TG PGECET / GATE Rank
            </label>
            <input
              type="number"
              min="1"
              required
              placeholder="e.g. 1450"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 text-base font-mono font-bold text-cyan-300 placeholder:text-white/30 focus:border-purple-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-[#1a1033] px-3.5 py-3 text-sm font-semibold text-white focus:border-purple-400 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Gender
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-bold transition ${
                    gender === 'M'
                      ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                      : 'border-white/10 bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`flex-1 rounded-2xl border py-3 text-sm font-bold transition ${
                    gender === 'F'
                      ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                      : 'border-white/10 bg-black/40 text-white/60 hover:bg-white/5'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
              Target Specialization (Optional)
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-2xl border border-white/15 bg-[#1a1033] px-3.5 py-3 text-sm text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="">All Specializations (AI/ML, CSE, VLSI, Civil, Mechanical...)</option>
              {PGECET_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 text-center">
            <GlassButton
              type="submit"
              disabled={loading || !rank}
              className="w-full justify-center py-3.5 text-base font-bold text-white shadow-lg shadow-purple-900/50"
            >
              {loading ? 'Analyzing 2,380+ Cutoffs...' : 'Predict PG Colleges Now'}
            </GlassButton>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {hasPredicted && (
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Prediction Results ({predictions.length} Colleges Available)
              </h2>
              <p className="text-xs text-white/50">
                Rank #{rank} · {category} · {gender === 'F' ? 'Female' : 'Male'} · {selectedBranch || 'All Branches'}
              </p>
            </div>
          </div>

          {predictions.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/40 p-8 text-center text-white/50">
              No matching colleges found for Rank #{rank}. Try selecting "All Specializations" or checking other branches.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((pred, i) => (
                <div
                  key={`${pred.college_code}_${pred.branch_name}_${i}`}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 to-[#0c0616]/90 p-5 shadow-xl transition hover:border-purple-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-block rounded-lg bg-purple-500/20 border border-purple-400/30 px-2.5 py-0.5 font-mono text-xs font-bold text-purple-300">
                        {pred.college_code}
                      </span>
                      <h3 className="mt-2 text-sm font-bold text-white leading-snug">
                        {pred.college_name}
                      </h3>
                      <p className="text-xs text-cyan-300 mt-1 font-semibold">
                        {pred.branch_name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                          pred.probability >= 75
                            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                            : pred.probability >= 50
                            ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                            : 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {pred.chance}
                      </span>
                      <span className="block text-[11px] font-mono text-white/40 mt-1">
                        Cutoff: #{pred.max_rank}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                    <span>Quota: {pred.allotted_category}</span>
                    <span>Opening: #{pred.min_rank}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
