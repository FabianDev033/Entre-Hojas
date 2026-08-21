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

const user = readArgument("user");
const password = readArgument("password");

if (!user || !password) {
  console.error("Usage: pnpm create-user -- --user <user> --password <password>");
  process.exitCode = 1;
} else {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64) as Buffer).toString("hex");
  const passwordHash = `scrypt$${salt}$${hash}`;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute<ExistingUser[]>(
      "SELECT `id` FROM `users` WHERE `user` = ? LIMIT 1 FOR UPDATE",
      [user],
    );

    if (existingRows[0]) {
      await connection.execute<ResultSetHeader>(
        "UPDATE `users` SET `password` = ? WHERE `id` = ?",
        [passwordHash, existingRows[0].id],
      );
      console.log(`Password updated for user '${user}'.`);
    } else {
      const [nextIdRows] = await connection.query<RowDataPacket[]>(
        "SELECT COALESCE(MAX(`id`), 0) + 1 AS nextId FROM `users` FOR UPDATE",
      );
      const nextId = Number(nextIdRows[0].nextId);

      await connection.execute<ResultSetHeader>(
        "INSERT INTO `users` (`id`, `user`, `password`) VALUES (?, ?, ?)",
        [nextId, user, passwordHash],
      );
      console.log(`User '${user}' created.`);
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
