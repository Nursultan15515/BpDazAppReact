import { api } from "./api";

export interface Me {
  userId: number;
  personId: number;
  login: string;
  fio: string;
  isAdmin: boolean;
  isLinked: boolean;
  accountName: string;
  authMode: string;
}

export function getMe(): Promise<Me> {
  return api<Me>("/api/me");
}

export function getAuthMode(): Promise<{ authMode: string }> {
  return api<{ authMode: string }>("/api/me/auth-mode");
}

export function login(loginName: string, password: string): Promise<void> {
  return api<void>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login: loginName, password }),
  });
}

export function logout(): Promise<void> {
  return api<void>("/api/auth/logout", { method: "POST" });
}

/** Привязка доменной учётки к логину — замена SetAccountNameByLogin. */
export function linkAccount(loginName: string): Promise<void> {
  return api<void>("/api/auth/link", {
    method: "POST",
    body: JSON.stringify({ login: loginName }),
  });
}
