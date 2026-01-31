'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo } from 'lucide-react'

type Props = {
  name: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  minHeight?: string
}

export function RichTextEditor({
  name,
  defaultValue = '',
  placeholder = 'Write a description...',
  disabled = false,
  minHeight = '200px',
}: Props) {
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline' },
      }),
    ],
    content: defaultValue || '',
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          'min-w-0 focus:outline-none px-3 py-2 rounded-b-md border border-t-0 border-input bg-background ' +
          'text-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 [&_a]:underline [&_strong]:font-bold [&_em]:italic',
      },
      handleDOMEvents: {
        blur: () => {
          syncToHiddenInput()
        },
      },
    },
  })

  const syncToHiddenInput = useCallback(() => {
    const html = editor?.getHTML() ?? ''
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = html
    }
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor || defaultValue === undefined) return
    if (editor.isEmpty && defaultValue) {
      editor.commands.setContent(defaultValue)
    }
  }, [editor, defaultValue])

  useEffect(() => {
    const onUpdate = () => syncToHiddenInput()
    editor?.on('update', onUpdate)
    return () => editor?.off('update', onUpdate)
  }, [editor, syncToHiddenInput])

  useEffect(() => {
    syncToHiddenInput()
  }, [syncToHiddenInput])

  // Sync to hidden input on form submit (in case user didn't blur editor)
  useEffect(() => {
    const form = document.querySelector(`input[name="${name}"]`)?.closest('form')
    if (!form) return
    const onSubmit = () => syncToHiddenInput()
    form.addEventListener('submit', onSubmit)
    return () => form.removeEventListener('submit', onSubmit)
  }, [name, syncToHiddenInput])

  return (
    <div className="rounded-md border border-input overflow-hidden">
      <EditorToolbar editor={editor} disabled={disabled} />
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
      <input ref={hiddenInputRef} type="hidden" name={name} readOnly />
    </div>
  )
}

function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled?: boolean }) {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        disabled={disabled}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        disabled={disabled}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        disabled={disabled}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        disabled={disabled}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const url = window.prompt('URL')
          if (url) editor.chain().focus().setLink({ href: url }).run()
        }}
        active={editor.isActive('link')}
        disabled={disabled}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>
      <span className="w-px h-5 bg-border mx-0.5" />
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={active ? { backgroundColor: 'hsl(var(--muted))' } : undefined}
    >
      {children}
    </Button>
  )
}
