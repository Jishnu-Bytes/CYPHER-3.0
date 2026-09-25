import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PERSISTENCE_FILE = path.join(DATA_DIR, "persisted_reports.json");

/**
 * Ensures the data directory and persistence file exist
 */
function ensureStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PERSISTENCE_FILE)) {
      fs.writeFileSync(PERSISTENCE_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[Persistence] Storage initialization warning:", err);
  }
}

/**
 * Loads persisted civic reports synchronously
 */
export function loadPersistedReports<T = any>(): T[] {
  try {
    ensureStorage();
    if (fs.existsSync(PERSISTENCE_FILE)) {
      const raw = fs.readFileSync(PERSISTENCE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Persistence] Failed to read persisted reports, using memory seed:", err);
  }
  return [];
}

/**
 * Persists reports to local JSON storage
 */
export async function persistReports(reports: any[]): Promise<boolean> {
  try {
    ensureStorage();
    // Exclude large temporary photo buffers to optimize disk I/O
    const sanitized = reports.map((r) => {
      const copy = { ...r };
      if (copy.photoBase64 && copy.photoBase64.length > 500000) {
        copy.photoBase64 = copy.photoBase64.slice(0, 100) + "...[TRUNCATED_PERSISTENCE]";
      }
      return copy;
    });

    await fs.promises.writeFile(
      PERSISTENCE_FILE,
      JSON.stringify(sanitized, null, 2),
      "utf-8"
    );
    return true;
  } catch (err) {
    console.error("[Persistence] Write failure:", err);
    return false;
  }
}
