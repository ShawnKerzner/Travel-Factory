export interface DecodedToken {
	sub: number;
	role: string;
}

export function decodeToken(token: string): DecodedToken {
	const payload = token.split(".")[1];
	const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
	return JSON.parse(atob(base64));
}
