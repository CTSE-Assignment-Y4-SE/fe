import axios, {AxiosError, AxiosResponse} from "axios";
import {VehicleOwnerProfileResponse} from "../types/index.type.ts";

const baseUrl = "http://localhost:9093/api";

export const getVehicleOwner = async (): Promise<AxiosResponse<VehicleOwnerProfileResponse>> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get<VehicleOwnerProfileResponse>(`${baseUrl}/v1/vehicle/account`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

        console.log("Profile fetched successfully", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Login failed: ${axiosError.message}`);
        throw error;
    }
}

export const updateProfile = async (firstName: string, lastName: string, phoneNumber: string): Promise<AxiosResponse<VehicleOwnerProfileResponse>> => {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.patch(`${baseUrl}/v1/vehicle/account`, {
            firstName,
            lastName,
            phoneNumber,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log("Profile fetched successfully", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Login failed: ${axiosError.message}`);
        throw error;
    }
}
