import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum VacationRequestStatus {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
}

@Entity("vacation_requests")
export class VacationRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: "user_id" })
	user: User;

	@Column({ type: "date", name: "start_date" })
	startDate: string;

	@Column({ type: "date", name: "end_date" })
	endDate: string;

	@Column({ type: "text", nullable: true })
	reason: string | null;

	@Index()
	@Column({ type: "enum", enum: VacationRequestStatus, default: VacationRequestStatus.PENDING })
	status: VacationRequestStatus;

	@Column({ type: "text", nullable: true })
	comments: string | null;

	@CreateDateColumn({ name: "created_at" })
	createdAt: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt: Date;
}
