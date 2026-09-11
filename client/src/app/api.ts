export type ApiError = {
  status: number;
  data?: Record<string, unknown> | string;
};

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(url, options, false);
}

async function apiFetch<T>(url: string, options: RequestInit | undefined, isRetry: boolean): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
    ...options,
  });

  let data: Record<string, unknown> | string | undefined = undefined;
  const ct = res.headers.get("content-type") ?? "";
  // Ошибки ASP.NET приходят как application/problem+json — тоже разбираем как JSON,
  // иначе ProblemDetails попадёт на экран сырым текстом.
  if (ct.includes("json")) {
    data = await res.json().catch(() => undefined);
  } else {
    data = await res.text().catch(() => undefined);
  }

  if (!res.ok) {
    // Прозрачное обновление access-токена: один раз пробуем refresh и повторяем запрос.
    const isAuthEndpoint = url.startsWith("/api/auth/") || url === "/api/me/auth-mode";
    if (res.status === 401 && !isRetry && !isAuthEndpoint) {
      const refreshed = await tryRefresh();
      if (refreshed) return apiFetch<T>(url, options, true);
    }

    const err: ApiError = { status: res.status, data };
    throw err;
  }

  return data as T;
}

/**
 * Скачивание файла. Отдельно от api(), потому что ответ бинарный, а ошибку
 * сервер всё равно присылает как ProblemDetails.
 */
export async function apiDownload(url: string, fileName: string): Promise<void> {
  let res = await fetch(url, { credentials: "include" });

  if (res.status === 401 && await tryRefresh()) {
    res = await fetch(url, { credentials: "include" });
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") ?? "";
    const data = ct.includes("json")
      ? await res.json().catch(() => undefined)
      : await res.text().catch(() => undefined);

    throw { status: res.status, data } as ApiError;
  }

  const blobUrl = URL.createObjectURL(await res.blob());
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Универсальный helper для получения текста ошибки из ApiError или Error. */
export function getErrorMessage(e: unknown): string {
  if (e && typeof e === "object") {
    const apiError = e as ApiError;

    if (typeof apiError.status === "number") {
      const data = apiError.data;

      if (typeof data === "string" && data.trim() !== "") return data;

      if (data && typeof data === "object") {
        // ProblemDetails от ASP.NET: { title, detail, errors: { field: [msg] } }
        const errors = (data as { errors?: Record<string, string[]> }).errors;
        if (errors) {
          const messages = Object.values(errors).flat();
          if (messages.length > 0) return messages.join(" ");
        }

        const detail = (data as { detail?: string; title?: string }).detail
          ?? (data as { title?: string }).title;
        if (detail) return detail;
      }

      return `HTTP ${apiError.status}`;
    }

    if (e instanceof Error) return e.message;
  }

  return String(e);
}
