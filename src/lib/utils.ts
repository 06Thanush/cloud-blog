import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Recently"
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString)
    return format(date, "MMM dd, yyyy")
  } catch {
    return "Recently"
  }
}

export function calculateReadingTime(content: string): number {
  if (!content) return 1
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return Math.max(1, minutes)
}

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(
    url &&
    key &&
    !url.includes("your-project-id") &&
    !key.includes("your-anon-key")
  )
}
