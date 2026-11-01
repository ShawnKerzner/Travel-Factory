import { AppDataSource } from "../data-source";
import { VacationRequest } from "../entities/VacationRequest";
import { PaginationParams } from "../utils/pagination";

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
}

export async function getMyVacationRequests(
	userId: number,
	{ page, limit }: PaginationParams
): Promise<PaginatedResult<VacationRequest>> {
	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const [data, total] = await repo.findAndCount({
		where: { user: { id: userId } },
		relations: { user: true },
		order: { createdAt: "DESC" },
		skip: (page - 1) * limit,
		take: limit,
	});

	return { data, total, page, limit };
}
