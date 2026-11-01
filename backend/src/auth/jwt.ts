import "dotenv/config";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET is not set");
}
const SECRET: string = process.env.JWT_SECRET;

export interface JwtPayload {
	sub: number;
	role: string;
}

export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): JwtPayload {
	return jwt.verify(token, SECRET) as unknown as JwtPayload;
}
