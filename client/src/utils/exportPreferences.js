import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPreferencesToPDF(orderedColleges, criteria) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("TG ICET Mock Counselling - Option List", 14, 15);

  doc.setFontSize(10);
  doc.text(
    `Rank: ${criteria.rank}   Category: ${criteria.category}   Gender: ${criteria.gender}   Course: ${criteria.course}`,
    14,
    22
  );

  autoTable(doc, {
    startY: 28,
    head: [["#", "Code", "College", "Place", "District", "Cutoff"]],
    body: orderedColleges.map((c, i) => [
      i + 1,
      c.code,
      c.name,
      c.place,
      c.district,
      c.cutoff,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save("mock-counselling-options.pdf");
}