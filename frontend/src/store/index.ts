import { createStore } from "vuex";
import auth, { type AuthState } from "./modules/auth";

export interface RootState {
	auth: AuthState;
}

export default createStore<RootState>({
	modules: {
		auth,
	},
});
