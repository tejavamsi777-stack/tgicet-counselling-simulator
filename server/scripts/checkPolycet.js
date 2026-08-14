import { pool } from "../src/config/database.js";

async function check() {
  const { rows } = await pool.query("SELECT * FROM exams WHERE slug = 'tg-polycet'");
  console.log("TG POLYCET Row:", rows);

  if (rows.length === 0) {
    const inserted = await pool.query(
      "INSERT INTO exams (slug, short_name, name, description, is_active) VALUES ('tg-polycet', 'TG POLYCET', 'Telangana Polytechnic Common Entrance Test', 'Polytechnic & Diploma admissions guidance for 10th / SSC passed candidates.', true) RETURNING *"
    );
    console.log("Inserted TG POLYCET:", inserted.rows[0]);
  } else {
    const updated = await pool.query(
      "UPDATE exams SET is_active = true, description = 'Polytechnic & Diploma admissions guidance for 10th / SSC passed candidates.' WHERE slug = 'tg-polycet' RETURNING *"
    );
    console.log("Updated TG POLYCET to active:", updated.rows[0]);
  }
  await pool.end();
}

check();
