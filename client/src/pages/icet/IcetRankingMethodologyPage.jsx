import { Link } from 'react-router-dom';
import { 
  Award, Briefcase, GraduationCap, Building2, TrendingUp, BookOpen, 
  Sparkles, CheckCircle2, ArrowLeft, ShieldCheck, Scale, Compass, HelpCircle, ArrowUpRight
} from 'lucide-react';
import Seo from '../../components/shared/Seo';

export default function IcetRankingMethodologyPage() {
  const parameters = [
    {
      id: 'placements',
      title: 'Placements & Corporate CTC',
      icon: Briefcase,
      color: '#3553E2',
      description:
        'Placement outcomes are the primary benchmark for post-graduate management (MBA) and technical (MCA) students. We audit official Training and Placement disclosures, recruiter consistency, and verified compensation packages.',
      criteria: [
        'Highest CTC offered by Tier-1 product firms, investment banks, and premier consulting majors.',
        'Average & Median Annual Package (CTC) for MBA specializations (Finance, HR, Marketing, BA) and MCA cohorts.',
        'Total Placement Conversion Percentage (Eligible graduating students vs verified campus offers).',
        'Corporate Recruiter Diversity: Big 4 auditing firms, multinational IT corporations, FMCG giants, and BFSI leaders.'
      ]
    },
    {
      id: 'faculty',
      title: 'Faculty Pedigree & Experience',
      icon: GraduationCap,
      color: '#7C3AED',
      description:
        'Management education thrives on experienced mentorship, corporate consulting backgrounds, and research-led teaching. We assess faculty credentials and stability.',
      criteria: [
        'Ratio of faculty holding Ph.D. / FPM qualifications from IIMs, Central Universities, OU, or top business schools.',
        'Faculty-to-Student Ratio (FSR) conforming to AICTE norms (1:20 for MBA and MCA post-graduate programs).',
        'Faculty members with extensive corporate, consulting, or industrial management track records.',
        'Ratification status by affiliating state universities (Osmania University, JNTUH, Kakatiya University).'
      ]
    },
    {
      id: 'infrastructure',
      title: 'Campus, Labs & Autonomous Governance',
      icon: Building2,
      color: '#0891B2',
      description:
        'Modern post-graduate studies require smart learning environments, high-capacity computing labs, digital business suites, and adaptive academic autonomy.',
      criteria: [
        'UGC Autonomy enabling industry-integrated curricula, agile case studies, and modern elective choices.',
        'Dedicated MCA computing labs: Cloud virtualization, full-stack dev environments, data analytics, and AI sandboxes.',
        'Air-conditioned auditorium, case-study amphitheaters, Bloomberg/Finance terminals, and enterprise management tools.',
        'Modern hostel accommodation, high-speed Wi-Fi across campus, and digital library databases (EBSCO, J-Gate, Delnet).'
      ]
    },
    {
      id: 'industry',
      title: 'Industry Tie-ups & Corporate Networking',
      icon: BookOpen,
      color: '#F56016',
      description:
        'Location and corporate connections define management and technical internships, live industry capstone projects, and executive guest lecture access.',
      criteria: [
        'Strategic location inside Hyderabad, HITEC City, Gachibowli Financial District, or close to tech corridors.',
        'Active Memorandums of Understanding (MoUs) with industry bodies like CII, FICCI, NASSCOM, and corporate partners.',
        'Summer Internship Placement (SIP) assistance and pre-placement offer (PPO) conversion support.',
        'Regular CEO/CXO talks, management conclaves, student clubs, and tech hackathons.'
      ]
    },
    {
      id: 'value',
      title: 'Value for Money (ROI & ePASS Feasibility)',
      icon: TrendingUp,
      color: '#D97706',
      description:
        'A comprehensive comparison between total 2-year tuition investment and graduate earnings. State university constituent colleges with low fees often yield extraordinary ROI.',
      criteria: [
        'Payback Ratio: Median starting package compared against total 2-year MBA / MCA convenor tuition fees.',
        'Government & University constituent advantage (e.g. OUCB, JNTM, JNTH, KUCS offering ₹25,000–₹50,000 fees with ₹7–₹9+ LPA average packages).',
        'Fee regulatory compliance under Telangana Admission and Fee Regulatory Committee (TAFRC) government orders.',
        'Telangana ePASS post-matric scholarship & fee reimbursement eligibility across eligible categories.'
      ]
    },
    {
      id: 'research',
      title: 'Research, NAAC Accreditation & Case Studies',
      icon: Award,
      color: '#059669',
      description:
        'Academic prestige is anchored by national accreditations, case research publication, and management journal contributions.',
      criteria: [
        'National Assessment and Accreditation Council (NAAC) grading (institutions with A++ and A+ lead in quality).',
        'Publication of Harvard / Ivey style case studies and papers in Scopus / UGC-CARE listed management journals.',
        'National Board of Accreditation (NBA) accredited status for management and computer applications departments.',
        'Recognized Ph.D. research centers under Osmania University, JNTUH, or Kakatiya University.'
      ]
    }
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-10 text-left">
      <Seo
        title="How We Rate MBA & MCA Colleges — TG ICET Ranking Methodology 2027"
        description="Learn how MBA and MCA colleges in Telangana are rated on TG ICET Counselling Simulator: Placements, Faculty Pedigree, Campus Infrastructure, Corporate Tie-ups, Value for Money (ROI), and NAAC Accreditations."
        path="/tg-icet/ranking-methodology"
      />

      {/* Header */}
      <div>
        <Link
          to="/tg-icet/colleges"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to TG ICET Colleges Directory
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            <ShieldCheck size={13} /> Transparent Institutional Scoring
          </span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          How We Rate MBA &amp; MCA Colleges
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-300 max-w-3xl leading-relaxed">
          Our rating system is built on verified, objective data from state counselling authorities (TSCHE / TG ICET), national accreditation bodies (NAAC, NIRF), and official university placement disclosures. Discover how each of our 6 core evaluation dimensions is measured.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Scale size={18} /> Equal Weightage
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            All 6 dimensions contribute equitably to avoid distortions caused by aggressive marketing, inflated claims, or high tuition fees.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 size={18} /> Zero Commercial Bias
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Ratings are 100% algorithmic and objective. No college or business school can sponsor, alter, or inflate its rating score on our simulator.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Compass size={18} /> Student &amp; Career Centric
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Tailored specifically for post-graduate MBA &amp; MCA aspirants to evaluate career ROI, placement security, and academic environment.
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

      {/* Accreditation & Quality Modifiers Section */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          National Accreditation &amp; Government Benchmark Modifiers
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Every institution in our directory is cross-referenced with official state counselling cutoff trends and national quality accreditations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5">
            <span className="font-bold text-emerald-400 text-sm">NAAC Grade Benchmark</span>
            <p className="text-gray-300 text-xs">
              <strong>A++ and A+</strong> institutions with high CGPAs demonstrate verified academic excellence, infrastructure maintenance, and high governance ratings.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5">
            <span className="font-bold text-blue-400 text-sm">University Campus Standing</span>
            <p className="text-gray-300 text-xs">
              Premier university constituent colleges (e.g. <strong>OUCB, JNTM, JNTH, KUCS</strong>) receive specialized pedigree benchmarks due to legacy alumni networks and high corporate trust.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-1.5">
            <span className="font-bold text-amber-400 text-sm">TSCHE Closing Cutoffs</span>
            <p className="text-gray-300 text-xs">
              Actual student preference demand is reflected in historic admission ranks. High rank cutoffs indicate strong candidate competition and recruiter preference.
            </p>
          </div>
        </div>
      </section>

      {/* Formula & Overall Calculation */}
      <section className="rounded-3xl border border-purple-500/20 bg-purple-950/20 p-6 sm:p-8 space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white">How the Overall Rating is Computed</h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          The Overall Rating displayed on every college card is calibrated across the core academic, placement, and institutional dimensions:
        </p>
        <div className="rounded-2xl border border-purple-500/30 bg-black/50 p-4 font-mono text-center text-xs sm:text-sm text-purple-300 overflow-x-auto">
          Overall Score = (Placements + Faculty + Infrastructure + Industry Tie-ups + Value + Research) / 6
        </div>
        <p className="text-[11px] text-gray-400 italic text-center">
          * Note: Ratings are analytical quality benchmarks created to help students compare post-graduate programs objectively and do not represent statutory government rankings.
        </p>
      </section>

      {/* Bottom CTA */}
      <div className="text-center pt-4 pb-8">
        <Link
          to="/tg-icet/colleges"
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-3 text-sm font-bold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20"
        >
          Explore All Telangana MBA &amp; MCA Colleges <ArrowLeft className="rotate-180" size={16} />
        </Link>
      </div>
    </main>
  );
}
