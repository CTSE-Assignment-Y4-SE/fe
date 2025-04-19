export interface VehicleOwnerProfile {
    vehicleOwnerId: number;
    userId: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
}

export interface VehicleOwnerProfileResponse {
    status: string;
    results: VehicleOwnerProfile[];
}
