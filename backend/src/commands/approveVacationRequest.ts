import { Response } from "commoneventframework";
import { AppDataSource, ensureDataSourceInitialized } from "../data-source";
import { VacationRequest, VacationRequestStatus } from "../entities/VacationRequest";
import { isPending } from "../businessRules/vacationRequestRules";
import { eventBus, DomainEvent } from "../events/eventBus";

export interface ApproveVacationRequestCommand {
	id: number;
}

export async function approveVacationRequest(
	command: ApproveVacationRequestCommand
): Promise<VacationRequest | Response> {
	await ensureDataSourceInitialized();

	if (!Number.isInteger(command.id)) {
		return new Response(404, { error: "Vacation request not found" });
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const request = await repo.findOne({ where: { id: command.id }, relations: { user: true } });

	if (!request) {
		return new Response(404, { error: "Vacation request not found" });
	}
	if (!isPending(request.status)) {
		return new Response(409, { error: "Only a pending request can be approved" });
	}

	request.status = VacationRequestStatus.APPROVED;
	const saved = await repo.save(request);

	eventBus.emit(DomainEvent.VACATION_REQUEST_APPROVED, saved);

	return saved;
}
