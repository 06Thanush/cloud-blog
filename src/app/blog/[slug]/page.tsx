import * as React from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Clock, Calendar, ArrowLeft, Tag as TagIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/Badge"
import { LikeButton } from "@/components/blog/LikeButton"
import { ShareButtons } from "@/components/blog/ShareButtons"
import { AuthorBio } from "@/components/blog/AuthorBio"
import { CommentSection } from "@/components/blog/CommentSection"
import { RelatedPosts } from "@/components/blog/RelatedPosts"
import { formatDate } from "@/lib/utils"
import { DEFAULT_POST_IMAGE, DEFAULT_AVATAR, SITE_NAME, SITE_URL } from "@/lib/constants"
import type { PostWithAuthor, Post } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}

// 7. SEO - Dynamic Metadata Generation
export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, content, featured_image, category, published_at")
    .eq("slug", slug)
    .single()

  if (!post) {
    return {
      title: `Article Not Found | ${SITE_NAME}`,
    }
  }

  const title = `${post.title} | ${SITE_NAME}`
  const description = post.excerpt || post.content.substring(0, 160)
  const image = post.featured_image || DEFAULT_POST_IMAGE
  const canonicalUrl = `${SITE_URL}/blog/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: "article",
      publishedTime: post.published_at || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch article with author
  const { data: postData, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(id, username, full_name, avatar_url, bio, website)
    `)
    .eq("slug", slug)
    .single()

  if (error || !postData) {
    notFound()
  }

  const post: PostWithAuthor = {
    ...postData,
    author: Array.isArray(postData.author) ? postData.author[0] : postData.author,
  }

  // Fetch related posts (same category, excluding current)
  const { data: relatedData } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("category", post.category)
    .neq("id", post.id)
    .limit(3)

  const relatedPosts: Post[] = relatedData || []

  const authorName = post.author?.full_name || post.author?.username || "Editorial Team"
  const authorAvatar = post.author?.avatar_url || DEFAULT_AVATAR
  const coverImage = post.featured_image || DEFAULT_POST_IMAGE

  return (
    <article className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Articles</span>
        </Link>

        {/* Header Block */}
        <header className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{post.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time || 1} min read
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 leading-[1.12]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
              {post.excerpt}
            </p>
          )}

          {/* Author and Date Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-b border-neutral-200 dark:border-neutral-800 py-4">
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {authorName}
                </p>
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Like and Share Actions */}
            <div className="flex items-center gap-4">
              <LikeButton postId={post.id} initialLikes={post.likes_count} />
              <ShareButtons title={post.title} />
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {coverImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 shadow-sm">
            <Image
              src={coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Article Markdown Body */}
        <div className="prose-editorial max-w-none pt-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase text-neutral-400 mr-2 flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5" />
              Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-sm text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Card */}
        <AuthorBio author={post.author} />

        {/* Comments Section */}
        <CommentSection postId={post.id} />

        {/* Related Posts */}
        {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
      </div>
    </article>
  )
}
