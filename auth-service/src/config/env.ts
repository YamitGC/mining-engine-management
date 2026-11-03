import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde la raíz del proyecto o local
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const jwtSecret = process.env.JWT_SECRET || (isTest ? 'test_jwt_secret_for_testing_purposes_only_32_chars' : undefined);

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    'FATAL: La variable de entorno JWT_SECRET es obligatoria y debe tener al menos 32 caracteres.'
  );
}

export const config = {
  port: parseInt(process.env.AUTH_PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: jwtSecret,
    algorithm: (process.env.JWT_ALGORITHM || 'HS256') as 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  },
  databaseUrl: process.env.AUTH_DATABASE_URL || 'postgresql://admin:secretpassword@localhost:5433/auth_db'
};

