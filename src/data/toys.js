export const toys = [
  {
    slug: 'base64',
    name: 'Base64 编解码',
    icon: 'mdi:transit-connection-variant',
    description: '在线 Base64 编码与解码，支持中文',
  },
  {
    slug: 'markdown',
    name: 'Markdown 编辑器',
    icon: 'mdi:markdown',
    description: '实时预览的 Markdown 编辑器，支持数学公式与代码高亮',
  },
]

export const toysMap = Object.fromEntries(toys.map(t => [t.slug, t]))
