import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GlowCard } from "../ui/spotlight-card";
import { GlassButton } from "../ui/glass-button";

export default function ExamCard({ exam }) {
  const available = exam.status === "available";
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleClick(e) {
    if (!user) {
      e.preventDefault();
      navigate("/login", { state: { from: { pathname: `/exams/${exam.slug}` } } });
    }
  }

  return (
    <Link
      to={`/exams/${exam.slug}`}
      onClick={handleClick}
      className="group relative block h-full w-full outline-none"
    >
      <GlowCard
        customSize={true}
        tilt={true}
        glowColor={available ? "purple" : "blue"}
        className="h-full w-full overflow-hidden transition-all duration-300"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-3">
          <span className="text-xs font-bold tracking-tight text-white sm:text-base">
            {exam.shortName}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs ${
              available
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 backdrop-blur-md"
                : "bg-white/5 text-slate-400 ring-1 ring-white/10 backdrop-blur-md"
            }`}
          >
            {available ? <CheckCircle2 size={10} /> : <Clock3 size={10} />}
            {available ? "Available" : "Soon"}
          </span>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs leading-relaxed text-gray-300/90 sm:mt-3 sm:text-sm">
          {exam.description}
        </p>

        {/* Programs */}
        <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300/80 sm:mt-3.5 sm:text-[11px]">
          {exam.programs.join(" · ")}
        </p>

        {/* Glass Button CTA */}
        <div className="mt-auto pt-4">
          <GlassButton
            size="sm"
            className="w-full"
            contentClassName="flex items-center justify-center gap-2"
          >
            <span>{available ? "Explore tools" : "View page"}</span>
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </GlassButton>
        </div>
      </GlowCard>
    </Link>
  );
}
