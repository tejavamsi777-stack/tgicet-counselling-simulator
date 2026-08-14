import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { pool } from "../src/config/database.js";

// Column mapping definitions
const CATEGORY_MAP = [
  { category: "OC", gender: "Male" },
  { category: "OC", gender: "Female" },
  { category: "BC_A", gender: "Male" },
  { category: "BC_A", gender: "Female" },
  { category: "BC_B", gender: "Male" },
  { category: "BC_B", gender: "Female" },
  { category: "BC_C", gender: "Male" },
  { category: "BC_C", gender: "Female" },
  { category: "BC_D", gender: "Male" },
  { category: "BC_D", gender: "Female" },
  { category: "BC_E", gender: "Male" },
  { category: "BC_E", gender: "Female" },
  { category: "SC_I", gender: "Male" },
  { category: "SC_I", gender: "Female" },
  { category: "SC_II", gender: "Male" },
  { category: "SC_II", gender: "Female" },
  { category: "SC_III", gender: "Male" },
  { category: "SC_III", gender: "Female" },
  { category: "ST", gender: "Male" },
  { category: "ST", gender: "Female" },
  { category: "EWS", gender: "Male" },
  { category: "EWS", gender: "Female" },
];

// Helper to convert structured record into standardized import rows
export function transformRecordToRows(rec) {
  const rows = [];
  CATEGORY_MAP.forEach((catObj, index) => {
    const val = rec.cutoffs[index];
    if (val !== undefined && val !== null && val !== "" && val !== "NA" && !isNaN(Number(val))) {
      rows.push({
        code: rec.code,
        name: rec.name,
        district: rec.district,
        course: rec.course,
        courseName: rec.courseName,
        category: catObj.category,
        gender: catObj.gender,
        cutoff: Number(val),
        collegeType: rec.collegeType || "PVT",
        fee: rec.fee ? Number(rec.fee) : null,
      });
    }
  });
  return rows;
}
