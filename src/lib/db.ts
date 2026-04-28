import "server-only";
import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    const config: PoolConfig = {
      connectionString,
      // RDS terminates TLS but most stock connection strings don't pin the
      // CA. `sslmode=require` in the URL is enough; we just don't reject
      // self-signed for now to avoid biting on first connection.
      ssl: connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    };
    pool = new Pool(config);
    pool.on("error", (err) => {
      // Don't crash the process on idle-client errors.
      console.error("[db] idle client error", err);
    });
  }
  return pool;
}

export async function query<T = unknown>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<{ rows: T[]; rowCount: number | null }> {
  const result = await getPool().query(text, params as unknown[] | undefined);
  return { rows: result.rows as T[], rowCount: result.rowCount };
}
