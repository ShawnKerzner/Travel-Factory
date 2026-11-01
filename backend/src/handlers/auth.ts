import bcrypt from "bcryptjs";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { Response } from "commoneventframework";
import { InputParserFn, HandlerFn } from "./types";
import { AppDataSource, ensureDataSourceInitialized } from "../data-source";
import { User } from "../entities/User";
import { signToken } from "../auth/jwt";

interface LoginInput {
	email: string;
	password: string;
}

export const parseLoginInput: InputParserFn = (event: CommonEvent) => {
	let body: any;
	try {
		body = event.body ? JSON.parse(event.body) : {};
	} catch {
		return new Response(400, { error: "Invalid JSON body" });
	}

	const { email, password } = body;
	if (!email || !password) {
		return new Response(400, { error: "email and password are required" });
	}

	return { email, password } as LoginInput;
};

export const login: HandlerFn = async (input: LoginInput) => {
	await ensureDataSourceInitialized();

	const userRepo = AppDataSource.getRepository(User);
	const user = await userRepo.findOne({
		where: { email: input.email },
		select: { id: true, name: true, email: true, password: true, role: true, createdAt: true },
	});
	if (!user) {
		return new Response(401, { error: "Invalid email or password" });
	}

	const passwordMatches = await bcrypt.compare(input.password, user.password);
	if (!passwordMatches) {
		return new Response(401, { error: "Invalid email or password" });
	}

	const token = signToken({ sub: user.id, role: user.role });
	return { token };
};
