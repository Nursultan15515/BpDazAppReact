import { api, apiDownload } from "./api";
import { appendPaging, type PagedResult } from "./paging";

/** Совпадает с RequestStatus на бэкенде. */
export type RequestStatus =
  | "Default"
  | "Decorated"
  | "Current"
  | "Overdue"
  | "Done"
  | "CardTaken";

/** Вкладки списка: все / в здании / покинувшие. */
export type RequestFilterMode = "All" | "InBuilding" | "Left";

export interface RequestListItem {
  id: number;
  visitorName: string;
  visitorIin: string;
  targetBuilding: string;
  place: string;
  period: string;
  enterExitTime: string;
  enterTime: string | null;
  exitTime: string | null;
  hostDepartment: string;
  hostPersonName: string;
  makerName: string;
  status: RequestStatus;
}

export interface RequestDetails {
  id: number;
  date: string;
  iin: string;
  lastname: string;
  firstname: string;
  middleName: string | null;
  organization: string | null;
  mobilePhone: string | null;
  day: string;
  timeFrom: string;
  timeTo: string;
  objective: string | null;
  hostPersonName: string;
  hostPhone: string | null;
  hostPlace: string;
  place: string;
  cardNumber: string | null;
  status: RequestStatus;
  /** Код фото в DocumentFiles. Пусто — снимка на посту не делали. */
  photoId: string | null;
  /** Разрешено ли удалять пропуск. Правило считает сервер. */
  canDelete: boolean;
}

/** Адрес фото посетителя по заявке. 404, если снимка нет. */
export function requestPhotoUrl(id: number): string {
  return `/api/requests/${id}/photo`;
}

export interface CreateRequestForm {
  iin: string;
  lastname: string;
  firstname: string;
  middleName?: string;
  organization?: string;
  mobilePhone: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  hostPersonId: number;
  placeId: number;
  place?: string;
  hostPhone?: string;
  purpose: string;
}

export interface RequestListParams {
  mode: RequestFilterMode;
  dateFrom: string;
  dateTo: string;
  onlyMine: boolean;
  search: string;
  page: number;
  pageSize: number;
}

export function getRequests(params: RequestListParams): Promise<PagedResult<RequestListItem>> {
  const query = new URLSearchParams({
    mode: params.mode,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    onlyMine: String(params.onlyMine),
    search: params.search,
  });
  appendPaging(query, params.page, params.pageSize);

  return api<PagedResult<RequestListItem>>(`/api/requests?${query}`);
}

/**
 * Выгружает список в Excel. Пагинация сюда не передаётся: в файл уходит вся
 * выборка по текущим фильтрам — как AllPages(true) у грида BpDazApp.
 */
export function exportRequests(
  params: Omit<RequestListParams, "page" | "pageSize">
): Promise<void> {
  const query = new URLSearchParams({
    mode: params.mode,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    onlyMine: String(params.onlyMine),
    search: params.search,
  });

  return apiDownload(`/api/requests/export?${query}`, "Список посетителей.xlsx");
}

export function getRequest(id: number): Promise<RequestDetails> {
  return api<RequestDetails>(`/api/requests/${id}`);
}

export function createRequest(form: CreateRequestForm): Promise<RequestDetails> {
  return api<RequestDetails>("/api/requests", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export function deleteRequest(id: number): Promise<void> {
  return api<void>(`/api/requests/${id}`, { method: "DELETE" });
}
