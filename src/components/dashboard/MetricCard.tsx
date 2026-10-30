import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  description,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 font-mono">
          {label}
        </span>
        <div className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-serif">
          {value}
        </span>
        {description && (
          <p className="mt-1 text-xs text-neutral-400">{description}</p>
        )}
      </div>
    </div>
  )
}
