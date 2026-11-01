import bcrypt from "bcryptjs";
import { AppDataSource } from "./data-source";
import { User, UserRole } from "./entities/User";

const demoUsers = [
	{ name: "Alice Requester", email: "alice@example.com", password: "password123", role: UserRole.REQUESTER },
	{ name: "Bob Requester", email: "bob@example.com", password: "password123", role: UserRole.REQUESTER },
	{ name: "Carla Validator", email: "carla@example.com", password: "password123", role: UserRole.VALIDATOR },
];

async function seed() {
	await AppDataSource.initialize();
	const userRepo = AppDataSource.getRepository(User);

	for (const demo of demoUsers) {
		const existing = await userRepo.findOneBy({ email: demo.email });
		if (existing) {
			console.log(`Skipping ${demo.email} — already exists.`);
			continue;
		}

		const passwordHash = await bcrypt.hash(demo.password, 10);
		const user = userRepo.create({
			name: demo.name,
			email: demo.email,
			password: passwordHash,
			role: demo.role,
		});
		await userRepo.save(user);
		console.log(`Created ${demo.role}: ${demo.email}`);
	}

	await AppDataSource.destroy();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
