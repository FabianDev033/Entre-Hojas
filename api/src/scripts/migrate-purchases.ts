import type { RowDataPacket } from "mysql2";
import pool from "../config/database.js";

try {
  // Existing purchases predate automatic inventory movements; never replay them.
  const columns = [
    ["anulada", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["stock_aplicado", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["version", "INT NOT NULL DEFAULT 1"],
  ];
  for (const [name, definition] of columns) {
    const [existing] = await pool.query<RowDataPacket[]>(
      "SHOW COLUMNS FROM compras LIKE ?",
      [name],
    );
    if (!existing.length)
      await pool.query(`ALTER TABLE compras ADD COLUMN ${name} ${definition}`);
  }
  console.log(
    "Compras preparadas. Las compras anteriores conservan su stock y sus datos.",
  );
} catch (error) {
  console.error("No se pudo preparar compras:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
