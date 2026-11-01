import { Response } from "commoneventframework";
import { AppDataSource, ensureDataSourceInitialized } from "../data-source";
import { VacationRequest, VacationRequestStatus } from "../entities/VacationRequest";
import { isValidDateRange, isInPast, doesOverlap } from "../businessRules/vacationRequestRules";
import { eventBus, DomainEvent } from "../events/eventBus";

export interface SubmitVacationRequestCommand {
	userId: number;
	startDate: string;
	endDate: string;
	reason?: string | null;
}

export async function submitVacationRequest(
	command: SubmitVacationRequestCommand
): Promise<VacationRequest | Response> {
	await ensureDataSourceInitialized();

	const { userId, startDate, endDate, reason } = command;

	if (!isValidDateRange({ startDate, endDate })) {
		return new Response(400, { error: "endDate must be on or after startDate" });
	}
	if (isInPast(startDate)) {
		return new Response(400, { error: "startDate cannot be in the past" });
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const existing = await repo.find({ where: { user: { id: userId } } });

	if (doesOverlap({ startDate, endDate }, existing)) {
		return new Response(409, { error: "This request overlaps an existing request" });
	}

	const saved = await repo.save(
		repo.create({
			user: { id: userId },
			startDate,
			endDate,
			reason: reason ?? null,
			status: VacationRequestStatus.PENDING,
		})
	);

	eventBus.emit(DomainEvent.VACATION_REQUEST_SUBMITTED, saved);

	return saved;
}
