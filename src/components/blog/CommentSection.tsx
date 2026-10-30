"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { MessageSquare, Trash2, Send, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { formatDate } from "@/lib/utils"
import { DEFAULT_AVATAR } from "@/lib/constants"
import type { CommentWithAuthor } from "@/lib/supabase/types"
import type { User } from "@supabase/supabase-js"

interface CommentSectionProps {
  postId: string
  initialComments?: CommentWithAuthor[]
}

export function CommentSection({
  postId,
  initialComments = [],
}: CommentSectionProps) {
  const [comments, setComments] = React.useState<CommentWithAuthor[]>(initialComments)
  const [user, setUser] = React.useState<User | null>(null)
  const [commentText, setCommentText] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()

  // Load user
  React.useEffect(() => {
    const fetchUserAndComments = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)

      // Fetch fresh comments with profiles
      const { data: commentData } = await supabase
        .from("comments")
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          updated_at,
          author:profiles(id, username, full_name, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true })

      if (commentData) {
        // Map data structure
        const mapped: CommentWithAuthor[] = commentData.map((item: any) => ({
          id: item.id,
          post_id: item.post_id,
          user_id: item.user_id,
          content: item.content,
          created_at: item.created_at,
          updated_at: item.updated_at,
          author: Array.isArray(item.author) ? item.author[0] : item.author,
        }))
        setComments(mapped)
      }
    }

    fetchUserAndComments()
  }, [postId, supabase])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText.trim(),
        })
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at,
          updated_at,
          author:profiles(id, username, full_name, avatar_url)
        `)
        .single()

      if (insertError) {
        throw insertError
      }

      if (data) {
        const newComment: CommentWithAuthor = {
          id: data.id,
          post_id: data.post_id,
          user_id: data.user_id,
          content: data.content,
          created_at: data.created_at,
          updated_at: data.updated_at,
          author: Array.isArray(data.author) ? data.author[0] : data.author,
        }
        setComments((prev) => [...prev, newComment])
        setCommentText("")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to post comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return
    setDeletingId(commentId)

    try {
      const { error: deleteError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)

      if (deleteError) {
        throw deleteError
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err: any) {
      alert("Failed to delete comment: " + (err?.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-8 pt-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <MessageSquare className="h-5 w-5 text-neutral-500" />
        <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Input Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="space-y-3">
          <div className="relative">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts on this piece?"
              rows={3}
              required
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
            />
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={!commentText.trim()}
              className="gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Post Comment</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-md border border-dashed border-neutral-300 dark:border-neutral-800 p-6 text-center bg-neutral-50 dark:bg-neutral-900/30">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Sign in to join the conversation and leave a comment.
          </p>
          <Link href={`/login?redirectTo=/blog/${postId}`}>
            <Button size="sm" variant="outline">
              Sign In to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6 pt-4">
        {comments.length === 0 ? (
          <p className="text-center py-8 text-sm text-neutral-500 italic">
            No comments yet. Be the first to share your perspective!
          </p>
        ) : (
          comments.map((comment) => {
            const author = comment.author
            const authorName = author?.full_name || author?.username || "Reader"
            const authorAvatar = author?.avatar_url || DEFAULT_AVATAR
            const isOwner = user?.id === comment.user_id

            return (
              <div
                key={comment.id}
                className="flex items-start gap-4 p-4 rounded-md bg-white dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800/80"
              >
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {authorName}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingId === comment.id}
                        aria-label="Delete comment"
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
