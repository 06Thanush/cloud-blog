"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ImageUploader } from "@/components/editor/ImageUploader"
import { Save, User as UserIcon, CheckCircle2, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()

  const [loading, setLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [userId, setUserId] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState("")

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return
        setUserId(user.id)
        setEmail(user.email || "")

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profile) {
          setFullName(profile.full_name || "")
          setUsername(profile.username || "")
          setBio(profile.bio || "")
          setWebsite(profile.website || "")
          setAvatarUrl(profile.avatar_url || "")
        } else {
          setFullName(user.user_metadata?.full_name || "")
          setUsername(user.email?.split("@")[0] || "")
        }
      } catch (err: any) {
        setError(err?.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "")

      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        website: website.trim(),
        avatar_url: avatarUrl.trim(),
        updated_at: new Date().toISOString(),
      })

      if (upsertError) {
        if (upsertError.code === "23505") {
          throw new Error("This username is already taken by another author.")
        }
        throw upsertError
      }

      // Also update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          avatar_url: avatarUrl.trim(),
        },
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-xs font-mono text-neutral-500">Loading profile data...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Author Profile
        </h1>
        <p className="text-xs text-neutral-500">
          Your public persona shown at the bottom of published articles.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>Profile changes updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email read-only */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Account Email (Supabase Auth)
          </label>
          <input
            type="email"
            disabled
            value={email}
            className="flex h-11 w-full rounded-sm border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 px-3.5 py-2 text-sm text-neutral-500 cursor-not-allowed"
          />
        </div>

        {/* Display name */}
        <Input
          label="Display Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. John Doe"
          required
        />

        {/* Username */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Username / Handle
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-mono">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              className="flex h-11 w-full rounded-sm border border-neutral-300 bg-white pl-8 pr-3.5 py-2 text-sm font-mono text-neutral-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-white"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Author Biography
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell readers about yourself, your engineering focus, and background..."
            className="w-full rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
          />
        </div>

        {/* Website */}
        <Input
          label="Website or Portfolio URL"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />

        {/* Avatar */}
        <ImageUploader value={avatarUrl} onChange={setAvatarUrl} />

        <div className="pt-4">
          <Button type="submit" isLoading={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
