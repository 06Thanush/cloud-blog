import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { PostTable } from "@/components/dashboard/PostTable"
import { Button } from "@/components/ui/Button"
import {
  FileText,
  CheckCircle,
  Clock,
  Heart,
  MessageSquare,
  Plus,
} from "lucide-react"
import type { Post } from "@/lib/supabase/types"

export const metadata = {
  title: "Author Dashboard | Monolith",
  description: "Manage your blog articles, drafts, metrics, and reader engagement.",
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch author posts
  const { data: postsData } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false })

  const posts: Post[] = postsData || []

  // Fetch comments count for this author's posts
  const postIds = posts.map((p) => p.id)
  let totalComments = 0
  const postCommentsMap: Record<string, number> = {}

  if (postIds.length > 0) {
    const { data: commentsData } = await supabase
      .from("comments")
      .select("id, post_id")
      .in("post_id", postIds)

    if (commentsData) {
      totalComments = commentsData.length
      commentsData.forEach((c) => {
        postCommentsMap[c.post_id] = (postCommentsMap[c.post_id] || 0) + 1
      })
    }
  }

  // Calculate statistics
  const totalArticles = posts.length
  const publishedArticles = posts.filter((p) => p.status === "published").length
  const draftArticles = posts.filter((p) => p.status === "draft").length
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes_count || 0), 0)

  const postsWithCommentCounts = posts.map((p) => ({
    ...p,
    commentsCount: postCommentsMap[p.id] || 0,
  }))

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Author Studio
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Track engagement across your writings, manage publishing status, and write new articles.
          </p>
        </div>

        <Link href="/dashboard/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Write New Article</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Articles"
          value={totalArticles}
          icon={FileText}
          description="All created posts"
        />
        <MetricCard
          label="Published"
          value={publishedArticles}
          icon={CheckCircle}
          description="Live to the public"
        />
        <MetricCard
          label="Drafts"
          value={draftArticles}
          icon={Clock}
          description="Work in progress"
        />
        <MetricCard
          label="Total Comments"
          value={totalComments}
          icon={MessageSquare}
          description="Community discourse"
        />
        <MetricCard
          label="Total Likes"
          value={totalLikes}
          icon={Heart}
          description="Reader appreciations"
        />
      </div>

      {/* Articles Management Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Your Articles
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {posts.length} {posts.length === 1 ? "article" : "articles"} recorded
          </span>
        </div>

        <PostTable posts={postsWithCommentCounts} />
      </div>
    </div>
  )
}
