import { pool } from "../config/database.js";

export const allotmentRepository = {
  /**
   * Log an import execution in raw_import_logs
   */
  async createImportLog({ sourceUrl, sourceName, examId = "tg-eapcet", historicalExamName, admissionYear, phase, totalRecords, validRecords, newRecords, duplicateRecords, status, errorDetails, importedBy }) {
    const query = `
      INSERT INTO raw_import_logs (
        source_url, source_name, exam_id, historical_exam_name,
        admission_year, phase, total_records, valid_records,
        new_records, duplicate_records, status, error_details, imported_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [
      sourceUrl,
      sourceName,
      examId,
      historicalExamName || (admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET"),
      admissionYear,
      phase,
      totalRecords || 0,
      validRecords || 0,
      newRecords || 0,
      duplicateRecords || 0,
      status || "SUCCESS",
      errorDetails || null,
      importedBy || "admin"
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  /**
   * Insert multiple candidate allotment records idempotently using ON CONFLICT DO NOTHING
   */
  async insertBatchAllotments(records, rawImportId = null) {
    if (!records || records.length === 0) return { inserted: 0, duplicates: 0 };

    let inserted = 0;
    let duplicates = 0;

    // Use transaction for consistency
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const rec of records) {
        const query = `
          INSERT INTO eapcet_allotment_records (
            raw_import_id, exam_id, historical_exam_name,
            admission_year, phase, college_code, college_name,
            branch_code, branch_name, rank, roll_no, candidate_name,
            gender, region, caste, seat_category
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (exam_id, admission_year, phase, college_code, branch_code, roll_no)
          DO NOTHING
          RETURNING id;
        `;

        const values = [
          rawImportId,
          rec.examId || "tg-eapcet",
          rec.historicalExamName || (rec.admissionYear < 2024 ? "TS EAMCET" : "TG EAPCET"),
          rec.admissionYear,
          rec.phase,
          rec.collegeCode.toUpperCase(),
          rec.collegeName,
          rec.branchCode.toUpperCase(),
          rec.branchName,
          rec.rank,
          rec.rollNo,
          rec.candidateName,
          rec.gender,
          rec.region || "OU",
          rec.caste || "OC",
          rec.seatCategory
        ];

        const res = await client.query(query, values);
        if (res.rowCount > 0) {
          inserted++;
        } else {
          duplicates++;
        }
      }

      await client.query("COMMIT");
      return { inserted, duplicates };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  /**
   * Query filtered allotments with pagination and analytics summary
   */
  async queryAllotments({ examId = "tg-eapcet", year, phase, collegeCode, branchCode, search = "", category = "", gender = "", page = 1, limit = 50 }) {
    let yearNum = 2026;
    let phaseStr = "phase2";

    if (year) {
      if (typeof year === "string" && year.includes("-")) {
        const parts = year.split("-");
        yearNum = parseInt(parts[0], 10);
        phaseStr = parts[1];
      } else if (!isNaN(year)) {
        yearNum = parseInt(year, 10);
        phaseStr = phase || "phase1";
      }
    }

    const cCode = (collegeCode || "CBIT").toUpperCase();
    const bCode = (branchCode || "CIV").toUpperCase();

    // 1. Fetch Candidates
    const conditions = [
      `exam_id = $1`,
      `admission_year = $2`,
      `phase = $3`,
      `college_code = $4`,
      `branch_code = $5`
    ];
    const params = [examId, yearNum, phaseStr, cCode, bCode];
    let pIdx = 6;

    if (gender) {
      conditions.push(`gender = $${pIdx}`);
      params.push(gender.toUpperCase());
      pIdx++;
    }

    if (category) {
      conditions.push(`(caste = $${pIdx} OR seat_category ILIKE $${pIdx + 1})`);
      params.push(category.toUpperCase(), `%${category}%`);
      pIdx += 2;
    }

    if (search && search.trim()) {
      conditions.push(`(candidate_name ILIKE $${pIdx} OR roll_no ILIKE $${pIdx} OR seat_category ILIKE $${pIdx})`);
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    const whereClause = conditions.join(" AND ");

    const countQuery = `SELECT COUNT(*) as total FROM eapcet_allotment_records WHERE ${whereClause};`;
    const { rows: countRows } = await pool.query(countQuery, params);
    const totalRecords = parseInt(countRows[0]?.total || "0", 10);

    const offset = (Math.max(1, page) - 1) * limit;
    const dataQuery = `
      SELECT id, admission_year as "admissionYear", phase, college_code as "collegeCode",
             college_name as "collegeName", branch_code as "branchCode", branch_name as "branchName",
             rank, roll_no as "rollNo", candidate_name as "candidateName", gender,
             region, caste as "category", seat_category as "seatCategory",
             historical_exam_name as "historicalExamName"
      FROM eapcet_allotment_records
      WHERE ${whereClause}
      ORDER BY rank ASC
      LIMIT $${pIdx} OFFSET $${pIdx + 1};
    `;
    const { rows: candidateRows } = await pool.query(dataQuery, [...params, limit, offset]);

    // 2. Fetch Aggregated Statistics for this College & Branch
    const statsQuery = `
      SELECT 
        COUNT(*) as total_seats,
        MIN(rank) as opening_rank,
        MAX(rank) as closing_rank,
        COUNT(CASE WHEN gender = 'M' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'F' THEN 1 END) as female_count
      FROM eapcet_allotment_records
      WHERE exam_id = $1 AND admission_year = $2 AND phase = $3 AND college_code = $4 AND branch_code = $5;
    `;
    const { rows: statsRows } = await pool.query(statsQuery, [examId, yearNum, phaseStr, cCode, bCode]);
    const stats = statsRows[0] || {};
    const totalSeats = parseInt(stats.total_seats || "0", 10);
    const maleCount = parseInt(stats.male_count || "0", 10);
    const femaleCount = parseInt(stats.female_count || "0", 10);

    // 3. Category distribution & closing ranks
    const catQuery = `
      SELECT 
        seat_category,
        COUNT(*) as seat_count,
        MIN(rank) as opening_rank,
        MAX(rank) as closing_rank
      FROM eapcet_allotment_records
      WHERE exam_id = $1 AND admission_year = $2 AND phase = $3 AND college_code = $4 AND branch_code = $5
      GROUP BY seat_category
      ORDER BY MIN(rank) ASC;
    `;
    const { rows: catRows } = await pool.query(catQuery, [examId, yearNum, phaseStr, cCode, bCode]);

    const categoryCounts = {};
    catRows.forEach(r => {
      categoryCounts[r.seat_category] = parseInt(r.seat_count, 10);
    });

    const categoryClosingRanks = catRows.map(r => ({
      seatCategory: r.seat_category,
      openingRank: parseInt(r.opening_rank, 10),
      closingRank: parseInt(r.closing_rank, 10)
    }));

    return {
      totalRecords,
      page: Math.max(1, page),
      pageSize: limit,
      totalPages: Math.max(1, Math.ceil(totalRecords / limit)),
      totalSeats,
      openingRank: parseInt(stats.opening_rank || "0", 10),
      closingRank: parseInt(stats.closing_rank || "0", 10),
      genderSplit: {
        male: maleCount,
        female: femaleCount,
        malePercent: totalSeats > 0 ? Math.round((maleCount / totalSeats) * 100) : 0,
        femalePercent: totalSeats > 0 ? Math.round((femaleCount / totalSeats) * 100) : 0
      },
      categoryCounts,
      categoryClosingRanks,
      candidates: candidateRows
    };
  },

  /**
   * Get total verified allotment records count in database
   */
  async getTotalDatabaseRecordsCount() {
    const { rows } = await pool.query("SELECT COUNT(*) as total FROM eapcet_allotment_records;");
    return parseInt(rows[0]?.total || "0", 10);
  }
};
