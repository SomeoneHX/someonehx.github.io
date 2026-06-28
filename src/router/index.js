import HomeView from '@/views/HomeView.vue'
import BlogView from '@/views/BlogView.vue'
import ArticleView from '@/views/ArticleView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/blog/', name: 'Blog', component: BlogView },
  { path: '/blog/:slug/', name: 'Article', component: ArticleView },
  { path: '/projects/', name: 'Projects', component: BlogView },
  { path: '/projects/:slug/', name: 'ProjectArticle', component: ArticleView },
  { path: '/tags/:tag/', name: 'Tag', component: BlogView },
  { path: '/categories/:category/', name: 'Category', component: BlogView },
  { path: '/series/:series/', name: 'Series', component: BlogView },
]

export default routes
