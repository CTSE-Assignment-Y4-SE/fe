import {useEffect, useState} from "react";
import {Card, DatePicker, Empty, List, message, Space, Spin} from "antd";
import moment, {Moment} from "moment";
import {getAllServiceSlots} from "../../../../services/slot.service";
import {ServiceSlot} from "../../../../types/slot.type";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

const GarageAdminSlotPage = () => {
    const [slots, setSlots] = useState<ServiceSlot[]>([]);
    const [filteredSlots, setFilteredSlots] = useState<ServiceSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAllSlots();
    }, []);

    const fetchAllSlots = async () => {
        setLoading(true);
        try {
            const response = await getAllServiceSlots();
            setSlots(response.results);
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

    const handleDateChange = (date: Moment | null) => {
        if (!date) {
            setFilteredSlots(slots);
            setSelectedDate(null);
            return;
        }

        const formattedDate = date.format("YYYY-MM-DD");
        setSelectedDate(formattedDate);

        const filtered = slots.filter((slot) => slot.serviceDate === formattedDate);
        setFilteredSlots(filtered);
    };

    return (
        <div style={{padding: 20}}>
            <h1>Service Slots</h1>
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
                    <h2>All Slots</h2>
                    {filteredSlots.length === 0 ? (
                        <Empty description="No slots available for the selected date."/>
                    ) : (
                        <List
                            grid={{gutter: 16, column: 2}}
                            dataSource={filteredSlots}
                            renderItem={(slot) => (
                                <List.Item>
                                    <Card
                                        title={`${moment(slot.serviceDate).format("DD MMM YYYY")} (${slot.startTime} - ${slot.endTime})`}
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
        </div>
    );
};

export default GarageAdminSlotPage;
