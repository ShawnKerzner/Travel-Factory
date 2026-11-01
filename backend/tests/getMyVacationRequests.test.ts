import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { VacationRequest, VacationRequestStatus } from "../src/entities/VacationRequest";
import { getMyVacationRequests } from "../src/queries/getMyVacationRequests";
import { parsePagination } from "../src/utils/pagination";

let userA: User;
let userB: User;

async function createRequest(user: User, startDate: string, endDate: string) {
	const repo = AppDataSource.getRepository(VacationRequest);
	return repo.save(
		repo.create({ user: { id: user.id }, startDate, endDate, status: VacationRequestStatus.PENDING })
	);
}

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	userA = await userRepo.save(
		userRepo.create({ name: "User A", email: "my-requests-a@example.com", password: "x", role: UserRole.REQUESTER })
	);
	userB = await userRepo.save(
		userRepo.create({ name: "User B", email: "my-requests-b@example.com", password: "x", role: UserRole.REQUESTER })
	);
});

afterEach(async () => {
	const repo = AppDataSource.getRepository(VacationRequest);
	await repo.delete({ user: { id: userA.id } });
	await repo.delete({ user: { id: userB.id } });
});

afterAll(async () => {
	const userRepo = AppDataSource.getRepository(User);
	await userRepo.delete({ id: userA.id });
	await userRepo.delete({ id: userB.id });
	await AppDataSource.destroy();
});

describe("getMyVacationRequests", () => {
	test("1: no requests returns empty data and total 0", async () => {
		const result = await getMyVacationRequests(userA.id, { page: 1, limit: 10 });
		expect(result).toEqual({ data: [], total: 0, page: 1, limit: 10 });
	});

	test("2: page 1 of 15 requests returns 10 items", async () => {
		for (let i = 1; i <= 15; i++) {
			await createRequest(userA, `2030-01-${String(i).padStart(2, "0")}`, `2030-01-${String(i).padStart(2, "0")}`);
		}
		const result = await getMyVacationRequests(userA.id, { page: 1, limit: 10 });
		expect(result.data).toHaveLength(10);
		expect(result.total).toBe(15);
	});

	test("3: page 2 of 15 requests returns the remaining 5 items", async () => {
		for (let i = 1; i <= 15; i++) {
			await createRequest(userA, `2030-01-${String(i).padStart(2, "0")}`, `2030-01-${String(i).padStart(2, "0")}`);
		}
		const result = await getMyVacationRequests(userA.id, { page: 2, limit: 10 });
		expect(result.data).toHaveLength(5);
		expect(result.total).toBe(15);
	});

	test("4: page beyond available data returns empty data but the correct total", async () => {
		for (let i = 1; i <= 15; i++) {
			await createRequest(userA, `2030-01-${String(i).padStart(2, "0")}`, `2030-01-${String(i).padStart(2, "0")}`);
		}
		const result = await getMyVacationRequests(userA.id, { page: 99, limit: 10 });
		expect(result.data).toHaveLength(0);
		expect(result.total).toBe(15);
	});
});

describe("parsePagination", () => {
	test("5: invalid page/limit fall back to defaults", () => {
		expect(parsePagination({ page: "abc", limit: "-5" })).toEqual({ page: 1, limit: 10 });
	});
});

describe("getMyVacationRequests, continued", () => {
	test("6: only returns the requesting user's own requests", async () => {
		await createRequest(userA, "2030-02-01", "2030-02-02");
		await createRequest(userB, "2030-02-03", "2030-02-04");

		const result = await getMyVacationRequests(userA.id, { page: 1, limit: 10 });
		expect(result.data).toHaveLength(1);
		expect(result.total).toBe(1);
		expect(result.data[0].user.id).toBe(userA.id);
	});

	test("7: newest submitted request appears first", async () => {
		const first = await createRequest(userA, "2030-03-01", "2030-03-02");
		const second = await createRequest(userA, "2030-04-01", "2030-04-02");

		const result = await getMyVacationRequests(userA.id, { page: 1, limit: 10 });
		expect(result.data[0].id).toBe(second.id);
		expect(result.data[1].id).toBe(first.id);
	});
});
