import axios, {AxiosError, AxiosResponse} from "axios";
import {UserResponse} from "../types/index.type.ts";

const baseUrl = "http://54.145.3.246:8080/user/api/v1/user";

export const getUsersByRole = async (roles: string[] | null): Promise<AxiosResponse<UserResponse>> => {
    try {
        const token = localStorage.getItem("token");

        const roleQuery = roles?.length ? `roles=${roles.join(",")}` : "";

        const response = await axios.get<UserResponse>(
            `${baseUrl}?${roleQuery}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Successfully fetched users from server");
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.log("Failed to get users", axiosError.message);
        throw error;
    }
};

export const deactivateUser = async (userId: string): Promise<void> => {
    try {
        const token = localStorage.getItem("token");

        await axios.patch(`${baseUrl}/deactivate/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        console.log("Failed to get users", axiosError.message);
        throw error;
    }
}

export const activateUser = async (userId: string): Promise<void> => {
    try {
        const token = localStorage.getItem("token");
        await axios.patch(`${baseUrl}/activate/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        console.log("Failed to activate user", axiosError.message);
        throw error;
    }
}
