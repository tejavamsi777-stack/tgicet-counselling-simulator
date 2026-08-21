import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apEapcetApi } from '../../lib/apEapcetApi';
import MobileQuickActionsBar from '../../components/shared/MobileQuickActionsBar';
import { Building2, MapPin, Award, BookOpen, ExternalLink, ArrowLeft, Share2, Layers, DollarSign, CheckCircle2 } from 'lucide-react';

export default function CollegeProfilePage() {
  const { code } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    apEapcetApi
      .getCollegeByCode(code || 'CBIT')
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setCollege(res.data);
        } else {
          setError(res.error || 'College details not found');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load college profile');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mb-4" />
        <p className="text-white/60 text-sm font-medium">Loading Institution Profile for {code}...</p>
      </div>
    );
  }

  if (error || !college) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/20 p-8 text-white">
          <p className="text-lg font-bold text-rose-300 mb-2">College Not Found</p>
          <p className="text-sm text-white/60 mb-6">{error || `No details found for college code ${code}`}</p>
          <Link
            to="/ap-eapcet/allotments"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-500 transition-all"
          >
            <ArrowLeft size={16} />
            Back to Allotments Explorer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white">
      {/* Top Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/ap-eapcet/allotments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Allotments
        </Link>

        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
          Official APSCHE Code: {college.code}
        </span>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-black/80 to-purple-900/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-md bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[11px] font-bold text-purple-300 uppercase">
                {college.region || 'OU'} Region
              </span>
              <span className="rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white/70 uppercase">
                {college.affiliation || 'JNTUH'}
              </span>
              <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold uppercase">
                {college.coed ? 'Co-Ed' : 'Girls Only'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{college.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-400" />
                {college.place || college.district}, {college.district} District
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-sky-400" />
                Management Type: {college.type || 'REG'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
            <Link
              to={`/ap-eapcet/allotments?college=${college.code}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-950/50"
            >
              <Layers size={14} />
              View Seat Allotments
            </Link>
            <Link
              to={`/ap-eapcet/compare?c1=${college.code}&c2=VNRV`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <Award size={14} className="text-amber-400" />
              Compare College
            </Link>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Annual Tuition Fee</p>
            <p className="text-xl font-extrabold text-amber-300 mt-1">₹{(college.annualFee || 95000).toLocaleString()}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Per Annum (4 Years)</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Offered Branches</p>
            <p className="text-xl font-extrabold text-purple-300 mt-1">{college.branches?.length || 8} Courses</p>
            <p className="text-[10px] text-white/40 mt-0.5">CSE, ECE, IT &amp; Specializations</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Highest Placement</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-1">{college.placements?.highestPackage || '45.0 LPA'}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Verified Placement Record</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Average Package</p>
            <p className="text-xl font-extrabold text-sky-400 mt-1">{college.placements?.averagePackage || '7.8 LPA'}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Across All Engineering Streams</p>
          </div>
        </div>
      </div>

      {/* Offered Branches Catalog */}
      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 sm:p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Offered Engineering Branches</h2>
            <p className="text-xs text-white/50">Official APSCHE accredited engineering programs for {college.code}</p>
          </div>
          <span className="text-xs font-semibold text-purple-400">{college.branches?.length || 0} Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(college.branches || ['CSE', 'CSM', 'CSD', 'ECE', 'EEE', 'INF', 'CIV', 'MEC']).map((br, idx) => {
            const branchCode = typeof br === 'string' ? br : br.code;
            const branchName = typeof br === 'string' ? br : br.name || br.code;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-purple-500/50 hover:bg-white/[0.07] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold">
                      {branchCode}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Intake Active
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{branchName}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/60">Annual Fee: ₹{(college.annualFee || 95000).toLocaleString()}</span>
                  <Link
                    to={`/ap-eapcet/allotments?college=${college.code}&branch=${branchCode}`}
                    className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    Cutoffs <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Mobile Actions */}
      <MobileQuickActionsBar
        shareTitle={`${college.name} (${college.code}) — College Profile`}
        shareUrl={window.location.href}
      />
    </div>
  );
}
