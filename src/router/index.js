import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/packertool',
    name: 'PackerTool',
    component: () => import(/* webpackChunkName: "packertool" */ '../views/PackerTool.vue')
  },
  {
    path: '/itereditor',
    name: 'IterEditor',
    component: () => import(/* webpackChunkName: "itereditor" */ '../views/IterEditor.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
