export function todayDateString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
	return endDate >= startDate;
}

export function isInPast(date: string, today: string = todayDateString()): boolean {
	return date < today;
}
