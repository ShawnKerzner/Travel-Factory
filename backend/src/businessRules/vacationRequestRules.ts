import { VacationRequestStatus } from "../entities/VacationRequest";

export interface DateRange {
	startDate: string;
	endDate: string;
}

export interface ExistingRequest extends DateRange {
	status: VacationRequestStatus;
}

export function isValidDateRange({ startDate, endDate }: DateRange): boolean {
	return endDate >= startDate;
}

export function doesOverlap(newRequest: DateRange, existing: ExistingRequest[]): boolean {
	return existing.some((req) => {
		if (req.status === VacationRequestStatus.REJECTED) {
			return false;
		}
		return newRequest.startDate <= req.endDate && newRequest.endDate >= req.startDate;
	});
}

export function isModifiable(status: VacationRequestStatus): boolean {
	return status !== VacationRequestStatus.APPROVED;
}

export function todayDateString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function isInPast(date: string, today: string = todayDateString()): boolean {
	return date < today;
}

export function isValidRejectionComment(comment: string | null | undefined): boolean {
	return !!comment && comment.trim().length > 0;
}
