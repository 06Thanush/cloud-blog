"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "editorial"
  size?: "sm" | "md" | "lg" | "icon"
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer"

    const variants = {
      primary:
        "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm",
      editorial:
        "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 tracking-wide uppercase text-xs font-semibold py-3 px-6",
      secondary:
        "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
      outline:
        "border border-neutral-300 dark:border-neutral-700 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100",
      ghost:
        "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-sm",
    }

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-sm",
      md: "h-10 px-4 text-sm rounded-sm",
      lg: "h-12 px-6 text-base rounded-sm",
      icon: "h-10 w-10 p-0 rounded-sm",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
