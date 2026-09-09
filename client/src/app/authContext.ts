import { createContext, useContext } from "react";
import type { Me } from "./auth.api";

export type AuthState =
  | { status: "loading" }
  /** Не аутентифицирован — показываем форму входа. */
  | { status: "anonymous"; authMode: string }
  /** Домен опознал пользователя, но в базе бюро пропусков его нет. */
  | { status: "needsLink"; accountName: string; authMode: string }
  | { status: "ready"; me: Me };

export interface AuthContextValue {
  state: AuthState;
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  link: (login: string) => Promise<void>;
  reload: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth вызван вне AuthProvider");
  return value;
}

/** Профиль текущего пользователя или null, пока он не загружен. */
export function useMe(): Me | null {
  const { state } = useAuth();
  return state.status === "ready" ? state.me : null;
}
