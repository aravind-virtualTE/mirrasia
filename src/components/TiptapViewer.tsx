import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { cn } from "@/lib/utils"
import { useEffect } from 'react'
import { marked } from 'marked'

interface TiptapViewerProps {
    content: string
    className?: string
}

export function TiptapViewer({ content, className }: TiptapViewerProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: "", // Initial empty content, we set it in useEffect
        editable: false,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm max-w-none focus:outline-none dark:prose-invert",
                    className
                ),
            },
        },
    })

    useEffect(() => {
        const parseContent = async () => {
            if (editor && content) {
                const html = await marked.parse(content);
                if (html !== editor.getHTML()) {
                    editor.commands.setContent(html)
                }
            }
        };
        parseContent();
    }, [content, editor])

    if (!editor) {
        return null
    }

    return <EditorContent editor={editor} className="w-full" />
}
