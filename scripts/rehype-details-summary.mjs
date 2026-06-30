import { visit } from 'unist-util-visit'

const LABELS = {
  'box--info': '信息',
  'box--success': '成功',
  'box--warning': '警告',
  'box--error': '错误',
}

export default function rehypeDetailsSummary() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'details') return

      const first = node.children?.[0]
      if (!first || first.tagName !== 'summary') {
        const className = Array.isArray(node.properties.className)
          ? node.properties.className.join(' ')
          : node.properties.className || ''

        let label = ''
        for (const [cls, text] of Object.entries(LABELS)) {
          if (className.includes(cls)) {
            label = text
            break
          }
        }

        node.children.unshift({
          type: 'element',
          tagName: 'summary',
          properties: {},
          children: label ? [{ type: 'text', value: label }] : [],
        })
      }
    })
  }
}
