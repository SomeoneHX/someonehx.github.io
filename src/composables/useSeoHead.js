import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import data from '@/generated/content.json'
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  RSS_URL,
  absoluteUrl,
} from '@/site'

function excerpt(text, max = 120) {
  const t = (text || '').replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max)}…` : t
}

function toHead({ title, description, type = 'website', image, path, publishedTime, noindex }) {
  const meta = [
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:type', content: type },
    { property: 'og:url', content: absoluteUrl(path) },
    { property: 'og:image', content: absoluteUrl(image || DEFAULT_OG_IMAGE) },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: absoluteUrl(image || DEFAULT_OG_IMAGE) },
  ]
  if (type === 'article' && publishedTime) {
    meta.push({ property: 'article:published_time', content: publishedTime })
  }
  if (noindex) {
    meta.push({ name: 'robots', content: 'noindex, nofollow' })
  }
  return {
    title,
    meta,
    link: [
      { rel: 'canonical', href: absoluteUrl(path) },
      { rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: RSS_URL },
    ],
  }
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

const withSite = (t) => `${t} | ${SITE_NAME}`

export function useSeoHead() {
  const route = useRoute()

  const head = computed(() => {
    const p = route.path

    // 未匹配到任何路由 → 404
    if (route.name === 'NotFound') {
      return toHead({
        title: withSite('页面未找到'),
        description: '页面不存在或已被移除。',
        path: p,
        noindex: true,
      })
    }

    // 首页
    if (p === '/') {
      return toHead({
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        path: '/',
      })
    }

    // 文章页与文章列表
    if (p.startsWith('/blog/')) {
      const slug = safeDecode(p.replace(/^\/blog\//, '').replace(/\/$/, ''))
      if (!slug) {
        return toHead({
          title: withSite('博客'),
          description: `${SITE_NAME} 的文章列表。`,
          path: '/blog/',
        })
      }
      const article = data.articles.find((a) => a.slug === slug)
      if (!article) {
        return toHead({
          title: withSite('文章未找到'),
          description: '文章不存在或已被移除。',
          path: p,
          noindex: true,
        })
      }
      return toHead({
        title: withSite(article.title),
        description: article.description || excerpt(article.text),
        type: 'article',
        image: article.cover,
        path: p,
        publishedTime: article.date || undefined,
      })
    }

    // 标签
    if (p.startsWith('/tags/')) {
      const tag = safeDecode(p.replace(/^\/tags\//, '').replace(/\/$/, ''))
      if (!tag) {
        return toHead({
          title: withSite('标签'),
          description: `${SITE_NAME} 的文章标签。`,
          path: '/tags/',
        })
      }
      return toHead({
        title: withSite(`标签：${tag}`),
        description: `标签「${tag}」下的文章。`,
        path: p,
      })
    }

    // 静态页面
    const statics = {
      '/archives/': { title: '归档', desc: `${SITE_NAME} 的文章归档。` },
      '/about/': { title: '关于', desc: `关于 ${SITE_NAME}。` },
      '/guestbook/': { title: '留言板', desc: `在 ${SITE_NAME} 的留言板留下想说的话。` },
    }
    if (statics[p]) {
      return toHead({
        title: withSite(statics[p].title),
        description: statics[p].desc,
        path: p,
      })
    }

    // 兜底：未知但合法的路由
    return toHead({
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      path: p,
    })
  })

  useHead(head)
}
