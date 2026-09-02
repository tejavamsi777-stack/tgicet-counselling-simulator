import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, X, ArrowRight, Building2 } from "lucide-react";
import { GlowCard } from "../ui/spotlight-card";
import { GlassButton } from "../ui/glass-button";
import { strictMultiFieldMatch } from "../../utils/searchMatch";

export default function ExamToolsSection({ tools = [] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tools by strict prefix & word-boundary search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;

    return tools.filter((tool) => {
      const keywords = Array.isArray(tool.keywords) ? tool.keywords : [];
      const fields = [tool.title, tool.detail, tool.action, tool.tag, ...keywords].filter(Boolean);
      return strictMultiFieldMatch(fields, searchQuery);
    });
  }, [tools, searchQuery]);

  return (
    <section className="mt-8 mb-8">
      {/* Sleek Search Bar & Quick Action Button to the Right */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-2.5 sm:gap-3">
        <div className="relative w-full max-w-md sm:max-w-md">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 z-10 text-purple-300 flex items-center justify-center">
            <Search size={18} className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. predictor, rank, web options, cutoffs)..."
            className="w-full rounded-2xl border border-white/20 bg-white/10 pl-12 pr-10 py-3 text-xs sm:text-sm text-white placeholder-gray-400 backdrop-blur-2xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 p-1 text-gray-400 hover:text-white transition cursor-pointer"
              title="Clear Search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Explore EAPCET Colleges Button to the right of Search Tools */}
        <Link
          to="/tg-eapcet/colleges"
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white hover:text-gray-900 active:scale-95 transition-all font-bold px-5 py-3 text-xs sm:text-sm text-white backdrop-blur-2xl shadow-sm whitespace-nowrap cursor-pointer shrink-0 group"
        >
          <Building2 size={16} className="text-purple-300 group-hover:text-gray-900 transition-colors shrink-0" />
          <span>Explore EAPCET Colleges</span>
          <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Spacious, Uniform Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool, idx) => (
            <FeatureCard key={tool.to || idx} tool={tool} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
            <Search size={22} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">No tools found matching &quot;{searchQuery}&quot;</h3>
          <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
            Try searching for &quot;predictor&quot;, &quot;rank&quot;, &quot;options&quot;, or &quot;allotments&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}
    </section>
  );
}

function FeatureCard({ tool }) {
  const { icon: Icon, title, detail, to, action, badge } = tool;

  return (
    <Link to={to} className="group relative block h-full w-full outline-none">
      <GlowCard
        customSize={true}
        tilt={false}
        glowColor="purple"
        className="flex h-full min-h-[220px] flex-col justify-between p-6 transition-all duration-200 hover:border-white/30"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="glass-button-wrap relative inline-flex">
              <div className="glass-button flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-white/5 text-purple-300 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
                <Icon size={20} className="text-purple-300" />
              </div>
              <div className="glass-button-shadow rounded-xl"></div>
            </div>
            {badge && (
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
                {badge}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">{title}</h3>
          <p className="mt-2 text-xs sm:text-sm font-normal leading-relaxed text-gray-300/90">{detail}</p>
        </div>
        <div className="mt-6">
          <GlassButton
            size="sm"
            className="w-full text-xs font-semibold"
            contentClassName="flex items-center justify-center gap-1.5 py-1"
          >
            <span>{action}</span>
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
          </GlassButton>
        </div>
      </GlowCard>
    </Link>
  );
}
