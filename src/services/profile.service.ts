import axios, {AxiosError, AxiosResponse} from "axios";
import {UserResponse} from "../types/index.type.ts";

const baseUrl = "http://54.145.3.246:8080/user/api";

export const getUserProfile = async (): Promise<AxiosResponse<UserResponse>> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.get<UserResponse>(`${baseUrl}/v1/user/profile`,
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
