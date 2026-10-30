"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface LikeButtonProps {
  postId: string
  initialLikes?: number
}

export function LikeButton({ postId, initialLikes = 0 }: LikeButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [likesCount, setLikesCount] = React.useState(initialLikes)
  const [isLiked, setIsLiked] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [userId, setUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isSubscribed = true

    const checkLikedStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return
      if (isSubscribed) setUserId(user.id)

      const { data } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (isSubscribed && data) {
        setIsLiked(true)
      }
    }

    checkLikedStatus()
    return () => {
      isSubscribed = false
    }
  }, [postId, supabase])

  const handleToggleLike = async () => {
    if (!userId) {
      router.push(`/login?redirectTo=/blog/${postId}`)
      return
    }

    if (loading) return
    setLoading(true)

    const prevLiked = isLiked
    const prevCount = likesCount

    // Optimistic update
    setIsLiked(!prevLiked)
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      if (prevLiked) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId)
      } else {
        // Like
        await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: userId })
      }
    } catch {
      // Revert if error
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading}
      aria-label={isLiked ? "Unlike article" : "Like article"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        isLiked
          ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-transform ${
          isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-neutral-500"
        }`}
      />
      <span className="font-mono text-xs">{likesCount}</span>
    </button>
  )
}
