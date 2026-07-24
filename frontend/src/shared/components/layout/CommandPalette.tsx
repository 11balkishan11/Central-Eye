import { useEffect, useState } from "react"
import { Search } from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-24 sm:pt-32">
      <div 
        className="fixed inset-0"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            autoFocus
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 text-sm">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Suggestions
          </div>
          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left">
              Organizations
            </button>
            <button className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left">
              Sites
            </button>
            <button className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground text-left">
              Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
