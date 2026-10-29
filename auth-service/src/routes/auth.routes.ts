import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../dtos/auth.dto';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { loginRateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();
const controller = new AuthController();

// POST /api/auth/register - Registro de nuevo usuario
router.post('/register', validate(registerSchema), controller.register);

// POST /api/auth/login - Inicio de sesión protegido con Rate Limiting contra fuerza bruta
router.post('/login', loginRateLimiter, validate(loginSchema), controller.login);

// GET /api/auth/login - Mensaje explicativo si alguien accede por navegador
router.get('/login', (req, res) => {
  res.status(405).json({
    status: 'error',
    message: 'El inicio de sesión requiere una petición HTTP POST con body JSON {"email": "...", "password": "..."}. No se admite método GET por navegador.'
  });
});

// GET /api/auth/profile - Perfil del usuario logueado
router.get('/profile', authenticateJwt, controller.getProfile);

export default router;

