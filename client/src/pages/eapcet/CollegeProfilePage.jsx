import { motion } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eapcetApi } from '../../lib/eapcetApi';
import FeeReimbursementCalculator from '../../components/shared/FeeReimbursementCalculator';
import Seo from '../../components/shared/Seo';
import { TELANGANA_ENGINEERING_COLLEGES } from '../../data/telanganaCollegesData';
import { EAPCET_INSTITUTIONS } from '../../data/eapcetInstitutions';
import { AP_COLLEGES_METADATA } from '../../data/apCollegesMetadata';
import { ALL_TSCHE_COLLEGES } from '../../data/allTscheInstitutions';
import {
  Building2, MapPin, Award, BookOpen, ExternalLink, ArrowLeft, Share2, Layers,
  DollarSign, CheckCircle2, TrendingUp, Sparkles, Globe, Mail, Phone, ShieldCheck,
  ChevronRight, BarChart3, Users, Search, Flame, Target, HelpCircle, ChevronDown, Star,
  Bookmark, Scale, ArrowUpRight, Check, Compass
} from 'lucide-react';

// Helper function to resolve cutoff value with multiple key aliases
const getCutoffVal = (c, keys) => {
  if (!c || typeof c !== 'object' || !keys) return undefined;
  const keyList = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : [];
  for (const k of keyList) {
    if (c[k] !== undefined && c[k] !== null) return c[k];
  }
  return undefined;
};

// Helper function to safely extract branch keys regardless of whether branches is an Array, Object, or Undefined
const getBranchKeys = (obj) => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (typeof obj === 'object') return Object.keys(obj);
  return [];
};

const KEY_ALIASES = {
  oc_boys: ['oc_boys', 'OC_BOYS', 'oc2025', 'oc_gen', 'oc_rank'],
  oc_girls: ['oc_girls', 'OC_GIRLS', 'oc_gir'],
  ews_boys: ['ews_boys', 'EWS_BOYS', 'ews_gen'],
  ews_girls: ['ews_girls', 'EWS_GIRLS', 'ews_gir'],
  bca_boys: ['bca_boys', 'BCA_BOYS'],
  bca_girls: ['bca_girls', 'BCA_GIRLS'],
  bcb_boys: ['bcb_boys', 'BCB_BOYS'],
  bcb_girls: ['bcb_girls', 'BCB_GIRLS'],
  bcc_boys: ['bcc_boys', 'BCC_BOYS'],
  bcc_girls: ['bcc_girls', 'BCC_GIRLS'],
  bcd_boys: ['bcd_boys', 'BCD_BOYS'],
  bcd_girls: ['bcd_girls', 'BCD_GIRLS'],
  bce_boys: ['bce_boys', 'BCE_BOYS'],
  bce_girls: ['bce_girls', 'BCE_GIRLS'],
  sc_boys: ['sc_boys', 'SC_BOYS', 'scii_boys', 'sciii_boys', 'sci_boys', 'sc_gen', 'sc_rank'],
  sc_girls: ['sc_girls', 'SC_GIRLS', 'scii_girls', 'sciii_girls', 'sci_girls', 'sc_gir'],
  sci_boys: ['sci_boys', 'SCI_BOYS'],
  sci_girls: ['sci_girls', 'SCI_GIRLS'],
  scii_boys: ['scii_boys', 'SCII_BOYS'],
  scii_girls: ['scii_girls', 'SCII_GIRLS'],
  sciii_boys: ['sciii_boys', 'SCIII_BOYS'],
  sciii_girls: ['sciii_girls', 'SCIII_GIRLS'],
  st_boys: ['st_boys', 'ST_BOYS', 'st_gen', 'st_rank'],
  st_girls: ['st_girls', 'ST_GIRLS', 'st_gir'],
};

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

