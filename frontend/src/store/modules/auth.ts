import type { Module } from "vuex";
import api from "../../api";
import { decodeToken } from "../../utils/jwt";

export interface AuthState {
	token: string | null;
}

const authModule: Module<AuthState, unknown> = {
	namespaced: true,
	state: (): AuthState => ({
		token: localStorage.getItem("token"),
	}),
	mutations: {
		SET_TOKEN(state, token: string) {
			state.token = token;
			localStorage.setItem("token", token);
		},
		CLEAR_TOKEN(state) {
			state.token = null;
			localStorage.removeItem("token");
		},
	},
	actions: {
		async login({ commit }, credentials: { email: string; password: string }) {
			const response = await api.post("/auth/login", credentials);
			commit("SET_TOKEN", response.data.token);
		},
		logout({ commit }) {
			commit("CLEAR_TOKEN");
		},
	},
	getters: {
		isAuthenticated: (state) => !!state.token,
		role: (state) => (state.token ? decodeToken(state.token).role : null),
	},
};

export default authModule;
