import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  setPage: (page: number) => void;
  total: number;
  limit: number;
}

export function PaginationControls({ page, setPage, total, limit }: Props) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
      <div>
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
