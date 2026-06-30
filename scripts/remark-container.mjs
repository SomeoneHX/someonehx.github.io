import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

export default function remarkContainer() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective'
      ) return

      const data = node.data || (node.data = {})

      switch (node.name) {
        case 'info':
        case 'success':
        case 'warning':
        case 'error': {
          const hast = h('details', {
            className: ['box', `box--${node.name}`],
            ...(node.attributes?.open != null ? { open: true } : {}),
          })
          data.hName = hast.tagName
          data.hProperties = hast.properties
          break
        }
        case 'align': {
          const align = node.attributes
            ? Object.keys(node.attributes)[0]
            : null
          const hast = h('div', {
            className: align ? `align-${align}` : undefined,
          })
          data.hName = hast.tagName
          data.hProperties = hast.properties
          break
        }
        case 'epigraph': {
          data.hName = 'blockquote'
          data.hProperties = { className: ['epigraph'] }
          break
        }
        default:
          break
      }
    })
  }
}
