"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun, PenSquare, LayoutDashboard, User, LogOut, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/lib/../components/ui/Button"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import Image from "next/image"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [user, setUser] = React.useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const supabase = createClient()

  React.useEffect(() => {
    setMounted(true)

    // Check active session
    const getInitialUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user ?? null)
    }
    getInitialUser()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: "Dashboard", href: "/dashboard", authOnly: true },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-baseline gap-2 group">
            <span className="font-serif text-2xl font-black tracking-tight text-black dark:text-white group-hover:opacity-80 transition-opacity">
              MONOLITH
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              Cloud Journal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => {
              if (link.authOnly && !user) return null
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-black dark:hover:text-white ${
                    isActive
                      ? "text-black dark:text-white font-semibold"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Write Article Button */}
          <Link href="/dashboard/new" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="gap-2">
              <PenSquare className="h-4 w-4" />
              <span>Write</span>
            </Button>
          </Link>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-sm p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          )}

          {/* User Auth Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full ring-2 ring-transparent hover:ring-black dark:hover:ring-white transition-all p-0.5"
                aria-label="Open user menu"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs uppercase">
                  {user.user_metadata?.avatar_url ? (
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span>{user.email?.charAt(0) || "U"}</span>
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-md border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {user.user_metadata?.full_name || "Author"}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-sm"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      <span>Author Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard/new"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-sm"
                    >
                      <PenSquare className="h-3.5 w-3.5" />
                      <span>Create New Post</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-sm"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Profile Settings</span>
                    </Link>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-sm"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-sm"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => {
            if (link.authOnly && !user) return null
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Link
              href="/dashboard/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-semibold text-black dark:text-white"
            >
              <PenSquare className="h-4 w-4" />
              <span>Write an Article</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
