export type ApiError = {
  status: number;
  data?: Record<string, unknown> | string;
};

export async function api<T>(url: string, options?: RequestInit): Promise<T> {
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
    const err: ApiError = { status: res.status, data };
    throw err;
  }

  return data as T;
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
