// 生成 sitemap.xml / feed.xml 到 public/，随构建产物一起发布。
// 前置：scripts/build-content.mjs 已生成 src/generated/content.json
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, RSS_URL } from '../src/site.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentPath = resolve(root, 'src/generated/content.json')
const { articles, tagsIndex } = JSON.parse(readFileSync(contentPath, 'utf-8'))

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const excerpt = (text, max = 300) => {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function buildSitemap() {
  const urls = []

  const add = (loc, lastmod) => {
    urls.push(
      `  <url>\n    <loc>${esc(loc)}</loc>${lastmod ? `\n    <lastmod>${esc(lastmod)}</lastmod>` : ''}\n  </url>`,
    )
  }

  for (const p of ['/', '/blog/', '/tags/', '/archives/', '/about/', '/guestbook/']) {
    add(`${SITE_URL}${p}`)
  }

  for (const a of articles) {
    add(`${SITE_URL}/blog/${a.slug}/`, (a.date || '').slice(0, 10))
  }

  for (const tag of Object.keys(tagsIndex)) {
    add(`${SITE_URL}/tags/${encodeURIComponent(tag)}/`)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('\n') +
    `\n</urlset>\n`
  writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
  console.log(`sitemap.xml: ${urls.length} URLs`)
}

function buildFeed() {
  const latest = new Date(
    articles.length ? Math.max(...articles.map((a) => new Date(a.date || 0).getTime())) : Date.now(),
  ).toUTCString()

  const items = articles
    .map((a) => {
      const link = `${SITE_URL}/blog/${a.slug}/`
      const desc = a.description || excerpt(a.text)
      const cats = (a.tags || [])
        .map((t) => `      <category>${esc(t)}</category>`)
        .join('\n')
      return `  <item>\n` +
        `    <title>${esc(a.title)}</title>\n` +
        `    <link>${esc(link)}</link>\n` +
        `    <guid isPermaLink="true">${esc(link)}</guid>\n` +
        `    <pubDate>${esc(new Date(a.date).toUTCString())}</pubDate>\n` +
        `${cats ? cats + '\n' : ''}` +
        `    <description><![CDATA[${desc}]]></description>\n` +
        `  </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
    `  <channel>\n` +
    `    <title>${esc(SITE_NAME)}</title>\n` +
    `    <link>${esc(SITE_URL)}</link>\n` +
    `    <description>${esc(SITE_DESCRIPTION)}</description>\n` +
    `    <atom:link href="${esc(RSS_URL)}" rel="self" type="application/rss+xml" />\n` +
    `    <language>zh-CN</language>\n` +
    `    <lastBuildDate>${esc(latest)}</lastBuildDate>\n` +
    items +
    `\n  </channel>\n` +
    `</rss>\n`
  writeFileSync(resolve(root, 'public/feed.xml'), xml)
  console.log(`feed.xml: ${articles.length} items`)
}

buildSitemap()
buildFeed()
