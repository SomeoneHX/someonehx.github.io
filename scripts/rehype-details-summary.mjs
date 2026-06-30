import { visit } from 'unist-util-visit'

export default function rehypeDetailsSummary() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'details') {
        const first = node.children?.[0]
        if (!first || first.tagName !== 'summary') {
          node.children.unshift({
            type: 'element',
            tagName: 'summary',
            properties: {},
            children: [],
          })
        }
      }
    })
  }
}
