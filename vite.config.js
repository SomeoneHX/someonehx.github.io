import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  ssgOptions: {
    script: 'async',
    includedRoutes: async () => {
      const contentPath = resolve(__dirname, 'src/generated/content.json')
      const { articles, tagsIndex } =
        JSON.parse(readFileSync(contentPath, 'utf-8'))

      const routes = ['/', '/blog/', '/tags/']
      for (const a of articles) routes.push(`/blog/${a.slug}/`)
      for (const t of Object.keys(tagsIndex)) routes.push(`/tags/${t}/`)
      routes.push('/about/', '/archives/', '/friends/', '/guestbook/', '/toys/')

      const { readdirSync, existsSync } = await import('fs')
      const toolsDir = resolve(__dirname, 'src/views/tools')
      if (existsSync(toolsDir)) {
        for (const f of readdirSync(toolsDir).filter(f => f.endsWith('.vue'))) {
          routes.push(`/toys/${f.replace(/View\.vue$/, '').toLowerCase()}/`)
        }
      }

      return routes
    },
  },
})
