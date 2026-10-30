"use client"

import * as React from "react"
import { Share2, Check, Copy } from "lucide-react"

interface ShareButtonsProps {
  title: string
  url?: string
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false)

  const shareUrl =
    typeof window !== "undefined" ? url || window.location.href : ""

  const handleCopy = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(shareUrl)}`

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl
  )}`

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 mr-1 flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" />
        Share:
      </span>

      {/* Twitter / X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="rounded border border-neutral-200 dark:border-neutral-800 p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="rounded border border-neutral-200 dark:border-neutral-800 p-2 text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 1 0 0-3.05 1.53 1.53 0 0 0 0 3.05m1.37 9.74V9.95H5.09v8.55h2.74z" />
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        aria-label="Copy article link"
        className="flex items-center gap-1.5 rounded border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Copied!
            </span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  )
}
