import Link from "next/link"
import Image from "next/image"
import { Clock, Heart } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { formatDate, truncateText } from "@/lib/utils"
import { DEFAULT_POST_IMAGE, DEFAULT_AVATAR } from "@/lib/constants"
import type { PostWithAuthor } from "@/lib/supabase/types"

interface BlogCardProps {
  post: PostWithAuthor
  featured?: boolean
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const authorName = post.author?.full_name || post.author?.username || "Editorial Staff"
  const authorAvatar = post.author?.avatar_url || DEFAULT_AVATAR
  const imageUrl = post.featured_image || DEFAULT_POST_IMAGE

  if (featured) {
    return (
      <article className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-neutral-200 dark:border-neutral-800 pb-12 transition-colors">
        {/* Featured Image */}
        <div className="lg:col-span-7 relative aspect-[16/10] overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
          <Link href={`/blog/${post.slug}`}>
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </Link>
        </div>

        {/* Post Details */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{post.category}</Badge>
            <span className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
              <Clock className="h-3 w-3" />
              {post.reading_time || 1} min read
            </span>
          </div>

          <Link href={`/blog/${post.slug}`} className="group-hover:underline">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 leading-tight">
              {post.title}
            </h2>
          </Link>

          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans line-clamp-3">
            {post.excerpt || truncateText(post.content, 180)}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {authorName}
                </p>
                <p className="text-[11px] text-neutral-500">
                  {formatDate(post.published_at || post.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
              <span>{post.likes_count || 0}</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex flex-col justify-between h-full border border-neutral-200 dark:border-neutral-800 rounded-md p-5 bg-white dark:bg-neutral-900/40 hover:shadow-md transition-all">
      <div className="space-y-4">
        {/* Post Image */}
        <Link
          href={`/blog/${post.slug}`}
          className="relative block aspect-[16/10] overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800"
        >
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1 text-neutral-400 font-mono">
            <Clock className="h-3 w-3" />
            {post.reading_time || 1} min
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-serif text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {post.excerpt || truncateText(post.content, 120)}
        </p>
      </div>

      {/* Author and Date Footer */}
      <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            <Image
              src={authorAvatar}
              alt={authorName}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
            {authorName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <span className="flex items-center gap-1 text-rose-500">
            <Heart className="h-3 w-3 fill-rose-500/20" />
            {post.likes_count || 0}
          </span>
        </div>
      </div>
    </article>
  )
}
