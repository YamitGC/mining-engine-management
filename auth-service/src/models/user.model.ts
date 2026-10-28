export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  name: string;
}
