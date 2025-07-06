import type { User } from './user';

export interface AdminUser {
  id: string;
  username: string;
  is_superuser: boolean;
  is_active: boolean;
  first_name: string;
  last_name: string;
  user_id: string;
  user?: User;
}

export interface FilterAdminUser {
  id?: string;
  username?: string;
  is_superuser?: boolean;
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  user_id?: string;
}

export interface CreateAdminUser {
  username: string;
  password: string;
  is_superuser: boolean;
  is_active: boolean;
  first_name: string;
  last_name: string;
  user_id: string;
}

export interface PatchAdminUser {
  username?: string;
  password?: string;
  is_superuser?: boolean;
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
  user_id?: string;
} 