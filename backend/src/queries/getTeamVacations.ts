import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource, ensureDataSourceInitialized } from "../data-source";
import { VacationRequest, VacationRequestStatus } from "../entities/VacationRequest";

export async function getTeamVacations(startDate: string, endDate: string): Promise<VacationRequest[]> {
	await ensureDataSourceInitialized();

	const repo = AppDataSource.getRepository(VacationRequest);
	return repo.find({
		where: {
			status: VacationRequestStatus.APPROVED,
			startDate: LessThanOrEqual(endDate),
			endDate: MoreThanOrEqual(startDate),
		},
		relations: { user: true },
		order: { startDate: "ASC" },
	});
}
