import { api } from "./api";

export interface BlackListItem {
  id: number;
  iin: string | null;
  lastname: string | null;
  firstname: string | null;
  middleName: string | null;
  createdDate: string;
  createdBy: string;
}

export interface AddBlackListForm {
  iin: string;
  lastname: string;
  firstname: string;
  middleName?: string;
}

export function getBlackList(search: string): Promise<BlackListItem[]> {
  return api<BlackListItem[]>(`/api/blacklist?search=${encodeURIComponent(search)}`);
}

export function addToBlackList(form: AddBlackListForm): Promise<BlackListItem> {
  return api<BlackListItem>("/api/blacklist", { method: "POST", body: JSON.stringify(form) });
}

export function removeFromBlackList(id: number): Promise<void> {
  return api<void>(`/api/blacklist/${id}`, { method: "DELETE" });
}
