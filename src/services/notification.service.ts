import axios, {AxiosResponse} from "axios";
import {NotificationResponse} from "../types/notification.type.ts";

const BASE_URL = "http://localhost:8080/notification/api/v1/notification";

export const getAllNotifications = async (): Promise<NotificationResponse> => {
    try {
        const token = localStorage.getItem("token");
        const response: AxiosResponse<NotificationResponse> = await axios.get(`${BASE_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
}

export const markNotificationAsViewed = async (notificationId: number): Promise<void> => {
    try {
        const token = localStorage.getItem("token");
        await axios.patch(`${BASE_URL}/${notificationId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    } catch (error) {
        console.error('Error update notification view status', error);
        throw error;
    }
}
