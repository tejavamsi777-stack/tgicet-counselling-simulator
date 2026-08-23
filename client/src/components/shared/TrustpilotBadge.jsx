import { TRUSTPILOT_CONFIG } from '../../config/trustpilot';

// Official Trustpilot Green Star SVG Icon
export function TrustpilotStar({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-[#00b67a] ${className}`}
    >
      <path d="M12 0l3.09 9.511h10l-8.09 5.878 3.09 9.511-8.09-5.878-8.09 5.878 3.09-9.511-8.09-5.878h10z" />
    </svg>
  );
}

// Trustpilot Logo / Badge
export default function TrustpilotBadge({ variant = "compact", className = "" }) {
  if (variant === "full") {
    return (
      <a
        href={TRUSTPILOT_CONFIG.reviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2.5 rounded-2xl border border-[#00b67a]/30 bg-[#00b67a]/10 hover:bg-[#00b67a]/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#00b67a]">
              <TrustpilotStar size={11} className="text-white" />
            </div>
          ))}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-extrabold text-white">Trustpilot</span>
          <span className="text-[10px] text-[#00b67a] font-bold">Review Vuela Learn ↗</span>
        </div>
      </a>
    );
  }

  return (
    <a
      href={TRUSTPILOT_CONFIG.reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#00b67a]/40 bg-[#00b67a]/15 hover:bg-[#00b67a]/25 px-3 py-1 text-xs font-bold text-emerald-300 transition hover:scale-105 active:scale-95 cursor-pointer ${className}`}
    >
      <div className="flex h-4 w-4 items-center justify-center rounded-xs bg-[#00b67a]">
        <TrustpilotStar size={10} className="text-white" />
      </div>
      <span>Trustpilot Reviews</span>
    </a>
  );
}
