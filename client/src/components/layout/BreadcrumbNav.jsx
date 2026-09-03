import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Home, MapPin, Building2, LayoutGrid } from 'lucide-react';

const STATE_MAPPINGS = {
  'ap-eapcet': 'Andhra Pradesh',
  'kcet': 'Karnataka',
  'tg-eapcet': 'Telangana',
  'tg-icet': 'Telangana',
  'icet': 'Telangana',
  'tg-ecet': 'Telangana',
  'ecet': 'Telangana',
  'tg-polycet': 'Telangana',
  'polycet': 'Telangana',
  'tg-pgecet': 'Telangana',
  'pgecet': 'Telangana',
  'eapcet': 'Telangana',
};

const EXAM_NAME_MAPPINGS = {
  'ap-eapcet': 'AP EAPCET',
  'kcet': 'KCET',
  'tg-eapcet': 'TG EAPCET',
  'tg-icet': 'TG ICET',
  'icet': 'TG ICET',
  'tg-ecet': 'TG ECET',
  'ecet': 'TG ECET',
  'tg-polycet': 'TG POLYCET',
  'polycet': 'TG POLYCET',
  'tg-pgecet': 'TG PGECET',
  'pgecet': 'TG PGECET',
  'eapcet': 'TG EAPCET',
};

const FEATURE_NAME_MAPPINGS = {
  'predictor': 'College Predictor',
  'allotments': 'Seat Allotment',
  'mock-counselling': 'Mock Counselling',
  'compare': 'College Compare',
  'documents': 'Documents Checklist',
  'colleges': 'College Directory',
  'about': 'About Us',
  'login': 'Account Login',
  'admin': 'Admin Dashboard',
};

export default function BreadcrumbNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Don't render full breadcrumb bar on exact Home root '/'
  if (pathname === '/' || pathname === '') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  let stateName = '';
  let examSlug = '';
  let examName = '';
  let featureName = '';
  let featurePath = '';

  // Extract route info
  for (const seg of segments) {
    if (STATE_MAPPINGS[seg]) {
      examSlug = seg;
      stateName = STATE_MAPPINGS[seg];
      examName = EXAM_NAME_MAPPINGS[seg];
    } else if (FEATURE_NAME_MAPPINGS[seg]) {
      featureName = FEATURE_NAME_MAPPINGS[seg];
      featurePath = seg;
    }
  }

  // Handle direct custom paths like /colleges/123 or /exams/tg-eapcet
  if (!stateName && segments[0] === 'exams' && segments[1] && STATE_MAPPINGS[segments[1]]) {
    examSlug = segments[1];
    stateName = STATE_MAPPINGS[segments[1]];
    examName = EXAM_NAME_MAPPINGS[segments[1]];
    if (segments[2] && FEATURE_NAME_MAPPINGS[segments[2]]) {
      featureName = FEATURE_NAME_MAPPINGS[segments[2]];
    }
  } else if (!stateName && segments[0] === 'colleges') {
    stateName = 'Engineering Colleges';
    featureName = segments[1] ? 'College Details' : 'College Directory';
  } else if (!featureName && segments[0] && FEATURE_NAME_MAPPINGS[segments[0]]) {
    featureName = FEATURE_NAME_MAPPINGS[segments[0]];
  }

  return (
    <div className="w-full bg-transparent z-30 pt-4 pb-1 px-4 sm:px-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left Section: Back Button & Breadcrumbs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 text-xs font-bold text-purple-300 transition cursor-pointer shrink-0"
            title="Go to previous page"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>

          <span className="text-white/20">|</span>

          {/* Breadcrumbs List */}
          <nav className="flex items-center gap-1.5 text-gray-400 font-medium shrink-0">
            {/* Home link */}
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors text-gray-400">
              <Home size={13} />
              <span>Home</span>
            </Link>

            {/* State segment */}
            {stateName && (
              <>
                <ChevronRight size={13} className="text-gray-600 shrink-0" />
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-400" />
                  {stateName}
                </span>
              </>
            )}

            {/* Exam segment */}
            {examName && (
              <>
                <ChevronRight size={13} className="text-gray-600 shrink-0" />
                <Link
                  to={`/${examSlug}`}
                  className="hover:text-white font-semibold text-purple-300 transition-colors"
                >
                  {examName}
                </Link>
              </>
            )}

            {/* Current Feature segment */}
            {featureName && (
              <>
                <ChevronRight size={13} className="text-gray-600 shrink-0" />
                <span className="text-white font-bold tracking-tight">
                  {featureName}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right Section: Active Route Badge indicator */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono font-medium text-white/40">
          <LayoutGrid size={12} />
          <span>Route: <code className="text-cyan-400">{pathname}</code></span>
        </div>

      </div>
    </div>
  );
}
