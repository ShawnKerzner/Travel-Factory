import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Response } from "commoneventframework";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { parseLoginInput, login } from "../src/handlers/auth";
import { signToken } from "../src/auth/jwt";
import { requireAuth, requireRole, composeParsers } from "../src/auth/guards";

function fakeEvent(overrides: Partial<CommonEvent> = {}): CommonEvent {
	return {
		path: "/test",
		method: "GET",
		body: null,
		pathParameters: undefined,
		queryStringParameters: undefined,
		headers: undefined,
		version: "commonEvent",
		...overrides,
	};
}

const TEST_PASSWORD = "correct-password";
let testUser: User;

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	testUser = await userRepo.save(
		userRepo.create({
			name: "Test Requester",
			email: "test-auth@example.com",
			password: await bcrypt.hash(TEST_PASSWORD, 10),
			role: UserRole.REQUESTER,
		})
	);
});

afterAll(async () => {
	const userRepo = AppDataSource.getRepository(User);
	await userRepo.delete({ id: testUser.id });
	await AppDataSource.destroy();
});

describe("login", () => {
	test("1: correct email + password returns a token", async () => {
		const parsed = parseLoginInput(fakeEvent({ body: JSON.stringify({ email: testUser.email, password: TEST_PASSWORD }) }));
		expect(parsed).not.toBeInstanceOf(Response);

		const result = await login(parsed as any, fakeEvent());
		expect(result).not.toBeInstanceOf(Response);
		expect(typeof (result as any).token).toBe("string");
	});

	test("2: correct email + wrong password returns 401", async () => {
		const parsed = parseLoginInput(fakeEvent({ body: JSON.stringify({ email: testUser.email, password: "wrong-password" }) }));
		expect(parsed).not.toBeInstanceOf(Response);

		const result = await login(parsed as any, fakeEvent());
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(401);
	});

	test("3: missing password returns 400 before touching the database", () => {
		const parsed = parseLoginInput(fakeEvent({ body: JSON.stringify({ email: testUser.email }) }));
		expect(parsed).toBeInstanceOf(Response);
		expect((parsed as Response).statusCode).toBe(400);
	});
});

describe("requireAuth", () => {
	test("4: no Authorization header returns 401", () => {
		const result = requireAuth(fakeEvent({ headers: undefined }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(401);
	});

	test("5: malformed Authorization header (no Bearer prefix) returns 401", () => {
		const token = signToken({ sub: testUser.id, role: testUser.role });
		const result = requireAuth(fakeEvent({ headers: { authorization: token } }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(401);
	});

	test("6: invalid signature returns 401", () => {
		const badToken = jwt.sign({ sub: testUser.id, role: testUser.role }, "wrong-secret");
		const result = requireAuth(fakeEvent({ headers: { authorization: `Bearer ${badToken}` } }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(401);
	});

	test("7: expired token returns 401", () => {
		const expiredToken = jwt.sign({ sub: testUser.id, role: testUser.role }, process.env.JWT_SECRET as string, { expiresIn: "-10s" });
		const result = requireAuth(fakeEvent({ headers: { authorization: `Bearer ${expiredToken}` } }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(401);
	});
});

describe("requireRole", () => {
	test("8: authenticated but wrong role returns 403", () => {
		const token = signToken({ sub: testUser.id, role: UserRole.REQUESTER });
		const result = requireRole(UserRole.VALIDATOR)(fakeEvent({ headers: { authorization: `Bearer ${token}` } }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(403);
	});

	test("9: authenticated with correct role succeeds, via composeParsers", () => {
		const token = signToken({ sub: testUser.id, role: UserRole.VALIDATOR });
		const protectedParser = composeParsers(requireRole(UserRole.VALIDATOR));
		const result = protectedParser(fakeEvent({ headers: { authorization: `Bearer ${token}` } }));
		expect(result).not.toBeInstanceOf(Response);
		expect((result as any).auth.role).toBe(UserRole.VALIDATOR);
	});
});
