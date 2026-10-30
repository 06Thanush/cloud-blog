import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "secondary" | "success" | "warning"
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-black text-white dark:bg-white dark:text-black",
    secondary:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    outline:
      "border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200",
    success:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    warning:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
