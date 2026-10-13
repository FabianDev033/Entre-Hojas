import type { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

try {
  const [columns] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM plantas LIKE 'etiquetas'");
  if (!columns.length) {
    await pool.query("ALTER TABLE plantas ADD COLUMN etiquetas JSON NULL AFTER etiqueta");
    console.log("Columna etiquetas agregada. Se conservan las etiquetas actuales.");
  } else {
    console.log("La columna etiquetas ya existe.");
  }
} catch (error) {
  console.error("No se pudo preparar la base para etiquetas múltiples:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
