import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { STATUS_META } from "./status";

function toRows(results) {
  return results.map((c, i) => ({
    "#": i + 1,
    College: c.name,
    Course: c.course,
    Category: c.category,
    Gender: c.gender,
    Cutoff: c.cutoff,
    Fee: c.fee,
    University: c.university,
    Status: STATUS_META[c.status]?.label ?? "",
  }));
}

export function exportToExcel(results, filename = "tgicet-predictions.xlsx") {
  const rows = toRows(results);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Predictions");
  XLSX.writeFile(workbook, filename);
}

export function exportToPDF(results, filename = "tgicet-predictions.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  const rows = toRows(results);

  doc.setFontSize(14);
  doc.text("TG ICET Counselling Simulator - Predictions", 14, 15);

  autoTable(doc, {
    startY: 22,
    head: [Object.keys(rows[0] ?? {})],
    body: rows.map((r) => Object.values(r)),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(filename);
}