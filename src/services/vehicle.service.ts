import axios, {AxiosError, AxiosResponse} from "axios";
import {Vehicle, VehicleResponse} from "../types/index.type.ts";

const baseUrl = "http://54.145.3.246:8080/vehicle-owner/api";

export const fetchVehicles = async (): Promise<AxiosResponse<VehicleResponse>> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get<VehicleResponse>(`${baseUrl}/v1/vehicle`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Vehicles fetched successfully", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Fetching vehicles failed: ${axiosError.message}`);
        throw error;
    }
};

export const deleteVehicle = async (id: string): Promise<AxiosResponse> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.delete(`${baseUrl}/v1/vehicle/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log("Vehicle deleted successfully", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Deleting vehicle failed: ${axiosError.message}`);
        throw error;
    }
};

export const addVehicle = async (vehicle: Vehicle): Promise<AxiosResponse<VehicleResponse>> => {
    try {
        const token = localStorage.getItem("token");

        console.log("image uploaded", vehicle.image);
        console.log(vehicle.image);

        const response = await axios.post<VehicleResponse>(`${baseUrl}/v1/vehicle`,
            vehicle,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Vehicle added successfully", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Adding vehicle failed: ${axiosError.message}`);
        throw error;
    }

}

export const updateVehicle = async (id: number, vehicle: Vehicle): Promise<AxiosResponse<VehicleResponse>> => {
    try {
        const token = localStorage.getItem("token");

        console.log("image uploaded", vehicle.image);
        console.log(vehicle.image);

        const response = await axios.patch(`${baseUrl}/v1/vehicle/${id}`, vehicle, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        console.log("Vehicle updated successfully", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Update vehicle failed: ${axiosError.message}`);
        throw error;
    }
}
