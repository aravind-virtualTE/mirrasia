import { cn } from "@/lib/utils"

interface RichTextViewerProps {
    content: string
    className?: string
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
    if (!content) {
        return <div className={cn("text-gray-500 italic", className)}>No description provided</div>
    }

    return <div
    className={cn(
      "break-words whitespace-pre-wrap w-full max-w-full overflow-y-auto max-h-[300px]",
      className
    )}
    dangerouslySetInnerHTML={{ __html: content }}
  />

}
