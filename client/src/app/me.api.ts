import { api } from "./api";

export interface Me {
  userId: number;
  personId: number;
  login: string;
  fio: string;
  isAdmin: boolean;
}

export function getMe(): Promise<Me> {
  return api<Me>("/api/me");
}
