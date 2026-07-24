import type { ReactNode } from "react"
import { FolderOpen } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-border bg-card/50">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-muted text-muted-foreground">
        {icon || <FolderOpen size={24} />}
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action}
    </div>
  )
}
