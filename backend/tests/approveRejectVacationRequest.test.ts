import { Response } from "commoneventframework";
import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { VacationRequest, VacationRequestStatus } from "../src/entities/VacationRequest";
import { approveVacationRequest } from "../src/commands/approveVacationRequest";
import { rejectVacationRequest } from "../src/commands/rejectVacationRequest";
import { eventBus, DomainEvent } from "../src/events/eventBus";

let testUser: User;

async function createPendingRequest(): Promise<VacationRequest> {
	const repo = AppDataSource.getRepository(VacationRequest);
	return repo.save(
		repo.create({
			user: { id: testUser.id },
			startDate: "2030-05-01",
			endDate: "2030-05-05",
			status: VacationRequestStatus.PENDING,
		})
	);
}

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	testUser = await userRepo.save(
		userRepo.create({ name: "Approve Reject Test", email: "approve-reject@example.com", password: "x", role: UserRole.REQUESTER })
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

describe("approveVacationRequest", () => {
	test("1: approving a pending request succeeds and emits VacationRequestApproved", async () => {
		const pending = await createPendingRequest();
		const listener = jest.fn();
		eventBus.once(DomainEvent.VACATION_REQUEST_APPROVED, listener);

		const result = await approveVacationRequest({ id: pending.id });

		expect(result).not.toBeInstanceOf(Response);
		expect((result as VacationRequest).status).toBe(VacationRequestStatus.APPROVED);
		expect(listener).toHaveBeenCalledTimes(1);
	});

	test("4: approving an already-approved request returns 409", async () => {
		const pending = await createPendingRequest();
		await approveVacationRequest({ id: pending.id });

		const result = await approveVacationRequest({ id: pending.id });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(409);
	});

	test("5: rejecting an already-approved request returns 409", async () => {
		const pending = await createPendingRequest();
		await approveVacationRequest({ id: pending.id });

		const result = await rejectVacationRequest({ id: pending.id, comment: "Too late now" });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(409);
	});

	test("6: approving a nonexistent id returns 404", async () => {
		const result = await approveVacationRequest({ id: 999999999 });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(404);
	});
});

describe("rejectVacationRequest", () => {
	test("2: rejecting a pending request with a comment succeeds and emits VacationRequestRejected", async () => {
		const pending = await createPendingRequest();
		const listener = jest.fn();
		eventBus.once(DomainEvent.VACATION_REQUEST_REJECTED, listener);

		const result = await rejectVacationRequest({ id: pending.id, comment: "Not enough coverage that week" });

		expect(result).not.toBeInstanceOf(Response);
		expect((result as VacationRequest).status).toBe(VacationRequestStatus.REJECTED);
		expect((result as VacationRequest).comments).toBe("Not enough coverage that week");
		expect(listener).toHaveBeenCalledTimes(1);
	});

	test("3: rejecting without a comment returns 400 and leaves the request pending", async () => {
		const pending = await createPendingRequest();

		const result = await rejectVacationRequest({ id: pending.id, comment: undefined });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);

		const repo = AppDataSource.getRepository(VacationRequest);
		const stillPending = await repo.findOneBy({ id: pending.id });
		expect(stillPending?.status).toBe(VacationRequestStatus.PENDING);
	});
});
