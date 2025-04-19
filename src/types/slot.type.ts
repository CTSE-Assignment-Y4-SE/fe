export interface ServiceSlot {
    serviceSlotId: number;
    serviceDate: string;
    startTime: string;
    endTime: string;
    totalSlots: number;
    availableSlots: number;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceSlotResponse {
    status: string;
    results: ServiceSlot[];
}
