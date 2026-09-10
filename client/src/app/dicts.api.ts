import { api } from "./api";

export interface PersonOption {
  id: number;
  fio: string;
  positionName: string;
  departmentName: string;
  buildingName: string;
  placeId: number;
  place: string | null;
  phoneInternal: string | null;
}

export interface BuildingOption {
  id: number;
  title: string;
}

export function searchPersons(search: string): Promise<PersonOption[]> {
  return api<PersonOption[]>(`/api/dicts/persons?search=${encodeURIComponent(search)}`);
}

/** Принимающий по умолчанию — карточка текущего пользователя. */
export function getCurrentPerson(): Promise<PersonOption | null> {
  return api<PersonOption | null>("/api/dicts/persons/current");
}

export function getBuildings(): Promise<BuildingOption[]> {
  return api<BuildingOption[]>("/api/dicts/buildings");
}

export interface DictOption {
  id: number;
  title: string;
}

export function getDepartments(): Promise<DictOption[]> {
  return api<DictOption[]>("/api/dicts/departments");
}

export function getPositions(): Promise<DictOption[]> {
  return api<DictOption[]>("/api/dicts/positions");
}

export function searchOrganizations(search: string): Promise<string[]> {
  return api<string[]>(`/api/dicts/organizations?search=${encodeURIComponent(search)}`);
}
