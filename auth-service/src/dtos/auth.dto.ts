import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  email: z.string().email('Formato de correo electrónico inválido').max(150),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100),
  role: z.enum(['ADMIN', 'OPERATOR']).default('OPERATOR')
});

export const loginSchema = z.object({
  email: z.string().email('Formato de correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().max(150).optional(),
  role: z.enum(['ADMIN', 'OPERATOR']).optional(),
  password: z.string().min(6).optional()
});

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'El campo is_active es requerido' })
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

