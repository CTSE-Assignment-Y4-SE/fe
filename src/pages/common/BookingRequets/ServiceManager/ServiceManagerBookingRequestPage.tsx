import {useEffect, useState} from "react";
import {Button, Col, DatePicker, message, Modal, Row, Select, Space, Spin, Table, Tag} from "antd";
import {CheckOutlined, CloseOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import moment from "moment";
import {BookingRequest, BookingRequestResponse, BookingRequestStatus,} from "../../../../types/request.type";
import {
    getAllBookingRequestsAsVehicleOwnerOrGarageAdmin,
    updateBookingRequest
} from "../../../../services/booking.service";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

interface BookingRequestParams {
    status?: BookingRequestStatus;
    date?: string;
    offset?: number;
    limit?: number;
    export?: boolean;
}

const ServiceManagerBookingRequestPage = () => {
    const [requests, setRequests] = useState<BookingRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<BookingRequestStatus | undefined>(undefined);
    const [dateFilter, setDateFilter] = useState<moment.Moment | null>(null);

    useEffect(() => {
        fetchBookingRequests();
    }, [currentPage, pageSize, statusFilter, dateFilter]);

    const fetchBookingRequests = async () => {
        setLoading(true);
        try {
            const filters: BookingRequestParams = {
                offset: currentPage,
                limit: pageSize,
                status: statusFilter,
                date: dateFilter ? dateFilter.format("YYYY-MM-DD") : undefined,
            };

            const response: BookingRequestResponse = await getAllBookingRequestsAsVehicleOwnerOrGarageAdmin(filters);
            const {items, totalItems} = response.results[0];

            setRequests(items);
            setTotalItems(totalItems);
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

    const updateStatus = async (id: number, status: BookingRequestStatus) => {
        try {
            await updateBookingRequest(id, {status});
            message.success(`Booking request ${status.toLowerCase()} successfully.`);
            fetchBookingRequests();
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        }
    };

    const handleApprove = (id: number) => {
        Modal.confirm({
            title: "Are you sure you want to approve this booking request?",
            icon: <ExclamationCircleOutlined/>,
            okText: "Yes",
            okType: "primary",
            cancelText: "No",
            onOk: () => updateStatus(id, "CONFIRMED"),
        });
    };

    const handleReject = (id: number) => {
        Modal.confirm({
            title: "Are you sure you want to reject this booking request?",
            icon: <ExclamationCircleOutlined/>,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: () => updateStatus(id, "REJECTED"),
        });
    };

    const clearFilters = () => {
        setStatusFilter(undefined);
        setDateFilter(null);
        setCurrentPage(1);
    };

    const handleTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const columns = [
        {
            title: "Vehicle",
            dataIndex: "vehicleId",
            key: "vehicleId",
        },
        {
            title: "Date",
            dataIndex: ["serviceSlot", "serviceDate"],
            key: "date",
            render: (serviceDate: string) => moment(serviceDate).format("YYYY-MM-DD"),
        },
        {
            title: "Time",
            key: "time",
            render: (_: string, record: BookingRequest) =>
                `${record.serviceSlot.startTime.slice(0, 5)} - ${record.serviceSlot.endTime.slice(0, 5)}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: BookingRequestStatus) => {
                let color = "blue";
                if (status === "CONFIRMED") color = "green";
                if (status === "REJECTED") color = "red";
                if (status === "CANCELLED") color = "orange";
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: string, record: BookingRequest) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckOutlined/>}
                        disabled={record.status !== "PENDING"}
                        onClick={() => handleApprove(record.bookingRequestId)}
                    >
                        Approve
                    </Button>
                    <Button
                        type="primary"
                        icon={<CloseOutlined/>}
                        disabled={record.status !== "PENDING"}
                        onClick={() => handleReject(record.bookingRequestId)}
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{padding: 20}}>
            <h1>Booking Requests</h1>

            <Row gutter={[16, 16]} style={{marginBottom: 20}}>
                <Col>
                    <Select
                        placeholder="Filter by Status"
                        style={{width: 150}}
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value as BookingRequestStatus)}
                        allowClear
                    >
                        <Select.Option value="PENDING">Pending</Select.Option>
                        <Select.Option value="CONFIRMED">Confirmed</Select.Option>
                        <Select.Option value="REJECTED">Rejected</Select.Option>
                        <Select.Option value="CANCELLED">Cancelled</Select.Option>
                    </Select>
                </Col>
                <Col>
                    <DatePicker
                        placeholder="Filter by Date"
                        style={{width: 150}}
                        value={dateFilter}
                        onChange={(date) => setDateFilter(date)}
                    />
                </Col>
                <Col>
                    <Space>
                        <Button onClick={clearFilters}>Clear Filters</Button>
                    </Space>
                </Col>
            </Row>

            {loading ? (
                <Spin size="large" style={{display: "block", marginTop: 50, textAlign: "center"}}/>
            ) : (
                <Table
                    dataSource={requests.map((request) => ({
                        key: request.bookingRequestId,
                        ...request,
                    }))}
                    columns={columns}
                    bordered
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalItems,
                        showSizeChanger: true,
                        onChange: handleTableChange,
                    }}
                />
            )}
        </div>
    );
};

export default ServiceManagerBookingRequestPage;
