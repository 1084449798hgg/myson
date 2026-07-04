import Vue from 'vue'
import VueRouter from 'vue-router'
import UniverSheet from '../views/UniverSheet.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'UniverSheet',
    component: UniverSheet
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
