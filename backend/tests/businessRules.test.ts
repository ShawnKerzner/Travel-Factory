import {
	isValidDateRange,
	doesOverlap,
	isInPast,
	isValidRejectionComment,
} from "../src/businessRules/vacationRequestRules";
import { VacationRequestStatus } from "../src/entities/VacationRequest";

describe("isValidDateRange", () => {
	test("1: end after start is valid", () => {
		expect(isValidDateRange({ startDate: "2026-06-01", endDate: "2026-06-05" })).toBe(true);
	});

	test("2: same-day request is valid", () => {
		expect(isValidDateRange({ startDate: "2026-06-01", endDate: "2026-06-01" })).toBe(true);
	});

	test("3: end before start is invalid", () => {
		expect(isValidDateRange({ startDate: "2026-06-05", endDate: "2026-06-01" })).toBe(false);
	});
});

describe("doesOverlap", () => {
	const pending = (startDate: string, endDate: string) => ({ startDate, endDate, status: VacationRequestStatus.PENDING });
	const rejected = (startDate: string, endDate: string) => ({ startDate, endDate, status: VacationRequestStatus.REJECTED });

	test("4: separate ranges do not overlap", () => {
		expect(doesOverlap({ startDate: "2026-01-10", endDate: "2026-01-15" }, [pending("2026-01-01", "2026-01-05")])).toBe(false);
	});

	test("5: new range fully inside existing range overlaps", () => {
		expect(doesOverlap({ startDate: "2026-01-05", endDate: "2026-01-07" }, [pending("2026-01-01", "2026-01-10")])).toBe(true);
	});

	test("6: touching boundary counts as overlap", () => {
		expect(doesOverlap({ startDate: "2026-01-05", endDate: "2026-01-10" }, [pending("2026-01-01", "2026-01-05")])).toBe(true);
	});

	test("7: a rejected request is ignored, even if dates would otherwise overlap", () => {
		expect(doesOverlap({ startDate: "2026-01-05", endDate: "2026-01-07" }, [rejected("2026-01-01", "2026-01-10")])).toBe(false);
	});
});

describe("isInPast", () => {
	const today = "2026-06-15";

	test("10: a clearly past date is in the past", () => {
		expect(isInPast("2020-01-01", today)).toBe(true);
	});

	test("11: today itself is not in the past", () => {
		expect(isInPast(today, today)).toBe(false);
	});

	test("12: a future date is not in the past", () => {
		expect(isInPast("2030-01-01", today)).toBe(false);
	});
});

describe("isValidRejectionComment", () => {
	test("13: a real comment is valid", () => {
		expect(isValidRejectionComment("Not enough documentation provided")).toBe(true);
	});

	test("14: an empty string is invalid", () => {
		expect(isValidRejectionComment("")).toBe(false);
	});

	test("15: a whitespace-only comment is invalid", () => {
		expect(isValidRejectionComment("   ")).toBe(false);
	});

	test("16: a missing comment is invalid", () => {
		expect(isValidRejectionComment(undefined)).toBe(false);
	});
});
