import { Response } from "commoneventframework";
import { CommonEvent } from "commoneventframework/dist/types/commonEvent";
import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { VacationRequest, VacationRequestStatus } from "../src/entities/VacationRequest";
import { submitVacationRequest } from "../src/commands/submitVacationRequest";
import { parseSubmitInput } from "../src/handlers/vacationRequests";
import { eventBus, DomainEvent } from "../src/events/eventBus";

function fakeEvent(overrides: Partial<CommonEvent> = {}): CommonEvent {
	return {
		path: "/vacation-requests",
		method: "POST",
		body: null,
		pathParameters: undefined,
		queryStringParameters: undefined,
		headers: undefined,
		version: "commonEvent",
		...overrides,
	};
}

let testUser: User;

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	testUser = await userRepo.save(
		userRepo.create({
			name: "Test Requester",
			email: "test-submit@example.com",
			password: "unused-in-this-test",
			role: UserRole.REQUESTER,
		})
	);
});

afterEach(async () => {
	const requestRepo = AppDataSource.getRepository(VacationRequest);
	await requestRepo.delete({ user: { id: testUser.id } });
});

afterAll(async () => {
	const userRepo = AppDataSource.getRepository(User);
	await userRepo.delete({ id: testUser.id });
	await AppDataSource.destroy();
});

describe("parseSubmitInput", () => {
	test("1: missing startDate returns 400", () => {
		const result = parseSubmitInput(fakeEvent({ body: JSON.stringify({ endDate: "2030-01-05" }) }));
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});
});

describe("submitVacationRequest", () => {
	test("2: end date before start date returns 400", async () => {
		const result = await submitVacationRequest({
			userId: testUser.id,
			startDate: "2030-06-10",
			endDate: "2030-06-05",
		});
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});

	test("3: start date in the past returns 400", async () => {
		const result = await submitVacationRequest({
			userId: testUser.id,
			startDate: "2020-01-01",
			endDate: "2020-01-05",
		});
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});

	test("4: overlapping an existing pending request returns 409", async () => {
		await submitVacationRequest({ userId: testUser.id, startDate: "2030-01-01", endDate: "2030-01-10" });
		const result = await submitVacationRequest({ userId: testUser.id, startDate: "2030-01-05", endDate: "2030-01-07" });
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(409);
	});

	test("5: valid request is saved as pending and emits VacationRequestSubmitted", async () => {
		const listener = jest.fn();
		eventBus.once(DomainEvent.VACATION_REQUEST_SUBMITTED, listener);

		const result = await submitVacationRequest({ userId: testUser.id, startDate: "2030-03-01", endDate: "2030-03-05" });

		expect(result).not.toBeInstanceOf(Response);
		expect((result as VacationRequest).status).toBe(VacationRequestStatus.PENDING);
		expect(listener).toHaveBeenCalledTimes(1);
	});
});
