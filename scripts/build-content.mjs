import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import remarkContainer from './remark-container.mjs'
import remarkCodeMeta from './remark-code-meta.mjs'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypePrism from 'rehype-prism-plus'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import rehypeDetailsSummary from './rehype-details-summary.mjs'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkContainer)
  .use(remarkCodeMeta)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypePrism)
  .use(rehypeKatex)
  .use(rehypeDetailsSummary)
  .use(rehypeStringify)

const articlesDir = resolve('content/articles')
const outFile = resolve('src/generated/content.json')

async function build() {
  const files = readdirSync(articlesDir).filter(f => f.endsWith('.md'))
  const articles = []
  const tagsIndex = {}
  const seriesIndex = {}

  for (const file of files) {
    const raw = readFileSync(join(articlesDir, file), 'utf-8')
    const { data, content } = matter(raw)
    if (data.published === false) continue

    const slug = data.slug || basename(file, '.md')
    const result = await processor.process(content)
    const html = String(result)
    const links = data.links && data.links.length
      ? data.links.map(l => ({ label: l.label || '打开链接', url: l.url }))
      : data.link
        ? [{ label: data.linkLabel || '打开链接', url: data.link }]
        : []
    const article = {
      slug,
      title: data.title || slug,
      date: data.date || null,
      tags: data.tags || [],
      series: data.series || null,
      seriesOrder: data.seriesOrder || null,
      description: data.description || '',
      links,
      html,
    }
    articles.push(article)

    for (const tag of article.tags) {
      if (!tagsIndex[tag]) tagsIndex[tag] = []
      tagsIndex[tag].push(slug)
    }
    if (article.series) {
      if (!seriesIndex[article.series]) seriesIndex[article.series] = []
      seriesIndex[article.series].push(slug)
    }
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date))

  const result = { articles, tagsIndex, seriesIndex }
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`Built ${articles.length} articles → ${outFile}`)
}

build()
