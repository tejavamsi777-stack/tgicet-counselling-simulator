import { Layers, GraduationCap } from 'lucide-react';

const ELIGIBILITY_MAPPING = [
  {
    btechBranch: 'B.Tech Computer Science / IT',
    eligibleMTech: [
      'Artificial Intelligence & Machine Learning',
      'Data Sciences',
      'Computer Science & Engineering',
      'Cyber Security & Digital Forensics',
      'Software Engineering',
    ],
  },
  {
    btechBranch: 'B.Tech Electronics & Communication (ECE)',
    eligibleMTech: [
      'VLSI System Design',
      'Embedded Systems & IoT',
      'Digital Systems & Computer Electronics',
      'Communication Systems & Signal Processing',
      'Microwave & Radar Engineering',
    ],
  },
  {
    btechBranch: 'B.Tech Electrical & Electronics (EEE)',
    eligibleMTech: [
      'Power Electronics & Electrical Drives',
      'Electrical Power Systems',
      'Power System Control & Automation',
      'Electric Vehicle Technology',
      'Energy Systems',
    ],
  },
  {
    btechBranch: 'B.Tech Mechanical Engineering',
    eligibleMTech: [
      'CAD/CAM & Automation',
      'Thermal Engineering',
      'Advanced Manufacturing Systems',
      'Machine Design & Robotics',
      'Mechatronics & Computational Mechanics',
    ],
  },
  {
    btechBranch: 'B.Tech Civil Engineering',
    eligibleMTech: [
      'Structural Engineering',
      'Geo-Technical Engineering',
      'Transportation & Highway Engineering',
      'Environmental Engineering & Geomatics',
      'Construction Management',
    ],
  },
  {
    btechBranch: 'B.Pharmacy / Pharm.D',
    eligibleMTech: [
      'M.Pharm Pharmaceutics',
      'M.Pharm Pharmacology',
      'M.Pharm Pharmaceutical Analysis',
      'M.Pharm Pharmacognosy',
      'Pharm.D (Post Baccalaureate - 3 Years)',
    ],
  },
];

export default function EligibilityMatrix() {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#120a22]/90 via-[#180f2d]/90 to-[#0c0616]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
      <div className="flex items-center gap-2.5 border-b border-white/10 pb-5">
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-2 text-purple-400">
          <GraduationCap size={18} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            Qualifying Degree to PG Specialization Eligibility Matrix
          </h3>
          <p className="text-xs text-white/50">
            Approved feeder branch disciplines for M.Tech, M.E. &amp; M.Pharmacy specializations
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ELIGIBILITY_MAPPING.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 hover:border-purple-500/40 transition"
          >
            <h4 className="text-xs sm:text-sm font-bold text-cyan-300 border-b border-white/10 pb-2">
              {item.btechBranch}
            </h4>
            <div className="mt-2.5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Eligible Specializations:</span>
              {item.eligibleMTech.map((spec, j) => (
                <div key={j} className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-1 w-1 rounded-full bg-purple-400 shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
