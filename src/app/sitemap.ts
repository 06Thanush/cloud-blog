import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { SITE_URL } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all published posts
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at, published_at")
    .eq("status", "published")

  const blogUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
  ]

  return [...staticUrls, ...blogUrls]
}
