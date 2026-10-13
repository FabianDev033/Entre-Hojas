import type { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

try {
  const [columns] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM plantas LIKE 'petFriendly'");
  if (!columns.length) {
    await pool.query("ALTER TABLE plantas ADD COLUMN petFriendly BOOLEAN NULL DEFAULT NULL AFTER cuidado");
    console.log("Columna petFriendly agregada. Las plantas actuales quedan sin especificar.");
  } else {
    console.log("La columna petFriendly ya existe. Se conservan sus valores.");
  }
} catch (error) {
  console.error("No se pudo preparar la base para plantas aptas para mascotas:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
