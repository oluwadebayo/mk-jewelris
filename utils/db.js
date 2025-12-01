// utils/db.js
import { promises as fs } from "fs";
import path from "path";

// All JSON files live in project root
function jsonPath(filename) {
  return path.join(process.cwd(), filename);
}

// -------------------------
// READ JSON
// -------------------------
export async function readJSON(filename, fallback = null) {
  const p = jsonPath(filename);

  try {
    const raw = await fs.readFile(p, "utf8");
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

// -------------------------
// WRITE JSON (atomic)
// -------------------------
export async function writeJSON(filename, data) {
  const p = jsonPath(filename);
  const tmp = p + ".tmp";

  const str = JSON.stringify(data, null, 2);

  // write to temp file first
  await fs.writeFile(tmp, str, "utf8");

  // then rename (atomic swap)
  await fs.rename(tmp, p);
}
