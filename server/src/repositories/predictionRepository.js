import { pool } from "../config/database.js";

// AP EAPCET exam ID
const AP_EAPCET_EXAM_ID = 11;

/**
 * Normalise an AP EAPCET category code submitted from the predictor.
 * The UI sends simple codes like "OC", "BC-A", "SC-I", "ST", "EWS",
 * "Muslim Minority", "Christian Minority" plus a separate region ("AU"/"SVU"/"UR").
 * This function converts them to the DB format, e.g. OC_AU, BC_A_SVU, MUS_UR.
 */
function resolveApCategory(category, region = "AU") {
  const raw = (category || "").toUpperCase().trim();
  const reg = (region || "AU").toUpperCase().trim();

  const regionSuffix = reg === "NON-LOCAL" || reg === "UR" ? "UR" : reg; // AU | SVU | UR

  // Map friendly names → DB prefix
  const MAP = {
    "OC": "OC",
    "BC-A": "BC_A", "BC_A": "BC_A",
    "BC-B": "BC_B", "BC_B": "BC_B",
    "BC-C": "BC_C", "BC_C": "BC_C",
    "BC-D": "BC_D", "BC_D": "BC_D",
    "BC-E": "BC_E", "BC_E": "BC_E",
    "SC-I": "SC_I",  "SC_I": "SC_I",  "SC I": "SC_I",
    "SC-II": "SC_II", "SC_II": "SC_II", "SC II": "SC_II",
    "SC-III": "SC_III", "SC_III": "SC_III", "SC III": "SC_III",
    "ST": "ST",
    "EWS": "EWS",
    "MUSLIM MINORITY": "MUS", "MUSLIM": "MUS", "MUS": "MUS",
    "CHRISTIAN MINORITY": "CHR", "CHRISTIAN": "CHR", "CHR": "CHR",
  };

  const prefix = MAP[raw];
  if (prefix) return `${prefix}_${regionSuffix}`;

  // Already a full DB code like OC_AU — return as-is
  return raw;
}

export const predictionRepository = {
  async findMatches({ rank, category, gender, courses = [], districts = [], years = [], year, examId, region }) {
    const yearList = Array.isArray(years) && years.length > 0 ? years : (year ? [Number(year)] : []);

    // For AP EAPCET resolve simple category + region → DB code
    let resolvedCategory = category;
    let categoryPrefix = null; // used when matching all regions

    if (Number(examId) === AP_EAPCET_EXAM_ID && category) {
      const isAllRegion = !region || region === "ALL";
      if (isAllRegion) {
        // Get just the prefix (e.g. "OC", "BC_A") to match OC_AU, OC_SVU, OC_UR
        categoryPrefix = resolveApCategory(category, "AU").replace(/_AU$/, "");
        resolvedCategory = null; // will use LIKE instead of exact
      } else {
        resolvedCategory = resolveApCategory(category, region);
      }
    }

    const params = [examId, gender, rank];
    let catCondition = "";

    if (categoryPrefix) {
      params.push(`${categoryPrefix}_%`);
      catCondition = `AND cat.code LIKE $${params.length}`;
    } else {
      params.push(resolvedCategory);
      catCondition = `AND cat.code = $${params.length}`;
    }

    let sql = `
      SELECT
        col.code, col.name, col.place, col.university,
        col.ownership_type, col.is_minority, col.is_girls, col.is_self_finance,
        d.code AS district_code,
        d.name AS district_name,
        cu.cutoff_rank,
        cu.gender AS gender,
        crs.code AS course_code, crs.name AS course_name,
        cat.code AS category_code,
        y.year AS year,
        cc.fee
      FROM cutoffs cu
      JOIN colleges col ON col.id = cu.college_id
      JOIN districts d ON d.id = col.district_id
      JOIN courses crs ON crs.id = cu.course_id
      JOIN categories cat ON cat.id = cu.category_id
      JOIN years y ON y.id = cu.year_id
      LEFT JOIN college_courses cc ON cc.college_id = col.id AND cc.course_id = cu.course_id
      WHERE cu.exam_id = $1
        AND col.exam_id = $1
        AND crs.exam_id = $1
        AND cat.exam_id = $1
        AND y.exam_id = $1
        AND cu.gender = $2
        AND cu.cutoff_rank >= FLOOR($3 * 0.85)
        AND col.is_active = true
        ${catCondition}
    `;

    if (Array.isArray(yearList) && yearList.length > 0 && !yearList.includes("ALL")) {
      params.push(yearList);
      sql += ` AND y.year = ANY($${params.length}::int[])`;
    }

    if (Array.isArray(courses) && courses.length > 0 && !courses.includes("ALL")) {
      params.push(courses);
      sql += ` AND crs.code = ANY($${params.length}::text[])`;
    }

    if (Array.isArray(districts) && districts.length > 0 && !districts.includes("ALL")) {
      params.push(districts);
      sql += ` AND (d.code = ANY($${params.length}::text[]) OR UPPER(d.name) = ANY($${params.length}::text[]))`;
    }

    sql += ` ORDER BY cu.cutoff_rank ASC`;

    const { rows } = await pool.query(sql, params);
    return rows;
  },
};

