import { pool } from "../src/config/database.js";

async function check() {
  const { rows } = await pool.query("SELECT * FROM exams WHERE slug = 'tg-ecet'");
  console.log("TG ECET Row:", rows);

  if (rows.length === 0) {
    const inserted = await pool.query(
      "INSERT INTO exams (slug, short_name, name, description, is_active) VALUES ('tg-ecet', 'TG ECET', 'Telangana Engineering Common Entrance Test', 'Lateral-entry B.E. / B.Tech / B.Pharmacy admissions.', true) RETURNING *"
    );
    console.log("Inserted TG ECET:", inserted.rows[0]);
  } else {
    const updated = await pool.query(
      "UPDATE exams SET is_active = true, description = 'Lateral-entry B.E. / B.Tech / B.Pharmacy admissions.' WHERE slug = 'tg-ecet' RETURNING *"
    );
    console.log("Updated TG ECET to active:", updated.rows[0]);
  }
  await pool.end();
}

check();
