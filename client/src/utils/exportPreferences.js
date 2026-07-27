import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPreferencesToPDF(orderedEntries, criteria) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("TG ICET Mock Counselling - Option List", 14, 15);

  doc.setFontSize(10);
  doc.text(
    `Rank: ${criteria.rank}   Category: ${criteria.category}   Gender: ${criteria.gender}`,
    14,
    22
  );

  autoTable(doc, {
    startY: 28,
    head: [["#", "Code", "College", "Course", "Place", "District"]],
    body: orderedEntries.map((c, i) => [
      i + 1,
      c.code,
      c.name,
      c.course,
      c.place,
      c.district,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save("mock-counselling-options.pdf");
}