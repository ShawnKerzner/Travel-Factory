import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import RequesterHome from "../views/RequesterHome.vue";
import ValidatorDashboard from "../views/ValidatorDashboard.vue";
import store from "../store";

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: "/", name: "root", component: Login },
		{ path: "/login", name: "login", component: Login },
		{
			path: "/requester",
			name: "requester-home",
			component: RequesterHome,
			meta: { requiresAuth: true, role: "requester" },
		},
		{
			path: "/validator",
			name: "validator-dashboard",
			component: ValidatorDashboard,
			meta: { requiresAuth: true, role: "validator" },
		},
	],
});

router.beforeEach((to) => {
	const isAuthenticated = store.getters["auth/isAuthenticated"];
	const role = store.getters["auth/role"];
	const roleHome = role === "validator" ? "/validator" : "/requester";

	if (to.path === "/") {
		return isAuthenticated ? roleHome : "/login";
	}
	if (to.path === "/login" && isAuthenticated) {
		return roleHome;
	}
	if (to.meta.requiresAuth && !isAuthenticated) {
		return "/login";
	}
	if (to.meta.role && to.meta.role !== role) {
		return roleHome;
	}
	return true;
});

export default router;
