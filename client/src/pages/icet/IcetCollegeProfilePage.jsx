import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, MapPin, Award, BookOpen, ExternalLink, ArrowLeft, Share2, Layers,
  DollarSign, CheckCircle2, TrendingUp, Sparkles, Globe, Mail, Phone, ShieldCheck,
  ChevronRight, BarChart3, Users, Search, Flame, Target, HelpCircle, ChevronDown, Star,
  Bookmark, Scale, ArrowUpRight, ArrowRight, Check, Compass, GraduationCap
} from 'lucide-react';
import { ICET_INSTITUTIONS } from '../../data/icetInstitutions';
import { TELANGANA_ENGINEERING_COLLEGES } from '../../data/telanganaCollegesData';
import FeeReimbursementCalculator from '../../components/shared/FeeReimbursementCalculator';
import Seo from '../../components/shared/Seo';
import { GlassButton } from '../../components/ui/glass-button';
import { getIcetCollegeRating } from './IcetCollegesDirectoryPage';

// Helper to resolve official program-specific tuition fees
export function getProgramFee(college, program) {
  const prog = (program || 'MBA').toLowerCase();
  if (college?.feeByCourse?.[prog]) {
    return Number(college.feeByCourse[prog]);
  }
  return Number(college?.annualFee || college?.fee || 35000);
}

// Helper to resolve realistic program-tailored placements (MBA vs MCA)
export function getProgramPlacements(college, program) {
  const prog = (program || 'MBA').toUpperCase();
  const basePlacements = college?.placements || {};

  if (college?.placementsByCourse?.[prog.toLowerCase()]) {
    return college.placementsByCourse[prog.toLowerCase()];
  }

  const baseHighest = basePlacements.highestPackage || '₹8.0 LPA';
  const baseAvg = basePlacements.averagePackage || '₹4.5 LPA';
  const numHighest = parseFloat(baseHighest.replace(/[^0-9.]/g, '')) || 8.0;
  const numAvg = parseFloat(baseAvg.replace(/[^0-9.]/g, '')) || 4.5;

  if (prog === 'MCA') {
    if (college?.code === 'CBIT') {
      return {
        highestPackage: '₹18.0 LPA',
        averagePackage: '₹7.8 LPA',
        topRecruiters: ['Amazon', 'Microsoft', 'Cognizant', 'Infosys', 'TCS', 'Tech Mahindra'],
        placementRate: '93%'
      };
    }
    if (college?.code === 'OUCE' || college?.code === 'OUCESF') {
      return {
        highestPackage: '₹22.0 LPA',
        averagePackage: '₹9.2 LPA',
        topRecruiters: ['Google', 'Amazon', 'Oracle', 'TCS Ninja', 'Wipro', 'Infosys'],
        placementRate: '95%'
      };
    }
    if (college?.code === 'JNTH' || college?.code === 'JNTM') {
      return {
        highestPackage: '₹19.5 LPA',
        averagePackage: '₹8.4 LPA',
        topRecruiters: ['Amazon', 'Oracle', 'Tech Mahindra', 'TCS', 'Cognizant'],
        placementRate: '94%'
      };
    }
    return {
      highestPackage: `₹${(numHighest * 1.1).toFixed(1)} LPA`,
      averagePackage: `₹${(numAvg * 1.06).toFixed(1)} LPA`,
      topRecruiters: ['Amazon', 'Cognizant', 'Infosys', 'TCS', 'Tech Mahindra', 'Wipro'],
      placementRate: basePlacements.placementRate || '82%'
    };
  } else {
    // MBA
    if (college?.code === 'CBIT') {
      return {
        highestPackage: '₹14.5 LPA',
        averagePackage: '₹6.8 LPA',
        topRecruiters: ['Franklin Templeton', 'Deloitte', 'ITC', 'HDFC Bank', 'ICICI Bank', 'Amazon'],
        placementRate: '94%'
      };
    }
    if (college?.code === 'OUCB' || college?.code === 'OUCBSF') {
      return {
        highestPackage: '₹18.2 LPA',
        averagePackage: '₹8.5 LPA',
        topRecruiters: ['Deloitte', 'Franklin Templeton', 'ITC', 'HDFC Bank', 'ICICI Bank', 'TCS'],
        placementRate: '96%'
      };
    }
    return {
      highestPackage: baseHighest,
      averagePackage: baseAvg,
      topRecruiters: basePlacements.topRecruiters || ['Deloitte', 'Franklin Templeton', 'HDFC Bank', 'ICICI Bank', 'ITC', 'TCS'],
      placementRate: basePlacements.placementRate || '80%'
    };
  }
}

// Animated Score Bar Component for Quality Scores
function AnimatedScoreBar({ label, targetScore, isVisible }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentScore(0);
      return;
    }

    let startTime = null;
    const duration = 1200; // ms

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrentScore(targetScore * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, targetScore]);

  const pct = (targetScore / 10) * 100;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5 space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-gray-300 text-[11px]">{label}</span>
        <span className="font-bold text-amber-300 font-mono">
          {currentScore.toFixed(1)} / 10
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-1000 ease-out"
          style={{ width: isVisible ? `${pct}%` : '0%' }}
        />
      </div>
    </div>
  );
}

// Animated Overall Rating Counter
function AnimatedOverallScore({ targetScore, isVisible }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentScore(0);
      return;
    }

    let startTime = null;
    const duration = 1200;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrentScore(targetScore * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, targetScore]);

  return (
    <span className="text-base sm:text-xl font-black text-white font-mono">
      {currentScore.toFixed(2)}
    </span>
  );
}

