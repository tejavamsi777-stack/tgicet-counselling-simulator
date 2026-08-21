import { ShieldCheck, Target, Calculator, ArrowLeftRight, CheckCircle2, Award, Zap, Database, Lock, Users, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: Database,
    title: "100% Authentic Government Data",
    desc: "Ingested directly from official TSCHE and APSCHE candidate seat allotment archives, gazettes, and official fee notifications covering 500+ institutions.",
    badge: "Official Records",
  },
  {
    icon: Target,
    title: "Precision Quota & Category AI",
    desc: "Calculates realistic closing ranks considering your caste (OC, BC-A/B/C/D/E, SC, ST, EWS), gender reservation, and regional local status (OU, AU, SVU).",
    badge: "Accurate Predictions",
  },
  {
    icon: Calculator,
    title: "Govt Scholarship & Fee Calculators",
    desc: "Includes Telangana TS ePASS (G.O. Ms. 244 & 33) and Andhra Pradesh Jagananna Vidya Deevena (JVD G.O. Ms. 115) to compute your exact net tuition fee.",
    badge: "Instant Calculation",
  },
  {
    icon: ArrowLeftRight,
    title: "Multi-College Comparison Matrix",
    desc: "Compare institutions side-by-side on approved annual fees, NAAC grades, highest/average placement packages, recruiter networks, and latest cutoff ranks.",
    badge: "Side-by-Side",
  },
  {
    icon: Zap,
    title: "Mock Web Options Priority Builder",
    desc: "Simulates the official web counselling portal to help you draft, reorder, and risk-evaluate your college-branch choice list before locking options.",
    badge: "Smart Simulation",
  },
  {
    icon: Lock,
    title: "Privacy First — Zero Spam",
    desc: "No mandatory login walls, no selling student phone numbers to private college agents, and no spam calls. 100% free open educational access.",
    badge: "100% Free & Safe",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full">
      {/* Why Choose Section Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-300 mb-2">
          <Sparkles size={14} />
          <span>Why Over 100,000+ Students &amp; Parents Trust Us</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Why Choose Our Counselling Platform?
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-3xl mx-auto leading-relaxed">
          State admissions counselling is complex with cascading reservation quotas and rigid deadlines. We eliminate guesswork with authoritative datasets and automated simulators.
        </p>
      </div>

      {/* 6 Core Advantages Grid (Tightened Gaps & Full Width) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 mb-8">
        {FEATURES.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-black/60 to-purple-950/20 p-5 sm:p-5 backdrop-blur-xl hover:border-purple-500/40 hover:bg-white/[0.06] transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 group-hover:scale-105 group-hover:bg-purple-500/30 transition-all">
                    <Icon size={19} />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-white/70">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-1.5 group-hover:text-purple-200 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* About Our Platform Banner Box */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-black/80 to-purple-900/20 p-5 sm:p-7 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-purple-400" size={20} />
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              About VuelaLearn
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
            <strong>VuelaLearn</strong> (vuelalearn.in) is an independent, student-first open platform engineered specifically for candidates appearing in <strong>Andhra Pradesh (APSCHE)</strong> and <strong>Telangana (TSCHE)</strong> state entrance examinations. 
          </p>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
            Whether you are predicting college chances in <strong>AP EAPCET</strong> or <strong>TG EAPCET</strong>, comparing MBA colleges in <strong>TG ICET</strong>, planning lateral entry engineering through <strong>TG ECET</strong>, finding polytechnic diploma streams in <strong>TG POLYCET</strong>, or checking postgraduate allocations in <strong>TG PGECET</strong> — our mission is to deliver complete clarity, official fee accountability, and unbiased guidance so every student achieves the best possible college seat their merit deserves.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-center">
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-white">500+</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">Institutions Profiled</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-purple-300">200,000+</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">Allotment Records</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-cyan-300">6 Exams</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">Supported Portals</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-emerald-400">100% Free</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">Zero Ads/Spam</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
