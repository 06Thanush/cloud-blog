import Image from "next/image"
import Link from "next/link"
import { Globe, User } from "lucide-react"
import { DEFAULT_AVATAR } from "@/lib/constants"
import type { Profile } from "@/lib/supabase/types"

interface AuthorBioProps {
  author?: Profile | null
}

export function AuthorBio({ author }: AuthorBioProps) {
  const name = author?.full_name || author?.username || "Editorial Team"
  const avatar = author?.avatar_url || DEFAULT_AVATAR
  const bio =
    author?.bio ||
    "Writer, engineer, and cloud enthusiast contributing to the architectural discourse on modern computing and software engineering."

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {name}
              </h3>
              {author?.username && (
                <p className="text-xs text-neutral-500 font-mono">@{author.username}</p>
              )}
            </div>

            {author?.website && (
              <a
                href={author.website.startsWith("http") ? author.website : `https://${author.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Website</span>
              </a>
            )}
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans">
            {bio}
          </p>
        </div>
      </div>
    </div>
  )
}
