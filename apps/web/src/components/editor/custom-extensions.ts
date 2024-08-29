import {
  Extension,
  mergeAttributes,
  Node,
  textblockTypeInputRule,
} from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { Fragment } from 'prosemirror-model'

export const DatasetBlockNode = Node.create({
  name: 'datasetBlock',
  group: 'block',
  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'dataset-block',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['dataset-block', mergeAttributes(HTMLAttributes), 0]
  },

  addAttributes() {
    return {
      blockId: {
        default: null,
        parseHTML: (element) => element.getAttribute('blockId'),
        renderHTML: (attributes) => ({
          blockId: attributes.blockId,
        }),
      },
    }
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const blockId = node.attrs.blockId || ''
          const content = node.content.content
            .map((child: any) => child.text || '')
            .join(' ')
          state.write(`[dataset-block-${blockId}] ${content} `)
          state.closeBlock(node)
        },
      },
    }
  },
  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /(.*?)\s*\[dataset-block-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]\s*/,
        type: this.type,
        getAttributes: (match) => {
          console.log(match)
          return { blockId: match[2] } // Capture the UUID
        },
      }),
    ]
  },
})

export const DatasetBlockDropHandleExtension = Extension.create({
  name: 'dataset-block-drop-handle',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDrop(view, event: DragEvent): boolean {
            if (!event) return false

            event.preventDefault()

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })

            const snippetContent =
              event?.dataTransfer?.getData('datasetBlock') || ''

            if (!snippetContent) return false

            const parsedData = JSON.parse(snippetContent)

            const snippetNode = view.state.schema.nodes.datasetBlock.create(
              {
                blockId: parsedData.blockId,
              },
              view.state.schema.text(parsedData.content),
            )

            if (coordinates) {
              const transaction = view.state.tr.insert(
                coordinates.pos,
                Fragment.from(snippetNode),
              )

              transaction.setMeta('isSnippetDropTransaction', true)
              view.dispatch(transaction)
            }

            return false
          },
        },
      }),
    ]
  },
})
