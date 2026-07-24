import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/utils"

// Maps to the backend DeviceLifecycleState enum
export type LifecycleState = "provisioning" | "discovering" | "active" | "maintenance" | "decommissioning" | "decommissioned" | "error"

interface LifecycleBadgeProps {
  state: LifecycleState
  className?: string
}

export function LifecycleBadge({ state, className }: LifecycleBadgeProps) {
  const styles: Record<LifecycleState, string> = {
    provisioning: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400",
    discovering: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400",
    active: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
    maintenance: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
    decommissioning: "text-orange-600 bg-orange-500/10 border-orange-500/20 dark:text-orange-400",
    decommissioned: "text-gray-600 bg-gray-500/10 border-gray-500/20 dark:text-gray-400",
    error: "text-rose-600 bg-rose-500/10 border-rose-500/20 dark:text-rose-400",
  }

  const labels: Record<LifecycleState, string> = {
    provisioning: "Provisioning",
    discovering: "Discovering",
    active: "Active",
    maintenance: "Maintenance",
    decommissioning: "Decommissioning",
    decommissioned: "Decommissioned",
    error: "Error",
  }

  return (
    <Badge variant="outline" className={cn(styles[state], className)}>
      {labels[state]}
    </Badge>
  )
}
