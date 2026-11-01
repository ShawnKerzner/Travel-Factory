export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export interface PaginationParams {
	page: number;
	limit: number;
}

export function parsePagination(query: { [name: string]: string | undefined } | undefined): PaginationParams {
	const page = Number(query?.page);
	const limit = Number(query?.limit);

	return {
		page: Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE,
		limit: Number.isInteger(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
	};
}
