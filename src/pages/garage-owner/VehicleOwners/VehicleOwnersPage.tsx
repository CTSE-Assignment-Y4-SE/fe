import {useEffect, useState} from "react";
import {Button, message, Modal, Space, Spin, Table} from "antd";
import {CheckOutlined, DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import {activateUser, deactivateUser, getUsersByRole} from "../../../services/user.service.ts";
import {User, UserResponse} from "../../../types/user.type.ts";
import {AxiosError, AxiosResponse} from "axios";
import {ErrorResponse} from "react-router";

const {confirm} = Modal;

const VehicleOwnerPage = () => {
    const [vehicleOwners, setVehicleOwners] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchVehicleOwners = async () => {
            setLoading(true);
            try {
                const response: AxiosResponse<UserResponse> = await getUsersByRole(["VEHICLE_OWNER"]);
                setVehicleOwners(response.data.results);
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

        fetchVehicleOwners();
    }, []);

    const toggleActiveStatus = async (id: number, isActive: boolean) => {
        try {
            if (isActive) {
                await deactivateUser(String(id));
            } else {
                await activateUser(String(id));
            }

            setVehicleOwners((prev) =>
                prev.map((owner) =>
                    owner.userId === id ? {...owner, active: !isActive} : owner
                )
            );
            message.success(
                `User ${isActive ? "deactivated" : "activated"} successfully.`
            );
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        }
    };

    const handleConfirmation = (id: number, isActive: boolean) => {
        const action = isActive ? "deactivate" : "activate";
        const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);

        confirm({
            title: `Are you sure you want to ${action} this user?`,
            icon: <ExclamationCircleOutlined/>,
            content: isActive
                ? "Deactivating the user will prevent them from accessing the system."
                : "Activating the user will allow them to access the system again.",
            okText: `Yes, ${capitalizedAction}`,
            okType: isActive ? "danger" : "primary",
            cancelText: "No",
            onOk() {
                toggleActiveStatus(id, isActive);
            },
            onCancel() {
                console.log(`${capitalizedAction} action cancelled`);
            },
        });
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "userId",
            key: "userId",
        },
        {
            title: "Name",
            key: "name",
            render: (_: string, record: User) => {
                const firstName = record.vehicleOwnerResponseDto?.firstName || "N/A";
                const lastName = record.vehicleOwnerResponseDto?.lastName || "";
                return `${firstName} ${lastName}`.trim();
            },
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Phone Number",
            key: "phoneNumber",
            render: (_: string, record: User) => record.vehicleOwnerResponseDto?.phoneNumber || "N/A",
        },
        {
            title: "Status",
            dataIndex: "active",
            key: "active",
            render: (active: boolean) => (active ? "Active" : "Deactivated"),
        },
        {
            title: "Action",
            key: "action",
            render: (_: string, record: User) => (
                <Space>
                    {record.active ? (
                        <Button
                            icon={<DeleteOutlined/>}
                            danger
                            onClick={() => handleConfirmation(record.userId, true)}
                        >
                            Deactivate
                        </Button>
                    ) : (
                        <Button
                            icon={<CheckOutlined/>}
                            type="primary"
                            onClick={() => handleConfirmation(record.userId, false)}
                        >
                            Reactivate
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{padding: "20px"}}>
            <h1>Vehicle Owners</h1>
            {loading ? (
                <Spin size="large" style={{display: "block", marginTop: "50px", textAlign: "center"}}/>
            ) : (
                <Table
                    dataSource={vehicleOwners.map((owner) => ({
                        key: owner.userId,
                        ...owner,
                    }))}
                    columns={columns}
                    bordered
                    pagination={{pageSize: 10}}
                />
            )}
        </div>
    );
};

export default VehicleOwnerPage;
