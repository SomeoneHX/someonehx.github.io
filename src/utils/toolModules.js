const modules = import.meta.glob('@/views/tools/*.vue')

export const toolLoaders = {}

for (const [path, loader] of Object.entries(modules)) {
  const slug = path.match(/(\w+)\.vue$/)[1].replace(/View$/, '').toLowerCase()
  toolLoaders[slug] = loader
}
