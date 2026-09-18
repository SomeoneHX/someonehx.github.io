/// <reference types="vite/client" />

/** content.json：类型来自 src/types.ts（避免对大 JSON 做逐字面量推断） */
declare module '@/generated/content.json' {
  import type { ContentData } from '@/types'
  const data: ContentData
  export default data
}

/** scripts/ 下的 remark/rehype 插件为 .mjs，无类型；放宽为 any 交给 unified 消化 */
declare module '*.mjs' {
  const plugin: any
  export default plugin
}
