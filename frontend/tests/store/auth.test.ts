import { describe, test, expect, beforeEach, vi } from "vitest";
import { createStore } from "vuex";
import authModule from "../../src/store/modules/auth";

vi.mock("../../src/api", () => ({
	default: { post: vi.fn() },
}));

import api from "../../src/api";

function freshStore() {
	return createStore({ modules: { auth: authModule } });
}

describe("auth store", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	test("1: initial state reflects localStorage", () => {
		localStorage.setItem("token", "abc123");
		const store = freshStore();
		expect(store.state.auth.token).toBe("abc123");
	});

	test("2: SET_TOKEN updates state and localStorage", () => {
		const store = freshStore();
		store.commit("auth/SET_TOKEN", "new-token");
		expect(store.state.auth.token).toBe("new-token");
		expect(localStorage.getItem("token")).toBe("new-token");
	});

	test("3: CLEAR_TOKEN clears state and localStorage", () => {
		const store = freshStore();
		store.commit("auth/SET_TOKEN", "new-token");
		store.commit("auth/CLEAR_TOKEN");
		expect(store.state.auth.token).toBeNull();
		expect(localStorage.getItem("token")).toBeNull();
	});

	test("4: isAuthenticated getter reflects token presence", () => {
		const store = freshStore();
		expect(store.getters["auth/isAuthenticated"]).toBe(false);
		store.commit("auth/SET_TOKEN", "x");
		expect(store.getters["auth/isAuthenticated"]).toBe(true);
	});

	test("5: login action commits SET_TOKEN on success", async () => {
		(api.post as any).mockResolvedValue({ data: { token: "real-token" } });
		const store = freshStore();
		await store.dispatch("auth/login", { email: "a@b.com", password: "pw" });
		expect(store.state.auth.token).toBe("real-token");
	});

	test("6: login action does not commit SET_TOKEN on failure", async () => {
		(api.post as any).mockRejectedValue({ response: { data: { error: "Invalid email or password" } } });
		const store = freshStore();
		await expect(
			store.dispatch("auth/login", { email: "a@b.com", password: "wrong" })
		).rejects.toBeTruthy();
		expect(store.state.auth.token).toBeNull();
	});
});
