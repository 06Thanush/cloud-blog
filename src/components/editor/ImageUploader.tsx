"use client"

import * as React from "react"
import Image from "next/image"
import { UploadCloud, Link as LinkIcon, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/Button"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = React.useState(false)
  const [urlMode, setUrlMode] = React.useState(false)
  const [inputUrl, setInputUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from("blog-images")
        .getPublicUrl(filePath)

      onChange(publicUrlData.publicUrl)
    } catch (err: any) {
      setError(
        err?.message ||
          "Upload failed. Ensure the 'blog-images' storage bucket exists in Supabase."
      )
    } finally {
      setUploading(false)
    }
  }

  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      onChange(inputUrl.trim())
      setInputUrl("")
      setUrlMode(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Featured Image
        </label>
        <button
          type="button"
          onClick={() => setUrlMode(!urlMode)}
          className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline"
        >
          {urlMode ? "Upload file instead" : "Or use direct image URL"}
        </button>
      </div>

      {value ? (
        <div className="relative aspect-[16/9] w-full max-w-xl rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 group">
          <Image
            src={value}
            alt="Featured image preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1.5 rounded-full shadow transition-colors"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : urlMode ? (
        <div className="flex gap-2 max-w-xl">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste image URL (https://images.unsplash.com/...)"
            className="flex-1 h-10 px-3 text-sm rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
          />
          <Button type="button" size="sm" onClick={handleApplyUrl}>
            Apply
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="max-w-xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-neutral-400 rounded-md p-8 text-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-950/50"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-neutral-600 dark:text-neutral-400" />
                <p className="text-sm font-medium">Uploading to Supabase Storage...</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Click to upload featured cover image
                </p>
                <p className="text-xs text-neutral-400 font-mono">
                  PNG, JPG, WEBP up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}
