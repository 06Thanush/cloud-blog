"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { SITE_NAME } from "@/lib/constants"
import { ArrowLeft, UserPlus, CheckCircle2, Loader2 } from "lucide-react"

function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const supabase = createClient()

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.session) {
        // Direct login if email confirmation is turned off
        router.push(redirectTo)
        router.refresh()
      } else {
        // Email verification required
        setIsSuccess(true)
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full max-w-md rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 text-center space-y-4 shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Account Created
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          We&apos;ve sent a confirmation email to{" "}
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {email}
          </span>
          . Please check your inbox and verify your email to begin writing.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
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
          Create an author account
        </h1>
        <p className="text-xs text-neutral-500">
          Publish your insights to a global network of cloud architects and engineers.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 shadow-sm">
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ada Lovelace"
          />

          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@example.com"
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            helperText="Minimum 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            className="w-full gap-2 mt-2"
            isLoading={loading}
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Account</span>
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          Already have an account?{" "}
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="font-semibold text-black dark:text-white underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-8 space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            <p className="text-xs text-neutral-500">Loading registration...</p>
          </div>
        }
      >
        <SignUpForm />
      </Suspense>
    </div>
  )
}
