import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        status: 'success',
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ status: 'error', message: 'ID de usuario inválido' });
        return;
      }
      const user = await userService.getUserById(id);
      res.status(200).json({
        status: 'success',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ status: 'error', message: 'ID de usuario inválido' });
        return;
      }
      const updatedUser = await userService.updateUser(id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Usuario actualizado exitosamente',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ status: 'error', message: 'ID de usuario inválido' });
        return;
      }
      const updatedUser = await userService.updateStatus(id, req.body);
      res.status(200).json({
        status: 'success',
        message: `Usuario ${req.body.is_active ? 'activado' : 'desactivado'} exitosamente`,
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  }
}
