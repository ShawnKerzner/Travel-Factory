import { Response } from "commoneventframework";
import { AppDataSource } from "../src/data-source";
import { User, UserRole } from "../src/entities/User";
import { VacationRequest, VacationRequestStatus } from "../src/entities/VacationRequest";
import { cancelVacationRequest } from "../src/commands/cancelVacationRequest";
import { editVacationRequest } from "../src/commands/editVacationRequest";

let userA: User;
let userB: User;

async function createRequest(user: User, status: VacationRequestStatus, startDate: string, endDate: string) {
	const repo = AppDataSource.getRepository(VacationRequest);
	return repo.save(repo.create({ user: { id: user.id }, startDate, endDate, status }));
}

beforeAll(async () => {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);
	userA = await userRepo.save(
		userRepo.create({ name: "Cancel Edit A", email: "cancel-edit-a@example.com", password: "x", role: UserRole.REQUESTER })
	);
	userB = await userRepo.save(
		userRepo.create({ name: "Cancel Edit B", email: "cancel-edit-b@example.com", password: "x", role: UserRole.REQUESTER })
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

describe("cancelVacationRequest", () => {
	test("1: owner cancelling their own pending request deletes it", async () => {
		const req = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");

		const result = await cancelVacationRequest({ id: req.id, userId: userA.id });

		expect(result).not.toBeInstanceOf(Response);
		const repo = AppDataSource.getRepository(VacationRequest);
		expect(await repo.findOneBy({ id: req.id })).toBeNull();
	});

	test("2: a different user cancelling it returns 404 and leaves it untouched", async () => {
		const req = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");

		const result = await cancelVacationRequest({ id: req.id, userId: userB.id });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(404);
		const repo = AppDataSource.getRepository(VacationRequest);
		expect(await repo.findOneBy({ id: req.id })).not.toBeNull();
	});

	test("3: cancelling a non-pending request returns 409", async () => {
		const req = await createRequest(userA, VacationRequestStatus.APPROVED, "2030-09-01", "2030-09-05");

		const result = await cancelVacationRequest({ id: req.id, userId: userA.id });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(409);
	});

	test("4: cancelling a nonexistent id returns 404", async () => {
		const result = await cancelVacationRequest({ id: 999999999, userId: userA.id });

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(404);
	});
});

describe("editVacationRequest", () => {
	test("5: owner editing their own pending request to valid dates succeeds", async () => {
		const req = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");

		const result = await editVacationRequest({
			id: req.id,
			userId: userA.id,
			startDate: "2030-09-10",
			endDate: "2030-09-15",
		});

		expect(result).not.toBeInstanceOf(Response);
		expect((result as VacationRequest).startDate).toBe("2030-09-10");
	});

	test("6: editing to overlap another of the owner's requests returns 409, but editing with unchanged dates does not conflict with itself", async () => {
		const reqA = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");
		const reqB = await createRequest(userA, VacationRequestStatus.PENDING, "2030-10-01", "2030-10-05");

		const conflicting = await editVacationRequest({
			id: reqA.id,
			userId: userA.id,
			startDate: "2030-10-03",
			endDate: "2030-10-04",
		});
		expect(conflicting).toBeInstanceOf(Response);
		expect((conflicting as Response).statusCode).toBe(409);

		const selfEdit = await editVacationRequest({
			id: reqB.id,
			userId: userA.id,
			startDate: "2030-10-01",
			endDate: "2030-10-05",
			reason: "No real change",
		});
		expect(selfEdit).not.toBeInstanceOf(Response);
	});

	test("7: editing to an invalid date order returns 400", async () => {
		const req = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");

		const result = await editVacationRequest({
			id: req.id,
			userId: userA.id,
			startDate: "2030-09-10",
			endDate: "2030-09-01",
		});

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});

	test("8: editing to a past start date returns 400", async () => {
		const req = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");

		const result = await editVacationRequest({
			id: req.id,
			userId: userA.id,
			startDate: "2020-01-01",
			endDate: "2020-01-05",
		});

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(400);
	});

	test("9: editing a non-pending request returns 409", async () => {
		const req = await createRequest(userA, VacationRequestStatus.APPROVED, "2030-09-01", "2030-09-05");

		const result = await editVacationRequest({
			id: req.id,
			userId: userA.id,
			startDate: "2030-09-10",
			endDate: "2030-09-15",
		});

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(409);
	});

	test("10: a different user editing it returns 404", async () => {
		const req = await createRequest(userA, VacationRequestStatus.PENDING, "2030-09-01", "2030-09-05");

		const result = await editVacationRequest({
			id: req.id,
			userId: userB.id,
			startDate: "2030-09-10",
			endDate: "2030-09-15",
		});

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).statusCode).toBe(404);
	});
});
