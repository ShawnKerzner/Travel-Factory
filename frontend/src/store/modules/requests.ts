import type { Module } from "vuex";
import api from "../../api";
import type { RequestRow } from "../../components/RequestTable.vue";

export interface Requester {
	id: number;
	name: string;
	email: string;
}

export interface ValidatorFilters {
	status?: string;
	userId?: number;
}

export interface RequestsState {
	myRequests: RequestRow[];
	myRequestsTotal: number;
	myRequestsPage: number;
	myRequestsLimit: number;
	loading: boolean;
	validatorRequests: RequestRow[];
	validatorTotal: number;
	validatorPage: number;
	validatorLimit: number;
	validatorFilters: ValidatorFilters;
	validatorLoading: boolean;
	requesters: Requester[];
	teamVacations: RequestRow[];
	teamVacationsLoading: boolean;
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
		validatorRequests: [],
		validatorTotal: 0,
		validatorPage: 1,
		validatorLimit: 10,
		validatorFilters: {},
		validatorLoading: false,
		requesters: [],
		teamVacations: [],
		teamVacationsLoading: false,
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
		SET_VALIDATOR_REQUESTS(state, { data, total, page, limit }) {
			state.validatorRequests = data;
			state.validatorTotal = total;
			state.validatorPage = page;
			state.validatorLimit = limit;
		},
		SET_VALIDATOR_FILTERS(state, filters: ValidatorFilters) {
			state.validatorFilters = filters;
		},
		SET_VALIDATOR_LOADING(state, loading: boolean) {
			state.validatorLoading = loading;
		},
		SET_REQUESTERS(state, requesters: Requester[]) {
			state.requesters = requesters;
		},
		SET_TEAM_VACATIONS(state, data: RequestRow[]) {
			state.teamVacations = data;
		},
		SET_TEAM_VACATIONS_LOADING(state, loading: boolean) {
			state.teamVacationsLoading = loading;
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
		async cancelRequest({ dispatch, state }, { id }: { id: number }) {
			await api.delete(`/vacation-requests/${id}`);
			await dispatch("fetchMyRequests", { page: state.myRequestsPage, limit: state.myRequestsLimit });
		},
		async fetchValidatorRequests({ commit, state }, { page = 1 }: { page?: number } = {}) {
			commit("SET_VALIDATOR_LOADING", true);
			try {
				const response = await api.get("/vacation-requests", {
					params: { page, limit: state.validatorLimit, ...state.validatorFilters },
				});
				commit("SET_VALIDATOR_REQUESTS", response.data);
			} finally {
				commit("SET_VALIDATOR_LOADING", false);
			}
		},
		async setValidatorFilters({ commit, dispatch }, filters: ValidatorFilters) {
			commit("SET_VALIDATOR_FILTERS", filters);
			await dispatch("fetchValidatorRequests", { page: 1 });
		},
		async fetchRequesters({ commit }) {
			const response = await api.get("/users");
			commit("SET_REQUESTERS", response.data);
		},
		async approveRequest({ dispatch, state }, { id }: { id: number }) {
			await api.put(`/vacation-requests/${id}/approve`);
			await dispatch("fetchValidatorRequests", { page: state.validatorPage });
		},
		async rejectRequest({ dispatch, state }, { id, comment }: { id: number; comment: string }) {
			await api.put(`/vacation-requests/${id}/reject`, { comment });
			await dispatch("fetchValidatorRequests", { page: state.validatorPage });
		},
		async fetchTeamVacations({ commit }, { startDate, endDate }: { startDate: string; endDate: string }) {
			commit("SET_TEAM_VACATIONS_LOADING", true);
			try {
				const response = await api.get("/team-vacations", { params: { startDate, endDate } });
				commit("SET_TEAM_VACATIONS", response.data);
			} finally {
				commit("SET_TEAM_VACATIONS_LOADING", false);
			}
		},
	},
};

export default requestsModule;
