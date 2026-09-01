import { useState } from "react";
import { FileSpreadsheet, FileText, Share2 } from "lucide-react";
import Button from "../ui/Button";
import { exportToExcel, exportToPDF } from "../../utils/exportResults";
import { ShareModal } from "../shared/ShareModal";

export default function ExportButtons({ results = [], examTitle = "Vuela Learn" }) {
  const [shareOpen, setShareOpen] = useState(false);

  if (!results.length) return null;

  const fileBase = examTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");

  function handleExportClick(type) {
    if (type === "excel") exportToExcel(results, `${fileBase}-predictions.xlsx`);
    if (type === "pdf") exportToPDF(results, `${fileBase}-predictions.pdf`, `${examTitle} - Predictions Report`);
  }

  const topSafe = results.filter((r) => r.status === "safe").slice(0, 4);
  const topColleges = (topSafe.length > 0 ? topSafe : results.slice(0, 4))
    .map((c, i) => `${i + 1}. ${c.name} (${c.course || "General"}) - ${c.status?.toUpperCase()}`)
    .join("\n");

  const shareText = `🎓 ${examTitle} College Predictor Report\n\nTop Recommended Eligible Colleges:\n${topColleges}\n\n📊 Total Colleges Found: ${results.length}\n🔗 Predict your chances live:\n`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all hover:bg-purple-500/20 hover:border-purple-500/50 shadow-sm cursor-pointer"
        title="Share results via Apps"
      >
        <Share2 size={13} className="text-purple-400" />
        <span>Share</span>
      </button>

      <Button variant="secondary" size="sm" onClick={() => handleExportClick("excel")}>
        <FileSpreadsheet size={14} />
        <span>Excel</span>
      </Button>

      <Button variant="secondary" size="sm" onClick={() => handleExportClick("pdf")}>
        <FileText size={14} />
        <span>PDF</span>
      </Button>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareData={{
          url: typeof window !== "undefined" ? window.location.href : "https://vuelalearn.in",
          title: `${examTitle} Predictions Report`,
          text: shareText,
        }}
      />
    </div>
  );
}