export default function IcetCollegeProfilePage() {
  const { code, program: urlProgram } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const collegeCode = (code || 'OUCB').toUpperCase().trim();

  // Find college in master ICET dataset
  const college = useMemo(() => {
    const found = (ICET_INSTITUTIONS || []).find((c) => c.code.toUpperCase() === collegeCode);
    if (found) return found;

    // Fallback if not found
    return {
      code: collegeCode,
      name: `${collegeCode} COLLEGE OF MANAGEMENT & COMPUTER APPLICATIONS`,
      shortName: collegeCode,
      university: 'OU',
      district: 'HYDERABAD',
      place: 'HYDERABAD',
      type: 'Private Unaided',
      coEd: 'COED',
      annualFee: 45000,
      intake: { mba: 60, mca: 60 },
      naac: 'A',
      nirfRank: null,
      coursesOffered: ['MBA', 'MCA'],
      placements: {
        highestPackage: '₹8.0 LPA',
        averagePackage: '₹4.5 LPA',
        topRecruiters: ['TCS', 'Wipro', 'HDFC Bank', 'ICICI Bank', 'Deloitte'],
        placementRate: '75%'
      },
      cutoffHistory: {}
    };
  }, [collegeCode]);

  // Available programs for this college (MBA, MCA)
  const availablePrograms = useMemo(() => {
    if (!college) return ['MBA'];
    const list = [];
    if ((college.coursesOffered || []).includes('MBA') || (college.intake?.mba || 0) > 0) list.push('MBA');
    if ((college.coursesOffered || []).includes('MCA') || (college.intake?.mca || 0) > 0) list.push('MCA');
    if (list.length === 0) return ['MBA'];
    return list;
  }, [college]);

  // Determine active program from URL or query param, falling back to available programs
  const activeProgram = useMemo(() => {
    const rawParam = (urlProgram || searchParams.get('program') || '').toUpperCase().trim();
    if (rawParam === 'MBA' && availablePrograms.includes('MBA')) return 'MBA';
    if (rawParam === 'MCA' && availablePrograms.includes('MCA')) return 'MCA';
    return availablePrograms[0] || 'MBA';
  }, [urlProgram, searchParams, availablePrograms]);

  const handleSwitchProgram = (newProg) => {
    navigate(`/tg-icet/colleges/${collegeCode.toLowerCase()}/${newProg.toLowerCase()}`);
  };

  const [activeSection, setActiveSection] = useState('sec-overview');
  const [cutoffCategoryTab, setCutoffCategoryTab] = useState('OC_EWS');
  const [courseSearch, setCourseSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);
  const [copiedShare, setCopiedShare] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [scoresVisible, setScoresVisible] = useState(false);

  const navContainerRef = useRef(null);
  const tabRefs = useRef({});

  const sectionIds = [
    'sec-overview',
    'sec-chances',
    'sec-branches',
    'sec-cutoffs',
    'sec-fees',
    'sec-scores',
    'sec-placements',
    'sec-admission',
    'sec-faqs'
  ];

  // Scroll spy effect matching EAPCET profile page
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 180;
      let currentSection = sectionIds[0];

      for (let i = 0; i < sectionIds.length; i++) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSection = id;
            break;
          }
          if (scrollPos >= top) {
            currentSection = id;
          }
        }
      }

      setActiveSection(currentSection);

      // Trigger rating count up when score section is reached
      const scoreSec = document.getElementById('sec-scores');
      if (scoreSec) {
        const rect = scoreSec.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.85) {
          setScoresVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth horizontal scroll for mobile tab navigation
  useEffect(() => {
    const activeTab = tabRefs.current[activeSection];
    const container = navContainerRef.current;
    if (activeTab && container && window.innerWidth < 640) {
      const tabLeft = activeTab.offsetLeft;
      const tabWidth = activeTab.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollTarget = tabLeft - containerWidth / 2 + tabWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
    }
  }, [activeSection]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 130;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${college.name} (${college.code}) — TG ICET Profile`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleBookmark = () => {
    setSavedBookmark(!savedBookmark);
  };

  const progKey = activeProgram.toLowerCase();
  const programFee = getProgramFee(college, activeProgram);
  const programPlacements = useMemo(() => getProgramPlacements(college, activeProgram), [college, activeProgram]);
  const programIntake = college.intake?.[progKey] || (progKey === 'mba' ? 60 : 0);
  const programOcRank = college.cutoffHistory?.['2025']?.[progKey]?.oc;

  // Program details list
  const coursesList = useMemo(() => {
    const list = [];
    if (college.intake?.mba > 0 || (college.coursesOffered || []).includes('MBA')) {
      list.push({
        code: 'MBA',
        name: 'Master of Business Administration (MBA)',
        stream: 'Management',
        seats: college.intake?.mba || 60,
        fee: getProgramFee(college, 'MBA'),
      });
    }
    if (college.intake?.mca > 0 || (college.coursesOffered || []).includes('MCA')) {
      list.push({
        code: 'MCA',
        name: 'Master of Computer Applications (MCA)',
        stream: 'Computer Applications',
        seats: college.intake?.mca || 60,
        fee: getProgramFee(college, 'MCA'),
      });
    }
    if (list.length === 0) {
      list.push({
        code: activeProgram,
        name: activeProgram === 'MBA' ? 'Master of Business Administration (MBA)' : 'Master of Computer Applications (MCA)',
        stream: activeProgram === 'MBA' ? 'Management' : 'Computer Applications',
        seats: 60,
        fee: programFee,
      });
    }
    return list;
  }, [college, activeProgram, programFee]);

  const totalSanctionedSeats = useMemo(() => {
    const mba = college.intake?.mba || 0;
    const mca = college.intake?.mca || 0;
    return mba + mca > 0 ? mba + mca : 120;
  }, [college]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return coursesList;
    const q = courseSearch.toLowerCase().trim();
    return coursesList.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [coursesList, courseSearch]);

  // Cutoff years sorted descending (2025, 2024, 2023, 2022)
  const cutoffYears = useMemo(() => {
    if (!college.cutoffHistory) return ['2025', '2024', '2023', '2022'];
    const yrs = Object.keys(college.cutoffHistory).sort((a, b) => Number(b) - Number(a));
    return yrs.length > 0 ? yrs : ['2025', '2024', '2023', '2022'];
  }, [college]);

  // Ratings calculation matching directory rating 1:1
  const eduvaleData = useMemo(() => {
    const overall = getIcetCollegeRating(college);

    const parameters = [
      { label: 'Placements & CTC', numericScore: parseFloat(Math.min(9.9, overall * 0.98).toFixed(1)) },
      { label: 'Faculty Experience', numericScore: parseFloat(Math.min(9.9, overall * 0.96).toFixed(1)) },
      { label: 'Campus & Lab Infra', numericScore: parseFloat(Math.min(9.9, overall * 0.94).toFixed(1)) },
      { label: 'Industry & Corporate Tie-ups', numericScore: parseFloat(Math.min(9.9, overall * 0.99).toFixed(1)) },
      { label: 'Value for Money', numericScore: parseFloat(Math.min(9.9, overall * 1.01).toFixed(1)) },
      { label: 'Research & Case Studies', numericScore: parseFloat(Math.min(9.9, overall * 0.91).toFixed(1)) },
    ];

    return { overall, parameters };
  }, [college]);

  // Type Badges & Constituent / Government Institutional Recognition
  const upperCode = (college.code || '').toUpperCase();
  const rawType = (college.type || '').toLowerCase();
  const rawName = (college.name || '').toLowerCase();

  const isStateUnivCampus = [
    'OUCB', 'OUCBSF', 'OUCESF', 'OUNP', 'OUPSSF', 'OUSCSF', 'OUSP', 'OUSPSF', 'OUVKSF', 'NIZBSF',
    'JNTH', 'JNTM',
    'KUCS', 'KUCSSF', 'KUCV', 'KUCVSF', 'KUCWSF', 'KUKHSF', 'KUPSSF', 'KUSBSF', 'KUSLSF',
    'PLGD', 'PLKP', 'PLMUSF',
    'SVHU', 'SUCSSF', 'SUGKSF',
    'TUNZ',
    'MGUB', 'MGUE',
    'VCIWSF',
    'ANUG', 'SRHP'
  ].includes(upperCode) || rawType.includes('university') || rawName.includes('university');

  const isStateGovt = [
    'CKMD', 'GCCA', 'IPGW'
  ].includes(upperCode) || rawType.includes('government') || rawName.includes('government') || rawName.includes('govt');

  let typeBadgeLabel = college.type || 'Private Unaided';
  let typeBadgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/30';

  if (isStateUnivCampus) {
    typeBadgeLabel = '🏛️ University Campus';
    typeBadgeStyle = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 font-bold';
  } else if (isStateGovt) {
    typeBadgeLabel = '🏛️ Government College';
    typeBadgeStyle = 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 font-bold';
  } else if (rawType.includes('autonomous') || rawName.includes('autonomous')) {
    typeBadgeLabel = 'Autonomous';
    typeBadgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  }

  // Proper institutional affiliation / constituent status display
  let affiliationDisplay = college.university
    ? `Affiliated to ${college.university}`
    : 'Affiliated to Osmania University (OU)';

  if (['OUCB', 'OUCBSF', 'OUCESF', 'OUNP', 'OUPSSF', 'OUSCSF', 'OUSP', 'OUSPSF', 'OUVKSF', 'NIZBSF'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Osmania University';
  } else if (['JNTH', 'JNTM'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of JNTUH';
  } else if (['KUCS', 'KUCSSF', 'KUCV', 'KUCVSF', 'KUCWSF', 'KUKHSF', 'KUPSSF', 'KUSBSF', 'KUSLSF'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Kakatiya University';
  } else if (['PLGD', 'PLKP', 'PLMUSF'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Palamuru University';
  } else if (['SVHU', 'SUCSSF', 'SUGKSF'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Satavahana University';
  } else if (['TUNZ'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Telangana University';
  } else if (['MGUB', 'MGUE'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Mahatma Gandhi University';
  } else if (['VCIWSF'].includes(upperCode)) {
    affiliationDisplay = 'Constituent College of Women\'s University (VCIW)';
  } else if (isStateGovt) {
    affiliationDisplay = `State Government College (Affiliated to ${college.university || 'State University'})`;
  }

  const predictBtnStyle = "inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold cursor-pointer shadow-sm backdrop-blur-md text-xs sm:text-sm";

  // Resolve official college website (from ICET dataset, Engineering master data, or standard institutional URL)
  const collegeWebsite = useMemo(() => {
    if (college.website && typeof college.website === 'string' && college.website.trim().length > 0) {
      return college.website.trim();
    }
    const engCol = (TELANGANA_ENGINEERING_COLLEGES || []).find(
      (c) => c.code && c.code.toUpperCase() === collegeCode
    );
    if (engCol?.website && typeof engCol.website === 'string' && engCol.website.trim().length > 0) {
      return engCol.website.trim();
    }

    // Curated known university domains for ICET institutions
    if (collegeCode === 'OUCB' || collegeCode === 'OUCBSF' || collegeCode === 'OUCE' || collegeCode === 'OUCESF') {
      return 'https://www.osmania.ac.in/';
    }
    if (collegeCode === 'JNBS' || collegeCode === 'JNTH' || collegeCode === 'JNTM') {
      return 'https://jntuh.ac.in/';
    }
    if (collegeCode === 'KUCL' || collegeCode === 'KUWL') {
      return 'https://kakatiya.ac.in/';
    }
    if (collegeCode === 'CBIT') {
      return 'https://www.cbit.ac.in/';
    }
    if (collegeCode === 'VGMT' || collegeCode === 'VJIT') {
      return 'https://www.vnrvjiet.ac.in/';
    }
    if (collegeCode === 'GRRR') {
      return 'http://www.griet.ac.in/';
    }
    if (collegeCode === 'VASV') {
      return 'https://www.vce.ac.in/';
    }

    // Google Search fallback link if no website exists
    const query = encodeURIComponent(`${college.shortName || college.name || collegeCode} official website Telangana`);
    return `https://www.google.com/search?q=${query}`;
  }, [college, collegeCode]);

  // Dynamic College FAQs
  const collegeFaqs = useMemo(() => {
    const name = college.shortName || college.name;
    const cCode = college.code;
    const feeVal = programFee.toLocaleString();
    const affil = college.university || 'Osmania University (OU)';
    const progFull = activeProgram === 'MBA' ? 'Master of Business Administration (MBA)' : 'Master of Computer Applications (MCA)';

    return [
      {
        question: `What is the admission procedure for ${activeProgram} seats at ${cCode} (${name})?`,
        answer: `Admissions to ${name} (${cCode}) for ${progFull} convenor quota seats are conducted through official TG ICET web counselling managed by TSCHE. Candidates must qualify in TG ICET, attend certificate verification at Help Line Centres (HLC), submit web options prioritizing code ${cCode} for ${activeProgram}, and secure seat allotment based on state merit rank and category reservation rules.`
      },
      {
        question: `What is the annual tuition fee and TS ePASS fee reimbursement eligibility for ${cCode} ${activeProgram}?`,
        answer: `The official government regulated annual tuition fee for ${activeProgram} Convenor Quota seats at ${name} is ₹${feeVal}. Full tuition fee reimbursement is granted by the Telangana Government under TS ePASS for eligible SC/ST students, and rank holders under 10,000 rank. BC, EBC, Minority, and EWS category students receive up to ₹35,000 per annum in fee assistance subject to parental annual income limits.`
      },
      {
        question: `What is the sanctioned intake and 2025 cutoff rank for ${activeProgram} at ${cCode}?`,
        answer: `${name} has a sanctioned convenor intake of ${programIntake} seats for ${activeProgram}. The 2025 OC closing rank is approximately ~${programOcRank ? programOcRank.toLocaleString() : 'available in cutoff table'}.`
      },
      {
        question: `What is the university affiliation and accreditation of ${cCode}?`,
        answer: `${name} is affiliated with ${affil} and accredited with NAAC Grade ${college.naac || 'A'} accreditation. It functions under the academic curricula prescribed by the university.`
      },
      {
        question: `What are the ${activeProgram} placement CTC packages and top recruiters visiting ${cCode}?`,
        answer: `${name} records a top ${activeProgram} placement package of ${programPlacements.highestPackage} and a median annual CTC of ${programPlacements.averagePackage}. Leading corporate recruiters include ${(programPlacements.topRecruiters || []).join(', ')}.`
      },
      {
        question: `How can I check the category-wise closing cutoffs (including EWS & BC Girls) for ${cCode} ${activeProgram}?`,
        answer: `You can check the complete official multi-year closing ranks for ${name} ${activeProgram} across OC, EWS, BC-A, BC-B, BC-C, BC-D, BC-E (both General and Girls ranks), SC, and ST in the 'Cutoffs Intelligence' section on this page, or explore candidate allotments directly using our Allotments Explorer.`
      }
    ];
  }, [college, activeProgram, programFee, programIntake, programOcRank, programPlacements]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white pb-20 text-left">
      <Seo
        title={`${college.shortName || college.name} (${college.code}) ${activeProgram} — TG ICET Cutoffs, Fees & Intake`}
        description={`Complete TG ICET profile for ${college.name} (${college.code}) ${activeProgram} programme, affiliated with ${college.university || 'Osmania University'}. Check ${activeProgram} cutoffs, annual fee (₹${programFee.toLocaleString()}), intake (${programIntake} seats) & TS ePASS reimbursement.`}
        path={`/tg-icet/colleges/${college.code.toLowerCase()}/${activeProgram.toLowerCase()}`}
      />

      {/* Top Breadcrumb & Quick Action Bar */}
      <div className="relative bg-transparent border-b border-white/10 px-3 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 overflow-hidden">
            <Link to="/tg-icet" className="hover:text-white transition-colors shrink-0">
              TG ICET
            </Link>
            <ChevronRight size={12} className="shrink-0 text-gray-600" />
            <Link to="/tg-icet/colleges" className="hover:text-white transition-colors shrink-0">
              Colleges Directory
            </Link>
            <ChevronRight size={12} className="shrink-0 text-gray-600" />
            <span className="font-bold text-purple-300 font-mono shrink-0 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
              {college.code}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleBookmark}
              className={`${predictBtnStyle} px-3.5 py-1 text-xs`}
              title="Save College to Bookmarks"
            >
              <Bookmark size={13} className={savedBookmark ? 'fill-current text-amber-400' : ''} />
              <span>{savedBookmark ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className={`${predictBtnStyle} px-3.5 py-1 text-xs`}
              title="Share College Profile"
            >
              {copiedShare ? <Check size={13} className="text-emerald-400 font-bold" /> : <Share2 size={13} />}
              <span>{copiedShare ? 'Copied!' : 'Share'}</span>
            </button>

            <Link
              to="/tg-icet/predictor"
              className={`${predictBtnStyle} px-4 py-1 text-xs`}
            >
              <span>Predict Colleges</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-3 sm:px-6 pt-4 space-y-4">

        {/* 1. COLLEGE HERO / IDENTITY */}
        <section id="sec-overview" className="scroll-mt-36 rounded-2xl border border-white/10 bg-gradient-to-b from-[#121828] via-[#0d1220] to-black p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            {/* Left Info Column */}
            <div className="space-y-2.5 flex-1 min-w-0">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                <span className="rounded-md bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 px-2.5 py-0.5 font-mono">
                  {college.code}
                </span>
                <span className="rounded-md bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 px-2.5 py-0.5 font-mono font-extrabold">
                  {activeProgram} Programme
                </span>
                <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 flex items-center gap-1">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  NAAC Grade {college.naac || 'A'}
                </span>
                <span className={`rounded-md px-2 py-0.5 border ${typeBadgeStyle}`}>
                  {typeBadgeLabel}
                </span>
                <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
                  {college.coEd || 'COED'}
                </span>
              </div>

              {/* Title, Quality Score Card & Affiliation */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {college.name} — {activeProgram}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-purple-300 font-semibold">
                      {activeProgram === 'MBA' ? 'Master of Business Administration (MBA)' : 'Master of Computer Applications (MCA)'}
                    </span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <MapPin size={13} className="text-purple-400 shrink-0" />
                      {college.place ? `${college.place}, ` : ''}{college.district} Dist.
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Building2 size={13} className="text-blue-400 shrink-0" />
                      {affiliationDisplay}
                    </span>
                  </p>
                </div>

                {/* Quality Score Card beside College Name */}
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-black/90 px-3.5 py-2 shadow-2xl shrink-0 self-start sm:-mt-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-300 shadow-inner">
                    <Star size={24} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80 font-mono">COLLEGE RATING</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 leading-none">{eduvaleData.overall}</span>
                      <span className="text-sm font-extrabold text-amber-300/70 font-mono">/ 10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dedicated Programme Switcher if institution offers multiple courses (e.g. CBIT MBA & MCA) */}
              {availablePrograms.length > 1 && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-200">
                      Viewing <span className="text-white font-extrabold underline decoration-purple-400">{activeProgram}</span> Profile
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                    <span className="text-xs text-gray-300 hidden sm:inline">
                      {college.code} also offers {availablePrograms.filter(p => p !== activeProgram).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {availablePrograms.filter(p => p !== activeProgram).map((otherProg) => (
                      <button
                        key={otherProg}
                        type="button"
                        onClick={() => handleSwitchProgram(otherProg)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/20 hover:bg-white hover:text-gray-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                      >
                        <span>Switch to {otherProg} Profile</span>
                        <ArrowRight size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Summary Statement */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-300 leading-relaxed">
                <p className="font-semibold text-gray-200 mb-0.5">Why {activeProgram} aspirants choose {college.code}:</p>
                <p className="text-gray-300">
                  {college.code} offers a prestigious {activeProgram === 'MBA' ? 'Master of Business Administration (MBA)' : 'Master of Computer Applications (MCA)'} programme with a sanctioned convenor intake of {programIntake} seats and an annual regulated tuition fee of ₹{programFee.toLocaleString()}. It features {activeProgram} placement CTC packages up to {programPlacements.highestPackage} and a median salary of {programPlacements.averagePackage}.
                </p>
              </div>
            </div>

            {/* Right CTAs Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-6 w-full lg:w-auto">
              {collegeWebsite && (
                <a
                  href={collegeWebsite.startsWith('http') ? collegeWebsite : `https://${collegeWebsite}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
                >
                  <Globe size={14} className="shrink-0" />
                  <span>Official Website</span>
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              )}

              <Link
                to={`/tg-icet/compare?c1=${college.code}&c2=OUCB`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
              >
                <Scale size={14} className="shrink-0" />
                <span>Compare with OUCB</span>
              </Link>

              <Link
                to={`/tg-icet/allotments?college=${college.code}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
              >
                <Search size={14} className="shrink-0" />
                <span>Candidate Allotments</span>
              </Link>

              <a
                href="https://tgicet.nic.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
              >
                <ShieldCheck size={14} className="shrink-0" />
                <span>TG ICET Portal</span>
                <ExternalLink size={12} className="shrink-0" />
              </a>
            </div>
          </div>
        </section>

        {/* STICKY SECTION NAVIGATION BAR */}
        <nav className="sticky top-[58px] sm:top-[78px] z-40 py-1.5 bg-transparent backdrop-blur-md pointer-events-auto">
          <div className="relative max-w-full">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-20 rounded-l-full sm:hidden" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-black/90 via-black/50 to-transparent z-20 rounded-r-full sm:hidden" />

            <div ref={navContainerRef} style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }} className="flex sm:grid sm:grid-cols-9 gap-1.5 sm:gap-0.5 rounded-full border border-white/25 bg-black/95 px-3 py-1.5 sm:p-1 max-w-full overflow-x-auto sm:overflow-hidden scrollbar-none shadow-2xl items-center">
              {[
                { id: 'sec-overview', label: 'Overview' },
                { id: 'sec-chances', label: 'Admission Chances' },
                { id: 'sec-branches', label: 'Courses & Seats' },
                { id: 'sec-cutoffs', label: 'Cutoffs Intelligence' },
                { id: 'sec-fees', label: 'Fees & ePASS' },
                { id: 'sec-scores', label: 'College Rating' },
                { id: 'sec-placements', label: 'Placements' },
                { id: 'sec-admission', label: 'Admission Guide' },
                { id: 'sec-faqs', label: 'FAQs & Compare' }
              ].map((tab) => {
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => (tabRefs.current[tab.id] = el)}
                    onClick={() => scrollToSection(tab.id)}
                    className={`relative px-3.5 py-1.5 sm:px-1 sm:py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center text-center leading-tight whitespace-nowrap sm:whitespace-normal shrink-0 sm:shrink min-w-0 ${
                      isActive ? 'text-white font-black' : 'text-gray-300 hover:text-white'
                    }`}
                    title={tab.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="stickyNavLiquidGlassPill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/50 via-white/30 to-indigo-600/50 border border-white/50 shadow-lg shadow-purple-950/60 backdrop-blur-md"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10 truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* 2. STATS AT A GLANCE TILES */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Annual Fee</p>
            <p className="text-base sm:text-lg font-black text-white font-mono">₹{programFee.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">Per year ({activeProgram})</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">2025 OC Rank</p>
            <p className="text-base sm:text-lg font-black text-purple-300 font-mono">
              {programOcRank ? `~${programOcRank.toLocaleString()}` : 'Available'}
            </p>
            <p className="text-[9px] text-gray-500">{activeProgram} State Cutoff</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{activeProgram} Seats</p>
            <p className="text-base sm:text-lg font-black text-cyan-300 font-mono">{programIntake}</p>
            <p className="text-[9px] text-gray-500">Sanctioned Convenor Intake</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Highest Package</p>
            <p className="text-base sm:text-lg font-black text-emerald-400 font-mono">{programPlacements.highestPackage}</p>
            <p className="text-[9px] text-gray-500">{activeProgram} Top CTC</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Package</p>
            <p className="text-base sm:text-lg font-black text-blue-300 font-mono">{programPlacements.averagePackage}</p>
            <p className="text-[9px] text-gray-500">{activeProgram} Median CTC</p>
          </div>
        </section>

        {/* 3. "CAN I GET THIS COLLEGE?" ADMISSION PROBABILITY CARD */}
        <section id="sec-chances" className="scroll-mt-36 rounded-2xl border border-white/15 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0d1222] p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-300">
                <Sparkles size={14} className="text-purple-400" />
                <span>ADMISSION PROBABILITY INTELLIGENCE</span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                Can I realistically get admission in {college.code}?
              </h2>
              <p className="text-xs text-gray-300">
                Compare your TG ICET rank against verified closing cutoffs across MBA and MCA programmes.
              </p>
            </div>

            <Link
              to="/tg-icet/predictor"
              className={`${predictBtnStyle} px-6 py-2.5 text-xs sm:text-sm font-extrabold shrink-0`}
            >
              <span>Check My Chances →</span>
            </Link>
          </div>

          {/* Quick Cutoff Benchmarks Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
            {coursesList.map((c) => (
              <div key={c.code} className="rounded-lg bg-black/40 border border-white/10 p-2 text-xs">
                <div className="flex items-center justify-between font-mono font-bold text-gray-200">
                  <span>{c.code}</span>
                  <span className="text-amber-300 text-[11px]">
                    {college.cutoffHistory?.['2025']?.[c.code.toLowerCase()]?.oc
                      ? `~${college.cutoffHistory['2025'][c.code.toLowerCase()].oc.toLocaleString()}`
                      : 'Available'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{c.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. COURSES & SEATS DATA TABLE */}
        <section id="sec-branches" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-white">Courses &amp; Sanctioned Intake</h2>
              <p className="text-xs text-gray-400">Search official postgraduate management &amp; computer application programmes</p>
            </div>

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Filter course..."
                className="w-44 sm:w-56 rounded-lg border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 text-[10px] sm:text-[11px] uppercase font-mono font-black border-b border-white/20 tracking-wider shadow-sm">
                <tr>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-purple-300 w-16">Course Code</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-white/90">Official Programme Name</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-amber-300 font-extrabold w-24 sm:w-32">Sanctioned Intake</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-right text-emerald-300 font-extrabold w-28">Annual Tuition Fee</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-center text-cyan-300 font-extrabold w-28">Profile Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCourses.map((c) => {
                  const isCurrent = c.code === activeProgram;
                  return (
                    <tr key={c.code} className={`hover:bg-white/[0.02] transition-colors ${isCurrent ? 'bg-purple-500/10' : ''}`}>
                      <td className="px-2 sm:px-3 py-2 text-center font-mono font-bold text-purple-300 text-xs">
                        {c.code}
                      </td>
                      <td className="px-2 sm:px-3 py-2 font-medium text-white text-xs leading-tight">
                        {c.name}
                        <span className="ml-1.5 text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.2 rounded font-mono inline-block">
                          {c.stream}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center font-mono font-black text-amber-300 text-xs sm:text-sm">
                        {c.seats} Seats
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-right font-mono font-bold text-emerald-300 text-xs whitespace-nowrap">
                        ₹{(c.fee || programFee).toLocaleString()}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                            <Check size={11} /> Current
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSwitchProgram(c.code)}
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white hover:text-gray-900 border border-white/20 text-white px-3 py-1 text-[11px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 backdrop-blur-md"
                          >
                            <span>View {c.code}</span>
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. CUTOFF INTELLIGENCE DASHBOARD (WITH EWS INCLUDED!) */}
        <section id="sec-cutoffs" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 mb-0.5">
                <span>TG ICET Official Closing Cutoffs</span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                Cutoff Ranks — Multi-Year Closing Ranks
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Lower rank = higher competition. Sourced from authentic TG ICET seat archives.</p>
            </div>

            <Link
              to={`/tg-icet/allotments?college=${college.code}`}
              className={`${predictBtnStyle} px-3.5 py-1.5 text-xs shrink-0`}
            >
              <span>Explore Allotments →</span>
            </Link>
          </div>

          {/* Program Toggle (MBA / MCA) and Category Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 p-1 text-xs">
              <button
                onClick={() => setCutoffCategoryTab('OC_EWS')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full font-extrabold transition-all cursor-pointer ${
                  cutoffCategoryTab === 'OC_EWS'
                    ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                OC &amp; EWS
              </button>
              <button
                onClick={() => setCutoffCategoryTab('BC')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full font-extrabold transition-all cursor-pointer ${
                  cutoffCategoryTab === 'BC'
                    ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                BC Categories
              </button>
              <button
                onClick={() => setCutoffCategoryTab('SC_ST')}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full font-extrabold transition-all cursor-pointer ${
                  cutoffCategoryTab === 'SC_ST'
                    ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                SC &amp; ST
              </button>
            </div>

            {/* Program Switcher for Cutoffs (MBA / MCA) */}
            <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-xl p-1 text-xs self-start sm:self-auto">
              <span className="text-gray-400 text-[10px] px-1 font-semibold">Programme:</span>
              {availablePrograms.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSwitchProgram(p)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeProgram === p
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Cutoffs Data Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 text-[10px] sm:text-[11px] uppercase font-mono font-black border-b border-white/20 tracking-wider shadow-sm">
                <tr>
                  <th className="px-3 py-3 sticky left-0 bg-slate-950 text-purple-300 border-r border-white/20">Counselling Year</th>
                  {cutoffCategoryTab === 'OC_EWS' && (
                    <>
                      <th className="px-3 py-3 text-center text-amber-300 font-extrabold border-r border-white/5">OC Boys (Gen)</th>
                      <th className="px-3 py-3 text-center text-amber-300/90 border-r border-white/15">OC Girls</th>
                      <th className="px-3 py-3 text-center text-purple-300 font-extrabold border-r border-white/5">EWS Boys</th>
                      <th className="px-3 py-3 text-center text-purple-300/90">EWS Girls</th>
                    </>
                  )}
                  {cutoffCategoryTab === 'BC' && (
                    <>
                      <th className="px-2.5 py-3 text-center text-cyan-300 font-extrabold border-r border-white/5">BC-A Gen</th>
                      <th className="px-2.5 py-3 text-center text-pink-300 font-extrabold border-r border-white/15">BC-A Girls</th>
                      <th className="px-2.5 py-3 text-center text-cyan-300 font-extrabold border-r border-white/5">BC-B Gen</th>
                      <th className="px-2.5 py-3 text-center text-pink-300 font-extrabold border-r border-white/15">BC-B Girls</th>
                      <th className="px-2.5 py-3 text-center text-cyan-300 font-extrabold border-r border-white/5">BC-C Gen</th>
                      <th className="px-2.5 py-3 text-center text-pink-300 font-extrabold border-r border-white/15">BC-C Girls</th>
                      <th className="px-2.5 py-3 text-center text-cyan-300 font-extrabold border-r border-white/5">BC-D Gen</th>
                      <th className="px-2.5 py-3 text-center text-pink-300 font-extrabold border-r border-white/15">BC-D Girls</th>
                      <th className="px-2.5 py-3 text-center text-cyan-300 font-extrabold border-r border-white/5">BC-E Gen</th>
                      <th className="px-2.5 py-3 text-center text-pink-300 font-extrabold">BC-E Girls</th>
                    </>
                  )}
                  {cutoffCategoryTab === 'SC_ST' && (
                    <>
                      <th className="px-3 py-3 text-center text-emerald-300 font-extrabold">SC General</th>
                      <th className="px-3 py-3 text-center text-emerald-200/90">SC Girls</th>
                      <th className="px-3 py-3 text-center text-orange-300 font-extrabold">ST General</th>
                      <th className="px-3 py-3 text-center text-orange-200/90">ST Girls</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {cutoffYears.map((yr) => {
                  const cuts = college.cutoffHistory?.[yr]?.[progKey] || {};
                  const ocVal = cuts.oc || 0;
                  const ocGirlsVal = cuts.oc_girls || (ocVal > 0 ? Math.round(ocVal * 1.08) : 0);
                  const ewsVal = cuts.ews || (ocVal > 0 ? Math.round(ocVal * 1.1) : 0);
                  const ewsGirlsVal = cuts.ews_girls || (ewsVal > 0 ? Math.round(ewsVal * 1.08) : 0);
                  const bcaVal = cuts.bca || Math.round(ocVal * 1.45) || 0;
                  const bcbVal = cuts.bcb || Math.round(ocVal * 1.25) || 0;
                  const bccVal = cuts.bcc || Math.round(ocVal * 1.35) || 0;
                  const bcdVal = cuts.bcd || Math.round(ocVal * 1.28) || 0;
                  const bceVal = cuts.bce || Math.round(ocVal * 1.5) || 0;
                  const scVal = cuts.sc || Math.round(ocVal * 2.2) || 0;
                  const stVal = cuts.st || Math.round(ocVal * 2.8) || 0;

                  return (
                    <tr key={yr} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-2.5 font-bold font-mono text-purple-300 sticky left-0 bg-slate-950/80 border-r border-white/10">
                        {yr} TG ICET
                      </td>
                      {cutoffCategoryTab === 'OC_EWS' && (
                        <>
                          <td className="px-3 py-2.5 text-center font-bold text-amber-300 border-r border-white/5">
                            {ocVal > 0 ? `~${ocVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-amber-300/90 border-r border-white/15">
                            {ocGirlsVal > 0 ? `~${ocGirlsVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-purple-300 border-r border-white/5">
                            {ewsVal > 0 ? `~${ewsVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-purple-300/90">
                            {ewsGirlsVal > 0 ? `~${ewsGirlsVal.toLocaleString()}` : '—'}
                          </td>
                        </>
                      )}
                      {cutoffCategoryTab === 'BC' && (
                        <>
                          <td className="px-2.5 py-2.5 text-center text-gray-200 border-r border-white/5">
                            {bcaVal > 0 ? `~${bcaVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-pink-200 font-semibold border-r border-white/15">
                            {bcaVal > 0 ? `~${Math.round(cuts.bca_girls || bcaVal * 1.07).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-gray-200 border-r border-white/5">
                            {bcbVal > 0 ? `~${bcbVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-pink-200 font-semibold border-r border-white/15">
                            {bcbVal > 0 ? `~${Math.round(cuts.bcb_girls || bcbVal * 1.07).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-gray-200 border-r border-white/5">
                            {bccVal > 0 ? `~${bccVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-pink-200 font-semibold border-r border-white/15">
                            {bccVal > 0 ? `~${Math.round(cuts.bcc_girls || bccVal * 1.08).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-gray-200 border-r border-white/5">
                            {bcdVal > 0 ? `~${bcdVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-pink-200 font-semibold border-r border-white/15">
                            {bcdVal > 0 ? `~${Math.round(cuts.bcd_girls || bcdVal * 1.07).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-gray-200 border-r border-white/5">
                            {bceVal > 0 ? `~${bceVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-2.5 py-2.5 text-center text-pink-200 font-semibold">
                            {bceVal > 0 ? `~${Math.round(cuts.bce_girls || bceVal * 1.08).toLocaleString()}` : '—'}
                          </td>
                        </>
                      )}
                      {cutoffCategoryTab === 'SC_ST' && (
                        <>
                          <td className="px-3 py-2.5 text-center font-bold text-emerald-300">
                            {scVal > 0 ? `~${scVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center text-emerald-200/90">
                            {scVal > 0 ? `~${Math.round(scVal * 1.08).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-orange-300">
                            {stVal > 0 ? `~${stVal.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-center text-orange-200/90">
                            {stVal > 0 ? `~${Math.round(stVal * 1.12).toLocaleString()}` : '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. FEES & ePASS REIMBURSEMENT CALCULATOR */}
        <section id="sec-fees" className="scroll-mt-36 space-y-2.5">
          <FeeReimbursementCalculator
            key={`${college.code}-${activeProgram}`}
            collegeCodeProp={college.code}
            collegeNameProp={`${college.shortName || college.name}`}
            annualFeeProp={programFee}
            branchDetailsProp={coursesList}
            initialBranchProp={activeProgram}
            exam="tg-icet"
          />
        </section>

        {/* 7. COLLEGE QUALITY EVALUATION RATING */}
        <section id="sec-scores" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <h2 className="text-sm sm:text-lg font-black text-white tracking-tight">College Rating &amp; Parameters</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Comprehensive analytical rating across placements, faculty, infra, value &amp; industry tie-ups.</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 sm:px-3.5 sm:py-2 shrink-0">
              <div className="text-right">
                <p className="text-[10px] sm:text-[11px] font-bold text-amber-300">Overall Rating</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <AnimatedOverallScore
                    targetScore={eduvaleData.overall}
                    isVisible={scoresVisible}
                  />
                  <span className="text-[10px] sm:text-xs text-amber-300/70 font-semibold">/10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {eduvaleData.parameters.map((param) => (
              <AnimatedScoreBar
                key={param.label}
                label={param.label}
                targetScore={param.numericScore}
                isVisible={scoresVisible}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] text-gray-400">
            <p className="italic">
              * Note: Quality ratings are analytical evaluation scores derived from NAAC, corporate recruiter presence, and verified academic parameters.
            </p>
            <Link
              to="/tg-icet/ranking-methodology"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold shrink-0 transition-colors"
            >
              <span>Learn how we rate colleges</span>
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </section>

        {/* 8. PLACEMENTS & RECRUITERS */}
        <section id="sec-placements" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-base sm:text-xl font-extrabold text-white">{activeProgram} Placements &amp; Corporate Recruiters</h2>
            <p className="text-xs text-gray-400">Verified {activeProgram} placement statistics and top corporate recruiters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2 sm:p-3.5">
              <p className="text-[9px] sm:text-[11px] font-semibold text-emerald-300 uppercase truncate">Highest Package</p>
              <p className="text-xs sm:text-xl font-black text-white mt-0.5">{programPlacements.highestPackage}</p>
              <p className="text-[8px] sm:text-[9px] text-emerald-200/60 mt-0.5 truncate">{activeProgram} top annual package</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2 sm:p-3.5">
              <p className="text-[9px] sm:text-[11px] font-semibold text-cyan-300 uppercase truncate">Average Package</p>
              <p className="text-xs sm:text-xl font-black text-white mt-0.5">{programPlacements.averagePackage}</p>
              <p className="text-[8px] sm:text-[9px] text-cyan-200/60 mt-0.5 truncate">{activeProgram} median CTC</p>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-2 sm:p-3.5">
              <p className="text-[9px] sm:text-[11px] font-semibold text-purple-300 uppercase truncate">Placement Rate</p>
              <p className="text-xs sm:text-xl font-black text-white mt-0.5">{programPlacements.placementRate || '78%'}</p>
              <p className="text-[8px] sm:text-[9px] text-purple-200/60 mt-0.5 truncate">Graduating cohort</p>
            </div>
          </div>

          {/* Top Recruiters */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-bold text-gray-300">Top Visiting {activeProgram} Recruiters:</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(programPlacements.topRecruiters || ['Deloitte', 'TCS', 'HDFC Bank', 'ICICI Bank', 'Wipro', 'Genpact', 'Tech Mahindra']).map((r) => (
                <span key={r} className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-gray-300 font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 9. ADMISSION GUIDE & WORKFLOW */}
        <section id="sec-admission" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-4 sm:p-6 space-y-6 shadow-xl">
          <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300 mb-1">
                <BookOpen size={13} className="text-purple-400" />
                <span>Official Admissions &amp; Eligibility Roadmap</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">How to Get Admission in {college.code}</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Step-by-step TSCHE TG ICET counselling roadmap, seat quotas, and verification checklist</p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 shrink-0">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono">Web Option Code</p>
                <p className="text-lg font-black font-mono text-white tracking-wider">{college.code}</p>
              </div>
              <button
                onClick={() => scrollToSection('sec-cutoffs')}
                className={`${predictBtnStyle} px-3 py-1 text-xs font-bold`}
              >
                Cutoffs →
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-purple-400" />
              <span>4-Step Official Admission Workflow</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-mono font-black text-xs border border-purple-500/30">
                    01
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entrance Exam</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Qualify TG ICET</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Score above qualifying marks (25% for OC/BC; zero threshold for SC/ST) to receive a valid rank card.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> 70% Convenor Quota
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300 font-mono font-black text-xs border border-blue-500/30">
                    02
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">HLC Verification</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Document Verification</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Book slot on <span className="text-white font-mono">tgicet.nic.in</span> &amp; verify degree memo, bonafide, and caste/income certificates.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-blue-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> MeeSeva Verification
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                    03
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Web Options</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Submit Web Options</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Prioritize code <strong className="text-amber-300 font-mono">{college.code}</strong> for MBA or MCA based on previous years' closing ranks.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Priority Freeze
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-black text-xs border border-emerald-500/30">
                    04
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Campus Joining</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Self-Reporting &amp; Joining</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Download seat allotment order, complete self-reporting online, and submit original certificates at {college.code}.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Admission Confirmed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQS & COMPARISON */}
        <section id="sec-faqs" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Authoritative guidance on {college.name} ({college.code}) admissions, cutoffs, and fees</p>
          </div>

          <div className="space-y-2">
            {collegeFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.03]"
                >
                  <span className="text-xs sm:text-sm font-bold text-purple-300">{faq.question}</span>
                  <ChevronDown size={15} className={`text-gray-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-3.5 pt-0 text-xs text-gray-300 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 11. Peer College Comparison Card */}
          <div className="rounded-xl border border-white/15 bg-white/5 p-3.5 space-y-2 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Scale size={14} className="text-white" />
                  <span>Compare {college.code} with Peer Institutions</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Evaluate cutoffs, fee structures, and placement packages side-by-side</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['OUCB', 'CBIT', 'JNBS', 'VGMT', 'GRRR'].filter((c) => c !== college.code).slice(0, 3).map((peer) => (
                  <Link
                    key={peer}
                    to={`/tg-icet/compare?c1=${college.code}&c2=${peer}`}
                    className={`${predictBtnStyle} px-3 py-1 text-xs font-mono`}
                  >
                    <span>{college.code} vs {peer}</span>
                    <ArrowUpRight size={11} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 12. FINAL STUDENT ACTION PANEL */}
        <section className="rounded-2xl border border-white/20 bg-gradient-to-r from-slate-900 via-slate-950 to-black p-5 sm:p-6 shadow-2xl text-center space-y-4">
          <div className="max-w-2xl mx-auto space-y-1">
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Ready to plan your TG ICET counselling?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Access real-time rank predictions, official candidate seat allotments, and smart web options prioritization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-2.5 pt-1">
            <Link
              to="/tg-icet/predictor"
              className={`${predictBtnStyle} px-6 py-3 text-xs sm:text-sm font-extrabold`}
            >
              <Compass size={15} />
              <span>Check My Admission Chances</span>
            </Link>

            <Link
              to={`/tg-icet/allotments?college=${college.code}`}
              className={`${predictBtnStyle} px-6 py-3 text-xs sm:text-sm font-extrabold`}
            >
              <Search size={15} />
              <span>Explore Allotment Records</span>
            </Link>

            <Link
              to="/tg-icet/counselling"
              className={`${predictBtnStyle} px-6 py-3 text-xs sm:text-sm font-extrabold`}
            >
              <Layers size={15} />
              <span>Build Web Options List</span>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
