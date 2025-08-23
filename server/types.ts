// server/types.ts

export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  full_name: string;
  department: string;
  role?: "admin" | "asset_manager" | "department_head" | "staff";
  is_active?: boolean;
  created_at?: Date;
}

export interface Asset {
  asset_id?: number;
  asset_name: string;
  description: string;
  category: string;
  serial_number: string;
  model: string;
  manufacturer: string;
  purchase_date: Date | null;
  purchase_cost: number;
  warranty_expiry: Date | null;
  location: string;
  condition: string;
  status: string;
  assigned_to?: number | null;
  notes?: string;
  created_at?: Date;
}
