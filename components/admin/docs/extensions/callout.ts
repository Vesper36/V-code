import { Node, mergeAttributes } from '@tiptap/react'

export interface CalloutOptions {
  types: string[]
  HTMLAttributes: Record<string, unknown>
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addOptions() {
    return {
      types: ['info', 'warning', 'danger', 'tip'],
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes) => ({ 'data-callout-type': attributes.type }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-callout': '' }),
      0,
    ]
  },

  addCommands() {
    return {
      setCallout:
        (attrs: { type?: string } = {}) =>
        ({ commands }: { commands: any }) =>
          commands.wrapIn(this.name, attrs),
      toggleCallout:
        (attrs: { type?: string } = {}) =>
        ({ commands }: { commands: any }) =>
          commands.toggleWrap(this.name, attrs),
      unsetCallout:
        () =>
        ({ commands }: { commands: any }) =>
          commands.lift(this.name),
    } as any
  },
})
