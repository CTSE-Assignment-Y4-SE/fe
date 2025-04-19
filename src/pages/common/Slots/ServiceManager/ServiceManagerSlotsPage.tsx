import {useEffect, useState} from "react";
import {Button, Form, Input, message, Modal, TimePicker} from "antd";
import {Calendar, momentLocalizer} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment, {Moment} from "moment";
import {ServiceSlot} from "../../../../types/slot.type";
import {createServiceSlot, getAllServiceSlots, updateServiceSlot} from "../../../../services/slot.service";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
}

const ServiceManagerSlotsPage = () => {
    const [slots, setSlots] = useState<ServiceSlot[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSlot, setEditingSlot] = useState<ServiceSlot | null>(null);

    const fetchSlots = async () => {
        try {
            const response = await getAllServiceSlots();
            const formattedSlots = response.results.map((slot: ServiceSlot) => ({
                ...slot,
                startTime: slot.startTime.slice(0, 5),
                endTime: slot.endTime.slice(0, 5),
            }));
            setSlots(formattedSlots);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        }
    };

    const handleSlotSubmit = async (values: {
        date: string;
        time_start: Moment;
        time_end: Moment;
        capacity: number
    }) => {
        const newSlot = {
            serviceDate: moment(values.date).format("YYYY-MM-DD"),
            startTime: values.time_start.format("HH:mm"),
            endTime: values.time_end.format("HH:mm"),
            slots: parseInt(values.capacity.toString(), 10),
        };

        const isOverlapping = slots.some(
            (slot: ServiceSlot) =>
                slot.serviceSlotId !== (editingSlot?.serviceSlotId || null) &&
                slot.serviceDate === newSlot.serviceDate &&
                !(moment(newSlot.endTime, "HH:mm").isSameOrBefore(moment(slot.startTime, "HH:mm")) ||
                    moment(newSlot.startTime, "HH:mm").isSameOrAfter(moment(slot.endTime, "HH:mm")))
        );

        if (isOverlapping) {
            message.error("The time slot overlaps with an existing slot. Please select a different time.");
            return;
        }

        try {
            if (editingSlot) {
                await updateServiceSlot(editingSlot.serviceSlotId, newSlot);
                message.success("Slot updated successfully!");
            } else {
                await createServiceSlot(newSlot);
                message.success("Slot added successfully!");
            }
            setIsModalVisible(false);
            setEditingSlot(null);
            fetchSlots();
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        }
    };

    const openModal = (event: CalendarEvent | null = null) => {
        if (event?.id) {
            const slot = slots.find((s) => s.serviceSlotId === event.id);
            setEditingSlot(slot || null);
        } else {
            setEditingSlot(null);
        }
        setIsModalVisible(true);
    };

    const events = slots.map((slot) => ({
        id: slot.serviceSlotId,
        title: `(${slot.availableSlots}/${slot.totalSlots} slots)`,
        start: new Date(`${slot.serviceDate}T${slot.startTime}`),
        end: new Date(`${slot.serviceDate}T${slot.endTime}`),
    }));

    useEffect(() => {
        fetchSlots();
    }, []);

    return (
        <div style={{padding: 20}}>
            <h1>Manage Service Time Slots</h1>
            <Button type="primary" onClick={() => openModal()}>
                Add Slot
            </Button>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{height: 500, marginTop: 20}}
                onSelectEvent={(event) => openModal(event)}
            />
            <Modal
                title={editingSlot ? "Edit Time Slot" : "Add New Time Slot"}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingSlot(null);
                }}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={handleSlotSubmit}
                    key={editingSlot ? editingSlot.serviceSlotId : "new-slot"}
                    initialValues={
                        editingSlot
                            ? {
                                date: editingSlot.serviceDate,
                                time_start: moment(editingSlot.startTime, "HH:mm"),
                                time_end: moment(editingSlot.endTime, "HH:mm"),
                                capacity: editingSlot.totalSlots,
                            }
                            : {
                                date: null,
                                time_start: null,
                                time_end: null,
                                capacity: "",
                            }
                    }
                >
                    <Form.Item
                        label="Date"
                        name="date"
                        rules={[{required: true, message: "Please select a date!"}]}
                    >
                        <Input type="date"/>
                    </Form.Item>
                    <Form.Item
                        label="Start Time"
                        name="time_start"
                        rules={[{required: true, message: "Please select a start time!"}]}
                    >
                        <TimePicker format="HH:mm"/>
                    </Form.Item>
                    <Form.Item
                        label="End Time"
                        name="time_end"
                        rules={[{required: true, message: "Please select an end time!"}]}
                    >
                        <TimePicker format="HH:mm"/>
                    </Form.Item>
                    <Form.Item
                        label="Capacity"
                        name="capacity"
                        rules={[
                            {required: true, message: "Please enter capacity!"},
                            {
                                validator: (_, value) =>
                                    value > 0
                                        ? Promise.resolve()
                                        : Promise.reject(new Error("Capacity must be greater than 0!")),
                            },
                        ]}
                    >
                        <Input
                            type="number"
                            onKeyPress={(e) => {
                                if (e.key === '-' || e.key === '+') {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingSlot ? "Update" : "Add"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceManagerSlotsPage;
