import { api } from "./api";

export interface PersonListItem {
  id: number;
  fio: string;
  lastname: string | null;
  firstname: string | null;
  middleName: string | null;
  departmentName: string;
  positionName: string;
  buildingName: string;
  place: string | null;
  phoneInternal: string | null;
  phone: string | null;
  email: string | null;
  login: string | null;
}

export interface CreatePersonForm {
  lastname: string;
  firstname: string;
  middleName?: string;
  departmentId: number;
  positionId: number;
  placeId: number;
  place?: string;
  email?: string;
  phoneInternal?: string;
  phone?: string;
  isUserOfSystem: boolean;
  login?: string;
  accountName?: string;
}

export function getPersons(search: string): Promise<PersonListItem[]> {
  return api<PersonListItem[]>(`/api/persons?search=${encodeURIComponent(search)}`);
}

export function createPerson(form: CreatePersonForm): Promise<void> {
  return api<void>("/api/persons", { method: "POST", body: JSON.stringify(form) });
}
