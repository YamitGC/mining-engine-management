import { createApp } from './app';
import { config } from './config/env';
import { initDatabase } from './config/database';
import { UserRepository } from './repositories/user.repository';
import bcrypt from 'bcryptjs';

const startServer = async () => {
  try {
    // 1. Inicializar tablas en PostgreSQL
    await initDatabase();

    // 2. Sembrar usuario inicial (ADMIN) si no existen usuarios
    const userRepo = new UserRepository();
    const count = await userRepo.count();
    if (count === 0) {
      const defaultHash = await bcrypt.hash('admin123', 10);
      await userRepo.create({
        name: 'Administrador General',
        email: 'admin@mining.com',
        passwordHash: defaultHash,
        role: 'ADMIN'
      });
      console.log('[Auth Service] Default admin created: admin@mining.com / admin123');
    }

    // 3. Iniciar servidor Express
    const app = createApp();
    app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`[Auth Service] Running on http://localhost:${config.port}`);
      console.log(`[Auth Service] Environment: ${config.nodeEnv}`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('[Auth Service] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();

