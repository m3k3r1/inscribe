'use client'

import { useQuery } from '@tanstack/react-query'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import { useParams } from 'next/navigation'
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
} from 'novel'
import { handleCommandNavigation, ImageResizer } from 'novel/extensions'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'

import { getContent } from '@/http/get-content'
import { saveContent } from '@/http/save-content'

import { Separator } from '../ui/separator'
import {
  DatasetBlockDropHandleExtension,
  DatasetBlockNode,
} from './custom-extensions'
import { defaultExtensions } from './extensions'
import { GenerativeMenuSwitch } from './generative/generative-menu-switch'
import { ColorSelector } from './selectors/color-selector'
import { LinkSelector } from './selectors/link-selector'
import { MathSelector } from './selectors/math-selector'
import { NodeSelector } from './selectors/node-selector'
import { TextButtons } from './selectors/text-buttons'
import { slashCommand, suggestionItems } from './slash-command'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const hljs = require('highlight.js')

const extensions = [
  ...defaultExtensions,
  slashCommand,
  DatasetBlockNode,
  DatasetBlockDropHandleExtension,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
]

interface EditorProps {
  setCharsCount: (count: number) => void
  setSaveStatus: (status: string) => void
  onContentChange: (content: string) => void
}

export function Editor({
  setCharsCount,
  setSaveStatus,
  onContentChange,
}: EditorProps) {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null)

  const [openNode, setOpenNode] = useState(false)
  const [openColor, setOpenColor] = useState(false)
  const [openLink, setOpenLink] = useState(false)
  const [openAI, setOpenAI] = useState(false)

  const { slug: orgSlug, project: projectSlug } = useParams<{
    slug: string
    project: string
  }>()

  const { data: projectContent } = useQuery({
    queryKey: [orgSlug, 'datasets', 'project', projectSlug],
    queryFn: () => getContent(orgSlug!, projectSlug!),
    enabled: !!orgSlug && !!projectSlug,
  })

  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, 'text/html')
    doc.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el)
    })
    return new XMLSerializer().serializeToString(doc)
  }

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON()
      setCharsCount(editor.storage.characterCount.words())
      window.localStorage.setItem(
        `html-content-${projectSlug}`,
        highlightCodeblocks(editor.getHTML()),
      )
      const content = JSON.stringify(json)
      window.localStorage.setItem(`novel-content-${projectSlug}`, content)
      window.localStorage.setItem(
        `markdown-${projectSlug}`,
        editor.storage.markdown.getMarkdown(),
      )
      setSaveStatus('Saved')
      onContentChange(editor.storage.markdown.getMarkdown())
      try {
        await saveContent(orgSlug, projectSlug, { content })
      } catch (e) {
        console.error(e)
        toast.error('Ups! Failed to save content')
      }
    },
    500,
  )

  useEffect(() => {
    if (projectContent) {
      const storageContent = window.localStorage.getItem(
        `novel-content-${projectSlug}`,
      )
      if (projectContent && projectContent.project.content)
        setInitialContent(JSON.parse(projectContent.project.content))
      else if (storageContent) setInitialContent(JSON.parse(storageContent))
      else
        setInitialContent({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: {
                level: 1,
              },
              content: [
                {
                  marks: [
                    {
                      type: 'bold',
                    },
                  ],
                  type: 'text',
                  text: projectSlug,
                },
              ],
            },
          ],
        })
    }
  }, [projectContent])

  if (!initialContent) return null

  return (
    <div className="h-[80vh] w-2/3">
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className=" no-scrollbar h-full overflow-y-scroll border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            // handlePaste: (view, event) =>
            //   handleImagePaste(view, event, uploadFn),
            // handleDrop: (view, event, _slice, moved) =>
            //   handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                'prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full',
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor)
            setSaveStatus('Unsaved')
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="no-scrollbar z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command && item.command(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
