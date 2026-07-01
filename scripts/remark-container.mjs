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
          const open = node.attributes?.open != null

          let label = ''
          for (let i = node.children.length - 1; i >= 0; i--) {
            const child = node.children[i]
            if (child.data?.directiveLabel) {
              label = child.children.map(c => c.value).join('').trim()
              node.children.splice(i, 1)
              break
            }
          }

          const hast = h('div', {
            className: ['box', `box--${node.name}`],
            'data-open': open ? '' : null,
            'data-type': node.name,
            'data-label': label || null,
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
