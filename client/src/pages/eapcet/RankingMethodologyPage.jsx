import { Link } from 'react-router-dom';
import { 
  Award, Briefcase, GraduationCap, Building2, TrendingUp, BookOpen, 
  Sparkles, CheckCircle2, ArrowLeft, ShieldCheck, Scale, Compass 
} from 'lucide-react';
import Seo from '../../components/shared/Seo';

export default function RankingMethodologyPage() {
  const parameters = [
    {
      id: 'placements',
      title: 'Placements & Industry Readiness',
      icon: Briefcase,
      color: '#3553E2',
      description:
        'Placement performance is the most critical benchmark for engineering aspirants. We evaluate each college based on official training and placement cell disclosures, NIRF reports, and verified recruiter track records.',
      criteria: [
        'Highest CTC (Package) offered by leading Tier-1 product companies.',
        'Average & Median Annual Package (CTC) across computer science and core engineering branches.',
        'Total Placement Percentage (Total eligible graduates vs verified corporate offers).',
        'Consistency and diversity of visiting recruiters (FAANG, Fortune 500 tech firms, Big 4, Core Engineering MNCs).'
      ]
    },
    {
      id: 'faculty',
      title: 'Faculty Quality & Academic Pedigree',
      icon: GraduationCap,
      color: '#7C3AED',
      description:
        'A college is only as good as the educators guiding its students. We assess the academic credentials, stability, and research competence of the teaching faculty.',
      criteria: [
        'Percentage of faculty members holding Ph.D. / Doctoral qualifications from premier institutes.',
        'Faculty-to-Student Ratio (FSR) maintaining AICTE / UGC regulatory mandates (typically 1:15 or 1:20).',
        'Ratification status by affiliating universities (such as JNTUH, Osmania University, or Kakatiya University).',
        'Faculty retention, continuous professional development, and technical publication track records.'
      ]
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure & UGC Autonomy',
      icon: Building2,
      color: '#0891B2',
      description:
        'Modern engineering requires cutting-edge lab equipment, high-performance computing, and campus autonomy that enables regular curriculum upgrades.',
      criteria: [
        'UGC Autonomous status enabling flexible, industry-aligned curricula and rapid syllabus modernization.',
        'Specialized laboratories: AI/ML GPU clusters, IoT labs, robotics, VLSI, and cloud testing setups.',
        'Smart interactive classrooms, campus-wide gigabit Wi-Fi, and well-maintained hostel & sports facilities.',
        'Green campus certifications, incubation hubs, and makerspaces for physical prototyping.'
      ]
    },
    {
      id: 'value',
      title: 'Value for Money (Return on Investment - ROI)',
      icon: TrendingUp,
      color: '#D97706',
      description:
        'Higher fees do not always mean a better education. We compare the annual tuition fees against graduate earnings to calculate the true educational ROI for parents and students.',
      criteria: [
        'Payback Ratio: Median starting salary vs total 4-year tuition fee expenditure.',
        'Government vs Private Autonomous comparison (e.g. premier government colleges with ₹50,000 fees and ₹10+ LPA packages score highest on Value).',
        'Fee transparency in accordance with Telangana Admission and Fee Regulatory Committee (TAFRC) government orders.',
        'Availability of full tuition fee waivers and state ePASS government reimbursement.'
      ]
    },
    {
      id: 'resources',
      title: 'Student Resources & Tech Locality',
      icon: BookOpen,
      color: '#F56016',
      description:
        'Geographic location and resource access significantly impact student exposure, internship opportunities, hackathons, and corporate networking.',
      criteria: [
        'Proximity to major technology hubs (e.g. Hyderabad / HITEC City IT Corridor vs remote districts).',
        'Digital library access with IEEE, Springer, ACM digital libraries, and ScienceDirect subscriptions.',
        'Availability of student transport networks, reliable metro/bus connectivity, and campus safety measures.',
        'Active technical student clubs, developer student clubs (GDSC), and national hackathon participation.'
      ]
    },
    {
      id: 'research',
      title: 'Research, Patents & NIRF Standing',
      icon: Award,
      color: '#059669',
      description:
        'Research initiatives indicate an institution academic vitality, grant capabilities, and long-term standing in national higher education frameworks.',
      criteria: [
        'National Institutional Ranking Framework (NIRF) rankings published by the Ministry of Education, Government of India.',
        'Number of research patents filed, published, and granted to faculty and students.',
        'Externally funded research grants from DST, AICTE, DRDO, ISRO, and corporate sponsors.',
        'Recognized Research Centers for Ph.D. scholars under affiliated state universities.'
      ]
    }
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-10">
      <Seo
        title="How We Rate Colleges — Methodology & Evaluation Criteria 2026"
        description="Comprehensive breakdown of how engineering colleges are rated in Telangana: Placements, Faculty credentials, Infrastructure, ROI, Locality, and NIRF/NAAC accreditations."
        path="/tg-eapcet/ranking-methodology"
      />

      {/* Header */}
      <div>
        <Link
          to="/tg-eapcet/colleges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft size={14} /> Back to Colleges Directory
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            <ShieldCheck size={13} /> Transparent Institutional Scoring
          </span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          College Rating Methodology
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
          Our rating system is built on verified, objective data from government counselling bodies (TSCHE), national accreditation agencies (NAAC, NIRF), and official placement audit disclosures. Discover how each of the 6 dimensions is calibrated.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Scale size={18} /> Equal Weightage
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            All 6 dimensions contribute equally (16.67% each) to prevent single-factor distortion like marketing claims or high tuition fees.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={18} /> Zero Paid Bias
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Ratings are 100% algorithmic and math-driven. No institution can sponsor, alter, or inflate its rating score on our platform.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Compass size={18} /> Student Centric
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Designed specifically for EAPCET/ECET aspirants to evaluate whether an institution justifies its rank and 4-year tuition fees.
          </p>
        </div>
      </div>

      {/* 6 Core Parameters Detailed Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-400" size={20} /> The 6 Core Evaluation Dimensions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {parameters.map((param) => {
            const Icon = param.icon;
            return (
              <div
                key={param.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                      style={{ backgroundColor: `${param.color}20` }}
                    >
                      <Icon size={20} style={{ color: param.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{param.title}</h3>
                      <span className="text-[10px] font-mono text-gray-400">Score Range: 1.0 – 10.0 / 10</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {param.description}
                </p>

                <div className="border-t border-white/5 pt-3 space-y-1.5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Key Factors Evaluated:</p>
                  <ul className="space-y-1">
                    {param.criteria.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accreditation Modifiers Section */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          National Accreditation &amp; Government Benchmark Modifiers
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          In addition to empirical cutoffs, every college is cross-referenced with national regulatory and accreditation databases:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5">
            <span className="font-bold text-emerald-400 text-sm">NAAC Accreditation</span>
            <p className="text-gray-300 text-xs">
              <strong>A++ (CGPA ≥ 3.51)</strong> institutions like VNR VJIET and JNTUH receive maximum academic governance points. Progressively lower tiers scale down through A+, A, B++, and B.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5">
            <span className="font-bold text-blue-400 text-sm">NIRF Ranking Band</span>
            <p className="text-gray-300 text-xs">
              Institutions within the Ministry of Education's <strong>Top 100</strong> and <strong>Band 101–150</strong> receive dedicated research and nationwide academic stature bonuses.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5">
            <span className="font-bold text-amber-400 text-sm">TSCHE Closing Cutoffs</span>
            <p className="text-gray-300 text-xs">
              State rank cutoffs establish candidate preference demand. Highly competitive admission cutoffs reflect strong real-world student trust and employer hiring preference.
            </p>
          </div>
        </div>
      </section>

      {/* Formula & Overall Calculation */}
      <section className="rounded-3xl border border-purple-500/20 bg-purple-950/20 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">How the Overall Rating is Computed</h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          The Overall Rating displayed on every college card is the arithmetic average of the 6 core dimensions:
        </p>
        <div className="rounded-2xl border border-purple-500/30 bg-black/50 p-4 font-mono text-center text-xs sm:text-sm text-purple-300 overflow-x-auto">
          Overall Score = (Placements + Faculty + Infrastructure + Value + Resources + Research) / 6
        </div>
        <p className="text-[11px] text-gray-400 italic text-center">
          * Note: Ratings are analytical evaluation scores designed to assist student decision-making and do not constitute official statutory government rankings.
        </p>
      </section>

      {/* Bottom CTA */}
      <div className="text-center pt-4 pb-8">
        <Link
          to="/tg-eapcet/colleges"
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
        >
          Explore All 214 Telangana Colleges <ArrowLeft className="rotate-180" size={16} />
        </Link>
      </div>
    </main>
  );
}
