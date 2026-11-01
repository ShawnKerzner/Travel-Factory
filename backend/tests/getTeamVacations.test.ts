import { Response } from "commoneventframework";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { VacationRequest, VacationRequestStatus } from "../src/entities/VacationRequest";
import { getTeamVacations } from "../src/queries/getTeamVacations";
import { parseTeamPlanningInput } from "../src/handlers/vacationRequests";

function fakeEvent(overrides: Partial<CommonEvent> = {}): CommonEvent {
	return {
		path: "/team-vacations",
		method: "GET",
		body: null,
		pathParameters: undefined,
		queryStringParameters: undefined,
		headers: undefined,
		version: "commonEvent",
		...overrides,
	};
}

let testUser: User;

async function createRequest(status: VacationRequestStatus, startDate: string, endDate: string) {
	const repo = AppDataSource.getRepository(VacationRequest);
	return repo.save(repo.create({ user: { id: testUser.id }, startDate, endDate, status }));
}

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	testUser = await userRepo.save(
		userRepo.create({ name: "Team Planning Test", email: "team-planning@example.com", password: "x", role: UserRole.REQUESTER })
	);
});

afterEach(async () => {
	const repo = AppDataSource.getRepository(VacationRequest);
	await repo.delete({ user: { id: testUser.id } });
});

afterAll(async () => {
	const userRepo = AppDataSource.getRepository(User);
	await userRepo.delete({ id: testUser.id });
	await AppDataSource.destroy();
});

describe("parseTeamPlanningInput", () => {
	test("1: missing startDate/endDate returns 400", () => {
		const result = parseTeamPlanningInput(fakeEvent({ queryStringParameters: { startDate: "2030-07-01" } }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});

	test("2: endDate before startDate returns 400", () => {
		const result = parseTeamPlanningInput(
			fakeEvent({ queryStringParameters: { startDate: "2030-07-10", endDate: "2030-07-01" } })
		);
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});
});

describe("getTeamVacations", () => {
	test("3: an approved request fully within the range is included", async () => {
		const req = await createRequest(VacationRequestStatus.APPROVED, "2030-07-10", "2030-07-15");
		const result = await getTeamVacations("2030-07-01", "2030-07-31");
		expect(result.map((r) => r.id)).toContain(req.id);
	});

	test("4: an approved request partially overlapping the range is included", async () => {
		const req = await createRequest(VacationRequestStatus.APPROVED, "2030-06-28", "2030-07-03");
		const result = await getTeamVacations("2030-07-01", "2030-07-31");
		expect(result.map((r) => r.id)).toContain(req.id);
	});

	test("5: a pending request overlapping the range is excluded", async () => {
		const req = await createRequest(VacationRequestStatus.PENDING, "2030-07-10", "2030-07-15");
		const result = await getTeamVacations("2030-07-01", "2030-07-31");
		expect(result.map((r) => r.id)).not.toContain(req.id);
	});

	test("6: a rejected request overlapping the range is excluded", async () => {
		const req = await createRequest(VacationRequestStatus.REJECTED, "2030-07-10", "2030-07-15");
		const result = await getTeamVacations("2030-07-01", "2030-07-31");
		expect(result.map((r) => r.id)).not.toContain(req.id);
	});
});
