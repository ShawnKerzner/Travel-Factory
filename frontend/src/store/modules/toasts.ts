import type { Module } from "vuex";

export interface Toast {
	id: number;
	message: string;
}

export interface ToastsState {
	toasts: Toast[];
}

let nextId = 1;

const toastsModule: Module<ToastsState, unknown> = {
	namespaced: true,
	state: (): ToastsState => ({
		toasts: [],
	}),
	mutations: {
		ADD_TOAST(state, toast: Toast) {
			state.toasts.push(toast);
		},
		REMOVE_TOAST(state, id: number) {
			state.toasts = state.toasts.filter((t) => t.id !== id);
		},
	},
	actions: {
		show({ commit }, message: string) {
			const id = nextId++;
			commit("ADD_TOAST", { id, message });
			setTimeout(() => commit("REMOVE_TOAST", id), 3000);
		},
	},
};

export default toastsModule;
