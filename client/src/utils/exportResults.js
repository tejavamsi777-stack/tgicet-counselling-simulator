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

export function exportToExcel(results, filename = "college-predictions.xlsx") {
  const rows = toRows(results);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Predictions");
  XLSX.writeFile(workbook, filename);
}

export function exportToPDF(results, filename = "college-predictions.pdf", title = "TG Counselling College Predictor Results") {
  const doc = new jsPDF({ orientation: "landscape" });
  const rows = toRows(results);

  const addPageBranding = (data) => {
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // 1. Semi-transparent Diagonal Watermark
      doc.setTextColor(200, 200, 220);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      try {
        // Render angled watermark text
        doc.text("TG COUNSELLING PORTAL 2026 • OFFICIAL REPORT", 140, 110, {
          align: "center",
          angle: 30,
        });
      } catch (e) {
        doc.text("TG COUNSELLING PORTAL 2026", 140, 110, { align: "center" });
      }

      // 2. Top Header Branding Bar
      doc.setFontSize(14);
      doc.setTextColor(124, 58, 237);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, 15);

      doc.setFontSize(9);
      doc.setTextColor(100, 110, 130);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} • Verified Seat Allotment Data`, 14, 20);

      // 3. Footer Page Numbers
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${totalPages} — TG Admissions & Counselling Portal (https://tgcounselling.vercel.app)`, 14, 200);
    }
  };

  autoTable(doc, {
    startY: 25,
    head: [Object.keys(rows[0] ?? {})],
    body: rows.map((r) => Object.values(r)),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [124, 58, 237] },
    didDrawPage: addPageBranding,
  });

  doc.save(filename);
}