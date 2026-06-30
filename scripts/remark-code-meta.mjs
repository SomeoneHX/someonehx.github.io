import { visit } from 'unist-util-visit'

export default function remarkCodeMeta() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      const info = [node.lang, node.meta].filter(Boolean).join(' ')
      if (!info) return

      const words = info.split(/\s+/)
      let lang = ''
      const metaParts = []
      let hasLineNumbers = false

      for (const word of words) {
        if (word.toLowerCase() === 'line-numbers') {
          hasLineNumbers = true
        } else if (/^lines=/i.test(word)) {
          metaParts.push(`{${word.slice(6)}}`)
        } else if (!lang && !/^{/.test(word)) {
          lang = word
        } else {
          metaParts.push(word)
        }
      }

      if (hasLineNumbers) {
        metaParts.push('showLineNumbers')
      }

      const meta = metaParts.length > 0 ? metaParts.join(' ') : undefined

      node.lang = lang || undefined
      node.meta = meta

      if (meta) {
        node.data = node.data || {}
        node.data.hProperties = node.data.hProperties || {}
        node.data.hProperties.metastring = meta
      }
    })
  }
}
