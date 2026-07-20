import HomeView from '@/views/HomeView.vue'
import BlogView from '@/views/BlogView.vue'
import ArticleView from '@/views/ArticleView.vue'
import TagsView from '@/views/TagsView.vue'
import AboutView from '@/views/AboutView.vue'
import ArchivesView from '@/views/ArchivesView.vue'
import FriendsView from '@/views/FriendsView.vue'
import GuestbookView from '@/views/GuestbookView.vue'
import ToysView from '@/views/ToysView.vue'
import ToolView from '@/views/ToolView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/blog/', name: 'Blog', component: BlogView },
  { path: '/blog/:slug/', name: 'Article', component: ArticleView },
  { path: '/tags/', name: 'Tags', component: TagsView },
  { path: '/tags/:tag/', name: 'Tag', component: BlogView },
  { path: '/about/', name: 'About', component: AboutView },
  { path: '/archives/', name: 'Archives', component: ArchivesView },
  { path: '/friends/', name: 'Friends', component: FriendsView },
  { path: '/guestbook/', name: 'Guestbook', component: GuestbookView },
  { path: '/toys/', name: 'Toys', component: ToysView },
  { path: '/toys/:slug/', name: 'Tool', component: ToolView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
]

export default routes
