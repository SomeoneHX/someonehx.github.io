/** 全站共享类型定义（与 scripts/build-content.mjs 的产出结构一一对应） */

export interface ArticleLink {
  label: string
  url: string
}

/** content.json 中单篇文章的结构（由 build-content.mjs 生成） */
export interface Article {
  slug: string
  title: string
  /** 无封面时为空字符串 */
  cover: string
  /** ISO 字符串；无日期时为 null */
  date: string | null
  tags: string[]
  pinned: boolean
  description: string
  links: ArticleLink[]
  /** 元数据里绑定的洛谷文章 ID；未绑定时为 null */
  luoguArticle: string | null
  markdown: string
  text: string
  wordCount: number
  readingMinutes: number
}

/** content.json 顶层结构 */
export interface ContentData {
  articles: Article[]
  /** 标签名 → 文章 slug 列表 */
  tagsIndex: Record<string, string[]>
}

/** rehype-heading 提取的标题（目录 / 页内锚点共用） */
export interface Heading {
  depth: number
  text: string
  id: string
}
