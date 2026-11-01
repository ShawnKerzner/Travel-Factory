import type { Module } from "vuex";
import api from "../../api";
import type { RequestRow } from "../../components/RequestTable.vue";

export interface RequestsState {
	myRequests: RequestRow[];
	myRequestsTotal: number;
	myRequestsPage: number;
	myRequestsLimit: number;
	loading: boolean;
}

export interface SubmitRequestPayload {
	startDate: string;
	endDate: string;
	reason?: string;
}

const requestsModule: Module<RequestsState, unknown> = {
	namespaced: true,
	state: (): RequestsState => ({
		myRequests: [],
		myRequestsTotal: 0,
		myRequestsPage: 1,
		myRequestsLimit: 10,
		loading: false,
	}),
	mutations: {
		SET_MY_REQUESTS(state, { data, total, page, limit }) {
			state.myRequests = data;
			state.myRequestsTotal = total;
			state.myRequestsPage = page;
			state.myRequestsLimit = limit;
		},
		SET_LOADING(state, loading: boolean) {
			state.loading = loading;
		},
	},
	actions: {
		async fetchMyRequests({ commit }, { page = 1, limit = 10 } = {}) {
			commit("SET_LOADING", true);
			try {
				const response = await api.get("/vacation-requests/me", { params: { page, limit } });
				commit("SET_MY_REQUESTS", response.data);
			} finally {
				commit("SET_LOADING", false);
			}
		},
		async submitRequest({ dispatch, state }, payload: SubmitRequestPayload) {
			await api.post("/vacation-requests", payload);
			await dispatch("fetchMyRequests", { page: state.myRequestsPage, limit: state.myRequestsLimit });
		},
	},
};

export default requestsModule;
