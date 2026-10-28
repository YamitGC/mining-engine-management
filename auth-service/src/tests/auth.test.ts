import request from 'supertest';
import { createApp } from '../app';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

// Mockeamos el repositorio para pruebas aisladas
jest.mock('../repositories/user.repository');

describe('Auth Service API Tests', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('debe retornar status healthy y código 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('auth-service');
    });
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente y retornar token JWT', async () => {
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserRepository.prototype.create as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Carlos Minero',
        email: 'carlos@mining.com',
        password_hash: 'hashed_password',
        role: 'OPERATOR',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Carlos Minero',
          email: 'carlos@mining.com',
          password: 'password123',
          role: 'OPERATOR'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe('carlos@mining.com');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
      expect(response.body.data).toHaveProperty('token');
    });

    it('debe rechazar registro con correo duplicado (409 Conflict)', async () => {
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({
        id: 2,
        email: 'duplicado@mining.com'
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Otro Usuario',
          email: 'duplicado@mining.com',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
    });

    it('debe fallar si los datos de entrada son inválidos (400 Bad Request)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'no-es-correo',
          password: '123' // menos de 6 caracteres
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe autenticar exitosamente y retornar token JWT válido', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Carlos Minero',
        email: 'carlos@mining.com',
        password_hash: hashedPassword,
        role: 'OPERATOR',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'carlos@mining.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      
      // Validar decodificación del token
      const decoded: any = jwt.verify(response.body.data.token, config.jwt.secret);
      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('carlos@mining.com');
      expect(decoded.role).toBe('OPERATOR');
    });

    it('debe rechazar contraseña incorrecta (401 Unauthorized)', async () => {
      const hashedPassword = await bcrypt.hash('correct_password', 10);
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'carlos@mining.com',
        password_hash: hashedPassword,
        is_active: true
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'carlos@mining.com',
          password: 'wrong_password'
        });

      expect(response.status).toBe(401);
    });

    it('debe rechazar usuario inactivo (403 Forbidden)', async () => {
      (UserRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'inactivo@mining.com',
        password_hash: 'hashed',
        is_active: false
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactivo@mining.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Protección con JWT en /api/auth/profile', () => {
    it('debe retornar 401 si no se envía token', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.status).toBe(401);
    });

    it('debe retornar 200 con datos del usuario si el token es válido', async () => {
      const validToken = jwt.sign(
        { userId: 1, email: 'admin@mining.com', role: 'ADMIN', name: 'Admin' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      (UserRepository.prototype.findById as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Admin',
        email: 'admin@mining.com',
        role: 'ADMIN',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('admin@mining.com');
    });
  });
});
