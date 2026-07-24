import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/shared/components/ui/input"

// A highly simplified DataTable placeholder
// In a real application, you would use @tanstack/react-table
interface DataTableProps<TData> {
  data: TData[]
  columns: {
    header: string
    accessorKey?: keyof TData | string
    id?: string
    cell?: (item: TData) => React.ReactNode
  }[]
  searchKey?: string
}

export function DataTable<TData>({ data, columns, searchKey }: DataTableProps<TData>) {
  const [search, setSearch] = React.useState("")

  const filteredData = React.useMemo(() => {
    if (!searchKey || !search) return data
    return data.filter((item) => {
      const val = item[searchKey as keyof TData]
      return String(val).toLowerCase().includes(search.toLowerCase())
    })
  }, [data, search, searchKey])

  return (
    <div className="flex flex-col gap-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search size={16} />
          </div>
          <Input
            placeholder={`Search by ${String(searchKey)}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      
      <div className="rounded-md border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b border-border">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="h-10 px-4 font-medium align-middle">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            ) : (
              filteredData.map((row, i) => (
                <tr key={i} className="border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {columns.map((col, j) => (
                    <td key={j} className="p-4 align-middle">
                      {col.cell ? col.cell(row) : String(row[col.accessorKey as keyof TData] || "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Placeholder */}
      <div className="flex items-center justify-end space-x-2 py-2">
        <div className="text-xs text-muted-foreground">
          Showing {filteredData.length} of {data.length} row(s).
        </div>
      </div>
    </div>
  )
}
