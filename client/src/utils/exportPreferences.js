import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getDistrictName } from "./districtNames";

const KNOWN_BRANCH_NAMES = {
  CSE: "Computer Science & Engineering",
  CSD: "CSE (Data Science)",
  CSM: "CSE (AI & Machine Learning)",
  CSC: "CSE (Cyber Security)",
  CSIT: "CS & Information Technology",
  CSB: "CS & Business Systems",
  CSO: "CSE (IOT)",
  INF: "Information Technology",
  IT: "Information Technology",
  ECE: "Electronics & Communication Engg",
  EEE: "Electrical & Electronics Engg",
  CIV: "Civil Engineering",
  MEC: "Mechanical Engineering",
  AIM: "Artificial Intelligence & ML",
  AID: "Artificial Intelligence & Data Science",
  CHE: "Chemical Engineering",
  MET: "Metallurgical Engineering",
  MIN: "Mining Engineering",
  PHM: "B.Pharmacy",
  PHR: "Pharm-D (Doctor of Pharmacy)",
  MBA: "Master of Business Administration",
  MCA: "Master of Computer Applications",
  MBT: "MBA (Tourism & Travel Management)",
  MTM: "MBA (Technology Management)",
};

function formatCourseName(c) {
  if (c.courseName && c.courseName.trim()) {
    return c.courseName;
  }
  if (c.course_name && c.course_name.trim()) {
    return c.course ? `${c.course} — ${c.course_name}` : c.course_name;
  }
  const code = (c.course || (Array.isArray(c.courses) && c.courses[0]) || "").toString().trim().toUpperCase();
  if (code && KNOWN_BRANCH_NAMES[code]) {
    return `${code} — ${KNOWN_BRANCH_NAMES[code]}`;
  }
  return code || "-";
}

export function exportPreferencesToPDF(orderedEntries, criteria = {}) {
  const doc = new jsPDF();

  const title = criteria.examName
    ? `${criteria.examName} Web Options Preference List`
    : "Web Options Preference List";

  // Document Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 15);

  // Criteria Subheader
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const rankStr = criteria.rank ? `Rank: ${Number(criteria.rank).toLocaleString()}` : "Rank: N/A";
  const catStr = `Category: ${criteria.category || "OC"}`;
  const genderStr = `Gender: ${criteria.gender || "Male"}`;
  const dateStr = `Generated: ${new Date().toLocaleDateString("en-IN")}`;

  doc.text(`${rankStr}   |   ${catStr}   |   ${genderStr}   |   ${dateStr}`, 14, 22);

  // Options Table with Full Course Name
  autoTable(doc, {
    startY: 28,
    head: [["#", "College Code", "College Name", "Course / Branch", "District"]],
    body: orderedEntries.map((c, i) => [
      i + 1,
      c.code || c.collegeCode || "-",
      c.name || c.collegeName || "-",
      formatCourseName(c),
      c.districtName || getDistrictName(c.district) || c.district || "-",
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [88, 28, 135], textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 24, fontStyle: "bold" },
      2: { cellWidth: 62 },
      3: { cellWidth: 62 },
      4: { cellWidth: 28 },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save("web-options-preferences.pdf");
}
