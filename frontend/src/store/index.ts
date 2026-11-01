import { createStore } from "vuex";
import auth, { type AuthState } from "./modules/auth";
import requests, { type RequestsState } from "./modules/requests";

export interface RootState {
	auth: AuthState;
	requests: RequestsState;
}

export default createStore<RootState>({
	modules: {
		auth,
		requests,
	},
});
