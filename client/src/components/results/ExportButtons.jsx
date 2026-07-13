import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import Button from "../ui/Button";
import { exportToExcel, exportToPDF } from "../../utils/exportResults";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../shared/LoginModal";

export default function ExportButtons({ results }) {
  const { user } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingExport, setPendingExport] = useState(null); // "excel" | "pdf" | null

  if (!results.length) return null;

  function runExport(type) {
    if (type === "excel") exportToExcel(results);
    if (type === "pdf") exportToPDF(results);
  }

  function handleExportClick(type) {
    if (user) {
      runExport(type);
      return;
    }
    // Not logged in — remember what they wanted, then ask them to log in first
    setPendingExport(type);
    setLoginOpen(true);
  }

  function handleAuthenticated() {
    if (pendingExport) {
      runExport(pendingExport);
      setPendingExport(null);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => handleExportClick("excel")}>
        <FileSpreadsheet size={15} />
        Export Excel
      </Button>
      <Button variant="secondary" size="sm" onClick={() => handleExportClick("pdf")}>
        <FileText size={15} />
        Export PDF
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