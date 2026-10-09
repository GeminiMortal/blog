import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ProjectsPage from '../pages/ProjectsPage.vue'
import ProjectDetailPage from '../pages/ProjectDetailPage.vue'
import AwardsPage from '../pages/AwardsPage.vue'
import AwardDetailPage from '../pages/AwardDetailPage.vue'
import LogsPage from '../pages/LogsPage.vue'
import LogDetailPage from '../pages/LogDetailPage.vue'
import AboutPage from '../pages/AboutPage.vue'
import AdminApp from '../components/admin/AdminApp.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/projects', name: 'projects', component: ProjectsPage },
  { path: '/projects/:id', name: 'project-detail', component: ProjectDetailPage },
  { path: '/awards', name: 'awards', component: AwardsPage },
  { path: '/awards/:id', name: 'award-detail', component: AwardDetailPage },
  { path: '/logs', name: 'logs', component: LogsPage },
  { path: '/logs/:id', name: 'log-detail', component: LogDetailPage },
  { path: '/about', name: 'about', component: AboutPage },
  { path: '/admin', name: 'admin', component: AdminApp }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

export default router