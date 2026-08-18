import { useState } from "react";
import { FileSpreadsheet, FileText, Share2 } from "lucide-react";
import Button from "../ui/Button";
import { exportToExcel, exportToPDF } from "../../utils/exportResults";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../shared/LoginModal";

export default function ExportButtons({ results = [], examTitle = "TG Counselling" }) {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState(null); // "excel" | "pdf" | null

  if (!results.length) return null;

  const fileBase = examTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");

  function runExport(type) {
    if (type === "excel") exportToExcel(results, `${fileBase}-predictions.xlsx`);
    if (type === "pdf") exportToPDF(results, `${fileBase}-predictions.pdf`, `${examTitle} - Predictions Report`);
  }

  function handleExportClick(type) {
    if (user) {
      runExport(type);
      return;
    }
    // Not logged in — ask to log in first
    setPendingExport(type);
    setLoginOpen(true);
  }

  function handleAuthenticated() {
    if (pendingExport) {
      runExport(pendingExport);
      setPendingExport(null);
    }
  }

  function handleWhatsAppShare() {
    const topSafe = results.filter((r) => r.status === "safe").slice(0, 4);
    const topColleges = (topSafe.length > 0 ? topSafe : results.slice(0, 4))
      .map((c, i) => `${i + 1}. *${c.name}* (${c.course || "General"}) - ${c.status?.toUpperCase()}`)
      .join("\n");

    const text = `🎓 *${examTitle} College Predictor Report*\n\nTop Recommended Eligible Colleges:\n${topColleges}\n\n📊 Total Colleges Found: *${results.length}*\n🔗 Predict your chances live:\n${window.location.href}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-sm cursor-pointer"
        title="Share summary on WhatsApp"
      >
        <Share2 size={13} className="text-emerald-400" />
        <span>Share WhatsApp</span>
      </button>

      <Button variant="secondary" size="sm" onClick={() => handleExportClick("excel")}>
        <FileSpreadsheet size={14} />
        <span>Excel</span>
      </Button>

      <Button variant="secondary" size="sm" onClick={() => handleExportClick("pdf")}>
        <FileText size={14} />
        <span>PDF</span>
      </Button>

      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          setPendingExport(null);
        }}
        onAuthenticated={handleAuthenticated}
      />
    </div>
  );
}