import { createStore } from "vuex";
import auth, { type AuthState } from "./modules/auth";
import requests, { type RequestsState } from "./modules/requests";
import toasts, { type ToastsState } from "./modules/toasts";

export interface RootState {
	auth: AuthState;
	requests: RequestsState;
	toasts: ToastsState;
}

export default createStore<RootState>({
	modules: {
		auth,
		requests,
		toasts,
	},
});
