import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/utils"

type HealthStatus = "healthy" | "warning" | "critical" | "unknown"

interface HealthBadgeProps {
  status: HealthStatus
  className?: string
}

export function HealthBadge({ status, className }: HealthBadgeProps) {
  const styles: Record<HealthStatus, string> = {
    healthy: "text-green-600 bg-green-500/10 border-green-500/20 dark:text-green-400",
    warning: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20 dark:text-yellow-400",
    critical: "text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400",
    unknown: "text-gray-600 bg-gray-500/10 border-gray-500/20 dark:text-gray-400",
  }

  const labels: Record<HealthStatus, string> = {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    unknown: "Unknown",
  }

  return (
    <Badge variant="outline" className={cn(styles[status], className)}>
      {labels[status]}
    </Badge>
  )
}
