export interface VehicleOwner {
    vehicleOwnerId: number;
    userId: number;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
}

export interface Vehicle {
    vehicleId: number;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    image: string | null;
    vehicleOwner: VehicleOwner;
}

export interface VehicleResponse {
    status: string;
    results: Vehicle[];
}
