import { describe, test, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Pagination from "../../src/components/Pagination.vue";

describe("Pagination", () => {
	test("9: displays the current page and total pages", () => {
		const wrapper = mount(Pagination, { props: { page: 2, total: 25, limit: 10 } });
		expect(wrapper.text()).toContain("Page 2 of 3");
	});

	test("10: Previous is disabled on page 1, Next is disabled on the last page", () => {
		const first = mount(Pagination, { props: { page: 1, total: 25, limit: 10 } });
		expect(first.find("button:first-of-type").attributes("disabled")).toBeDefined();
		expect(first.find("button:last-of-type").attributes("disabled")).toBeUndefined();

		const last = mount(Pagination, { props: { page: 3, total: 25, limit: 10 } });
		expect(last.find("button:first-of-type").attributes("disabled")).toBeUndefined();
		expect(last.find("button:last-of-type").attributes("disabled")).toBeDefined();
	});

	test("11: clicking Next/Previous emits the new page number", async () => {
		const wrapper = mount(Pagination, { props: { page: 2, total: 25, limit: 10 } });
		await wrapper.find("button:last-of-type").trigger("click");
		await wrapper.find("button:first-of-type").trigger("click");

		expect(wrapper.emitted("update:page")).toEqual([[3], [1]]);
	});
});
