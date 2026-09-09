import { api } from "./api";

export interface UserListItem {
  id: number;
  personId: number | null;
  fio: string;
  login: string | null;
  accountName: string | null;
  departmentName: string;
  place: string | null;
  phone: string | null;
  isAdmin: boolean;
}

export interface UserEditItem {
  id: number;
  lastname: string | null;
  firstname: string | null;
  middleName: string | null;
  login: string | null;
  accountName: string | null;
  isAdmin: boolean;
}

export interface UserEditForm {
  lastname?: string;
  firstname?: string;
  middleName?: string;
  login: string;
  accountName: string;
  isAdmin: boolean;
}

export function getUsers(search: string): Promise<UserListItem[]> {
  return api<UserListItem[]>(`/api/users?search=${encodeURIComponent(search)}`);
}

export function getUser(id: number): Promise<UserEditItem> {
  return api<UserEditItem>(`/api/users/${id}`);
}

export function updateUser(id: number, form: UserEditForm): Promise<void> {
  return api<void>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(form) });
}
