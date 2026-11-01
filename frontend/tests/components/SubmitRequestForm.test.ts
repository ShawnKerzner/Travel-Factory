import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createStore } from "vuex";
import SubmitRequestForm from "../../src/components/SubmitRequestForm.vue";

function mountForm(submitImpl: (...args: any[]) => Promise<any>) {
	const store = createStore({
		modules: {
			requests: {
				namespaced: true,
				actions: { submitRequest: submitImpl },
			},
		},
	});
	return mount(SubmitRequestForm, { global: { plugins: [store] } });
}

describe("SubmitRequestForm", () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	test("1: submitting with empty dates shows validation errors and does not call submitRequest", async () => {
		const submitRequest = vi.fn();
		const wrapper = mountForm(submitRequest);
		await wrapper.find("form").trigger("submit.prevent");

		expect(wrapper.text()).toContain("Start date is required");
		expect(wrapper.text()).toContain("End date is required");
		expect(submitRequest).not.toHaveBeenCalled();
	});

	test("2: end date before start date shows a validation error and does not call submitRequest", async () => {
		const submitRequest = vi.fn();
		const wrapper = mountForm(submitRequest);
		const [startInput, endInput] = wrapper.findAll('input[type="date"]');
		await startInput.setValue("2030-07-10");
		await endInput.setValue("2030-07-01");
		await wrapper.find("form").trigger("submit.prevent");

		expect(wrapper.text()).toContain("End date must be on or after start date");
		expect(submitRequest).not.toHaveBeenCalled();
	});

	test("3: a past start date shows a validation error and does not call submitRequest", async () => {
		const submitRequest = vi.fn();
		const wrapper = mountForm(submitRequest);
		const [startInput, endInput] = wrapper.findAll('input[type="date"]');
		await startInput.setValue("2020-01-01");
		await endInput.setValue("2020-01-05");
		await wrapper.find("form").trigger("submit.prevent");

		expect(wrapper.text()).toContain("Start date cannot be in the past");
		expect(submitRequest).not.toHaveBeenCalled();
	});

	test("4: a valid submission calls submitRequest with the entered values", async () => {
		const submitRequest = vi.fn().mockResolvedValue(undefined);
		const wrapper = mountForm(submitRequest);
		const [startInput, endInput] = wrapper.findAll('input[type="date"]');
		await startInput.setValue("2030-07-01");
		await endInput.setValue("2030-07-05");
		await wrapper.find('input[type="text"]').setValue("Family trip");
		await wrapper.find("form").trigger("submit.prevent");
		await flushPromises();

		expect(submitRequest).toHaveBeenCalledWith(
			expect.anything(),
			{ startDate: "2030-07-01", endDate: "2030-07-05", reason: "Family trip" }
		);
	});

	test("5: a server rejection shows the real error message", async () => {
		const submitRequest = vi.fn().mockRejectedValue({
			response: { data: { error: "This request overlaps an existing request" } },
		});
		const wrapper = mountForm(submitRequest);
		const [startInput, endInput] = wrapper.findAll('input[type="date"]');
		await startInput.setValue("2030-07-01");
		await endInput.setValue("2030-07-05");
		await wrapper.find("form").trigger("submit.prevent");
		await flushPromises();

		expect(wrapper.text()).toContain("This request overlaps an existing request");
	});
});
