import { visit } from 'unist-util-visit'

const TYPE_LABELS = {
  info: '信息',
  success: '成功',
  warning: '警告',
  error: '错误',
}

export default function rehypeDetailsSummary() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'div') return

      const className = Array.isArray(node.properties.className)
        ? node.properties.className.join(' ')
        : node.properties.className || ''
      if (!className.includes(' box--')) return

      if (node.children.some(c => c.properties?.className?.includes('box__header'))) return

      const type = node.properties.dataType || ''
      const label = TYPE_LABELS[type] || ''
      const title = node.properties.dataLabel || ''

      const headerChildren = []
      if (label) {
        headerChildren.push({
          type: 'element',
          tagName: 'span',
          properties: { className: ['box__type'] },
          children: [{ type: 'text', value: label }],
        })
      }
      if (title) {
        headerChildren.push({
          type: 'element',
          tagName: 'span',
          properties: { className: ['box__title'] },
          children: [{ type: 'text', value: title }],
        })
      }

      const header = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['box__header'] },
        children: headerChildren,
      }

      const body = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['box__body'] },
        children: node.children,
      }

      node.children = [header, body]

      delete node.properties.dataType
      delete node.properties.dataLabel
    })
  }
}
