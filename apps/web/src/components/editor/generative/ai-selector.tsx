'use client'

import { useCompletion } from 'ai/react'
import { ArrowUp } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEditor } from 'novel'
import { addAIHighlight } from 'novel/extensions'
import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandList } from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAiFilters } from '@/hooks/use-ai-filters'

import CrazySpinner from '../icons/crazy-spinner'
import Magic from '../icons/magic'
import AICompletionCommands from './ai-completion-command'
import { AISelectorCommands } from './ai-selector-commands'

interface AISelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isDirectCommand: boolean
}

export function AISelector({ onOpenChange, isDirectCommand }: AISelectorProps) {
  const { editor } = useEditor()
  const { project: projectSlug } = useParams<{
    project: string
  }>()
  const [inputValue, setInputValue] = useState('')
  const { modelFilter, languageFilter, formatFilter } = useAiFilters()

  const { completion, complete, isLoading } = useCompletion({
    // id: "novel",
    api: '/api/generate',
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error('You have reached your request limit for the day.')
      }
    },
    onError: (e) => {
      toast.error(e.message)
    },
  })

  useEffect(() => {
    console.log('isDirectCommand', isDirectCommand)
    if (isDirectCommand) {
      if (!editor) return

      const slice = editor.state.selection.content()
      const text = editor.storage.markdown.serializer.serialize(slice.content)

      const context = editor.storage.markdown.getMarkdown()

      complete(text, {
        body: {
          option: 'command',
          command: inputValue,
          context,
          model: modelFilter.values().next().value,
          language: languageFilter.values().next().value,
          project: projectSlug,
          format: formatFilter,
        },
      })
    }
  }, [isDirectCommand])

  const hasCompletion = completion.length > 0

  return (
    <Command className="w-[500px]">
      <CommandList>
        {hasCompletion && (
          <div className="flex max-h-[600px]">
            <ScrollArea>
              <div className="prose prose-sm p-2 px-4 text-foreground">
                <Markdown>{completion}</Markdown>
              </div>
            </ScrollArea>
          </div>
        )}

        {isLoading && (
          <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
            <Magic className="mr-2 h-4 w-4 shrink-0  " />
            AI is thinking
            <div className="ml-2 mt-1">
              <CrazySpinner />
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="relative">
              <CommandInput
                value={inputValue}
                onValueChange={setInputValue}
                autoFocus
                placeholder={
                  hasCompletion
                    ? 'Tell AI what to do next'
                    : 'Ask AI to edit or generate...'
                }
                onFocus={() => {
                  if (!editor) return
                  addAIHighlight(editor)
                }}
              />
              <Button
                size="icon"
                className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
                onClick={() => {
                  if (!editor) return

                  if (completion)
                    return complete(completion, {
                      body: {
                        project: projectSlug,
                        option: 'zap',
                        command: inputValue,
                        model: modelFilter.values().next().value,
                        language: languageFilter.values().next().value,
                        format: formatFilter.values().next().value,
                      },
                    }).then(() => setInputValue(''))

                  const slice = editor.state.selection.content()
                  const text = editor.storage.markdown.serializer.serialize(
                    slice.content,
                  )

                  complete(text, {
                    body: {
                      project: projectSlug,
                      option: 'zap',
                      command: inputValue,
                      model: modelFilter.values().next().value,
                      language: languageFilter.values().next().value,
                      format: formatFilter.values().next().value,
                    },
                  }).then(() => setInputValue(''))
                }}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
            {hasCompletion ? (
              <AICompletionCommands
                onDiscard={() => {
                  if (!editor) return

                  editor.chain().unsetHighlight().focus().run()
                  onOpenChange(false)
                }}
                completion={completion}
              />
            ) : (
              <AISelectorCommands
                onSelect={(value, option) => {
                  if (!editor) return

                  const context = editor.storage.markdown.getMarkdown()
                  complete(value, {
                    body: {
                      project: projectSlug,
                      option,
                      context,
                      model: modelFilter.values().next().value,
                      language: languageFilter.values().next().value,
                      format: formatFilter.values().next().value,
                    },
                  })
                }}
              />
            )}
          </>
        )}
      </CommandList>
    </Command>
  )
}
