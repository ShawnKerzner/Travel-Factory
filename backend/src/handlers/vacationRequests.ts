import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { Response } from "commoneventframework";
import { InputParserFn, HandlerFn } from "./types";
import { submitVacationRequest } from "../commands/submitVacationRequest";
import { approveVacationRequest } from "../commands/approveVacationRequest";
import { rejectVacationRequest } from "../commands/rejectVacationRequest";
import { getMyVacationRequests } from "../queries/getMyVacationRequests";
import { getVacationRequestsForValidator, parseStatusFilter, ValidatorListFilters } from "../queries/getVacationRequestsForValidator";
import { getTeamVacations } from "../queries/getTeamVacations";
import { isValidDateRange } from "../businessRules/vacationRequestRules";
import { composeParsers, requireAuth, requireRole } from "../auth/guards";
import { UserRole } from "../entities/User";
import { parsePagination, PaginationParams } from "../utils/pagination";

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

interface MyRequestsInput extends PaginationParams {
	auth: { sub: number; role: string };
}

export const parseMyRequestsInput: InputParserFn = (event: CommonEvent) => {
	return parsePagination(event.queryStringParameters);
};

export const parseMyRequestsRequest = composeParsers(requireAuth, parseMyRequestsInput);

export const getMyRequests: HandlerFn = async (input: MyRequestsInput) => {
	const result = await getMyVacationRequests(input.auth.sub, { page: input.page, limit: input.limit });
	return new Response(200, result as unknown as object);
};

interface ValidatorListInput extends PaginationParams, ValidatorListFilters {
	auth: { sub: number; role: string };
}

export const parseValidatorListInput: InputParserFn = (event: CommonEvent) => {
	const { page, limit } = parsePagination(event.queryStringParameters);
	const status = parseStatusFilter(event.queryStringParameters?.status);
	const userIdRaw = Number(event.queryStringParameters?.userId);
	const userId = Number.isInteger(userIdRaw) && userIdRaw > 0 ? userIdRaw : undefined;

	return { page, limit, status, userId };
};

export const parseValidatorListRequest = composeParsers(requireRole(UserRole.VALIDATOR), parseValidatorListInput);

export const listVacationRequests: HandlerFn = async (input: ValidatorListInput) => {
	const result = await getVacationRequestsForValidator(
		{ status: input.status, userId: input.userId },
		{ page: input.page, limit: input.limit }
	);
	return new Response(200, result as unknown as object);
};

interface ApproveRejectInput {
	id: number;
	comment?: string | null;
}

export const parseApproveInput: InputParserFn = (event: CommonEvent) => {
	return { id: Number(event.pathParameters?.id) };
};

export const parseApproveRequest = composeParsers(requireRole(UserRole.VALIDATOR), parseApproveInput);

export const approveRequest: HandlerFn = async (input: ApproveRejectInput) => {
	const result = await approveVacationRequest({ id: input.id });
	if (result instanceof Response) {
		return result;
	}
	return new Response(200, result as unknown as object);
};

export const parseRejectInput: InputParserFn = (event: CommonEvent) => {
	let body: any;
	try {
		body = event.body ? JSON.parse(event.body) : {};
	} catch {
		return new Response(400, { error: "Invalid JSON body" });
	}

	return { id: Number(event.pathParameters?.id), comment: body.comment };
};

export const parseRejectRequest = composeParsers(requireRole(UserRole.VALIDATOR), parseRejectInput);

export const rejectRequest: HandlerFn = async (input: ApproveRejectInput) => {
	const result = await rejectVacationRequest({ id: input.id, comment: input.comment });
	if (result instanceof Response) {
		return result;
	}
	return new Response(200, result as unknown as object);
};

interface TeamPlanningInput {
	startDate: string;
	endDate: string;
}

export const parseTeamPlanningInput: InputParserFn = (event: CommonEvent) => {
	const startDate = event.queryStringParameters?.startDate;
	const endDate = event.queryStringParameters?.endDate;

	if (!startDate || !endDate) {
		return new Response(400, { error: "startDate and endDate are required" });
	}
	if (!isValidDateRange({ startDate, endDate })) {
		return new Response(400, { error: "endDate must be on or after startDate" });
	}

	return { startDate, endDate };
};

export const parseTeamPlanningRequest = composeParsers(requireAuth, parseTeamPlanningInput);

export const getTeamPlanning: HandlerFn = async (input: TeamPlanningInput) => {
	const result = await getTeamVacations(input.startDate, input.endDate);
	return new Response(200, result as unknown as object);
};
