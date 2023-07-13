import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from "../views/Home.vue";
import UserAdd from "../views/UserAdd.vue";
import UserEdit from "../views/UserEdit.vue";

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/user-add",
    name: "useradd",
    component: UserAdd,
  },
  {
    path: "/users/:userId",
    name: "useredit",
    component: UserEdit,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
