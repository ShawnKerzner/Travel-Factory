import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createStore } from "vuex";
import LoginForm from "../../src/components/LoginForm.vue";

const push = vi.fn();
vi.mock("vue-router", () => ({
	useRouter: () => ({ push }),
}));

function mountForm(loginImpl: (...args: any[]) => Promise<any>) {
	const store = createStore({
		modules: {
			auth: {
				namespaced: true,
				actions: { login: loginImpl },
				getters: { role: () => "requester" },
			},
		},
	});
	return mount(LoginForm, { global: { plugins: [store] } });
}

describe("LoginForm", () => {
	beforeEach(() => {
		push.mockClear();
	});

	test("7: renders email input, password input, and submit button", () => {
		const wrapper = mountForm(vi.fn());
		expect(wrapper.find('input[type="email"]').exists()).toBe(true);
		expect(wrapper.find('input[type="password"]').exists()).toBe(true);
		expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
	});

	test("8: submitting empty fields shows validation errors and does not call login", async () => {
		const login = vi.fn();
		const wrapper = mountForm(login);
		await wrapper.find("form").trigger("submit.prevent");
		expect(wrapper.text()).toContain("Email is required");
		expect(wrapper.text()).toContain("Password is required");
		expect(login).not.toHaveBeenCalled();
	});

	test("9: submitting valid fields calls login with the entered values", async () => {
		const login = vi.fn().mockResolvedValue(undefined);
		const wrapper = mountForm(login);
		await wrapper.find('input[type="email"]').setValue("alice@example.com");
		await wrapper.find('input[type="password"]').setValue("password123");
		await wrapper.find("form").trigger("submit.prevent");
		await flushPromises();

		expect(login).toHaveBeenCalledWith(
			expect.anything(),
			{ email: "alice@example.com", password: "password123" }
		);
	});

	test("10: a failed login shows an error message", async () => {
		const login = vi.fn().mockRejectedValue({ response: { data: { error: "Invalid email or password" } } });
		const wrapper = mountForm(login);
		await wrapper.find('input[type="email"]').setValue("alice@example.com");
		await wrapper.find('input[type="password"]').setValue("wrongpass");
		await wrapper.find("form").trigger("submit.prevent");
		await flushPromises();

		expect(wrapper.text()).toContain("Invalid email or password");
	});
});
