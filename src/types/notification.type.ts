export interface Notification {
    notificationId: number;
    title: string;
    body: string;
    notificationType: NotificationType;
    userId: number;
    bookingId: number;
    createdAt: string;
    viewed: boolean;
}

export interface NotificationResponse {
    status: string;
    results: Notification[];
}

export type NotificationType =
    | "BOOKING_REQUEST"
    | "BOOKING_APPROVED"
    | "BOOKING_REJECTED"
    | "BOOKING_CANCELLED";
