import type React from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Italic, List, ListOrdered, Heading2, Code, Undo, Redo } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const MenuButton = ({
  isActive,
  onClick,
  icon: Icon,
  title,
}: {
  isActive: boolean
  onClick: () => void
  icon: React.ElementType
  title: string
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    className={cn("h-8 px-2 text-gray-600 hover:bg-gray-100", isActive && "bg-gray-100 text-gray-900")}
    onClick={onClick}
    title={title}
  >
    <Icon className="h-4 w-4" />
  </Button>
)

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center border-b p-1 gap-1">
      <MenuButton
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        icon={Bold}
        title="Bold"
      />
      <MenuButton
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        icon={Italic}
        title="Italic"
      />
      <MenuButton
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        icon={Heading2}
        title="Heading"
      />
      <MenuButton
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        icon={List}
        title="Bullet List"
      />
      <MenuButton
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        icon={ListOrdered}
        title="Numbered List"
      />
      <MenuButton
        isActive={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        icon={Code}
        title="Code Block"
      />
      <div className="ml-auto flex">
        <MenuButton isActive={false} onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
        <MenuButton isActive={false} onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
      </div>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none p-3 min-h-[150px] break-all whitespace-pre-wrap max-w-full",
      },
    },
  })

  return (
    <div className={cn("border rounded-md overflow-hidden max-h-[300px] overflow-y-auto", className)}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="prose prose-sm w-full break-words whitespace-pre-wrap" />
      {!value && !editor?.isFocused && (
        <div className="absolute top-[52px] left-3 text-gray-400 pointer-events-none">{placeholder}</div>
      )}
    </div>
  )
}
