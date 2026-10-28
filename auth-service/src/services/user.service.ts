import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { UpdateUserDto, UpdateStatusDto } from '../dtos/auth.dto';
import { UserResponse } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.userRepository.findAll();
    return users.map(u => this.sanitize(u));
  }

  async getUserById(id: number): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return this.sanitize(user);
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError('El nuevo correo electrónico ya está registrado por otro usuario', 409);
      }
    }

    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await this.userRepository.update(id, {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash
    });

    if (!updated) {
      throw new AppError('Error al actualizar el usuario', 500);
    }

    return this.sanitize(updated);
  }

  async updateStatus(id: number, data: UpdateStatusDto): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await this.userRepository.update(id, {
      isActive: data.is_active
    });

    if (!updated) {
      throw new AppError('Error al actualizar el estado del usuario', 500);
    }

    return this.sanitize(updated);
  }

  private sanitize(user: any): UserResponse {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
