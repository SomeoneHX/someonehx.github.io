import { visit } from 'unist-util-visit'

function getText(node) {
  let text = ''
  if (node.type === 'text') return node.value
  if (node.children) {
    for (const child of node.children) {
      text += getText(child)
    }
  }
  return text
}

export default function rehypeHeading(options = {}) {
  const slugCounts = {}

  return (tree, file) => {
    for (const key in slugCounts) delete slugCounts[key]

    const headings = []

    visit(tree, 'element', (node) => {
      if (!/^h[1-6]$/.test(node.tagName)) return
      const depth = parseInt(node.tagName[1])
      if (options.maxDepth && depth > options.maxDepth) return

      const text = getText(node)

      let slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-')
      if (!slug) slug = 'heading'

      if (slugCounts[slug] !== undefined) {
        slugCounts[slug]++
        slug = `${slug}-${slugCounts[slug]}`
      } else {
        slugCounts[slug] = 0
      }

      if (!node.properties) node.properties = {}
      node.properties.id = slug

      headings.push({ depth, text, id: slug })
    })

    file.data.headings = headings
  }
}
