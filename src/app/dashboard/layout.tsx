import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LayoutDashboard, PenSquare, User, Globe } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?redirectTo=/dashboard")
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-neutral-950/40">
      {/* Dashboard Subheader */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center space-x-6">
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-400">
                Author Studio
              </span>

              <nav className="flex items-center space-x-4 text-xs font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Overview</span>
                </Link>
                <Link
                  href="/dashboard/new"
                  className="flex items-center gap-1.5 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  <span>New Post</span>
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-1.5 text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Profile</span>
                </Link>
              </nav>
            </div>

            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white font-mono"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Public Feed</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
