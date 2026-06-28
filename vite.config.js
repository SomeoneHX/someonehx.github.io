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
      const { articles, tagsIndex, categoriesIndex, seriesIndex } =
        JSON.parse(readFileSync(contentPath, 'utf-8'))

      const routes = ['/', '/blog/', '/projects/']
      for (const a of articles) {
        if (a.link) {
          routes.push(`/projects/${a.slug}/`)
        } else {
          routes.push(`/blog/${a.slug}/`)
        }
      }
      for (const t of Object.keys(tagsIndex)) routes.push(`/tags/${t}/`)
      for (const c of Object.keys(categoriesIndex)) routes.push(`/categories/${c}/`)
      for (const s of Object.keys(seriesIndex)) routes.push(`/series/${s}/`)
      return routes
    },
  },
})
