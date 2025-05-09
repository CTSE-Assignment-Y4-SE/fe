import axios, {AxiosError, AxiosResponse} from "axios";
import {LoginResponse, UserResponse} from "../types/index.type.ts";

const baseUrl = "http://localhost:8080/user/api/v1/auth";

export const login = async (email: string, password: string): Promise<AxiosResponse<LoginResponse>> => {
    try {
        const response = await axios.post<LoginResponse>(`${baseUrl}/sign-in`, {
            email,
            password
        })

        console.log("Login successful", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Login failed: ${axiosError.message}`);
        throw error;
    }
}

export const saveServiceManager = async (email: string): Promise<AxiosResponse<UserResponse>> => {
    try {
        const token = localStorage.getItem("token");

        const response = await axios.post<UserResponse>(`${baseUrl}/admin/service-manager`, {
                email,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

        console.log("Saved service manager", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Login successful: ${axiosError.message}`);
        throw error;
    }
}

export const signup = async (data: { email: string; password: string }): Promise<AxiosResponse> => {
    try {
        const response = await axios.post(`${baseUrl}/sign-up`, data);
        console.log("Signup successful", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Signup failed: ${axiosError.message}`);
        throw error;
    }
};

export const resetPassword = async (
    currentPassword: string,
    newPassword: string) => {
    try {
        const token = localStorage.getItem("token");
        await axios.patch(`${baseUrl}/reset/password`, {
            currentPassword: currentPassword,
            newPassword: newPassword,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Password reset failed: ${axiosError.message}`);
        throw error;
    }
}

export const forgotPassword = async (email: string) => {
    try {
        await axios.post(`${baseUrl}/forgot-password`, {
            email,
        });
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Forgot password: ${axiosError.message}`);
        throw error;
    }
}

export const verifyOtp = async (otp: string, email: string): Promise<AxiosResponse<LoginResponse>> => {
    try {
        const response: AxiosResponse<LoginResponse> = await axios.post(`${baseUrl}/verify/otp`, {
            otpCode: otp,
            email: email
        });
        console.log("Verify successful", response);
        return response;
    } catch (error) {
        const axiosError = error as AxiosError;
        console.error(`Verify Otp: ${axiosError.message}`);
        throw error;
    }
}
