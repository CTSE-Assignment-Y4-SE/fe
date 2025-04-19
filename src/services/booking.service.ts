import axios, {AxiosResponse} from 'axios';
import {BookingRequestResponse, BookingRequestStatus} from "../types/request.type.ts";

const BASE_URL = 'http://localhost:9090/api/v1/garage/booking/request';

interface BookingRequestParams {
    status?: string;
    date?: string;
    offset?: number;
    limit?: number;
    export?: boolean;
}

export const createBookingRequest = async (data: {
    serviceSlotId: number;
    vehicleId: number;
    bookingDate: string;
}): Promise<BookingRequestResponse> => {
    try {
        const token = localStorage.getItem('token');
        const response: AxiosResponse<BookingRequestResponse> = await axios.post(BASE_URL, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating booking request:', error);
        throw error;
    }
};

export const getAllBookingRequestsAsVehicleOwnerOrGarageAdmin = async (
    params: BookingRequestParams
) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params,
        });
        return response.data;
    } catch (error) {
        console.error("Error getting booking requests:", error);
        throw error;
    }
};

export const getAllMyBookingRequests = async (params: BookingRequestParams): Promise<BookingRequestResponse> => {
    try {
        const token = localStorage.getItem('token');
        const response: AxiosResponse<BookingRequestResponse> = await axios.get(`${BASE_URL}/my`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params,
        })
        return response.data;
    } catch (error) {
        console.error('Error getting booking requests:', error);
        throw error;
    }
}

export const updateBookingRequest = async (bookingRequestId: number, data: {
    status: BookingRequestStatus;
}): Promise<void> => {
    try {
        const token = localStorage.getItem('token');
        await axios.patch(`${BASE_URL}/${bookingRequestId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
    } catch (error) {
        console.error('Error updating booking request:', error);
        throw error;
    }
}
