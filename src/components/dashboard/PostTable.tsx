"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Edit2, Trash2, Globe, FileText, Loader2, Heart, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Post } from "@/lib/supabase/types"

interface PostTableProps {
  posts: (Post & { commentsCount?: number })[]
  onDeleteSuccess?: (id: string) => void
}

export function PostTable({ posts: initialPosts, onDeleteSuccess }: PostTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = React.useState(initialPosts)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  const handleToggleStatus = async (post: Post) => {
    setTogglingId(post.id)
    const newStatus = post.status === "published" ? "draft" : "published"
    const publishedAt = newStatus === "published" ? new Date().toISOString() : post.published_at

    try {
      const { error } = await supabase
        .from("posts")
        .update({
          status: newStatus,
          published_at: publishedAt,
        })
        .eq("id", post.id)

      if (error) throw error

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, status: newStatus, published_at: publishedAt }
            : p
        )
      )
      router.refresh()
    } catch (err: any) {
      alert("Failed to update status: " + (err?.message || "Unknown error"))
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return
    }

    setDeletingId(postId)
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId)
      if (error) throw error

      setPosts((prev) => prev.filter((p) => p.id !== postId))
      if (onDeleteSuccess) onDeleteSuccess(postId)
      router.refresh()
    } catch (err: any) {
      alert("Failed to delete post: " + (err?.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center bg-white dark:bg-neutral-900/30">
        <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-100">
          No articles written yet
        </h3>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
          Start sharing your thoughts, cloud architectures, and tutorials with readers worldwide.
        </p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-sm"
        >
          Write Your First Article
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 font-mono text-xs uppercase tracking-wider text-neutral-500">
          <tr>
            <th className="px-6 py-3.5 font-semibold">Title</th>
            <th className="px-6 py-3.5 font-semibold">Status</th>
            <th className="px-6 py-3.5 font-semibold">Category</th>
            <th className="px-6 py-3.5 font-semibold">Engagement</th>
            <th className="px-6 py-3.5 font-semibold">Date</th>
            <th className="px-6 py-3.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {posts.map((post) => {
            const isPublished = post.status === "published"
            const isToggling = togglingId === post.id
            const isDeleting = deletingId === post.id

            return (
              <tr
                key={post.id}
                className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
              >
                {/* Title */}
                <td className="px-6 py-4">
                  <div className="font-serif font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1 max-w-md">
                    {post.title}
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    /{post.slug}
                  </span>
                </td>

                {/* Status Toggle */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    disabled={isToggling}
                    className="cursor-pointer group flex items-center gap-1.5 focus:outline-none"
                    title={`Click to ${isPublished ? "unpublish" : "publish"}`}
                  >
                    {isPublished ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="warning">Draft</Badge>
                    )}
                    {isToggling && <Loader2 className="h-3 w-3 animate-spin text-neutral-400" />}
                  </button>
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {post.category}
                </td>

                {/* Engagement (Likes / Comments) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                    <span className="flex items-center gap-1" title="Likes">
                      <Heart className="h-3.5 w-3.5 text-rose-500" />
                      {post.likes_count || 0}
                    </span>
                    {post.commentsCount !== undefined && (
                      <span className="flex items-center gap-1" title="Comments">
                        <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                        {post.commentsCount}
                      </span>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-xs font-mono text-neutral-400 whitespace-nowrap">
                  {formatDate(post.published_at || post.created_at)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* View (if published) */}
                    {isPublished && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="View Live Article"
                      >
                        <Globe className="h-4 w-4" />
                      </Link>
                    )}

                    {/* Edit */}
                    <Link
                      href={`/dashboard/edit/${post.id}`}
                      className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Edit Article"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={isDeleting}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Delete Article"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
