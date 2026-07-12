import multer from "multer";

// Keeps the uploaded file in memory (not written to disk) — fine for
// spreadsheets up to a few thousand rows, which is our real-world scale here.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});