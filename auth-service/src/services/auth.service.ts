import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';
import { UserResponse, JwtPayload } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { config } from '../config/env';

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async register(data: RegisterDto): Promise<{ user: UserResponse; token: string }> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('El correo electrónico ya se encuentra registrado', 409);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await this.userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || 'OPERATOR'
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async login(data: LoginDto): Promise<{ user: UserResponse; token: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Credenciales incorrectas: correo o contraseña inválidos', 401);
    }

    if (!user.is_active) {
      throw new AppError('La cuenta de usuario se encuentra inactiva. Contacte al administrador', 403);
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
    if (!passwordMatch) {
      throw new AppError('Credenciales incorrectas: correo o contraseña inválidos', 401);
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  private generateToken(user: { id: number; email: string; role: any; name: string }): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    return jwt.sign(payload, config.jwt.secret, {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.expiresIn
    } as jwt.SignOptions);
  }

  public sanitizeUser(user: any): UserResponse {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }
}
