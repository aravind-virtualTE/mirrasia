import { cn } from "@/lib/utils"

interface RichTextViewerProps {
    content: string
    className?: string
}

// export function RichTextViewer({ content, className }: RichTextViewerProps) {
//   if (!content) {
//     return <div className={cn("text-gray-500 italic", className)}>No description provided</div>
//   }

//   return (
//     <div
//       className={cn(
//         "prose prose-sm max-w-full break-words whitespace-pre-wrap overflow-y-auto max-h-[300px]",
//         className
//       )}
//       dangerouslySetInnerHTML={{ __html: content }}
//     />
//   )
// }
export function RichTextViewer({ content, className }: RichTextViewerProps) {
  if (!content) {
    return <div className={cn("text-gray-500 italic", className)}>No description provided</div>
  }
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words whitespace-pre-wrap overflow-y-auto max-h-[300px] w-full",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}