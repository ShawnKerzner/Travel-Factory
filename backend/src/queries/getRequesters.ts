import { AppDataSource, ensureDataSourceInitialized } from "../data-source";
import { User, UserRole } from "../entities/User";

export async function getRequesters(): Promise<User[]> {
	await ensureDataSourceInitialized();

	const repo = AppDataSource.getRepository(User);
	return repo.find({ where: { role: UserRole.REQUESTER } });
}
