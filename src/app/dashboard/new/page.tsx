"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ImageUploader } from "@/components/editor/ImageUploader"
import { CategorySelector } from "@/components/editor/CategorySelector"
import { MarkdownEditor } from "@/components/editor/MarkdownEditor"
import { slugify, calculateReadingTime } from "@/lib/utils"
import { ArrowLeft, Save, Send, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false)
  const [excerpt, setExcerpt] = React.useState("")
  const [content, setContent] = React.useState("")
  const [category, setCategory] = React.useState("Technology")
  const [tags, setTags] = React.useState<string[]>([])
  const [featuredImage, setFeaturedImage] = React.useState("")

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Auto-generate slug when title changes unless manually edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (!slugManuallyEdited) {
      setSlug(slugify(val))
    }
  }

  const handleSave = async (targetStatus: "draft" | "published") => {
    setError(null)

    if (!title.trim()) {
      setError("Please provide an article title.")
      return
    }

    if (!content.trim()) {
      setError("Article content cannot be empty.")
      return
    }

    const finalSlug = (slug || slugify(title)).trim()
    if (!finalSlug) {
      setError("A valid URL slug is required.")
      return
    }

    setIsSubmitting(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be signed in to create an article.")
      }

      const readingTime = calculateReadingTime(content)
      const publishedAt = targetStatus === "published" ? new Date().toISOString() : null

      const { data, error: insertError } = await supabase
        .from("posts")
        .insert({
          title: title.trim(),
          slug: finalSlug,
          excerpt: excerpt.trim() || null,
          content: content.trim(),
          featured_image: featuredImage || null,
          category,
          tags,
          status: targetStatus,
          author_id: user.id,
          reading_time: readingTime,
          published_at: publishedAt,
        })
        .select("slug, status")
        .single()

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("An article with this URL slug already exists. Please customize the slug.")
        }
        throw insertError
      }

      if (targetStatus === "published") {
        router.push(`/blog/${data.slug}`)
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "Failed to create post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              New Article
            </h1>
            <p className="text-xs text-neutral-500">
              Draft your story or publish it directly to the feed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleSave("draft")}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleSave("published")}
            className="gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Publish Article</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="space-y-6">
        {/* Title */}
        <Input
          label="Article Title"
          value={title}
          onChange={handleTitleChange}
          placeholder="e.g. Distributed Consensus in Cloud-Native Meshes"
          className="text-base font-medium font-serif"
          required
        />

        {/* Slug */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              URL Slug
            </label>
            <span className="text-[11px] text-neutral-400 font-mono">
              /blog/{slug || "slug-preview"}
            </span>
          </div>
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value))
              setSlugManuallyEdited(true)
            }}
            placeholder="custom-url-slug"
            className="font-mono text-xs"
          />
        </div>

        {/* Excerpt */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Excerpt / Meta Description
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A compelling 1-2 sentence summary for article cards, search results, and social sharing..."
            rows={2}
            className="w-full rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
          />
        </div>

        {/* Featured Image */}
        <ImageUploader value={featuredImage} onChange={setFeaturedImage} />

        {/* Category & Tags */}
        <CategorySelector
          category={category}
          onCategoryChange={setCategory}
          tags={tags}
          onTagsChange={setTags}
        />

        {/* Markdown Content */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Article Content (Markdown)
            </label>
            <span className="text-xs text-neutral-400 font-mono flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Markdown & GFM supported
            </span>
          </div>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  )
}
