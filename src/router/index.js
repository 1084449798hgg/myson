import Vue from 'vue'
import VueRouter from 'vue-router'
import ChatHome from '../views/ChatHome.vue'
import UniverSheet from '../views/UniverSheet.vue'
import Earth3D from '../views/Earth3D.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'ChatHome',
    component: ChatHome
  },
  {
    path: '/sheet',
    name: 'UniverSheet',
    component: UniverSheet
  },
  {
    path: '/earth',
    name: 'Earth3D',
    component: Earth3D
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
