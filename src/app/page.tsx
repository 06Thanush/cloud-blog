import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { BlogFeed } from "@/components/blog/BlogFeed"
import { Button } from "@/components/ui/Button"
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/lib/constants"
import { isSupabaseConfigured } from "@/lib/utils"
import { PenSquare, Database, ArrowRight, ShieldCheck } from "lucide-react"
import type { PostWithAuthor } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const initialCategory = resolvedSearchParams?.category || "All"

  const configured = isSupabaseConfigured()
  const supabase = await createClient()

  let posts: PostWithAuthor[] = []
  let fetchError = null

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, bio, website)
      `)
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (error) {
      fetchError = error.message
    } else if (data) {
      posts = data.map((item: any) => ({
        ...item,
        author: Array.isArray(item.author) ? item.author[0] : item.author,
      }))
    }
  } catch (err: any) {
    fetchError = err?.message
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Editorial Masthead / Hero */}
      <section className="border-b-2 border-black dark:border-white pb-8 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              The Architecture & Cloud Journal
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.08]">
              Ideas, systems, and engineering at scale.
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 font-sans max-w-2xl leading-relaxed">
              {SITE_DESCRIPTION}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/new">
              <Button size="lg" className="gap-2">
                <PenSquare className="h-4 w-4" />
                <span>Start Writing</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Supabase Setup Banner (if not yet configured) */}
      {!configured && (
        <section className="rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
            <Database className="h-4 w-4" />
            <span>Supabase Connection Setup</span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Your application is built and ready to connect to your Supabase instance.
            Update your <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">.env.local</code> with your <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then run the SQL migration script located at <code className="font-mono">supabase/schema.sql</code> in your Supabase SQL Editor.
          </p>
        </section>
      )}

      {/* Posts Feed */}
      {posts.length > 0 ? (
        <BlogFeed initialPosts={posts} initialCategory={initialCategory} />
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-16 text-center bg-neutral-50/50 dark:bg-neutral-900/20 space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
            <PenSquare className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome to {SITE_NAME}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            No published articles found yet. Sign up or log into your Author Studio to publish your first article, or execute the schema script to begin.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Link href="/dashboard/new">
              <Button className="gap-2">
                <span>Create Your First Article</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
