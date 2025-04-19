export interface VehicleOwnerResponse {
    vehicleOwnerId: number;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
}

export interface User {
    userId: number;
    email: string | null;
    role: string | null;
    active: boolean;
    vehicleOwnerResponseDto: VehicleOwnerResponse | null;
}

export interface UserResponse {
    status: string;
    results: User[];
}
