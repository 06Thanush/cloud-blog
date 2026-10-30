"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search articles, concepts, or authors...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-xl", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-9 text-sm rounded-none border-b-2 border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
