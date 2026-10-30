"use client"

import * as React from "react"
import { BlogCard } from "./BlogCard"
import { SearchBar } from "@/components/ui/SearchBar"
import { CATEGORIES } from "@/lib/constants"
import type { PostWithAuthor } from "@/lib/supabase/types"
import { Sparkles, Filter } from "lucide-react"

interface BlogFeedProps {
  initialPosts: PostWithAuthor[]
  initialCategory?: string
}

export function BlogFeed({ initialPosts, initialCategory }: BlogFeedProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>(
    initialCategory || "All"
  )

  const filteredPosts = React.useMemo(() => {
    return initialPosts.filter((post) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase()

      // Search filter
      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchesCategory

      const matchesTitle = post.title.toLowerCase().includes(q)
      const matchesExcerpt = post.excerpt?.toLowerCase().includes(q)
      const matchesContent = post.content.toLowerCase().includes(q)
      const matchesAuthor =
        post.author?.full_name?.toLowerCase().includes(q) ||
        post.author?.username?.toLowerCase().includes(q)
      const matchesTags = post.tags?.some((t) => t.toLowerCase().includes(q))

      return (
        matchesCategory &&
        (matchesTitle || matchesExcerpt || matchesContent || matchesAuthor || matchesTags)
      )
    })
  }, [initialPosts, selectedCategory, searchQuery])

  // Top featured post if no search is active and on "All"
  const showFeatured =
    selectedCategory === "All" && !searchQuery.trim() && filteredPosts.length > 0
  const featuredPost = showFeatured ? filteredPosts[0] : null
  const regularPosts = showFeatured ? filteredPosts.slice(1) : filteredPosts

  return (
    <div className="space-y-12">
      {/* Featured Hero Article */}
      {featuredPost && (
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">
              Featured Editorial
            </span>
          </div>
          <BlogCard post={featuredPost} featured={true} />
        </section>
      )}

      {/* Filter and Search Bar Section */}
      <section className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search articles, topics, or authors..."
          />

          <div className="text-xs text-neutral-400 font-mono">
            Showing {filteredPosts.length} of {initialPosts.length} articles
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === "All"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === category
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section>
        {regularPosts.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900/30">
            <Filter className="mx-auto h-8 w-8 text-neutral-400 mb-3" />
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-100">
              No matching articles found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              Try adjusting your search terms or picking another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
              }}
              className="text-xs font-semibold text-black dark:text-white underline underline-offset-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
