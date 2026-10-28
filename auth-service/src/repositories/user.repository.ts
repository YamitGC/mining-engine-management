import { pool } from '../config/database';
import { User, UserRole } from '../models/user.model';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1;
    `;
    const result = await pool.query<User>(query, [email.trim()]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1;
    `;
    const result = await pool.query<User>(query, [id]);
    return result.rows[0] || null;
  }

  async findAll(): Promise<User[]> {
    const query = `
      SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
      FROM users
      ORDER BY id ASC;
    `;
    const result = await pool.query<User>(query);
    return result.rows;
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    const query = `
      INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, LOWER($2), $3, $4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, name, email, password_hash, role, is_active, created_at, updated_at;
    `;
    const result = await pool.query<User>(query, [
      data.name.trim(),
      data.email.trim(),
      data.passwordHash,
      data.role
    ]);
    return result.rows[0];
  }

  async update(id: number, data: Partial<{
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
  }>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let counter = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${counter++}`);
      values.push(data.name.trim());
    }
    if (data.email !== undefined) {
      fields.push(`email = LOWER($${counter++})`);
      values.push(data.email.trim());
    }
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${counter++}`);
      values.push(data.passwordHash);
    }
    if (data.role !== undefined) {
      fields.push(`role = $${counter++}`);
      values.push(data.role);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${counter++}`);
      values.push(data.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${counter}
      RETURNING id, name, email, password_hash, role, is_active, created_at, updated_at;
    `;

    const result = await pool.query<User>(query, values);
    return result.rows[0] || null;
  }

  async count(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count, 10);
  }
}
