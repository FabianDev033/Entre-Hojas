import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/database.js";

export interface User { id: number; usuario: string | null; contraseña: string | null; }

class UserModel {
  async findAll(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT `id`, `usuario`, `contraseña` FROM `user`");
    return rows as User[];
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT `id`, `usuario`, `contraseña` FROM `user` WHERE `id` = ?", [id]);
    return (rows[0] as User | undefined) ?? null;
  }

  async findByUsername(usuario: string): Promise<User | null> {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT `id`, `usuario`, `contraseña` FROM `user` WHERE `usuario` = ? LIMIT 1", [usuario]);
    return (rows[0] as User | undefined) ?? null;
  }

  async create(data: User): Promise<User> {
    await pool.execute<ResultSetHeader>("INSERT INTO `user` (`id`, `usuario`, `contraseña`) VALUES (?, ?, ?)", [data.id, data.usuario, data.contraseña]);
    return data;
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    const entries = Object.entries(data).filter(([key, value]) => key !== "id" && value !== undefined);
    await pool.execute<ResultSetHeader>(`UPDATE \`user\` SET ${entries.map(([key]) => `\`${key}\` = ?`).join(", ")} WHERE \`id\` = ?`, [...entries.map(([, value]) => value), id]);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM `user` WHERE `id` = ?", [id]);
    return result.affectedRows > 0;
  }
}

export default new UserModel();
