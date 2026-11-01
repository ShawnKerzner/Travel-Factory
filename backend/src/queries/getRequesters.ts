import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";

export async function getRequesters(): Promise<User[]> {
	if (!AppDataSource.isInitialized) {
		await AppDataSource.initialize();
	}

	const repo = AppDataSource.getRepository(User);
	return repo.find({ where: { role: UserRole.REQUESTER } });
}
