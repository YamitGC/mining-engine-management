import { Pool } from 'pg';
import { config } from './env';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

export async function initDatabase(maxRetries = 15, delayMs = 2000): Promise<void> {
  let retries = maxRetries;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(150) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN', 'OPERATOR')),
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);
        console.log('[Auth Service] Database tables initialized successfully');
        return;
      } finally {
        client.release();
      }
    } catch (error) {
      retries -= 1;
      console.warn(`[Auth Service] Esperando a PostgreSQL (reintentando en ${delayMs / 1000}s, intentos restantes: ${retries})... Error: ${(error as Error).message}`);
      if (retries === 0) {
        console.error('[Auth Service] No se pudo conectar a PostgreSQL tras múltiples intentos:', error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
