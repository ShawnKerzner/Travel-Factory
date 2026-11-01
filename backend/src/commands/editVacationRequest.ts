import { Response } from "commoneventframework";
import { AppDataSource, ensureDataSourceInitialized } from "../data-source";
import { VacationRequest } from "../entities/VacationRequest";
import { isValidDateRange, isInPast, doesOverlap, isPending } from "../businessRules/vacationRequestRules";

export interface EditVacationRequestCommand {
	id: number;
	userId: number;
	startDate: string;
	endDate: string;
	reason?: string | null;
}

export async function editVacationRequest(
	command: EditVacationRequestCommand
): Promise<VacationRequest | Response> {
	const { id, userId, startDate, endDate, reason } = command;

	if (!isValidDateRange({ startDate, endDate })) {
		return new Response(400, { error: "endDate must be on or after startDate" });
	}
	if (isInPast(startDate)) {
		return new Response(400, { error: "startDate cannot be in the past" });
	}

	await ensureDataSourceInitialized();

	if (!Number.isInteger(id)) {
		return new Response(404, { error: "Vacation request not found" });
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const request = await repo.findOne({ where: { id, user: { id: userId } } });

	if (!request) {
		return new Response(404, { error: "Vacation request not found" });
	}
	if (!isPending(request.status)) {
		return new Response(409, { error: "Only a pending request can be edited" });
	}

	const otherRequests = await repo.find({ where: { user: { id: userId } } });
	const otherRequestsExcludingThisOne = otherRequests.filter((r) => r.id !== id);

	if (doesOverlap({ startDate, endDate }, otherRequestsExcludingThisOne)) {
		return new Response(409, { error: "This request overlaps an existing request" });
	}

	request.startDate = startDate;
	request.endDate = endDate;
	if (reason !== undefined) {
		request.reason = reason ?? null;
	}

	return repo.save(request);
}
