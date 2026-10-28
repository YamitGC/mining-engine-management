import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Acceso no autenticado'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: `Acceso denegado: Se requiere uno de los roles [${allowedRoles.join(', ')}]`
      });
      return;
    }

    next();
  };
};

