import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { Response } from "commoneventframework";
import { InputParserFn, HandlerFn } from "./types";
import { submitVacationRequest } from "../commands/submitVacationRequest";
import { composeParsers, requireRole } from "../auth/guards";
import { UserRole } from "../entities/User";

interface SubmitRequestInput {
	startDate: string;
	endDate: string;
	reason?: string | null;
	auth: { sub: number; role: string };
}

export const parseSubmitInput: InputParserFn = (event: CommonEvent) => {
	let body: any;
	try {
		body = event.body ? JSON.parse(event.body) : {};
	} catch {
		return new Response(400, { error: "Invalid JSON body" });
	}

	const { startDate, endDate, reason } = body;
	if (!startDate || !endDate) {
		return new Response(400, { error: "startDate and endDate are required" });
	}

	return { startDate, endDate, reason };
};

export const parseSubmitRequest = composeParsers(requireRole(UserRole.REQUESTER), parseSubmitInput);

export const submitRequest: HandlerFn = async (input: SubmitRequestInput) => {
	const result = await submitVacationRequest({
		userId: input.auth.sub,
		startDate: input.startDate,
		endDate: input.endDate,
		reason: input.reason,
	});

	if (result instanceof Response) {
		return result;
	}

	return new Response(201, result as unknown as object);
};
