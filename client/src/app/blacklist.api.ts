import { api } from "./api";
import { appendPaging, type PagedResult } from "./paging";

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

export function getBlackList(
  search: string, page: number, pageSize: number
): Promise<PagedResult<BlackListItem>> {
  const query = new URLSearchParams({ search });
  appendPaging(query, page, pageSize);

  return api<PagedResult<BlackListItem>>(`/api/blacklist?${query}`);
}

export function addToBlackList(form: AddBlackListForm): Promise<BlackListItem> {
  return api<BlackListItem>("/api/blacklist", { method: "POST", body: JSON.stringify(form) });
}

export function removeFromBlackList(id: number): Promise<void> {
  return api<void>(`/api/blacklist/${id}`, { method: "DELETE" });
}
