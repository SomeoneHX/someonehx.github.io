import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import matter from 'gray-matter'

const articlesDir = resolve('content/articles')
const outFile = resolve('src/generated/content.json')

function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[#>*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function build() {
  const files = readdirSync(articlesDir).filter(f => f.endsWith('.md'))
  const articles = []
  const tagsIndex = {}

  for (const file of files) {
    const raw = readFileSync(join(articlesDir, file), 'utf-8')
    const { data, content } = matter(raw)
    if (data.published === false) continue

    const slug = data.slug || basename(file, '.md')
    const links = data.links && data.links.length
      ? data.links.map(l => ({ label: l.label || '打开链接', url: l.url }))
      : data.link
        ? [{ label: data.linkLabel || '打开链接', url: data.link }]
        : []
    const article = {
      slug,
      title: data.title || slug,
      cover: data.cover || '',
      date: data.date || null,
      tags: data.tags || [],
      pinned: !!data.pinned,
      description: data.description || '',
      links,
      markdown: content,
      text: toPlainText(content),
      wordCount: 0,
      readingMinutes: 0,
    }
    // 中文按约 300 字/分钟粗算阅读时长
    article.wordCount = Array.from(article.text.replace(/\s+/g, '')).length
    article.readingMinutes = Math.max(1, Math.round(article.wordCount / 300))
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
}

build()
