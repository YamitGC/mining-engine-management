export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  name: string;
  id_type: string;
  id_number: string;
  email: string;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Engine {
  id: number;
  serial_number: string;
  manufacturer: string;
  model: string;
  engine_type: string;
  power_capacity: string;
  client_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export type RepairStatus =
  | 'Recibido'
  | 'En diagnóstico'
  | 'Esperando aprobación'
  | 'En reparación'
  | 'En pruebas'
  | 'Finalizado'
  | 'Entregado';

export interface RepairOrderHistory {
  id: number;
  previous_status?: RepairStatus | null;
  new_status: RepairStatus;
  changed_by_user_id?: number | null;
  changed_by_user_name?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface RepairOrder {
  id: number;
  order_number: string;
  engine_id: number;
  client_id: number;
  reception_date: string;
  problem_description: string;
  technical_diagnosis?: string | null;
  work_performed?: string | null;
  assigned_technician?: string | null;
  estimated_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  status: RepairStatus;
  observations?: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
  engine?: Engine;
  status_history?: RepairOrderHistory[];
}
