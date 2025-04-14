import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import UserInput from "../views/UserInput.vue";
import About from "../views/About.vue";
import UserAuth from "../views/UserAuth.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/about",
      name: "about",
      component: About,
    },
    {
      path: "/UserInput",
      name: "UserInput",
      component: UserInput,
    },
    {
      path: "/UserAuth",
      name: "UserAuth",
      component: UserAuth,
    },
  ],
});

export default router;
