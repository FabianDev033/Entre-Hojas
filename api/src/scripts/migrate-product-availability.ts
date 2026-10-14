import type { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

try {
  const [columns] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM plantas LIKE 'habilitado'");
  if (!columns.length) {
    await pool.query("ALTER TABLE plantas ADD COLUMN habilitado BOOLEAN NOT NULL DEFAULT TRUE AFTER stock");
    console.log("Columna habilitado agregada. Los productos actuales siguen habilitados.");
  } else {
    console.log("La columna habilitado ya existe. Se conservan sus valores.");
  }
} catch (error) {
  console.error("No se pudo preparar la disponibilidad de productos:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
