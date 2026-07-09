import { GraduationCap, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import StatCard from "./StatCard";

export default function StatsGrid({ total, safe, moderate, risky }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Eligible Colleges" value={total} icon={GraduationCap} accent="brand" delay={0} />
      <StatCard label="Safe" value={safe} icon={CheckCircle2} accent="safe" delay={0.05} />
      <StatCard label="Moderate" value={moderate} icon={AlertTriangle} accent="moderate" delay={0.1} />
      <StatCard label="Risky" value={risky} icon={XCircle} accent="risky" delay={0.15} />
    </div>
  );
}