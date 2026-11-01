import { AppDataSource } from "../data-source";
import { VacationRequest, VacationRequestStatus } from "../entities/VacationRequest";
import { PaginationParams } from "../utils/pagination";
import { PaginatedResult } from "./getMyVacationRequests";

export interface ValidatorListFilters {
	status?: VacationRequestStatus;
	userId?: number;
}

export function parseStatusFilter(status: string | undefined): VacationRequestStatus | undefined {
	if (status && Object.values(VacationRequestStatus).includes(status as VacationRequestStatus)) {
		return status as VacationRequestStatus;
	}
	return undefined;
}

export async function getVacationRequestsForValidator(
	filters: ValidatorListFilters,
	{ page, limit }: PaginationParams
): Promise<PaginatedResult<VacationRequest>> {
	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}

	const where: { status?: VacationRequestStatus; user?: { id: number } } = {};
	if (filters.status) {
		where.status = filters.status;
	}
	if (filters.userId) {
		where.user = { id: filters.userId };
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const [data, total] = await repo.findAndCount({
		where,
		relations: { user: true },
		order: { createdAt: "DESC" },
		skip: (page - 1) * limit,
		take: limit,
	});

	return { data, total, page, limit };
}
