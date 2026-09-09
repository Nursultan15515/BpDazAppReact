import { useEffect, useState } from "react";
import { getErrorMessage } from "./api";

interface Loaded<T> {
  key: string;
  data?: T;
  error?: string;
}

/**
 * Загрузка данных по ключу. Пока ответ на текущий ключ не пришёл, список
 * считается загружающимся, но на экране остаются прошлые данные.
 *
 * `fetcher` должен быть обёрнут в useCallback с теми же зависимостями,
 * из которых собран `key`.
 */
export function useLoad<T>(key: string, fetcher: () => Promise<T>) {
  const [result, setResult] = useState<Loaded<T> | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => { if (!cancelled) setResult({ key, data }); })
      .catch((e) => { if (!cancelled) setResult({ key, error: getErrorMessage(e) }); });

    return () => { cancelled = true; };
  }, [key, fetcher]);

  const current = result?.key === key ? result : null;

  return {
    data: result?.data,
    error: current?.error ?? null,
    loading: current === null,
    loadedOnce: result !== null,
  };
}
