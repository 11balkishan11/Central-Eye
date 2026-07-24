import { cn } from "@/shared/utils/utils"

type StatusColor = "green" | "yellow" | "red" | "gray" | "blue"

interface StatusDotProps {
  status: StatusColor
  className?: string
  animate?: boolean
}

export function StatusDot({ status, className, animate = false }: StatusDotProps) {
  const baseClasses = "inline-block rounded-full"
  
  const colorMap: Record<StatusColor, string> = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-400",
    blue: "bg-blue-500",
  }

  return (
    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
      {animate && (
        <span 
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colorMap[status]
          )} 
        />
      )}
      <span 
        className={cn(
          baseClasses,
          colorMap[status],
          "h-2 w-2 relative inline-flex",
          className
        )} 
      />
    </span>
  )
}
