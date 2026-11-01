import axios from "axios";
import store from "../store";
import router from "../router";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
	const token = store.state.auth.token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			store.commit("auth/CLEAR_TOKEN");
			router.push("/login");
		}
		return Promise.reject(error);
	}
);

export default api;
