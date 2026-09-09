import { useEffect, useState, type ReactNode } from "react";
import { getMe, type Me } from "./me.api";
import { MeContext } from "./meContext";

/**
 * Профиль текущего пользователя, один запрос на всё приложение.
 * Когда появится аутентификация, сюда же добавится состояние логина.
 */
export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    getMe().then(setMe).catch(() => setMe(null));
  }, []);

  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}
