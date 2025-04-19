import {ServiceSlot} from "./slot.type";

export type BookingRequestStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

export interface BookingRequest {
    bookingRequestId: number;
    userId: number;
    serviceSlot: ServiceSlot;
    vehicleId: number;
    bookingDate: string;
    status: BookingRequestStatus;
    createdAt: string;
    updatedAt: string;
}

export interface PageDto<T> {
    items: T[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
}

export interface GenericResponse<T> {
    status: string;
    results: T[];
}

export type BookingRequestResponse = GenericResponse<PageDto<BookingRequest>>;

export type BookingRequestExportResponse = GenericResponse<BookingRequest>;
