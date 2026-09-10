import { useCallback, useState } from "react";
import { defaultPageSize } from "./paging";

/**
 * Номер и размер страницы. Смена фильтра, поиска или размера обязана вернуть
 * список на первую страницу — иначе запрос уйдёт за последнюю и придёт пустым.
 */
export function usePageState(initialSize = defaultPageSize) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const firstPage = useCallback(() => setPage(1), []);

  /** Уводит с опустевшей страницы после удаления последней на ней строки. */
  const stepBackIfEmptied = useCallback((rowsOnPage: number) => {
    if (rowsOnPage <= 1) setPage((current) => Math.max(1, current - 1));
  }, []);

  return { page, pageSize, setPage, changePageSize, firstPage, stepBackIfEmptied };
}
