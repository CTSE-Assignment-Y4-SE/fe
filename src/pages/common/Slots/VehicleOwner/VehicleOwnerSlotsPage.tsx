import {useEffect, useState} from "react";
import {Button, Card, DatePicker, Empty, List, message, Modal, Select, Space, Spin} from "antd";
import moment, {Moment} from "moment";
import {getAllServiceSlots} from "../../../../services/slot.service";
import {fetchVehicles} from "../../../../services/vehicle.service";
import {ServiceSlot} from "../../../../types/slot.type";
import {Vehicle} from "../../../../types/vehicle";
import {createBookingRequest} from "../../../../services/booking.service";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

const VehicleOwnerSlotsPage = () => {
    const [availableSlots, setAvailableSlots] = useState<ServiceSlot[]>([]);
    const [filteredSlots, setFilteredSlots] = useState<ServiceSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
    const [slotToBook, setSlotToBook] = useState<ServiceSlot | null>(null);

    useEffect(() => {
        fetchAvailableSlots();
        fetchUserVehicles();
    }, []);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await getAllServiceSlots();
            setAvailableSlots(response.results);
            setFilteredSlots(response.results);
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

    const fetchUserVehicles = async () => {
        try {
            const response = await fetchVehicles();
            setVehicles(response.data.results);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        }
    };

    const handleDateChange = (date: Moment | null) => {
        if (!date) {
            // Reset the filtered slots when no date is selected
            setFilteredSlots(availableSlots);
        } else {
            const formattedDate = date.format("YYYY-MM-DD");
            const filtered = availableSlots.filter((slot) => slot.serviceDate === formattedDate);
            setFilteredSlots(filtered);
        }
    };

    const openBookingModal = (slot: ServiceSlot) => {
        setSlotToBook(slot);
        setSelectedVehicle(null);
        setIsBookingModalVisible(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedVehicle) {
            message.error("Please select a vehicle to proceed with the booking.");
            return;
        }

        if (slotToBook) {
            const bookingData = {
                serviceSlotId: slotToBook.serviceSlotId,
                vehicleId: Number(selectedVehicle),
                bookingDate: moment(slotToBook.serviceDate).format("YYYY-MM-DD"),
            };

            try {
                await createBookingRequest(bookingData);
                message.success(
                    `You have successfully booked the slot from ${slotToBook.startTime} to ${slotToBook.endTime} for vehicle ${selectedVehicle}.`
                );

                // Update slots after booking
                setFilteredSlots((prev) =>
                    prev.map((s) =>
                        s.serviceSlotId === slotToBook.serviceSlotId
                            ? {...s, availableSlots: s.availableSlots - 1}
                            : s
                    )
                );

                setAvailableSlots((prev) =>
                    prev.map((s) =>
                        s.serviceSlotId === slotToBook.serviceSlotId
                            ? {...s, availableSlots: s.availableSlots - 1}
                            : s
                    )
                );
            } catch (error) {
                const axiosError = error as AxiosError<ErrorResponse>;
                const errorMessage =
                    axiosError.response?.data?.results?.[0]?.message ||
                    "An unexpected error occurred. Please try again.";
                message.error(errorMessage);
            }
        }

        setIsBookingModalVisible(false);
        setSlotToBook(null);
    };

    return (
        <div style={{padding: 20}}>
            <h1>Book a Service Slot</h1>
            <Space style={{marginBottom: 20}}>
                <DatePicker
                    onChange={handleDateChange}
                    placeholder="Select Date"
                    allowClear
                />
            </Space>

            {loading ? (
                <div style={{textAlign: "center", marginTop: 50}}>
                    <Spin size="large"/>
                </div>
            ) : (
                <div>
                    <h2>Available Slots</h2>
                    {filteredSlots.length === 0 ? (
                        <Empty description="No available slots for the selected date."/>
                    ) : (
                        <List
                            grid={{gutter: 16, column: 2}}
                            dataSource={filteredSlots}
                            renderItem={(slot) => (
                                <List.Item>
                                    <Card
                                        title={`${moment(slot.serviceDate).format("DD MMM YYYY")} (${slot.startTime} - ${slot.endTime})`}
                                        extra={
                                            <Button
                                                type="primary"
                                                disabled={slot.availableSlots <= 0}
                                                onClick={() => openBookingModal(slot)}
                                            >
                                                Book
                                            </Button>
                                        }
                                    >
                                        <p>
                                            <strong>Available Slots:</strong> {slot.availableSlots}/{slot.totalSlots}
                                        </p>
                                        <p>
                                            {slot.availableSlots <= 0 ? (
                                                <span style={{color: "red"}}>Fully Booked</span>
                                            ) : (
                                                <span style={{color: "green"}}>Available</span>
                                            )}
                                        </p>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            )}

            <Modal
                title="Book Service Slot"
                open={isBookingModalVisible}
                onOk={handleConfirmBooking}
                onCancel={() => setIsBookingModalVisible(false)}
                okText="Confirm Slots"
                cancelText="Cancel"
            >
                {slotToBook && (
                    <>
                        <p>
                            <strong>Date:</strong> {moment(slotToBook.serviceDate).format("DD MMM YYYY")}
                        </p>
                        <p>
                            <strong>Time:</strong> {slotToBook.startTime} - {slotToBook.endTime}
                        </p>
                        <p>
                            <strong>Available Slots:</strong> {slotToBook.availableSlots}/{slotToBook.totalSlots}
                        </p>
                        <Select
                            placeholder="Select Vehicle"
                            onChange={(value) => setSelectedVehicle(value)}
                            style={{width: "100%", marginTop: 10}}
                            value={selectedVehicle}
                            options={vehicles.map((vehicle: Vehicle) => ({
                                label: `${vehicle.brand} (${vehicle.model} - ${vehicle.year})`,
                                value: vehicle.vehicleId,
                            }))}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default VehicleOwnerSlotsPage;
