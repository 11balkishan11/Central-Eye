import type { ReactNode } from "react"
import { AlertOctagon, RefreshCw } from "lucide-react"
import { Button } from "../ui/button"

interface ErrorStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  retryAction?: () => void
  action?: ReactNode
}

export function ErrorState({ 
  title = "Something went wrong", 
  description = "There was an error loading this data. Please try again later.", 
  icon, 
  retryAction,
  action 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 rounded-xl bg-destructive/5">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-destructive/10 text-destructive">
        {icon || <AlertOctagon size={24} />}
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="mt-1 mb-6 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
      {action ? (
        action
      ) : retryAction ? (
        <Button variant="outline" onClick={retryAction}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      ) : null}
    </div>
  )
}
