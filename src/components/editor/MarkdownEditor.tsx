"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Link as LinkIcon,
  Eye,
  Edit3,
  Columns,
} from "lucide-react"
import { calculateReadingTime } from "@/lib/utils"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function MarkdownEditor({ value, onChange, error }: MarkdownEditorProps) {
  const [mode, setMode] = React.useState<"write" | "preview" | "split">("write")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const readingTime = calculateReadingTime(value)
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    const replacement = prefix + (selectedText || "text") + suffix
    const newText = text.substring(0, start) + replacement + text.substring(end)

    onChange(newText)

    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      )
    }, 10)
  }

  return (
    <div className="space-y-2 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("## ")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("### ")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("> ")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("`", "`")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("- ")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Bulleted List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("1. ")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("[", "](https://example.com)")}
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
            title="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              mode === "write"
                ? "bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white"
                : "text-neutral-500"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              mode === "preview"
                ? "bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white"
                : "text-neutral-500"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded ${
              mode === "split"
                ? "bg-white dark:bg-neutral-800 shadow-sm text-black dark:text-white"
                : "text-neutral-500"
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            Split
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div
        className={`grid gap-4 ${
          mode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Write Pane */}
        {(mode === "write" || mode === "split") && (
          <div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write your article in Markdown..."
              rows={18}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 font-mono text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors resize-y leading-relaxed"
            />
          </div>
        )}

        {/* Preview Pane */}
        {(mode === "preview" || mode === "split") && (
          <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 p-6 min-h-[400px] overflow-y-auto">
            {value.trim() ? (
              <div className="prose-editorial">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">
                Nothing to preview yet. Start typing to see your rendered article.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between text-xs text-neutral-400 font-mono pt-1">
        <div>{error && <span className="text-red-500">{error}</span>}</div>
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>
    </div>
  )
}
