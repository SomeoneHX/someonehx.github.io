import { visit } from 'unist-util-visit'

const STYLES = 'width:100%;height:100%;position:absolute;top:0;left:0'

export default function remarkBilibili() {
  return (tree) => {
    visit(tree, 'image', (node) => {
      if (!node.url.startsWith('bilibili:')) return

      const rest = node.url.slice('bilibili:'.length)
      const qIndex = rest.indexOf('?')
      const idPart = qIndex === -1 ? rest : rest.slice(0, qIndex)
      const qs = qIndex === -1 ? '' : rest.slice(qIndex + 1)

      let src = 'https://player.bilibili.com/player.html?'
      const upper = idPart.toUpperCase()

      if (/^BV\w+$/.test(upper)) {
        src += 'bvid=' + idPart
      } else {
        const num = idPart.replace(/^AV/gi, '')
        src += 'aid=' + num
      }
      src += '&muted=1'
      if (qs) src += '&' + qs

      node.data = node.data || {}
      node.data.hName = 'div'
      node.data.hProperties = { className: ['bilibili-embed'] }
      node.data.hChildren = [
        {
          type: 'element',
          tagName: 'iframe',
          properties: {
            src,
            frameborder: 0,
            allowfullscreen: true,
            muted: true,
            allow: 'autoplay; encrypted-media',
            style: STYLES,
          },
          children: [],
        },
      ]
      // note: src/alt may leak as attributes on the div, harmless
    })
  }
}
