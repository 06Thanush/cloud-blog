"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ImageUploader } from "@/components/editor/ImageUploader"
import { CategorySelector } from "@/components/editor/CategorySelector"
import { MarkdownEditor } from "@/components/editor/MarkdownEditor"
import { slugify, calculateReadingTime } from "@/lib/utils"
import { ArrowLeft, Save, Globe, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const postId = params.id as string

  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [excerpt, setExcerpt] = React.useState("")
  const [content, setContent] = React.useState("")
  const [category, setCategory] = React.useState("Technology")
  const [tags, setTags] = React.useState<string[]>([])
  const [featuredImage, setFeaturedImage] = React.useState("")
  const [status, setStatus] = React.useState<"draft" | "published">("draft")

  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: post, error: fetchError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single()

        if (fetchError || !post) {
          throw new Error("Article not found or you do not have permission to edit it.")
        }

        if (post.author_id !== user.id) {
          throw new Error("Unauthorized: You are not the author of this article.")
        }

        setTitle(post.title)
        setSlug(post.slug)
        setExcerpt(post.excerpt || "")
        setContent(post.content)
        setCategory(post.category)
        setTags(post.tags || [])
        setFeaturedImage(post.featured_image || "")
        setStatus(post.status as "draft" | "published")
      } catch (err: any) {
        setError(err?.message || "Failed to load post data.")
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId, router, supabase])

  const handleUpdate = async (targetStatus?: "draft" | "published") => {
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
    setIsSubmitting(true)

    const nextStatus = targetStatus || status

    try {
      const readingTime = calculateReadingTime(content)
      const updatePayload: any = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        featured_image: featuredImage || null,
        category,
        tags,
        status: nextStatus,
        reading_time: readingTime,
      }

      if (nextStatus === "published" && status === "draft") {
        updatePayload.published_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update(updatePayload)
        .eq("id", postId)

      if (updateError) {
        if (updateError.code === "23505") {
          throw new Error("An article with this URL slug already exists. Please choose a unique slug.")
        }
        throw updateError
      }

      if (nextStatus === "published") {
        router.push(`/blog/${finalSlug}`)
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    } catch (err: any) {
      setError(err?.message || "Failed to update article.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this article?")) {
      return
    }

    setIsSubmitting(true)
    try {
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)

      if (deleteError) throw deleteError

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      alert("Failed to delete article: " + (err?.message || "Unknown error"))
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-xs font-mono text-neutral-500">Loading editor...</p>
      </div>
    )
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
              Edit Article
            </h1>
            <p className="text-xs text-neutral-500">
              Status: <span className="font-semibold uppercase">{status}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="p-2 text-neutral-400 hover:text-red-500 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Delete article"
          >
            <Trash2 className="h-4 w-4" />
          </button>

          {status === "published" ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleUpdate("draft")}
              >
                Unpublish to Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleUpdate()}
                className="gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleUpdate("draft")}
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
                onClick={() => handleUpdate("published")}
                className="gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Publish</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main Fields */}
      <div className="space-y-6">
        <Input
          label="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-base font-serif font-bold"
          required
        />

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            URL Slug
          </label>
          <Input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Excerpt / Meta Description
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
          />
        </div>

        <ImageUploader value={featuredImage} onChange={setFeaturedImage} />

        <CategorySelector
          category={category}
          onCategoryChange={setCategory}
          tags={tags}
          onTagsChange={setTags}
        />

        <div className="space-y-2 pt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Content (Markdown)
          </label>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  )
}
