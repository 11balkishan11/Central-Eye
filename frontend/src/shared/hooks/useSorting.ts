import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export function useSorting(initialField = "created_at", initialDir: SortDirection = "desc") {
  const [sortField, setSortField] = useState(initialField);
  const [sortDir, setSortDir] = useState<SortDirection>(initialDir);

  const onSort = (field: string) => {
    if (field === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortingParams = useMemo(() => ({
    sort_by: sortField,
    sort_dir: sortDir,
  }), [sortField, sortDir]);

  return {
    sortField,
    sortDir,
    onSort,
    sortingParams,
  };
}
