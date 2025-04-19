import {useEffect, useState} from "react";
import {Button, Modal, Select, Space, Table} from "antd";
import {CheckOutlined, DeleteOutlined, ExclamationCircleOutlined} from "@ant-design/icons";
import ServiceManagerModal from "../../../components/ui/Modal/ServiceManager/ServiceManagerModal.tsx";
import {User, UserResponse} from "../../../types/user.type.ts";
import {activateUser, deactivateUser, getUsersByRole} from "../../../services/user.service.ts";
import {AxiosResponse} from "axios";
import {saveServiceManager} from "../../../services/auth.service.ts";

const {Option} = Select;
const {confirm} = Modal;

const ServiceManagerPage = () => {
    const [serviceManagers, setServiceManagers] = useState<User[]>([]);
    const [filteredManagers, setFilteredManagers] = useState<User[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        const fetchServiceManagers = async () => {
            try {
                const response: AxiosResponse<UserResponse> = await getUsersByRole(["SERVICE_MANAGER"]);
                setServiceManagers(response.data.results);
                setFilteredManagers(response.data.results);
            } catch (error) {
                console.error("Failed to fetch service managers:", error);
            }
        };

        fetchServiceManagers();
    }, []);

    const handleCreate = async (values: { email: string }) => {
        try {
            const response: AxiosResponse<UserResponse> = await saveServiceManager(values.email);
            const newManager = response.data.results[0];
            setServiceManagers((prev) => [...prev, newManager]);
            setFilteredManagers((prev) => [...prev, newManager]);
            setIsModalVisible(false);
        } catch (error) {
            console.error("Failed to create service manager:", error);
        }
    };

    const toggleActiveStatus = async (id: number, isActive: boolean) => {
        try {
            if (isActive) {
                await deactivateUser(String(id));
            } else {
                await activateUser(String(id));
            }

            setServiceManagers((prev) =>
                prev.map((manager) =>
                    manager.userId === id ? {...manager, active: !isActive} : manager
                )
            );
            setFilteredManagers((prev) =>
                prev.map((manager) =>
                    manager.userId === id ? {...manager, active: !isActive} : manager
                )
            );
        } catch (error) {
            console.error(`Failed to toggle status for user with ID ${id}`, error);
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

    const handleFilterChange = (status: string) => {
        setFilterStatus(status);
        if (status === "ALL") {
            setFilteredManagers(serviceManagers);
        } else {
            const isActive = status === "ACTIVE";
            setFilteredManagers(serviceManagers.filter((manager) => manager.active === isActive));
        }
    };

    const openModal = () => {
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "userId",
            key: "userId",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
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
            render: (_: unknown, record: User) => (
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
            <h1>Service Managers</h1>
            <Space style={{marginBottom: "20px"}}>
                <Button
                    type="primary"
                    onClick={openModal}
                >
                    Add New Service Manager
                </Button>
                <Select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    style={{width: 200}}
                    placeholder="Filter by Status"
                >
                    <Option value="ALL">All Managers</Option>
                    <Option value="ACTIVE">Active Managers</Option>
                    <Option value="DEACTIVATED">Deactivated Managers</Option>
                </Select>
            </Space>
            <Table
                dataSource={filteredManagers.map((manager) => ({
                    key: manager.userId,
                    ...manager,
                }))}
                columns={columns}
                bordered
            />
            <ServiceManagerModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreate}
                title="Add Service Manager"
            />
        </div>
    );
};

export default ServiceManagerPage;
