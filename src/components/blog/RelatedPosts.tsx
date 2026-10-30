import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { DEFAULT_POST_IMAGE } from "@/lib/constants"
import type { Post } from "@/lib/supabase/types"

interface RelatedPostsProps {
  posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts || posts.length === 0) return null

  return (
    <section className="pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
      <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Related Reading
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col space-y-3"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded bg-neutral-100 dark:bg-neutral-800">
              <Image
                src={post.featured_image || DEFAULT_POST_IMAGE}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
              <span>{post.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.reading_time || 1} min
              </span>
            </div>

            <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
              {post.title}
            </h4>

            <p className="text-xs text-neutral-500 line-clamp-2">
              {post.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
