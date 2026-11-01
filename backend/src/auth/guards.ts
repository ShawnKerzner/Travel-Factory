import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { Response } from "commoneventframework";
import { InputParserFn } from "../handlers/types";
import { verifyToken, JwtPayload } from "./jwt";
import { UserRole } from "../entities/User";

type GuardFn = (event: CommonEvent) => JwtPayload | Response;

function getAuthContext(event: CommonEvent): JwtPayload | Response {
	const header = event.headers?.authorization ?? event.headers?.Authorization;
	if (!header || !header.startsWith("Bearer ")) {
		return new Response(401, { error: "Missing or malformed Authorization header" });
	}

	const token = header.slice("Bearer ".length);
	try {
		return verifyToken(token);
	} catch {
		return new Response(401, { error: "Invalid or expired token" });
	}
}

export const requireAuth: GuardFn = (event) => getAuthContext(event);

export function requireRole(role: UserRole): GuardFn {
	return (event) => {
		const auth = getAuthContext(event);
		if (auth instanceof Response) {
			return auth;
		}
		if (auth.role !== role) {
			return new Response(403, { error: "Insufficient permissions" });
		}
		return auth;
	};
}

export function composeParsers(guard: GuardFn, parser?: InputParserFn): InputParserFn {
	return (event: CommonEvent) => {
		const auth = guard(event);
		if (auth instanceof Response) {
			return auth;
		}

		const parsed = parser ? parser(event) : {};
		if (parsed instanceof Response) {
			return parsed;
		}

		return { ...parsed, auth };
	};
}
