import { useEffect, useState } from "react";

/**
 * Возвращает значение с задержкой. В BpDazApp поиск организации и ФИО
 * запускался через setTimeout на 2 секунды — здесь та же идея.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
