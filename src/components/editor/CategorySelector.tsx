"use client"

import * as React from "react"
import { CATEGORIES, Category } from "@/lib/constants"
import { X, Tag } from "lucide-react"

interface CategorySelectorProps {
  category: string
  onCategoryChange: (category: string) => void
  tags: string[]
  onTagsChange: (tags: string[]) => void
}

export function CategorySelector({
  category,
  onCategoryChange,
  tags,
  onTagsChange,
}: CategorySelectorProps) {
  const [tagInput, setTagInput] = React.useState("")

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const cleanTag = tagInput.trim().replace(/^#/, "")
      if (cleanTag && !tags.includes(cleanTag)) {
        onTagsChange([...tags, cleanTag])
        setTagInput("")
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Category selection */}
      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Primary Category
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="flex h-11 w-full rounded-sm border border-neutral-300 bg-white px-3.5 py-2 text-sm text-neutral-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tags Input */}
      <div className="space-y-1.5 text-left">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Tags (Press Enter or comma)
        </label>
        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 min-h-[44px]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
            >
              <Tag className="h-3 w-3 text-neutral-400" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={tags.length === 0 ? "Add tags like 'React', 'Supabase'..." : ""}
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-[120px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>
  )
}
