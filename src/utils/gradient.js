export function coverGradient(slug) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `linear-gradient(135deg, hsl(${hue}, 40%, 35%), hsl(${(hue + 60) % 360}, 35%, 25%))`
}
