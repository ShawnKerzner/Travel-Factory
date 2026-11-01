import { describe, test, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createStore } from "vuex";
import RejectRequestModal from "../../src/components/RejectRequestModal.vue";

function mountModal(rejectImpl: (...args: any[]) => Promise<any>, open = true) {
	const store = createStore({
		modules: {
			requests: {
				namespaced: true,
				actions: { rejectRequest: rejectImpl },
			},
		},
	});
	return mount(RejectRequestModal, {
		props: { open, requestId: 42 },
		global: { plugins: [store] },
	});
}

describe("RejectRequestModal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("5: renders a comment field, a Reject button, and a Cancel button when open", () => {
		const wrapper = mountModal(vi.fn());
		expect(wrapper.find("textarea").exists()).toBe(true);
		expect(wrapper.text()).toContain("Reject");
		expect(wrapper.text()).toContain("Cancel");
	});

	test("1: submitting without a comment shows a validation error and does not call rejectRequest", async () => {
		const rejectRequest = vi.fn();
		const wrapper = mountModal(rejectRequest);
		const buttons = wrapper.findAll("button");
		await buttons.find((b) => b.text() === "Reject")!.trigger("click");

		expect(wrapper.text()).toContain("A comment is required to reject a request");
		expect(rejectRequest).not.toHaveBeenCalled();
	});

	test("2: submitting with a comment calls rejectRequest with the id and comment", async () => {
		const rejectRequest = vi.fn().mockResolvedValue(undefined);
		const wrapper = mountModal(rejectRequest);
		await wrapper.find("textarea").setValue("Team is short-staffed that week");
		const buttons = wrapper.findAll("button");
		await buttons.find((b) => b.text() === "Reject")!.trigger("click");
		await flushPromises();

		expect(rejectRequest).toHaveBeenCalledWith(
			expect.anything(),
			{ id: 42, comment: "Team is short-staffed that week" }
		);
	});

	test("3: clicking Cancel emits close without calling rejectRequest", async () => {
		const rejectRequest = vi.fn();
		const wrapper = mountModal(rejectRequest);
		const buttons = wrapper.findAll("button");
		await buttons.find((b) => b.text() === "Cancel")!.trigger("click");

		expect(wrapper.emitted("close")).toBeTruthy();
		expect(rejectRequest).not.toHaveBeenCalled();
	});

	test("4: a failed reject shows the real error message", async () => {
		const rejectRequest = vi.fn().mockRejectedValue({
			response: { data: { error: "Only a pending request can be rejected" } },
		});
		const wrapper = mountModal(rejectRequest);
		await wrapper.find("textarea").setValue("Some comment");
		const buttons = wrapper.findAll("button");
		await buttons.find((b) => b.text() === "Reject")!.trigger("click");
		await flushPromises();

		expect(wrapper.text()).toContain("Only a pending request can be rejected");
	});
});
