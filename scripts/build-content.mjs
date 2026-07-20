import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import remarkContainer from './remark-container.mjs'
import remarkCodeMeta from './remark-code-meta.mjs'
import remarkBilibili from './remark-bilibili.mjs'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypePrism from 'rehype-prism-plus'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import rehypeDetailsSummary from './rehype-details-summary.mjs'
import rehypeHeading from './rehype-heading.mjs'

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkGfm)
  .use(remarkDirective)
  .use(remarkContainer)
  .use(remarkCodeMeta)
  .use(remarkBilibili)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeKatex)
  .use(rehypePrism)
  .use(rehypeDetailsSummary)
  .use(rehypeHeading)
  .use(rehypeStringify)

const articlesDir = resolve('content/articles')
const outFile = resolve('src/generated/content.json')

async function build() {
  const files = readdirSync(articlesDir).filter(f => f.endsWith('.md'))
  const articles = []
  const tagsIndex = {}

  for (const file of files) {
    const raw = readFileSync(join(articlesDir, file), 'utf-8')
    const { data, content } = matter(raw)
    if (data.published === false) continue

    const slug = data.slug || basename(file, '.md')
    const result = await processor.process(content)
    const html = String(result)
    const headings = result.data.headings || []
    const links = data.links && data.links.length
      ? data.links.map(l => ({ label: l.label || '打开链接', url: l.url }))
      : data.link
        ? [{ label: data.linkLabel || '打开链接', url: data.link }]
        : []
    const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

    const article = {
      slug,
      title: data.title || slug,
      cover: data.cover || '',
      date: data.date || null,
      tags: data.tags || [],
      description: data.description || '',
      links,
      headings,
      html,
      text,
    }
    articles.push(article)

    for (const tag of article.tags) {
      if (!tagsIndex[tag]) tagsIndex[tag] = []
      tagsIndex[tag].push(slug)
    }
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date))

  const result = { articles, tagsIndex }
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`Built ${articles.length} articles → ${outFile}`)

  const toolsDir = resolve('content/tools')
  const toolsOut = resolve('src/generated/html-tools.json')
  const toolsPublic = resolve('public/tools')

  if (existsSync(toolsDir)) {
    const htmlFiles = readdirSync(toolsDir).filter(f => f.endsWith('.html'))
    const htmlTools = []

    mkdirSync(toolsPublic, { recursive: true })

    for (const file of htmlFiles) {
      const slug = basename(file, '.html')
      const raw = readFileSync(join(toolsDir, file), 'utf-8')
      const titleMatch = raw.match(/<title[^>]*>([^<]*)<\/title>/i)
      const name = titleMatch ? titleMatch[1].trim() : slug
      const descMatch = raw.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)
      const description = descMatch ? descMatch[1].trim() : ''
      copyFileSync(join(toolsDir, file), join(toolsPublic, file))
      htmlTools.push({ slug, name, description })
    }

    mkdirSync(dirname(toolsOut), { recursive: true })
    writeFileSync(toolsOut, JSON.stringify(htmlTools, null, 2), 'utf-8')
    console.log(`Built ${htmlTools.length} HTML tools → ${toolsOut}`)
  }
}

build()
