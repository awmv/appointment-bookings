import { createRouter, createWebHistory } from "vue-router";
import { Meteor } from "meteor/meteor";

const Appointments = () => import("./Appointments.vue");
const Login = () => import("./Login.vue");

const routes = [
  {
    path: "/",
    redirect: { name: "appointments" },
  },
  {
    path: "/appointments",
    name: "appointments",
    component: Appointments,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/:catchAll(.*)",
    redirect: { name: "appointments" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const isAuthenticated = Meteor.userId();

  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    next({ name: "login" });
  } else if (to.name === "appointments" && !isAuthenticated) {
    next({ name: "login" });
  } else {
    next();
  }
});
