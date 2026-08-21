import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ExternalLink, Sparkles } from 'lucide-react';
import { apEapcetApi } from '../../lib/apEapcetApi';
import SearchableSelect from '../shared/SearchableSelect';

export default function CollegeProfileSelectorBanner() {
  const [collegesList, setCollegesList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    apEapcetApi
      .getAllotmentMeta()
      .then((res) => {
        if (!isMounted) return;
        if (res.data) setCollegesList(res.data.colleges || []);
      })
      .catch((err) => console.error('Failed to load colleges list:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProceed = () => {
    if (selectedCollege) {
      navigate(`/colleges/${selectedCollege}`);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-950/40 via-black/80 to-purple-900/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
        {/* Left Info Column */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 shadow-inner">
            <Building2 size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                College Profiles &amp; Branch Fees
              </h3>
              <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 shrink-0">
                178 Institutions
              </span>
            </div>
            <p className="text-xs text-purple-200/70 mt-0.5 leading-relaxed truncate sm:whitespace-normal">
              Explore official annual tuition fees, accredited engineering branches, and placement CTC records.
            </p>
          </div>
        </div>

        {/* Right Search & Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
          <div className="w-full sm:w-[320px] md:w-[360px] lg:w-[380px] min-w-0">
            <SearchableSelect
              value={selectedCollege}
              onChange={(val) => setSelectedCollege(val)}
              disabled={loading}
              placeholder="-- Search / Select College --"
              searchPlaceholder="Search by college code or name..."
              options={collegesList.map((c) => {
                const cleanName = (c.name || '').replace(new RegExp(`^${c.code}\\s*[-–—:]\\s*`, 'i'), '').trim();
                return {
                  value: c.code,
                  label: `${c.code} — ${cleanName || c.name}`,
                  sublabel: c.district ? `${c.district} District` : undefined,
                };
              })}
            />
          </div>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!selectedCollege}
            className={`rounded-xl px-4.5 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 min-w-fit shadow-md ${
              selectedCollege
                ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-950/60 cursor-pointer active:scale-95'
                : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
            }`}
          >
            <span>Proceed to View Profile</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
