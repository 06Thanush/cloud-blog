"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { SITE_NAME } from "@/lib/constants"
import { ArrowLeft, Lock, Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const supabase = createClient()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.session) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <span className="font-serif text-3xl font-black tracking-tight text-black dark:text-white">
          {SITE_NAME}
        </span>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Sign in to your account
        </h1>
        <p className="text-xs text-neutral-500">
          Access your author dashboard, draft new pieces, and join discussions.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 shadow-sm">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full gap-2"
            isLoading={loading}
          >
            <Lock className="h-4 w-4" />
            <span>Sign In</span>
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-black dark:text-white underline underline-offset-4"
          >
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            <p className="text-xs text-neutral-500">Loading sign in...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
