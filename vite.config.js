import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'

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

      const VUE_SLUGS = ['base64', 'markdown']
      for (const s of VUE_SLUGS) routes.push(`/toys/${s}/`)

      const htmlToolsPath = resolve(__dirname, 'src/generated/html-tools.json')
      if (existsSync(htmlToolsPath)) {
        const htmlTools = JSON.parse(readFileSync(htmlToolsPath, 'utf-8'))
        for (const t of htmlTools) routes.push(`/toys/${t.slug}/`)
      }

      return routes
    },
  },
})
