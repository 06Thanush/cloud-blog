import Link from "next/link"
import { CATEGORIES, SITE_NAME, SITE_TAGLINE } from "@/lib/constants"
import { ArrowUpRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/60 mt-20 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-3xl font-black tracking-tight text-black dark:text-white">
              {SITE_NAME}
            </span>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
              {SITE_TAGLINE}. An independent publishing platform exploring cloud architecture,
              distributed systems, product design, and modern engineering practices.
            </p>
            <div className="pt-2 text-xs font-mono text-neutral-400">
              Powered by Next.js App Router, TypeScript, Tailwind CSS, Supabase & Vercel.
            </div>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-4 font-mono">
              Categories
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              {CATEGORIES.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link
                    href={`/?category=${encodeURIComponent(category)}`}
                    className="hover:text-black dark:hover:text-white transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform / Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-4 font-mono">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Author Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/new"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Write an Article
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap.xml"
                  target="_blank"
                  className="hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Sitemap <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/robots.txt"
                  target="_blank"
                  className="hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Robots.txt <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p className="font-mono">Built with Supabase PostgreSQL & Storage</p>
        </div>
      </div>
    </footer>
  )
}
