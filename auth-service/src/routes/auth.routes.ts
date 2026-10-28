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

// GET /api/auth/profile - Perfil del usuario logueado
router.get('/profile', authenticateJwt, controller.getProfile);

export default router;

