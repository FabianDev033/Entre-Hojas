import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.js";

export interface User { id: number; user: string | null; password: string | null; }

class UserModel {
  async findAll(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT `id`, `user`, `password` FROM `users`");
    return rows as User[];
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT `id`, `user`, `password` FROM `users` WHERE `id` = ?", [id]);
    return (rows[0] as User | undefined) ?? null;
  }

  async findByUser(user: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT `id`, `user`, `password` FROM `users` WHERE `user` = ? LIMIT 1", [user]);
    return (rows[0] as User | undefined) ?? null;
  }

  async create(data: User): Promise<User> {
    await pool.execute<ResultSetHeader>("INSERT INTO `users` (`id`, `user`, `password`) VALUES (?, ?, ?)", [data.id, data.user, data.password]);
    return data;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const entries = Object.entries(data).filter(([key, value]) => key !== "id" && value !== undefined);
    await pool.execute<ResultSetHeader>(`UPDATE \`user\` SET ${entries.map(([key]) => `\`${key}\` = ?`).join(", ")} WHERE \`id\` = ?`, [...entries.map(([, value]) => value), id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM `users` WHERE `id` = ?", [id]);
    return result.affectedRows > 0;
  }
}

export default new UserModel();
