import { Response } from "commoneventframework";
import { AppDataSource } from "../data-source";
import { VacationRequest } from "../entities/VacationRequest";
import { isPending } from "../businessRules/vacationRequestRules";

export interface CancelVacationRequestCommand {
	id: number;
	userId: number;
}

export async function cancelVacationRequest(
	command: CancelVacationRequestCommand
): Promise<{ deleted: true; id: number } | Response> {
	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}

	if (!Number.isInteger(command.id)) {
		return new Response(404, { error: "Vacation request not found" });
	}

	const repo = AppDataSource.getRepository(VacationRequest);
	const request = await repo.findOne({ where: { id: command.id, user: { id: command.userId } } });

	if (!request) {
		return new Response(404, { error: "Vacation request not found" });
	}
	if (!isPending(request.status)) {
		return new Response(409, { error: "Only a pending request can be cancelled" });
	}

	await repo.remove(request);

	return { deleted: true, id: command.id };
}
