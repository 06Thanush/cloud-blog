export const SITE_NAME = "MONOLITH"
export const SITE_TAGLINE = "The Cloud & Engineering Journal"
export const SITE_DESCRIPTION = "A high-performance cloud blogging platform built for developers, architects, and thinkers."
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const CATEGORIES = [
  "Technology",
  "Cloud",
  "Design",
  "Artificial Intelligence",
  "Web Development",
  "Architecture",
  "DevOps",
  "Tutorials"
] as const

export type Category = (typeof CATEGORIES)[number]

export const DEFAULT_POST_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop"
export const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
