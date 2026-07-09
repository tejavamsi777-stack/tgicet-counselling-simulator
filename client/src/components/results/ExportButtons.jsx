import { FileSpreadsheet, FileText } from "lucide-react";
import Button from "../ui/Button";
import { exportToExcel, exportToPDF } from "../../utils/exportResults";

export default function ExportButtons({ results }) {
  if (!results.length) return null;

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => exportToExcel(results)}>
        <FileSpreadsheet size={15} />
        Export Excel
      </Button>
      <Button variant="secondary" size="sm" onClick={() => exportToPDF(results)}>
        <FileText size={15} />
        Export PDF
      </Button>
    </div>
  );
}