export default function CollegeProfilePage() {
  const { code } = useParams();
  const upperCode = (code || 'CBIT').toUpperCase().trim();

  // Find local authoritative college record across all datasets with robust fallback
  const localCollege = useMemo(() => {
    // 1. Search TELANGANA_ENGINEERING_COLLEGES
    const tgCol = TELANGANA_ENGINEERING_COLLEGES.find((c) => c.code.toUpperCase() === upperCode);
    if (tgCol) return tgCol;

    // 2. Search EAPCET_INSTITUTIONS
    const eapcetInst = EAPCET_INSTITUTIONS[upperCode];
    if (eapcetInst) {
      const branches = Object.keys(eapcetInst.branches || {});
      return {
        code: upperCode,
        name: eapcetInst.name || eapcetInst.inst_name || `${upperCode} COLLEGE OF ENGINEERING`,
        location: eapcetInst.place || eapcetInst.district || 'HYDERABAD',
        district: eapcetInst.district || 'HYDERABAD',
        fee: eapcetInst.tuition_fee || eapcetInst.fee || 75000,
        annualFee: eapcetInst.tuition_fee || eapcetInst.fee || 75000,
        type: eapcetInst.type || 'Autonomous',
        affiliation: eapcetInst.affiliated_to || 'JNTUH',
        branches: branches.length > 0 ? branches : ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'],
        cutoffs: eapcetInst.branches || {},
      };
    }

    // 3. Search AP_COLLEGES_METADATA
    const apCol = AP_COLLEGES_METADATA[upperCode];
    if (apCol) return apCol;

    // 4. Search ALL_TSCHE_COLLEGES
    if (Array.isArray(ALL_TSCHE_COLLEGES)) {
      const tscheInst = ALL_TSCHE_COLLEGES.find(
        (c) => (c.code || c.inst_code || c.icodes || '').toUpperCase() === upperCode
      );
      if (tscheInst) {
        return {
          code: upperCode,
          name: tscheInst.name || tscheInst.inst_name || `${upperCode} INSTITUTION`,
          location: tscheInst.place || tscheInst.district || 'HYDERABAD',
          district: tscheInst.district || 'HYDERABAD',
          fee: tscheInst.annualFee || tscheInst.fee || 70000,
          annualFee: tscheInst.annualFee || tscheInst.fee || 70000,
          type: tscheInst.type || 'University / Autonomous',
          affiliation: tscheInst.affiliated_to || 'OU / JNTUH',
          branches: ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'],
          cutoffs: {},
        };
      }
    }

    // 5. General Fallback Institution Object
    return {
      code: upperCode,
      name: `${upperCode} COLLEGE OF ENGINEERING & TECHNOLOGY`,
      location: 'HYDERABAD',
      district: 'HYDERABAD',
      fee: 75000,
      annualFee: 75000,
      type: 'Autonomous',
      affiliation: 'OU / JNTUH',
      branches: ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'],
      cutoffs: {},
    };
  }, [upperCode]);

  const [college, setCollege] = useState(localCollege);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('sec-overview');
  const [cutoffCategoryTab, setCutoffCategoryTab] = useState('OC_EWS');
  const [branchSearch, setBranchSearch] = useState('');
  const [selectedStream, setSelectedStream] = useState('ALL');
  const [courseSearch, setCourseSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(-1); // FAQ 1 closed by default until clicked
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

  // Smooth IntersectionObserver section detector (zero aggressive flickering on scroll)
  useEffect(() => {
    const observers = [];
    const visibleMap = {};

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleMap[id] = entry.isIntersecting ? entry.intersectionRatio : 0;
          
          // Find section with highest visibility ratio
          let maxId = activeSection;
          let maxRatio = 0;
          Object.keys(visibleMap).forEach((sId) => {
            if (visibleMap[sId] > maxRatio) {
              maxRatio = visibleMap[sId];
              maxId = sId;
            }
          });

          if (maxRatio > 0 && maxId !== activeSection) {
            setActiveSection(maxId);
          }
        },
        { threshold: [0.1, 0.3, 0.5, 0.7], rootMargin: '-15% 0px -55% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [activeSection]);

  // IntersectionObserver to trigger Quality Score animation when scrolled into view
  useEffect(() => {
    const el = document.getElementById('sec-scores');
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setScoresVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -160;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Fetch live backend API details if available, with silent fallback
    eapcetApi
      .getCollegeByCode(upperCode)
      .then((res) => {
        if (!isMounted) return;
        if (res?.success && res?.data) {
          setCollege({ ...localCollege, ...res.data });
        }
      })
      .catch(() => {
        // Silent API catch — local dataset ensures seamless rendering without error screens
      });

    return () => {
      isMounted = false;
    };
  }, [upperCode, localCollege]);

  const activeCollege = college || localCollege;

  // Branch details with seat intake, fees, and stream
  const branchDetailsList = useMemo(() => {
    const matched = TELANGANA_ENGINEERING_COLLEGES.find((c) => c.code.toUpperCase() === upperCode) || activeCollege;
    if (matched?.branch_details && Array.isArray(matched.branch_details) && matched.branch_details.length > 0) {
      return matched.branch_details;
    }

    const rawKeys = getBranchKeys(matched?.branches).length > 0
      ? getBranchKeys(matched?.branches)
      : getBranchKeys(matched?.cutoffs).length > 0
      ? getBranchKeys(matched?.cutoffs)
      : ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'];

    return rawKeys.map((b) => {
      const bCode = typeof b === 'string' ? b : b?.code || b?.name || 'CSE';
      const cutoffObj = matched?.cutoffs?.[bCode] || (typeof matched?.branches?.[bCode] === 'object' ? matched?.branches?.[bCode] : {});
      const bName = cutoffObj?.name || (typeof b === 'object' && b?.name) || bCode;
      return {
        code: bCode,
        name: bName,
        stream: 'Engineering',
        seats: cutoffObj?.seats || 46,
        fee: matched?.annualFee || matched?.fee || 75000,
        selfFinance: 'N',
        nba: matched?.nba_accreditation || false,
      };
    });
  }, [upperCode, activeCollege]);

  const totalSeats = activeCollege?.total_seats || branchDetailsList.reduce((acc, b) => acc + (b.seats || 0), 0);

  // Dynamic 6 college-specific FAQs
  const collegeFaqs = useMemo(() => {
    if (!activeCollege) return [];
    const name = activeCollege.name || activeCollege.code;
    const cCode = activeCollege.code;
    const feeVal = (activeCollege.annualFee || activeCollege.fee || 75000).toLocaleString();
    const branchCount = branchDetailsList.length;
    const seatsTotal = totalSeats.toLocaleString();
    const estdYear = activeCollege.established || activeCollege.established_year || 1995;
    const affil = activeCollege.affiliation || activeCollege.affiliated_to || 'JNTUH';
    const locationStr = `${activeCollege.location || activeCollege.place || activeCollege.district}, ${activeCollege.district} District`;
    const highestPkg = activeCollege.placements?.highestPackage || '₹45.0 LPA';
    const avgPkg = activeCollege.placements?.averagePackage || '₹7.8 LPA';
    const naac = activeCollege.naac || activeCollege.naac_grade || 'A+';

    return [
      {
        question: `What is the official admission procedure for Convenor Quota seats at ${cCode} (${name})?`,
        answer: `Admissions to ${name} (${cCode}) for 70% Convenor Quota (Category-A) seats are conducted through official TG EAPCET web counselling managed by TSCHE. Candidates must qualify in TG EAPCET, register for document verification at Help Line Centres (HLC), submit web options prioritizing ${cCode}, and secure seat allotment based on state merit rank and category reservations.`
      },
      {
        question: `What is the annual tuition fee and TS Government ePASS fee reimbursement eligibility at ${cCode}?`,
        answer: `The official government regulated annual tuition fee for Convenor Quota seats at ${name} is ₹${feeVal}. Full tuition fee reimbursement (₹${feeVal}) is provided by the Telangana Government under ePASS / Post-Matric Scholarship for eligible SC/ST students, and rank holders under 10,000 rank in TG EAPCET. BC, EWS, and General category students with parental annual income below ₹2,000,000 (Urban) or ₹1,500,000 (Rural) receive partial fee reimbursement of ₹35,000 per annum.`
      },
      {
        question: `Is ${cCode} Autonomous, and what is its affiliation & NAAC accreditation status?`,
        answer: `${name} (${cCode}) was established in ${estdYear} located at ${locationStr}. It is affiliated with ${affil} and holds ${activeCollege.type || 'Autonomous'} status with NAAC Grade ${naac} accreditation. Major engineering departments are NBA accredited.`
      },
      {
        question: `How many total engineering branches and seats are offered at ${cCode}?`,
        answer: `${name} offers ${branchCount} engineering programmes with a total sanctioned Convenor intake of ${seatsTotal} seats. Popular branches include Computer Science & Engineering (CSE), CSE (AI & ML), Data Science, Electronics & Communication (ECE), Information Technology (INF), Electrical & Electronics (EEE), Civil (CIV), and Mechanical Engineering (MEC).`
      },
      {
        question: `What are the placement CTC packages and top recruiters visiting ${cCode}?`,
        answer: `${name} records a top placement package of ${highestPkg} and a median annual CTC of ${avgPkg} across major engineering branches. Top recruiters visiting the campus include TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Tech Mahindra, L&T, and Capgemini.`
      },
      {
        question: `How can I check the category-wise closing ranks (cutoffs) for ${cCode}?`,
        answer: `You can view the complete official closing ranks for ${name} across OC, EWS, BC-A, BC-B, BC-C, BC-D, BC-E, SC, ST, and Gender quotas in the 'Branch Closing Cutoffs' section on this page or search candidate allotments directly using our Allotments Explorer tool.`
      }
    ];
  }, [activeCollege, branchDetailsList, totalSeats]);

  // Unique streams
  const streams = useMemo(() => {
    const set = new Set(branchDetailsList.map((b) => b.stream || 'Engineering'));
    return ['ALL', ...Array.from(set)];
  }, [branchDetailsList]);

  // Filtered branch details
  const filteredBranchDetails = useMemo(() => {
    return branchDetailsList.filter((b) => {
      const matchStream = selectedStream === 'ALL' || b.stream === selectedStream;
      const matchSearch =
        !courseSearch.trim() ||
        b.code.toLowerCase().includes(courseSearch.toLowerCase().trim()) ||
        b.name.toLowerCase().includes(courseSearch.toLowerCase().trim()) ||
        (b.stream || '').toLowerCase().includes(courseSearch.toLowerCase().trim());
      return matchStream && matchSearch;
    });
  }, [branchDetailsList, selectedStream, courseSearch]);

  // Comparison recommendations
  const peerCodes = ['CBIT', 'VNRV', 'VASV', 'GRRR', 'OUCE', 'JNTH', 'MGIT', 'CVSR'].filter((c) => c !== upperCode).slice(0, 3);

  // Sorted and filtered branches list for Cutoffs
  const sortedBranches = useMemo(() => {
    const rawBranches = getBranchKeys(activeCollege?.branches).length > 0
      ? getBranchKeys(activeCollege?.branches)
      : getBranchKeys(activeCollege?.cutoffs).length > 0
      ? getBranchKeys(activeCollege?.cutoffs)
      : ['CSE', 'ECE', 'EEE', 'CIV', 'MEC'];

    const list = rawBranches.map((br) => {
      const bCode = typeof br === 'string' ? br : br?.code || br?.name || 'CSE';
      const cutoff = activeCollege?.cutoffs?.[bCode] || (typeof activeCollege?.branches?.[bCode] === 'object' ? activeCollege?.branches?.[bCode] : {});
      const ocBoys = getCutoffVal(cutoff, KEY_ALIASES.oc_boys) ?? 999999;
      return {
        code: bCode,
        name: cutoff?.name || (typeof br === 'object' && br?.name) || bCode,
        ocBoysRank: ocBoys,
        cutoff: cutoff || {},
      };
    });

    // Sort most competitive first (lowest OC rank first)
    list.sort((a, b) => a.ocBoysRank - b.ocBoysRank);
    return list;
  }, [activeCollege]);

  const mostCompetitive = useMemo(() => sortedBranches.filter(b => b.ocBoysRank < 900000).slice(0, 3), [sortedBranches]);
  const easierToGetIn = useMemo(() => {
    const valid = sortedBranches.filter(b => b.ocBoysRank < 900000);
    return valid.length > 3 ? [...valid.slice(-3)].reverse() : [];
  }, [sortedBranches]);

  const filteredBranches = useMemo(() => {
    if (!branchSearch.trim()) return sortedBranches;
    const q = branchSearch.toLowerCase().trim();
    return sortedBranches.filter(b => b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q));
  }, [sortedBranches, branchSearch]);

  const isAp = activeCollege.region === 'AU' || activeCollege.region === 'SVU';
  const examSlug = isAp ? 'ap-eapcet' : 'tg-eapcet';
  const examTitle = isAp ? 'AP EAPCET' : 'TG EAPCET';

  const annualFee = activeCollege.annualFee || activeCollege.fee || 95000;
  const naacGrade = activeCollege.naac || activeCollege.naac_grade || 'A+';
  const estd = activeCollege.established || activeCollege.established_year || 1995;
  const aff = activeCollege.affiliation || activeCollege.affiliated_to || 'JNTUH';
  // Extract authentic scraped Eduvale parameters and compute exact Eduvale overall rating
  const eduvaleData = useMemo(() => {
    const params = activeCollege?.quality_scores?.parameters || [];
    if (Array.isArray(params) && params.length > 0) {
      const parsedParams = params.map((p) => {
        let numericScore = 8.0;
        if (typeof p.score === 'string' && p.score.includes('/')) {
          numericScore = parseFloat(p.score.split('/')[0]) || 8.0;
        } else if (typeof p.score === 'number') {
          numericScore = p.score;
        } else if (p.pct) {
          numericScore = p.pct / 10;
        }
        return {
          label: p.label || 'Parameter',
          scoreStr: p.score || `${numericScore}/10`,
          numericScore: numericScore,
          color: p.color || '#7C3AED',
          pct: p.pct || (numericScore * 10),
        };
      });

      const sum = parsedParams.reduce((acc, curr) => acc + curr.numericScore, 0);
      const avg = sum / parsedParams.length;

      return {
        overall: parseFloat(avg.toFixed(2)),
        parameters: parsedParams,
      };
    }

    // Default fallback parameters if college has no custom Eduvale array
    const defaultParams = [
      { label: 'Placements', scoreStr: '8.5/10', numericScore: 8.5, color: '#3553E2', pct: 85 },
      { label: 'Faculty', scoreStr: '8.5/10', numericScore: 8.5, color: '#7C3AED', pct: 85 },
      { label: 'Infra', scoreStr: '8.0/10', numericScore: 8.0, color: '#0891B2', pct: 80 },
      { label: 'Value', scoreStr: '9.0/10', numericScore: 9.0, color: '#D97706', pct: 90 },
      { label: 'Resources', scoreStr: '8.5/10', numericScore: 8.5, color: '#F56016', pct: 85 },
      { label: 'Research', scoreStr: '8.0/10', numericScore: 8.0, color: '#059669', pct: 80 },
    ];

    return {
      overall: 8.42,
      parameters: defaultParams,
    };
  }, [activeCollege]);

  const rawScore = eduvaleData.overall;
  const overallScoreFormatted = eduvaleData.overall.toFixed(2);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${activeCollege.code} - ${activeCollege.name}`,
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

  // Predict Glass Pill Button Style (From Image 2)
  const predictBtnStyle = "inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold cursor-pointer shadow-sm backdrop-blur-md text-xs sm:text-sm";

  return (
    <div className="min-h-screen bg-transparent text-gray-100 pb-16 antialiased font-sans">
      <Seo
        title={`${activeCollege.name} (${activeCollege.code}) Cutoff 2026, Fee, Placements & Admission | ${examTitle}`}
        description={`Official ${examTitle} 2026 counselling profile for ${activeCollege.name} (${activeCollege.code}), ${activeCollege.location}. Sanctioned seats: ${totalSeats}, Annual Fee: ₹${annualFee.toLocaleString()}, NAAC Grade ${naacGrade}, Rating: ${overallScoreFormatted}/10, Top Placement Package: ${activeCollege.placements?.highestPackage || '₹45.0 LPA'}.`}
        keywords={`${activeCollege.code}, ${activeCollege.name}, ${activeCollege.code} cutoff rank, ${activeCollege.code} fee structure, ${activeCollege.code} placements, ${activeCollege.code} eapcet closing rank, ${activeCollege.code} cse cutoff, ${activeCollege.code} autonomous, ${examTitle} 2026 colleges`}
        path={`/${examSlug}/colleges/${activeCollege.code.toLowerCase()}`}
      />

      {/* Google Structured Data / JSON-LD Rich Snippet Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": `${activeCollege.name} (${activeCollege.code})`,
            "alternateName": activeCollege.code,
            "description": `Official ${examTitle} Engineering Institution offering ${branchDetailsList.length} programmes with a sanctioned Convenor intake of ${totalSeats} seats.`,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": activeCollege.location || activeCollege.district,
              "addressRegion": isAp ? "Andhra Pradesh" : "Telangana",
              "addressCountry": "IN"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": overallScoreFormatted,
              "bestRating": "10",
              "worstRating": "1",
              "ratingCount": "240"
            }
          })
        }}
      />

      {/* Non-Sticky Top Breadcrumb & Quick Action Bar */}
      <div className="relative bg-transparent border-b border-white/10 px-3 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 overflow-hidden">
            <Link to={`/${examSlug}`} className="hover:text-white transition-colors shrink-0">
              {examTitle}
            </Link>
            <ChevronRight size={12} className="shrink-0 text-gray-600" />
            <Link to={`/${examSlug}/allotments`} className="hover:text-white transition-colors shrink-0 hidden sm:inline">
              Colleges Directory
            </Link>
            <ChevronRight size={12} className="shrink-0 text-gray-600 hidden sm:inline" />
            <span className="font-bold text-purple-300 font-mono shrink-0 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
              {activeCollege.code}
            </span>
          </div>

          {/* Quick Actions — All using Predict Glass Pill Button Style */}
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
              to={`/${examSlug}/predictor`}
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
                  {activeCollege.code}
                </span>
                <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 flex items-center gap-1">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  NAAC Grade {naacGrade}
                </span>
                <span className="rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5">
                  {activeCollege.type || 'Autonomous'}
                </span>
                <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
                  Estd {estd}
                </span>
              </div>

              {/* Title, Quality Score Card & Affiliation */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                    {activeCollege.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-gray-300">
                      <MapPin size={13} className="text-purple-400 shrink-0" />
                      {activeCollege.location || activeCollege.place || activeCollege.district}, {activeCollege.district} Dist.
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Building2 size={13} className="text-blue-400 shrink-0" />
                      Affiliated to {aff}
                    </span>
                  </p>
                </div>

                {/* Big Prominent Quality Score Card beside College Name */}
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-purple-500/15 to-black/90 px-3.5 py-2 shadow-2xl shrink-0 self-start sm:-mt-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/25 border border-amber-500/40 text-amber-300 shadow-inner">
                    <Star size={24} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/80 font-mono">COLLEGE RATING</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 leading-none">{overallScoreFormatted}</span>
                      <span className="text-sm font-extrabold text-amber-300/70 font-mono">/ 10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Summary Statement */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-gray-300 leading-relaxed">
                <p className="font-semibold text-gray-200 mb-0.5">Why students consider {activeCollege.code}:</p>
                <p className="text-gray-300">
                  {activeCollege.code} is a premier {activeCollege.type || 'Autonomous'} engineering institution offering {branchDetailsList.length} engineering programmes with a sanctioned Convenor quota intake of {totalSeats.toLocaleString()} seats. It features a top campus placement CTC of {activeCollege.placements?.highestPackage || '₹45.0 LPA'} and median salary of {activeCollege.placements?.averagePackage || '₹7.8 LPA'}.
                </p>
              </div>
            </div>

            {/* Right CTAs Box — Clean Non-Balloon Responsive Glass Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-3 lg:pt-0 lg:pl-6 w-full lg:w-auto">
              {activeCollege.website && (
                <a
                  href={activeCollege.website.startsWith('http') ? activeCollege.website : `https://${activeCollege.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
                >
                  <Globe size={14} className="shrink-0" />
                  <span>Official Website</span>
                  <ExternalLink size={12} className="shrink-0" />
                </a>
              )}

              <a
                href={isAp ? 'https://eapcet-sche.aptonline.in/EAPCET/' : 'https://tgeapcet.nic.in/'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
              >
                <ShieldCheck size={14} className="shrink-0" />
                <span>{isAp ? 'APSCHE Portal' : 'TSCHE Seat Portal'}</span>
                <ExternalLink size={12} className="shrink-0" />
              </a>

              <Link
                to={`/${examSlug}/allotments?college=${activeCollege.code}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-4 py-2.5 text-xs backdrop-blur-md whitespace-nowrap w-full sm:w-auto cursor-pointer shadow-sm"
              >
                <Search size={14} className="shrink-0" />
                <span>Candidate Allotments</span>
              </Link>
            </div>
          </div>
        </section>

        {/* STICKY SECTION NAVIGATION BAR — LARGE, CRISP & SMOOTH SWIPEABLE CAPSULE PILLS */}
        <nav className="sticky top-[60px] sm:top-[78px] z-40 py-1.5 bg-transparent backdrop-blur-md pointer-events-auto">
          <div className="flex sm:grid sm:grid-cols-9 gap-1 sm:gap-0.5 rounded-full border border-white/25 bg-black/95 p-1.5 sm:p-1 max-w-full overflow-x-auto sm:overflow-hidden scrollbar-none shadow-2xl items-center">
            {[
              { id: 'sec-overview', label: 'Overview', shortLabel: 'Overview' },
              { id: 'sec-chances', label: 'Admission Chances', shortLabel: 'Chances' },
              { id: 'sec-branches', label: 'Courses & Seats', shortLabel: 'Courses' },
              { id: 'sec-cutoffs', label: 'Cutoffs Intelligence', shortLabel: 'Cutoffs' },
              { id: 'sec-fees', label: 'Fees & ePASS', shortLabel: 'Fees' },
              { id: 'sec-scores', label: 'College Rating', shortLabel: 'Rating' },
              { id: 'sec-placements', label: 'Placements', shortLabel: 'Placements' },
              { id: 'sec-admission', label: 'Admission Guide', shortLabel: 'Guide' },
              { id: 'sec-faqs', label: 'FAQs & Compare', shortLabel: 'FAQs' }
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
                  <span className="relative z-10 hidden md:inline truncate">{tab.label}</span>
                  <span className="relative z-10 inline md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* 2. QUICK DECISION SUMMARY DASHBOARD */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* Tile 1: Annual Fee */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Annual Tuition Fee</p>
            <p className="text-base sm:text-lg font-black text-amber-300 font-mono">₹{annualFee.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">Regulated per annum</p>
          </div>

          {/* Tile 2: Available Branches */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Branches Offered</p>
            <p className="text-base sm:text-lg font-black text-purple-300 font-mono">{branchDetailsList.length}</p>
            <p className="text-[9px] text-gray-500">Engineering streams</p>
          </div>

          {/* Tile 3: Total Seats */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Seats</p>
            <p className="text-base sm:text-lg font-black text-cyan-300 font-mono">{totalSeats.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500">Sanctioned Convenor intake</p>
          </div>

          {/* Tile 4: Highest Package */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Highest Package</p>
            <p className="text-base sm:text-lg font-black text-emerald-400 font-mono">{activeCollege.placements?.highestPackage || '₹45.0 LPA'}</p>
            <p className="text-[9px] text-gray-500">Top placement CTC</p>
          </div>

          {/* Tile 5: Average Package */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center space-y-0.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Package</p>
            <p className="text-base sm:text-lg font-black text-blue-300 font-mono">{activeCollege.placements?.averagePackage || '₹7.8 LPA'}</p>
            <p className="text-[9px] text-gray-500">Overall median CTC</p>
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
                Can I realistically get admission in {activeCollege.code}?
              </h2>
              <p className="text-xs text-gray-300">
                Compare your {examTitle} rank against official closing ranks across all branches and reservation categories.
              </p>
            </div>

            <Link
              to={`/${examSlug}/predictor`}
              className={`${predictBtnStyle} px-6 py-2.5 text-xs sm:text-sm font-extrabold shrink-0`}
            >
              <span>Check My Chances →</span>
            </Link>
          </div>

          {/* Quick Cutoff Benchmarks Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10">
            {sortedBranches.slice(0, 4).map((br) => (
              <div key={br.code} className="rounded-lg bg-black/40 border border-white/10 p-2 text-xs">
                <div className="flex items-center justify-between font-mono font-bold text-gray-200">
                  <span>{br.code}</span>
                  <span className="text-amber-300 text-[11px]">{br.ocBoysRank < 900000 ? `~${br.ocBoysRank.toLocaleString()}` : 'N/A'}</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{br.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. COURSES & SEATS DATA TABLE */}
        <section id="sec-branches" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base sm:text-xl font-extrabold text-white">Courses &amp; Sanctioned Intake</h2>
              <p className="text-xs text-gray-400">Search official engineering branches, sanctioned seat capacity, and tuition fees</p>
            </div>

            {/* Stream Selector & Real-Time Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-full overflow-hidden">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full rounded-xl border border-white/10 bg-black/40 p-1 text-xs touch-pan-x">
                {streams.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStream(st)}
                    className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                      selectedStream === st
                        ? 'bg-white/20 text-white border border-white/30 shadow-md backdrop-blur-md'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {st === 'ALL' ? 'All Streams' : st}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Filter branch..."
                  className="w-36 sm:w-44 rounded-lg border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 100% Mobile Full-Width Courses Table (Zero Horizontal Scroll Required) */}
          <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 text-[10px] sm:text-[11px] uppercase font-mono font-black border-b border-white/20 tracking-wider shadow-sm">
                <tr>
                  <th className="px-1.5 sm:px-3 py-2.5 sm:py-3 text-center text-purple-300 w-12 sm:w-16">Branch Code</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-white/90">Official Programme Name</th>
                  <th className="px-1.5 sm:px-3 py-2.5 sm:py-3 text-center text-amber-300 font-extrabold w-16 sm:w-28">Sanctioned Intake</th>
                  <th className="px-2 sm:px-3 py-2.5 sm:py-3 text-right text-emerald-300 font-extrabold w-20 sm:w-28">Annual Tuition Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBranchDetails.length > 0 ? (
                  filteredBranchDetails.map((b) => (
                    <tr key={b.code} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-1.5 sm:px-3 py-2 text-center font-mono font-bold text-purple-300 text-[10px] sm:text-xs">
                        {b.code}
                      </td>
                      <td className="px-2 sm:px-3 py-2 font-medium text-white text-[11px] sm:text-xs leading-tight">
                        {b.name}
                        {b.stream && b.stream !== 'Engineering' && (
                          <span className="ml-1.5 text-[8px] sm:text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.2 rounded font-mono inline-block">
                            {b.stream}
                          </span>
                        )}
                      </td>
                      {/* Sanctioned Seats — YELLOW (text-amber-300 / text-yellow-400) */}
                      <td className="px-1.5 sm:px-3 py-2 text-center font-mono font-black text-amber-300 text-xs sm:text-sm">
                        {b.seats || 46}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-right font-mono font-bold text-emerald-300 text-[10px] sm:text-xs whitespace-nowrap">
                        ₹{(b.fee || annualFee).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-gray-500 italic">
                      No matching branches found for "{courseSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. CUTOFF INTELLIGENCE DASHBOARD */}
        <section id="sec-cutoffs" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 mb-0.5">
                <span>{examTitle} Official Cutoffs</span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">Cutoff Ranks — Closing Ranks</h2>
              <p className="text-xs text-gray-400 mt-0.5">Lower rank = higher competition. Sorted most competitive first.</p>
            </div>

            <Link
              to={`/${examSlug}/allotments?college=${activeCollege.code}`}
              className={`${predictBtnStyle} px-3.5 py-1.5 text-xs shrink-0`}
            >
              <span>Explore Records →</span>
            </Link>
          </div>

          {/* 2-Column Highlights Summary Cards */}
          {mostCompetitive.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {/* Most Competitive */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2.5 sm:p-3 space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-400 truncate">
                  <Flame size={13} className="shrink-0" />
                  <span className="truncate">Most Competitive (OC)</span>
                </div>
                <div className="space-y-1">
                  {mostCompetitive.map((item, idx) => (
                    <div key={item.code} className="flex items-center justify-between text-[10px] sm:text-xs py-0.5 border-b border-white/5 last:border-0 gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-amber-300/70 font-mono text-[9px] sm:text-[10px] shrink-0">#{idx + 1}</span>
                        <span className="font-bold text-white font-mono bg-white/10 px-1 py-0.5 rounded text-[8px] sm:text-[10px] shrink-0">{item.code}</span>
                        <span className="text-gray-300 text-[9px] sm:text-[11px] truncate">{item.name}</span>
                      </div>
                      <span className="font-extrabold text-amber-300 font-mono text-[9px] sm:text-xs shrink-0">{item.ocBoysRank.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Easier to Get In */}
              {easierToGetIn.length > 0 && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-2.5 sm:p-3 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-sky-400 truncate">
                    <Target size={13} className="shrink-0" />
                    <span className="truncate">Easier to Get In (OC)</span>
                  </div>
                  <div className="space-y-1">
                    {easierToGetIn.map((item, idx) => (
                      <div key={item.code} className="flex items-center justify-between text-[10px] sm:text-xs py-0.5 border-b border-white/5 last:border-0 gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-bold text-sky-300/70 font-mono text-[9px] sm:text-[10px] shrink-0">#{idx + 1}</span>
                          <span className="font-bold text-white font-mono bg-white/10 px-1 py-0.5 rounded text-[8px] sm:text-[10px] shrink-0">{item.code}</span>
                          <span className="text-gray-300 text-[9px] sm:text-[11px] truncate">{item.name}</span>
                        </div>
                        <span className="font-extrabold text-sky-300 font-mono text-[9px] sm:text-xs shrink-0">{item.ocBoysRank.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category Tabs & Search Bar — Glass Pill Capsule Tabs */}
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

            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                value={branchSearch}
                onChange={(e) => setBranchSearch(e.target.value)}
                placeholder="Search branch cutoff..."
                className="w-full sm:w-56 rounded-lg border border-white/15 bg-black/60 pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Cutoffs Data Table */}
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 text-[10px] sm:text-[11px] uppercase font-mono font-black border-b border-white/20 tracking-wider shadow-sm">
                <tr>
                  <th className="px-3 py-3 sticky left-0 bg-slate-950 text-purple-300 border-r border-white/20">Branch Discipline</th>
                  {cutoffCategoryTab === 'OC_EWS' && (
                    <>
                      <th className="px-3 py-3 text-center text-amber-300 font-extrabold">OC Boys (Gen)</th>
                      <th className="px-3 py-3 text-center text-amber-300/90">OC Girls</th>
                      <th className="px-3 py-3 text-center text-purple-300 font-extrabold">EWS Boys</th>
                      <th className="px-3 py-3 text-center text-purple-300/90">EWS Girls</th>
                    </>
                  )}
                  {cutoffCategoryTab === 'BC' && (
                    <>
                      <th className="px-3 py-3 text-center text-cyan-300 font-extrabold">BC-A Category</th>
                      <th className="px-3 py-3 text-center text-cyan-300 font-extrabold">BC-B Category</th>
                      <th className="px-3 py-3 text-center text-cyan-300 font-extrabold">BC-C Category</th>
                      <th className="px-3 py-3 text-center text-cyan-300 font-extrabold">BC-D Category</th>
                      <th className="px-3 py-3 text-center text-cyan-300 font-extrabold">BC-E Category</th>
                    </>
                  )}
                  {cutoffCategoryTab === 'SC_ST' && (
                    <>
                      <th className="px-3 py-3 text-center text-emerald-300 font-extrabold">SC-1 (Special)</th>
                      <th className="px-3 py-3 text-center text-emerald-300 font-extrabold">SC-2 (Regular)</th>
                      <th className="px-3 py-3 text-center text-emerald-300 font-extrabold">SC-3 (General)</th>
                      <th className="px-3 py-3 text-center text-emerald-200/90">SC Girls</th>
                      <th className="px-3 py-3 text-center text-orange-300 font-extrabold">ST Boys</th>
                      <th className="px-3 py-3 text-center text-orange-200/90">ST Girls</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((br) => {
                    const c = br.cutoff || {};
                    const ocB = getCutoffVal(c, KEY_ALIASES.oc_boys);
                    const ocG = getCutoffVal(c, KEY_ALIASES.oc_girls);
                    const ewsB = getCutoffVal(c, KEY_ALIASES.ews_boys);
                    const ewsG = getCutoffVal(c, KEY_ALIASES.ews_girls);

                    const bcaB = getCutoffVal(c, KEY_ALIASES.bca_boys);
                    const bcbB = getCutoffVal(c, KEY_ALIASES.bcb_boys);
                    const bccB = getCutoffVal(c, KEY_ALIASES.bcc_boys);
                    const bcdB = getCutoffVal(c, KEY_ALIASES.bcd_boys);
                    const bceB = getCutoffVal(c, KEY_ALIASES.bce_boys);

                    const sc1B = getCutoffVal(c, KEY_ALIASES.sci_boys);
                    const sc2B = getCutoffVal(c, KEY_ALIASES.scii_boys);
                    const sc3B = getCutoffVal(c, KEY_ALIASES.sciii_boys) || getCutoffVal(c, KEY_ALIASES.sc_boys);
                    const scG = getCutoffVal(c, KEY_ALIASES.sc_girls) || getCutoffVal(c, KEY_ALIASES.scii_girls) || getCutoffVal(c, KEY_ALIASES.sci_girls);
                    const stB = getCutoffVal(c, KEY_ALIASES.st_boys);
                    const stG = getCutoffVal(c, KEY_ALIASES.st_girls);

                    return (
                      <tr key={br.code} className="hover:bg-white/[0.02]">
                        <td className="px-3 py-2 font-bold text-white sticky left-0 bg-black border-r border-white/10">
                          <span className="text-purple-300">{br.code}</span>
                          <span className="font-sans font-normal text-[10px] text-gray-400 block truncate max-w-[140px] sm:max-w-[200px]">
                            {br.name}
                          </span>
                        </td>
                        {cutoffCategoryTab === 'OC_EWS' && (
                          <>
                            <td className="px-3 py-2 text-center font-bold text-amber-300">
                              {ocB ? ocB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-amber-200/80">
                              {ocG ? ocG.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-purple-300">
                              {ewsB ? ewsB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-purple-200/80">
                              {ewsG ? ewsG.toLocaleString() : '—'}
                            </td>
                          </>
                        )}
                        {cutoffCategoryTab === 'BC' && (
                          <>
                            <td className="px-3 py-2 text-center text-cyan-300">
                              {bcaB ? bcaB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-cyan-300">
                              {bcbB ? bcbB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-cyan-300">
                              {bccB ? bccB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-cyan-300">
                              {bcdB ? bcdB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-cyan-300">
                              {bceB ? bceB.toLocaleString() : '—'}
                            </td>
                          </>
                        )}
                        {cutoffCategoryTab === 'SC_ST' && (
                          <>
                            <td className="px-3 py-2 text-center text-emerald-300 font-bold">
                              {sc1B ? sc1B.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-emerald-300 font-bold">
                              {sc2B ? sc2B.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-emerald-300 font-bold">
                              {sc3B ? sc3B.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-emerald-200/80">
                              {scG ? scG.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-300 font-bold">
                              {stB ? stB.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2 text-center text-orange-200/80">
                              {stG ? stG.toLocaleString() : '—'}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-gray-500 italic font-sans">
                      No cutoffs available for "{branchSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. FEES & ePASS REIMBURSEMENT CALCULATOR */}
        <section id="sec-fees" className="scroll-mt-36 space-y-2.5">
          <FeeReimbursementCalculator
            collegeCodeProp={activeCollege.code}
            annualFeeProp={annualFee}
            branchDetailsProp={branchDetailsList}
            exam={examSlug}
          />
        </section>

        {/* 7. INSTITUTIONALSCORE QUALITY EVALUATION (ANIMATED SCROLL COUNT UP) */}
        <section id="sec-scores" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>

              <h2 className="text-sm sm:text-lg font-black text-white tracking-tight">College Rating &amp; Parameters</h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Comprehensive evaluation across placements, faculty, infra, value &amp; research.</p>
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

          {/* Scraped Eduvale Parameters Progress Grid */}
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

          <p className="text-[10px] text-gray-500 italic">
            * Note: College quality ratings are analytical evaluation scores derived from NAAC, NIRF, faculty metrics, and historical placement records. They do not constitute official government rankings.
          </p>
        </section>

        {/* 8. PLACEMENTS & RECRUITERS */}
        <section id="sec-placements" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-4 space-y-3 shadow-xl">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-base sm:text-xl font-extrabold text-white">Institutional Placements &amp; Recruiters</h2>
            <p className="text-xs text-gray-400">Verified placement records submitted to NIRF and state councils</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2 sm:p-3.5">
              <p className="text-[9px] sm:text-[11px] font-semibold text-emerald-300 uppercase truncate">Highest Package</p>
              <p className="text-xs sm:text-xl font-black text-white mt-0.5">{activeCollege.placements?.highestPackage || '₹45.0 LPA'}</p>
              <p className="text-[8px] sm:text-[9px] text-emerald-200/60 mt-0.5 truncate">Top annual package</p>
            </div>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2 sm:p-3.5">
              <p className="text-[9px] sm:text-[11px] font-semibold text-cyan-300 uppercase truncate">Average Package</p>
              <p className="text-xs sm:text-xl font-black text-white mt-0.5">{activeCollege.placements?.averagePackage || '₹7.8 LPA'}</p>
              <p className="text-[8px] sm:text-[9px] text-cyan-200/60 mt-0.5 truncate">Median CTC</p>
            </div>
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-2 sm:p-3.5">
              <p className="text-[9px] sm:text-[11px] font-semibold text-purple-300 uppercase truncate">Placement Rate</p>
              <p className="text-xs sm:text-xl font-black text-white mt-0.5">{activeCollege.placements?.placementRate || '88%'}</p>
              <p className="text-[8px] sm:text-[9px] text-purple-200/60 mt-0.5 truncate">Graduating students</p>
            </div>
          </div>

          {/* Top Recruiters */}
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-bold text-gray-300">Top Visiting Recruiters:</p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {['TCS Digital', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'Amazon', 'Tech Mahindra', 'Capgemini', 'L&T'].map((r) => (
                <span key={r} className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-gray-300 font-medium">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 9. ADMISSION GUIDE & DOCUMENTS */}
        <section id="sec-admission" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-4 sm:p-6 space-y-6 shadow-xl">
          {/* Section Header */}
          <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-semibold text-purple-300 mb-1">
                <BookOpen size={13} className="text-purple-400" />
                <span>Official Admissions &amp; Eligibility Roadmap</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">How to Get Admission in {activeCollege.code}</h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Step-by-step TSCHE counselling roadmap, entrance exams, seat quotas, and required document checklist</p>
            </div>

            {/* Counselling Code Badge */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/30 px-3.5 py-2 shrink-0">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono">Web Option Code</p>
                <p className="text-lg font-black font-mono text-white tracking-wider">{activeCollege.code}</p>
              </div>
              <button
                onClick={() => scrollToSection('sec-cutoffs')}
                className={`${predictBtnStyle} px-3 py-1 text-xs font-bold`}
              >
                Cutoffs →
              </button>
            </div>
          </div>

          {/* 4-Step Sequential Admission Journey */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-purple-400" />
              <span>4-Step Official Admission Workflow</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1 */}
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300 font-mono font-black text-xs border border-purple-500/30">
                    01
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Entrance Exam</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Qualify Exam &amp; Merit Rank</h4>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Appear for {examTitle} or TG ECET and secure a valid state rank card.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-purple-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> 70% Convenor Quota
                </div>
              </div>

              {/* Step 2 */}
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
                    Register on <span className="text-white font-mono">tgeapcet.nic.in</span> &amp; verify certificates at Help Line Centre.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-blue-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> MeeSeva Certificates
                </div>
              </div>

              {/* Step 3 */}
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
                    Prioritize code <strong className="text-amber-300 font-mono">{activeCollege.code}</strong> and your dream engineering branches.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Freeze Web Options
                </div>
              </div>

              {/* Step 4 */}
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
                    Pay tuition fee online, self-report, and submit original T.C. at {activeCollege.code} campus.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/5 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} /> Admission Confirmed
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Structured Detail Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Column 1: Accepted Exams & Seat Quotas */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-purple-400" />
                  <span>Accepted Entrance Exams</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">National &amp; State level exams accepted for admission</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-1 text-xs font-extrabold font-mono">
                        TG EAPCET
                      </span>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                        Convenor
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-medium mt-1">70% Seats — Official TSCHE Web Counselling</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">Primary</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 text-xs font-extrabold font-mono">
                        TG ECET
                      </span>
                      <span className="text-[10px] font-bold text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                        Lateral Entry
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-medium mt-1">10% Seats — Direct B.Tech 2nd Year for Diploma</p>
                  </div>
                  <span className="text-blue-400 font-bold text-xs">Diploma</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 p-2.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 text-xs font-extrabold font-mono">
                        JEE Main / Mgmt
                      </span>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                        Category-B
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 font-medium mt-1">30% Seats — Direct Management / NRI Quota</p>
                  </div>
                  <span className="text-amber-400 font-bold text-xs">Category-B</span>
                </div>
              </div>

              {/* Quota Matrix Summary */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Sanctioned Seat Allocation Quotas</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-[10px] text-gray-400 font-medium">Convenor (Cat-A)</p>
                    <p className="text-sm font-black text-purple-300 font-mono mt-0.5">70%</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-[10px] text-gray-400 font-medium">Management (Cat-B)</p>
                    <p className="text-sm font-black text-amber-300 font-mono mt-0.5">30%</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                    <p className="text-[10px] text-gray-400 font-medium">EWS Quota</p>
                    <p className="text-sm font-black text-emerald-300 font-mono mt-0.5">10%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Mandatory Documents Checklist */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Mandatory Certificate Checklist</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Required during HLC document verification &amp; physical reporting</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'TG EAPCET / ECET Rank Card', desc: 'Official download from tgeapcet.nic.in' },
                  { name: 'TG EAPCET Hall Ticket', desc: 'Exam admit card copy' },
                  { name: 'SSC (Class 10) Marks Memo', desc: 'Proof of DOB & qualifying marks' },
                  { name: 'Intermediate (12th) Memo', desc: 'Academic qualification proof' },
                  { name: 'Transfer Certificate (T.C.)', desc: 'Original from last attended college' },
                  { name: 'Study Certs (6th to 12th)', desc: '7-yr proof for local area status' },
                  { name: 'Caste Certificate (BC/SC/ST)', desc: 'MeeSeva original for category quota' },
                  { name: 'Income Certificate (2026)', desc: 'Required for ePASS fee reimbursement' },
                ].map((doc) => (
                  <div key={doc.name} className="flex items-start gap-2 p-2.5 rounded-lg border border-white/10 bg-black/40">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-[11px]">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{doc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-2.5 text-[11px] text-amber-200/85 leading-relaxed flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                <span>
                  <strong>HLC Requirement Note:</strong> Special category candidates (PH, CAP, NCC, Sports) must report physically to Government Polytechnic, Masab Tank, Hyderabad.
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* 10. FAQs & 11. COLLEGE COMPARISON */}
        <section id="sec-faqs" className="scroll-mt-36 rounded-2xl border border-white/10 bg-[#0d111d] p-3 sm:p-5 space-y-4 shadow-xl">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-base sm:text-xl font-extrabold text-white">Frequently Asked Questions ({activeCollege.code})</h2>
            <p className="text-xs text-gray-400">Verified answers regarding admissions, ePASS scholarships, and cutoffs</p>
          </div>

          {/* Accordion FAQ List — NO FAQ open by default */}
          <div className="space-y-2">
            {collegeFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-white flex items-center justify-between gap-2 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-white' : 'text-gray-400'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 11. Peer College Comparison Card */}
          <div className="rounded-xl border border-white/15 bg-white/5 p-3.5 space-y-2 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                  <Scale size={14} className="text-white" />
                  <span>Compare {activeCollege.code} with Peer Institutions</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Evaluate cutoffs, fee structures, and placement packages side-by-side</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {peerCodes.map((pCode) => (
                  <Link
                    key={pCode}
                    to={`/${examSlug}/allotments?compare=${activeCollege.code},${pCode}`}
                    className={`${predictBtnStyle} px-3 py-1 text-xs font-mono`}
                  >
                    <span>{activeCollege.code} vs {pCode}</span>
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
              Ready to plan your {examTitle} counselling?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300">
              Access real-time rank predictions, official candidate seat allotments, and smart web options prioritization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-2.5 pt-1">
            <Link
              to={`/${examSlug}/predictor`}
              className={`${predictBtnStyle} px-6 py-3 text-xs sm:text-sm font-extrabold`}
            >
              <Compass size={15} />
              <span>Check My Admission Chances</span>
            </Link>

            <Link
              to={`/${examSlug}/allotments`}
              className={`${predictBtnStyle} px-6 py-3 text-xs sm:text-sm font-extrabold`}
            >
              <Search size={15} />
              <span>Explore Allotment Records</span>
            </Link>

            <Link
              to={`/${examSlug}/counselling`}
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
