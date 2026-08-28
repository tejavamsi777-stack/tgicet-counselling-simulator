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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Award className="text-purple-400" size={20} />
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                About Vuela Learn — 100% Free Admissions &amp; Counselling Platform
              </h3>
            </div>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-0.5 text-xs font-extrabold text-emerald-300">
              ✨ 100% Free For All Students
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
            <strong>Vuela Learn</strong> (vuelalearn.vercel.app) is India&apos;s leading <strong className="text-emerald-400">100% free</strong> state entrance counselling simulator and college admission predictor. Built specifically for candidates navigating <strong>TG EAPCET Counselling (TS EAMCET)</strong>, <strong>TG ICET Counselling</strong>, <strong>AP EAPCET Counselling</strong>, <strong>TG ECET</strong>, <strong>TG POLYCET</strong>, <strong>TG PGECET</strong>, and <strong>KCET</strong>, our mission is to make complex state admissions transparent, predictable, and stress-free.
          </p>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
            Our exclusive <strong className="text-purple-300">Smart Web Option Generator for TG EAPCET &amp; TG ICET</strong> helps thousands of students construct the perfect college priority list in seconds. By evaluating closing rank probabilities across OC, BC, SC, ST, and EWS quotas alongside OU and Non-Local seat reservations, we ensure you never make costly ordering mistakes during web counselling.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-center">
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-white">500+</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">AP &amp; TG Colleges</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-purple-300">200,000+</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">Allotment Records</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-cyan-300">Smart AI</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">Web Option Generator</p>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-extrabold text-emerald-400">100% Free</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider font-semibold mt-0.5">No Fees &bull; Zero Spam</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
