import { useState, useMemo } from "react";

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const paginationParams = useMemo(() => ({
    page,
    limit,
  }), [page, limit]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    paginationParams,
  };
}
