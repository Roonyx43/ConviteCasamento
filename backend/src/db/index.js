import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  host: "maglev.proxy.rlwy.net",
  port: 10886,
  database: "railway",
  user: "postgres",
  password: "AfWCkrcYbLHSuqBuoyzloLOapGZVcqUG",
  ssl: { rejectUnauthorized: false },  // obrigatório no Railway
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5,
});

pool.on("error", (err) => {
  console.error("PG pool error:", err);
});