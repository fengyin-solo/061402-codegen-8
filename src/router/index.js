import { createRouter, createWebHistory } from 'vue-router';

const Index = () => import('../views/Index.vue');
const EscapePlan = () => import('../views/EscapePlan/index.vue');

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index,
    meta: {
      title: '海岛生存'
    }
  },
  {
    path: '/escape',
    name: 'EscapePlan',
    component: EscapePlan,
    meta: {
      title: '航海逃生计划'
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;