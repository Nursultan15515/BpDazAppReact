/** Страница списка — зеркало PagedResult<T> на сервере. */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Размеры страницы. Мелкие — привычные веб-таблице, крупные повторяют
 * Kendo-грид BpDazApp, где список открывался сотнями строк.
 */
export const pageSizeOptions = [10, 25, 50, 100, 200];

/** Должен совпадать с Paging.DefaultPageSize на сервере. */
export const defaultPageSize = 50;

/** Дописывает срез страницы к параметрам запроса. */
export function appendPaging(params: URLSearchParams, page: number, pageSize: number): void {
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
}
