import "dotenv/config";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.js";

const scrypt = promisify(scryptCallback);

type ExistingUser = RowDataPacket & { id: number };

const readArgument = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
};

const usuario = readArgument("user");
const contraseña = readArgument("password");

if (!usuario || !contraseña) {
  console.error("Uso: pnpm create-user -- --user <usuario> --password <contraseña>");
  process.exitCode = 1;
} else {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(contraseña, salt, 64) as Buffer).toString("hex");
  const contraseñaHasheada = `scrypt$${salt}$${hash}`;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute<ExistingUser[]>(
      "SELECT `id` FROM `users` WHERE `user` = ? LIMIT 1 FOR UPDATE",
      [usuario],
    );

    if (existingRows[0]) {
      await connection.execute<ResultSetHeader>(
        "UPDATE `users` SET `password` = ? WHERE `id` = ?",
        [contraseñaHasheada, existingRows[0].id],
      );
      console.log(`Contraseña actualizada para el usuario '${usuario}'.`);
    } else {
      const [nextIdRows] = await connection.query<RowDataPacket[]>(
        "SELECT COALESCE(MAX(`id`), 0) + 1 AS nextId FROM `users` FOR UPDATE",
      );
      const nextId = Number(nextIdRows[0].nextId);

      await connection.execute<ResultSetHeader>(
        "INSERT INTO `users` (`id`, `user`, `password`) VALUES (?, ?, ?)",
        [nextId, usuario, contraseñaHasheada],
      );
      console.log(`Usuario '${usuario}' creado.`);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}
