import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export enum UserRole {
	REQUESTER = "requester",
	VALIDATOR = "validator",
}

@Entity("users")
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column({ type: "enum", enum: UserRole })
	role: UserRole;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;
}
