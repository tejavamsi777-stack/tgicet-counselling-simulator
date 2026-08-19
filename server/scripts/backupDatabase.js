import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { pool } from "../src/config/database.js";

dotenv.config();

const BACKUP_DIR = path.resolve("server/backups");
const RETENTION_DAYS = 7;

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function encryptBuffer(buffer, secretKey) {
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

export async function runDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFilename = `backup_tgcounselling_${timestamp}.json.enc`;
  const backupFilePath = path.join(BACKUP_DIR, backupFilename);
  const encryptionSecret = process.env.BACKUP_ENCRYPTION_KEY || process.env.JWT_SECRET || "TG_SECURE_BACKUP_KEY_2026";

  console.log(`[Backup] Starting automated PostgreSQL database snapshot at ${new Date().toISOString()}...`);

  try {
    // 1. Snapshot key application tables
    const tables = [
      "exams",
      "colleges",
      "courses",
      "categories",
      "districts",
      "cutoffs",
      "users",
      "user_checklists",
      "eapcet_scrape_cache",
    ];

    const snapshotData = {
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        tablesCount: tables.length,
      },
      data: {},
    };

    let totalRecordCount = 0;
    for (const table of tables) {
      try {
        const { rows } = await pool.query(`SELECT * FROM ${table}`);
        snapshotData.data[table] = rows;
        totalRecordCount += rows.length;
      } catch (err) {
        console.warn(`[Backup] Table ${table} not present or empty during snapshot:`, err.message);
        snapshotData.data[table] = [];
      }
    }

    snapshotData.meta.totalRecords = totalRecordCount;

    // 2. Serialize and Encrypt
    const jsonString = JSON.stringify(snapshotData, null, 2);
    const rawBuffer = Buffer.from(jsonString, "utf8");
    const encryptedBuffer = encryptBuffer(rawBuffer, encryptionSecret);

    fs.writeFileSync(backupFilePath, encryptedBuffer);
    const stats = fs.statSync(backupFilePath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`[Backup] ✅ Backup successfully created: ${backupFilename} (${sizeKB} KB, ${totalRecordCount} records)`);

    // 3. Clean up backups older than retention window
    cleanOldBackups();

    return {
      success: true,
      filename: backupFilename,
      records: totalRecordCount,
      sizeKB,
    };
  } catch (error) {
    console.error(`[Backup Alert] ❌ Database Backup Failed! Error: ${error.message}`);
    logAdminAlert(`CRITICAL: Automated Database Backup Failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      const ageDays = (now - stat.mtimeMs) / (1000 * 60 * 60 * 24);

      if (ageDays > RETENTION_DAYS) {
        fs.unlinkSync(filePath);
        console.log(`[Backup] Rotated out old backup file: ${file} (${ageDays.toFixed(1)} days old)`);
      }
    });
  } catch (err) {
    console.warn("[Backup] Rotation warning:", err.message);
  }
}

function logAdminAlert(message) {
  const alertLogPath = path.join(BACKUP_DIR, "backup_alerts.log");
  const alertEntry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(alertLogPath, alertEntry);
}

// Execute directly if run via node CLI
runDatabaseBackup().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
