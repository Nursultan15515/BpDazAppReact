import { api } from "./api";

export interface VisitorLookupResult {
  /** Local — нашли в своей базе, Gbdfl — во внешнем сервисе. */
  source: "Local" | "Gbdfl";
  visitorId: number;
  iin: string;
  lastname: string | null;
  firstname: string | null;
  middleName: string | null;
  organization: string | null;
  mobilePhone: string | null;
}

export function findVisitorByIin(iin: string): Promise<VisitorLookupResult> {
  return api<VisitorLookupResult>(`/api/visitors/by-iin?iin=${encodeURIComponent(iin)}`);
}
