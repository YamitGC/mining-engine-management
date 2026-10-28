import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del proyecto o local
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.AUTH_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_min_32_characters_long_12345',
    algorithm: (process.env.JWT_ALGORITHM || 'HS256') as 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  },
  databaseUrl: process.env.AUTH_DATABASE_URL || 'postgresql://admin:secretpassword@localhost:5433/auth_db'
};

