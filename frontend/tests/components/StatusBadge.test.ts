import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatusBadge from "../../src/components/StatusBadge.vue";

describe("StatusBadge", () => {
	test("6: pending renders the Pending label with the pending color", () => {
		const wrapper = mount(StatusBadge, { props: { status: "pending" } });
		expect(wrapper.text()).toContain("Pending");
		expect(wrapper.classes().join(" ")).toContain("yellow");
	});

	test("7: approved renders the Approved label with the approved color", () => {
		const wrapper = mount(StatusBadge, { props: { status: "approved" } });
		expect(wrapper.text()).toContain("Approved");
		expect(wrapper.classes().join(" ")).toContain("green");
	});

	test("8: rejected renders the Rejected label with the rejected color", () => {
		const wrapper = mount(StatusBadge, { props: { status: "rejected" } });
		expect(wrapper.text()).toContain("Rejected");
		expect(wrapper.classes().join(" ")).toContain("red");
	});
});
