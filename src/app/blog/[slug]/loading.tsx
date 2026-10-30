import { Skeleton } from "@/components/ui/Skeleton"

export default function BlogLoading() {
  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        <Skeleton className="h-4 w-28" />

        <div className="space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-5 w-5/6" />
        </div>

        <div className="flex items-center justify-between border-t border-b border-neutral-200 dark:border-neutral-800 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>

        <Skeleton className="aspect-[16/9] w-full rounded-md" />

        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}
