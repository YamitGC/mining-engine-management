import request from 'supertest';
import { createApp } from '../app';
import { UserRepository } from '../repositories/user.repository';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

jest.mock('../repositories/user.repository');

describe('User Management API Tests', () => {
  const app = createApp();

  const adminToken = jwt.sign(
    { userId: 1, email: 'admin@mining.com', role: 'ADMIN', name: 'Admin User' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  const operatorToken = jwt.sign(
    { userId: 2, email: 'oper@mining.com', role: 'OPERATOR', name: 'Oper User' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users (Listar usuarios)', () => {
    it('debe permitir listar usuarios a un ADMIN (200 OK)', async () => {
      (UserRepository.prototype.findAll as jest.Mock).mockResolvedValue([
        { id: 1, name: 'Admin', email: 'admin@mining.com', role: 'ADMIN', is_active: true }
      ]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.users.length).toBe(1);
    });

    it('debe bloquear con 403 Forbidden a un OPERATOR', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${operatorToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('Acceso denegado');
    });
  });

  describe('PATCH /api/users/:id/status (Desactivar/Activar usuario)', () => {
    it('debe permitir a un ADMIN cambiar el estado de un usuario', async () => {
      (UserRepository.prototype.findById as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Oper',
        email: 'oper@mining.com',
        role: 'OPERATOR',
        is_active: true
      });

      (UserRepository.prototype.update as jest.Mock).mockResolvedValue({
        id: 2,
        name: 'Oper',
        email: 'oper@mining.com',
        role: 'OPERATOR',
        is_active: false
      });

      const response = await request(app)
        .patch('/api/users/2/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false });

      expect(response.status).toBe(200);
      expect(response.body.data.user.is_active).toBe(false);
    });
  });
});
