import { createRouter, createWebHistory } from 'vue-router'
import Input from '@/views/GoogleSearch.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/', component: Input },

  ]
})

export default router