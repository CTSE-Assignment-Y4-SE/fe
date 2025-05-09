import axios, {AxiosResponse} from 'axios';
import {ServiceSlotResponse} from "../types/slot.type.ts";

const BASE_URL = 'http://54.145.3.246:8080/garage/api/v1/garage/service/slot';

export const createServiceSlot = async (data: {
    serviceDate: string;
    startTime: string;
    endTime: string;
    slots: number;
}) => {
    try {
        const token = localStorage.getItem('token');
        const response: AxiosResponse<ServiceSlotResponse> = await axios.post(BASE_URL, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error creating service slot:', error);
        throw error;
    }
};

export const getAllServiceSlots = async () => {
    try {
        const token = localStorage.getItem('token');
        const response: AxiosResponse<ServiceSlotResponse> = await axios.get(BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching service slots:', error);
        throw error;
    }
};

export const updateServiceSlot = async (
    slotId: number,
    data: {
        serviceDate: string;
        startTime: string;
        endTime: string;
        slots: number;
    }
): Promise<AxiosResponse<ServiceSlotResponse>> => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${BASE_URL}/${slotId}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to update service slot:", error);
        throw error;
    }
};
