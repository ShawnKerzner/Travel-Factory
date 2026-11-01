import type { Module } from "vuex";

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
		logout({ commit }) {
			commit("CLEAR_TOKEN");
		},
	},
	getters: {
		isAuthenticated: (state) => !!state.token,
	},
};

export default authModule;
