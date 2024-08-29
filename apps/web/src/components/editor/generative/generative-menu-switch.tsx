import { EditorBubble, useEditor } from 'novel'
import { removeAIHighlight } from 'novel/extensions'
import {} from 'novel/plugins'
import { Fragment, type ReactNode, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

import Magic from '../icons/magic'
import { AISelector } from './ai-selector'

interface GenerativeMenuSwitchProps {
  children: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function GenerativeMenuSwitch({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProps) {
  const { editor } = useEditor()
  const [isDirectCommand, setIsDirectCommand] = useState(false)
  useEffect(() => {
    if (!open && editor) {
      setIsDirectCommand(false)
      removeAIHighlight(editor)
    }
  }, [open])

  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? 'bottom-start' : 'top',
        onHidden: () => {
          if (!editor) return

          onOpenChange(false)
          editor.chain().unsetHighlight().run()
        },
      }}
      className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      {open && (
        <AISelector
          open={open}
          onOpenChange={onOpenChange}
          isDirectCommand={isDirectCommand}
        />
      )}

      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => {
              onOpenChange(true)
            }}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            Ask AI
          </Button>
          <Fragment>
            <Button
              className="gap-1 rounded-none text-purple-500"
              variant="ghost"
              onClick={() => {
                setIsDirectCommand(true)
                onOpenChange(true)
              }}
              size="sm"
            >
              <Magic className="h-5 w-5" />
              AI Command
            </Button>
          </Fragment>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  )
}
