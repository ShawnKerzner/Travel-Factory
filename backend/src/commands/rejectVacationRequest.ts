import { Response } from "commoneventframework";
import { AppDataSource } from "../data-source";
import { VacationRequest, VacationRequestStatus } from "../entities/VacationRequest";
import { isPending, isValidRejectionComment } from "../businessRules/vacationRequestRules";
import { eventBus, DomainEvent } from "../events/eventBus";

export interface RejectVacationRequestCommand {
	id: number;
	comment?: string | null;
}

export async function rejectVacationRequest(
	command: RejectVacationRequestCommand
): Promise<VacationRequest | Response> {
	if (!isValidRejectionComment(command.comment)) {
		return new Response(400, { error: "A comment is required to reject a request" });
	}

	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}

	if (!Number.isInteger(command.id)) {
		return new Response(404, { error: "Vacation request not found" });
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const request = await repo.findOne({ where: { id: command.id }, relations: { user: true } });

	if (!request) {
		return new Response(404, { error: "Vacation request not found" });
	}
	if (!isPending(request.status)) {
		return new Response(409, { error: "Only a pending request can be rejected" });
	}

	request.status = VacationRequestStatus.REJECTED;
	request.comments = (command.comment as string).trim();
	const saved = await repo.save(request);

	eventBus.emit(DomainEvent.VACATION_REQUEST_REJECTED, saved);

	return saved;
}
