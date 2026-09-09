import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getAuthMode,
  getMe,
  linkAccount,
  login as loginRequest,
  logout as logoutRequest,
} from "./auth.api";
import { AuthContext, type AuthState } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [reloadToken, setReloadToken] = useState(0);
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const me = await getMe();
        if (cancelled) return;

        setState(me.isLinked
          ? { status: "ready", me }
          : { status: "needsLink", accountName: me.accountName, authMode: me.authMode });
      } catch {
        // 401 — обычная ситуация до входа: узнаём режим, чтобы отрисовать форму.
        const mode = await getAuthMode().catch(() => ({ authMode: "Password" }));
        if (!cancelled) setState({ status: "anonymous", authMode: mode.authMode });
      }
    };

    load();
    return () => { cancelled = true; };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const value = useMemo(() => ({
    state,
    signIn: async (login: string, password: string) => {
      await loginRequest(login, password);
      reload();
    },
    signOut: async () => {
      await logoutRequest();
      reload();
    },
    link: async (login: string) => {
      await linkAccount(login);
      reload();
    },
    reload,
  }), [state, reload]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
