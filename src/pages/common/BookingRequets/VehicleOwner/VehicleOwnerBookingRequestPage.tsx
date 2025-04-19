import {useEffect, useState} from "react";
import {Button, Col, DatePicker, message, Pagination, Row, Select, Spin, Table, Tag} from "antd";
import moment from "moment";
import {BookingRequest, BookingRequestResponse, BookingRequestStatus, PageDto} from "../../../../types/request.type";
import {getAllMyBookingRequests} from "../../../../services/booking.service";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

const {Option} = Select;

const VehicleOwnerBookingRequestPage = () => {
    const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<BookingRequestStatus | null>(null);
    const [dateFilter, setDateFilter] = useState<moment.Moment | null>(null);

    useEffect(() => {
        fetchMyBookingRequests(currentPage, pageSize);
    }, [currentPage, pageSize, statusFilter, dateFilter]);

    const fetchMyBookingRequests = async (page: number, limit: number) => {
        setLoading(true);
        try {
            const filters = {
                offset: page,
                limit: limit,
                status: statusFilter || undefined,
                date: dateFilter ? dateFilter.format("YYYY-MM-DD") : undefined,
            };

            const response: BookingRequestResponse = await getAllMyBookingRequests(filters);
            const pageData: PageDto<BookingRequest> = response.results[0];

            setBookingRequests(pageData.items || []);
            setTotalItems(pageData.totalItems);
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

    const handlePageChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const clearFilters = () => {
        setStatusFilter(null);
        setDateFilter(null);
        setCurrentPage(1);
    };

    const columns = [
        {
            title: "Date",
            dataIndex: ["serviceSlot", "serviceDate"],
            key: "date",
            render: (serviceDate: string) => moment(serviceDate).format("DD MMM YYYY"),
        },
        {
            title: "Time",
            key: "time",
            render: (_: string, record: BookingRequest) =>
                `${record.serviceSlot.startTime.slice(0, 5)} - ${record.serviceSlot.endTime.slice(0, 5)}`,
        },
        {
            title: "Vehicle",
            dataIndex: "vehicleId",
            key: "vehicleId",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "blue";
                if (status === "CONFIRMED") color = "green";
                if (status === "REJECTED") color = "red";
                if (status === "CANCELLED") color = "orange";
                return <Tag color={color}>{status}</Tag>;
            },
        },
    ];

    return (
        <div style={{padding: 20}}>
            <h1>My Booking Requests</h1>

            {/* Filters Row */}
            <Row gutter={[16, 16]} style={{marginBottom: 20}}>
                <Col>
                    <Select
                        placeholder="Filter by Status"
                        style={{width: 200}}
                        value={statusFilter || undefined}
                        onChange={(value) => setStatusFilter(value as BookingRequestStatus)}
                        allowClear
                    >
                        <Option value="PENDING">Pending</Option>
                        <Option value="CONFIRMED">Confirmed</Option>
                        <Option value="REJECTED">Rejected</Option>
                        <Option value="CANCELLED">Cancelled</Option>
                    </Select>
                </Col>
                <Col>
                    <DatePicker
                        placeholder="Filter by Date"
                        style={{width: 200}}
                        value={dateFilter}
                        onChange={(date) => setDateFilter(date)}
                        allowClear
                    />
                </Col>
                <Col>
                    <Button onClick={clearFilters} style={{marginLeft: 10}}>
                        Clear Filters
                    </Button>
                </Col>
            </Row>

            {loading ? (
                <Spin size="large" style={{display: "block", marginTop: 50, textAlign: "center"}}/>
            ) : (
                <>
                    <Table
                        dataSource={bookingRequests.map((request) => ({
                            key: request.bookingRequestId,
                            ...request,
                        }))}
                        columns={columns}
                        bordered
                        pagination={false}
                    />
                    <div style={{marginTop: 20, textAlign: "center"}}>
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={totalItems}
                            onChange={handlePageChange}
                            showSizeChanger
                            pageSizeOptions={[5, 10, 20, 50]}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default VehicleOwnerBookingRequestPage;
