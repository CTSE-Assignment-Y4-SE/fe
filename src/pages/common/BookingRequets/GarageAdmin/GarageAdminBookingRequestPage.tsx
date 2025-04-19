import {useEffect, useState} from "react";
import {Calendar, momentLocalizer} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {message, Spin} from "antd";
import moment from "moment";
import {BookingRequest, BookingRequestExportResponse} from "../../../../types/request.type";
import {getAllBookingRequestsAsVehicleOwnerOrGarageAdmin} from "../../../../services/booking.service";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
}

const GarageAdminBookingRequestPage = () => {
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllBookingRequests();
    }, []);

    const fetchAllBookingRequests = async () => {
        setLoading(true);
        try {
            const response: BookingRequestExportResponse = await getAllBookingRequestsAsVehicleOwnerOrGarageAdmin({
                export: true,
            });
            setRequests(response.results);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const events: CalendarEvent[] = requests.map((request) => ({
        id: request.bookingRequestId,
        title: `Vehicle: ${request.vehicleId} | Status: ${request.status}`,
        start: new Date(`${request.serviceSlot.serviceDate}T${request.serviceSlot.startTime}`),
        end: new Date(`${request.serviceSlot.serviceDate}T${request.serviceSlot.endTime}`),
    }));

    return (
        <div style={{padding: 20}}>
            <h1>Booking Requests Calendar</h1>
            {loading ? (
                <Spin size="large" style={{display: "block", marginTop: 50, textAlign: "center"}}/>
            ) : (
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{height: 600, marginTop: 20}}
                    eventPropGetter={(event) => {
                        let backgroundColor = "#1890ff";
                        if (event.title.includes("CONFIRMED")) backgroundColor = "#52c41a";
                        if (event.title.includes("REJECTED")) backgroundColor = "#f5222d";
                        if (event.title.includes("CANCELLED")) backgroundColor = "#fa8c16";
                        return {style: {backgroundColor}};
                    }}
                    tooltipAccessor="title"
                />
            )}
        </div>
    );
};

export default GarageAdminBookingRequestPage;
