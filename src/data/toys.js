export const toys = [
  {
    slug: 'base64',
    name: 'Base64 编解码',
    icon: 'mdi:transit-connection-variant',
    description: '在线 Base64 编码与解码，支持中文',
  },
]

export const toysMap = Object.fromEntries(toys.map(t => [t.slug, t]))
