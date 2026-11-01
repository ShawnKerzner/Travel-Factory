import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { VacationRequest, VacationRequestStatus } from "../src/entities/VacationRequest";
import { getVacationRequestsForValidator, parseStatusFilter } from "../src/queries/getVacationRequestsForValidator";
import { getRequesters } from "../src/queries/getRequesters";

let userA: User;
let userB: User;
let validator: User;

async function createRequest(user: User, status: VacationRequestStatus, startDate: string, endDate: string) {
	const repo = AppDataSource.getRepository(VacationRequest);
	return repo.save(repo.create({ user: { id: user.id }, startDate, endDate, status }));
}

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	userA = await userRepo.save(
		userRepo.create({ name: "Validator List A", email: "validator-list-a@example.com", password: "x", role: UserRole.REQUESTER })
	);
	userB = await userRepo.save(
		userRepo.create({ name: "Validator List B", email: "validator-list-b@example.com", password: "x", role: UserRole.REQUESTER })
	);
	validator = await userRepo.save(
		userRepo.create({ name: "Validator List C", email: "validator-list-c@example.com", password: "x", role: UserRole.VALIDATOR })
	);

	await createRequest(userA, VacationRequestStatus.PENDING, "2030-01-01", "2030-01-02");
	await createRequest(userA, VacationRequestStatus.APPROVED, "2030-02-01", "2030-02-02");
	await createRequest(userB, VacationRequestStatus.PENDING, "2030-03-01", "2030-03-02");
});

afterAll(async () => {
	const requestRepo = AppDataSource.getRepository(VacationRequest);
	await requestRepo.delete({ user: { id: userA.id } });
	await requestRepo.delete({ user: { id: userB.id } });
	const userRepo = AppDataSource.getRepository(User);
	await userRepo.delete({ id: userA.id });
	await userRepo.delete({ id: userB.id });
	await userRepo.delete({ id: validator.id });
	await AppDataSource.destroy();
});

describe("getVacationRequestsForValidator", () => {
	test("1: no filters returns all requests across all users", async () => {
		const result = await getVacationRequestsForValidator({}, { page: 1, limit: 50 });
		const ourRequestsSeen = result.data.filter((r) => r.user.id === userA.id || r.user.id === userB.id);
		expect(ourRequestsSeen).toHaveLength(3);
	});

	test("2: status filter returns only matching status, across users", async () => {
		const result = await getVacationRequestsForValidator({ status: VacationRequestStatus.PENDING }, { page: 1, limit: 50 });
		const ourPending = result.data.filter((r) => r.user.id === userA.id || r.user.id === userB.id);
		expect(ourPending).toHaveLength(2);
		expect(ourPending.every((r) => r.status === VacationRequestStatus.PENDING)).toBe(true);
	});

	test("3: userId filter returns only that user's requests, any status", async () => {
		const result = await getVacationRequestsForValidator({ userId: userA.id }, { page: 1, limit: 10 });
		expect(result.data).toHaveLength(2);
		expect(result.data.every((r) => r.user.id === userA.id)).toBe(true);
	});

	test("4: status + userId combined returns only requests matching both", async () => {
		const result = await getVacationRequestsForValidator(
			{ status: VacationRequestStatus.PENDING, userId: userA.id },
			{ page: 1, limit: 10 }
		);
		expect(result.data).toHaveLength(1);
		expect(result.data[0].status).toBe(VacationRequestStatus.PENDING);
		expect(result.data[0].user.id).toBe(userA.id);
	});

	test("5: invalid status value is ignored", () => {
		expect(parseStatusFilter("banana")).toBeUndefined();
		expect(parseStatusFilter(undefined)).toBeUndefined();
		expect(parseStatusFilter("pending")).toBe(VacationRequestStatus.PENDING);
	});
});

describe("getRequesters", () => {
	test("6: only returns requesters, never validators", async () => {
		const result = await getRequesters();
		const ids = result.map((u) => u.id);
		expect(ids).toContain(userA.id);
		expect(ids).toContain(userB.id);
		expect(ids).not.toContain(validator.id);
	});

	test("7: returned users have no password field", async () => {
		const result = await getRequesters();
		for (const user of result) {
			expect((user as any).password).toBeUndefined();
		}
	});
});

