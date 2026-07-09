const XLSX = require("xlsx");
const fs = require("fs");

const workbook = XLSX.readFile(
  "./client/public/data/tsicet_2023_finalphase_lastranks.xlsx"
);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Read as arrays
const rows = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: ""
});

// Row 2 contains headers
const headers = rows[1];

// Data starts from row 3
const dataRows = rows.slice(2);

const result = [];

const categoryMap = [
  ["OC BOYS", "OC", "Male"],
  ["OC GIRLS", "OC", "Female"],
  ["BC_A BOYS", "BC-A", "Male"],
  ["BC_A GIRLS", "BC-A", "Female"],
  ["BC_B BOYS", "BC-B", "Male"],
  ["BC_B GIRLS", "BC-B", "Female"],
  ["BC_C BOYS", "BC-C", "Male"],
  ["BC_C GIRLS", "BC-C", "Female"],
  ["BC_D BOYS", "BC-D", "Male"],
  ["BC_D GIRLS", "BC-D", "Female"],
  ["BC_E BOYS", "BC-E", "Male"],
  ["BC_E GIRLS", "BC-E", "Female"],
  ["SC BOYS", "SC", "Male"],
  ["SC GIRLS", "SC", "Female"],
  ["ST BOYS", "ST", "Male"],
  ["ST GIRLS", "ST", "Female"],
  ["EWS GEN OU", "EWS", "Male"],
  ["EWS GIRLS OU", "EWS", "Female"]
];

for (const row of dataRows) {

  const obj = {};

  headers.forEach((h, i) => {
    obj[h] = row[i];
  });

  for (const [column, category, gender] of categoryMap) {

    const cutoff = obj[column];

    if (
      cutoff !== "" &&
      cutoff !== "NA" &&
      cutoff !== "---" &&
      cutoff != null
    ) {

      result.push({
        year: 2023,
        code: obj["Inst Code"],
        name: obj["Institute Name"],
        place: obj["Place"],
        district: obj["Dist Code"],
        course: obj["Branch Code"],
        courseName: obj["Branch Name"],
        category,
        gender,
        cutoff: Number(cutoff),
        fee: obj["Tuition Fee"],
        university: obj["Affiliated To"]
      });

    }

  }

}

fs.writeFileSync(
  "./client/src/data/colleges.json",
  JSON.stringify(result, null, 2)
);

console.log(`✅ Created ${result.length} searchable records`);