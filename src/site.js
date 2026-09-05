// 站点级常量：URL、名称、描述等。换自定义域名时只需改 SITE_URL。
export const SITE_URL = 'https://someonehx.github.io'

export const SITE_NAME = 'Someone.HX'
export const SITE_DESCRIPTION = 'Someone.HX 的个人主页与博客'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`
export const RSS_URL = `${SITE_URL}/feed.xml`

/** 把本地路径（如 /covers/a.png）或相对路径拼成绝对 URL；已是 http(s) 原样返回 */
export function absoluteUrl(path) {
  if (/^https?:\/\//i.test(path)) return path
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`)
}
