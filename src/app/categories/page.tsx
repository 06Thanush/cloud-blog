import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { CATEGORIES } from "@/lib/constants"
import { Folder, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Categories | Monolith",
  description: "Browse articles organized by engineering, cloud architecture, and development topics.",
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Fetch published articles categories count
  const { data: posts } = await supabase
    .from("posts")
    .select("category")
    .eq("status", "published")

  const counts: Record<string, number> = {}
  if (posts) {
    posts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Topics & Categories
        </h1>
        <p className="text-sm text-neutral-500 mt-2">
          Explore curated technical writings, system designs, and tutorials grouped by subject matter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((category) => {
          const count = counts[category] || 0

          return (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className="group p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:border-black dark:hover:border-white transition-all space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <Folder className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {category}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  {count} {count === 1 ? "article" : "articles"}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
