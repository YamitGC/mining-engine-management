import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { updateUserSchema, updateStatusSchema } from '../dtos/auth.dto';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';

const router = Router();
const controller = new UserController();

// Todos los endpoints de usuarios requieren token JWT válido
router.use(authenticateJwt);

// GET /api/users - Listar todos los usuarios (solo ADMIN)
router.get('/', authorizeRoles('ADMIN'), controller.getAll);

// GET /api/users/:id - Detalle de usuario
router.get('/:id', controller.getById);

// PUT /api/users/:id - Actualizar usuario (solo ADMIN)
router.put('/:id', authorizeRoles('ADMIN'), validate(updateUserSchema), controller.update);

// PATCH /api/users/:id/status - Activar o desactivar usuario (solo ADMIN)
router.patch('/:id/status', authorizeRoles('ADMIN'), validate(updateStatusSchema), controller.updateStatus);

export default router;

