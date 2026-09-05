import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import { execFileSync } from 'child_process'

function contentHotReload() {
  const articlesDir = resolve(__dirname, 'content/articles')
  const buildScript = resolve(__dirname, 'scripts/build-content.mjs')

  return {
    name: 'content-hot-reload',
    configureServer(server) {
      server.watcher.add(articlesDir)

      const rebuild = (file) => {
        if (!file.endsWith('.md')) return

        try {
          execFileSync(process.execPath, [buildScript], { stdio: 'inherit' })
          server.ws.send({ type: 'full-reload' })
        } catch {
          server.config.logger.error(`文章构建失败，未刷新页面：${file}`)
        }
      }

      server.watcher.on('add', rebuild)
      server.watcher.on('change', rebuild)
      server.watcher.on('unlink', rebuild)
    },
  }
}

export default defineConfig({
  plugins: [vue(), contentHotReload()],
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
      routes.push('/about/', '/archives/', '/guestbook/')

      return routes
    },
  },
})
