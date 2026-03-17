import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import HomeView from '../views/HomeView.vue'
import ChapterView from '../views/ChapterView.vue'
import { chapters } from '../data/chapters'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
        meta: { titleKey: 'home.title' },
      },
      {
        path: 'chapter/:id',
        name: 'chapter',
        component: ChapterView,
        meta: { titleKey: 'sidebar' },
        props: true,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
export { chapters }
