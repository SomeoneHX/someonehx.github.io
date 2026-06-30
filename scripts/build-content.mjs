import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs'
import { resolve, dirname, join, basename } from 'path'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: true })
const articlesDir = resolve('content/articles')
const outFile = resolve('src/generated/content.json')

function build() {
  const files = readdirSync(articlesDir).filter(f => f.endsWith('.md'))
  const articles = []
  const tagsIndex = {}
  const seriesIndex = {}

  for (const file of files) {
    const raw = readFileSync(join(articlesDir, file), 'utf-8')
    const { data, content } = matter(raw)
    if (data.published === false) continue

    const slug = data.slug || basename(file, '.md')
    const html = md.render(content)
    const article = {
      slug,
      title: data.title || slug,
      date: data.date || null,
      tags: data.tags || [],
      series: data.series || null,
      seriesOrder: data.seriesOrder || null,
      description: data.description || '',
      link: data.link || null,
      linkLabel: data.linkLabel || null,
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
