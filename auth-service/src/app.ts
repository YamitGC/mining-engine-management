import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      service: 'auth-service',
      timestamp: new Date().toISOString()
    });
  });

  // Endpoints de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  // Manejador de rutas no encontradas (404)
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
  });

  // Middleware global de manejo de errores
  app.use(errorHandler);

  return app;
};
