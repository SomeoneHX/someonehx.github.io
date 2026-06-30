import HomeView from '@/views/HomeView.vue'
import BlogView from '@/views/BlogView.vue'
import ArticleView from '@/views/ArticleView.vue'
import TagsView from '@/views/TagsView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/blog/', name: 'Blog', component: BlogView },
  { path: '/blog/:slug/', name: 'Article', component: ArticleView },
  { path: '/tags/', name: 'Tags', component: TagsView },
  { path: '/tags/:tag/', name: 'Tag', component: BlogView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]

export default routes
