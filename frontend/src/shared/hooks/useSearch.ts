import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";

export function useSearch(initialSearch = "", delay = 500) {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, delay);

  const searchParams = useMemo(() => {
    return debouncedSearch ? { search: debouncedSearch } : {};
  }, [debouncedSearch]);

  return {
    search,
    setSearch,
    debouncedSearch,
    searchParams,
  };
}
