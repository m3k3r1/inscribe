import { Check, TextQuote, TrashIcon } from 'lucide-react'
import { useEditor } from 'novel'

import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'

export default function AICompletionCommands({
  completion,
  onDiscard,
}: {
  completion: string
  onDiscard: () => void
}) {
  const { editor } = useEditor()
  return (
    <>
      <CommandGroup>
        <CommandItem
          className="gap-2 px-4"
          value="replace"
          onSelect={() => {
            if (!editor) return

            const selection = editor.view.state.selection

            editor
              .chain()
              .focus()
              .insertContentAt(
                {
                  from: selection.from,
                  to: selection.to,
                },
                completion,
              )
              .run()
          }}
        >
          <Check className="h-4 w-4 text-muted-foreground" />
          Replace selection
        </CommandItem>
        <CommandItem
          className="gap-2 px-4"
          value="insert"
          onSelect={() => {
            if (!editor) return
            const selection = editor.view.state.selection
            editor
              .chain()
              .focus()
              .insertContentAt(selection.to, completion)
              .run()
          }}
        >
          <TextQuote className="h-4 w-4 text-muted-foreground" />
          Insert below
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />

      <CommandGroup>
        <CommandItem onSelect={onDiscard} value="thrash" className="gap-2 px-4">
          <TrashIcon className="h-4 w-4 text-muted-foreground" />
          Discard
        </CommandItem>
      </CommandGroup>
    </>
  )
}
