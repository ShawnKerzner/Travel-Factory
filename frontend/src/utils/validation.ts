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

export function getCurrentMonthRange(today: string = todayDateString()): { startDate: string; endDate: string } {
	const [year, month] = today.split("-").map(Number);
	const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
	const lastDay = new Date(year, month, 0).getDate();
	const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
	return { startDate, endDate };
}
