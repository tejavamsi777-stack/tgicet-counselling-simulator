import { pool } from "../src/config/database.js";

const client = await pool.connect();
try {
  await client.query("BEGIN");

  const { rows } = await client.query(
    "SELECT id, exam_id, code FROM categories WHERE code LIKE '%-_%' OR code LIKE '%-%'"
  );
  // Only keep dash-format ones
  const dashRows = rows.filter((r) => r.code.includes("-"));
  console.log("Dash-format categories found:", dashRows.length, dashRows.map((r) => r.code));

  for (const dashRow of dashRows) {
    const canonical = dashRow.code.toUpperCase().replace(/-/g, "_");
    const { rows: under } = await client.query(
      "SELECT id FROM categories WHERE exam_id = $1 AND code = $2",
      [dashRow.exam_id, canonical]
    );

    if (under.length > 0) {
      const canonicalId = under[0].id;

      // For cutoffs that would conflict (canonical already has a row for same key),
      // delete the duplicate dash-version cutoff instead of re-pointing.
      await client.query(`
        DELETE FROM cutoffs dash_c
        USING cutoffs AS canon_c
        WHERE dash_c.category_id = $1
          AND canon_c.category_id = $2
          AND dash_c.exam_id     = canon_c.exam_id
          AND dash_c.year_id     = canon_c.year_id
          AND dash_c.college_id  = canon_c.college_id
          AND dash_c.course_id   = canon_c.course_id
          AND dash_c.gender      = canon_c.gender
      `, [dashRow.id, canonicalId]);

      // Now re-point any remaining (non-conflicting) cutoffs
      const updated = await client.query(
        "UPDATE cutoffs SET category_id = $1 WHERE category_id = $2",
        [canonicalId, dashRow.id]
      );
      console.log(`Re-pointed ${updated.rowCount} cutoffs: ${dashRow.code} -> ${canonical}`);

      // Delete the duplicate category row
      await client.query("DELETE FROM categories WHERE id = $1", [dashRow.id]);
      console.log(`Deleted duplicate category: ${dashRow.code}`);
    } else {
      // No underscore version — just rename it in place
      await client.query(
        "UPDATE categories SET code = $1, name = $1 WHERE id = $2",
        [canonical, dashRow.id]
      );
      console.log(`Renamed: ${dashRow.code} -> ${canonical}`);
    }
  }

  await client.query("COMMIT");
  console.log("Cleanup complete.");
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Error — rolled back:", err.message);
} finally {
  client.release();
  await pool.end();
}
