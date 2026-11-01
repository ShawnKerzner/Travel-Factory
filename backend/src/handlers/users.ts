import { Response } from "commoneventframework";
import { HandlerFn } from "./types";
import { getRequesters } from "../queries/getRequesters";
import { composeParsers, requireRole } from "../auth/guards";
import { UserRole } from "../entities/User";

export const parseUsersListRequest = composeParsers(requireRole(UserRole.VALIDATOR));

export const listUsers: HandlerFn = async () => {
	const requesters = await getRequesters();
	return new Response(200, requesters as unknown as object);
};
