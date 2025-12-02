import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import WorkflowRun from '@/views/WorkflowRun.vue'
import Settings from '@/views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/workflow/:id',
      name: 'WorkflowRun',
      component: WorkflowRun,
      props: true
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings
    }
  ]
})

export default router