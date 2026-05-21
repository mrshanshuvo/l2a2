import { Pool } from "pg";
import config from "../config/index.ts";

export const pool = new Pool({
  connectionString: config.connectionString,
});

export const initDB = async () => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    console.log("Database connected successfully:", result.rows[0].now);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};