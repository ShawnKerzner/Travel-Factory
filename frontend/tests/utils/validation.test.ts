import { describe, test, expect } from "vitest";
import { getCurrentMonthRange } from "../../src/utils/validation";

describe("getCurrentMonthRange", () => {
	test("returns the first and last day of a 30-day month", () => {
		expect(getCurrentMonthRange("2030-11-15")).toEqual({ startDate: "2030-11-01", endDate: "2030-11-30" });
	});

	test("returns the first and last day of a 31-day month", () => {
		expect(getCurrentMonthRange("2030-01-15")).toEqual({ startDate: "2030-01-01", endDate: "2030-01-31" });
	});

	test("handles February in a non-leap year", () => {
		expect(getCurrentMonthRange("2030-02-10")).toEqual({ startDate: "2030-02-01", endDate: "2030-02-28" });
	});

	test("handles February in a leap year", () => {
		expect(getCurrentMonthRange("2028-02-10")).toEqual({ startDate: "2028-02-01", endDate: "2028-02-29" });
	});

	test("handles December rolling into next year correctly", () => {
		expect(getCurrentMonthRange("2030-12-25")).toEqual({ startDate: "2030-12-01", endDate: "2030-12-31" });
	});
});
