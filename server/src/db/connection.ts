import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance: DatabaseSync | null = null;

export function getDb(inMemory: boolean = false): DatabaseSync {
  if (dbInstance && !inMemory) {
    return dbInstance;
  }

  let db: DatabaseSync;
  if (inMemory) {
    db = new DatabaseSync(':memory:');
  } else {
    const dataDir = process.env.DATA_DIR
      ? path.resolve(process.env.DATA_DIR)
      : path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'mota.db');
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA busy_timeout = 5000;');
  }

  // Read and execute schema with robust path resolution for dev & prod
  const schemaCandidates = [
    path.resolve(__dirname, 'schema.sql'),
    path.resolve(__dirname, '../../src/db/schema.sql'),
    path.resolve(process.cwd(), 'server/src/db/schema.sql'),
    path.resolve(process.cwd(), 'src/db/schema.sql'),
    path.resolve(process.cwd(), 'server/dist/db/schema.sql'),
    path.resolve(process.cwd(), 'dist/db/schema.sql')
  ];
  const schemaPath = schemaCandidates.find(candidate => fs.existsSync(candidate));
  if (schemaPath) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }

  // Safe incremental migrations for existing databases
  try {
    const cols = db.prepare("PRAGMA table_info(auth_sessions)").all() as Array<{ name: string }>;
    const colNames = cols.map(c => c.name);
    if (colNames.length > 0) {
      if (!colNames.includes('token')) {
        db.exec("ALTER TABLE auth_sessions ADD COLUMN token TEXT;");
      }
      if (!colNames.includes('role')) {
        db.exec("ALTER TABLE auth_sessions ADD COLUMN role TEXT DEFAULT 'APPLICANT';");
      }
    }
  } catch {
    // Ignore if table info cannot be retrieved during initial creation
  }

  if (!inMemory) {
    dbInstance = db;
  }

  return db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
