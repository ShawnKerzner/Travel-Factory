import { EventEmitter } from "events";

export enum DomainEvent {
	VACATION_REQUEST_SUBMITTED = "VacationRequestSubmitted",
	VACATION_REQUEST_APPROVED = "VacationRequestApproved",
	VACATION_REQUEST_REJECTED = "VacationRequestRejected",
}

export const eventBus = new EventEmitter();
