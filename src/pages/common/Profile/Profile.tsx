import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {ErrorResponse, useNavigate} from "react-router";
import {Button, Card, Descriptions, Form, Input, message, Modal, Skeleton, Typography} from "antd";
import {getUserProfile} from "../../../services/profile.service.ts";
import {User} from "../../../types/user.type.ts";
import {VehicleOwnerProfile} from "../../../types/vehicle-owner.type.ts";
import {resetPassword} from "../../../services/auth.service.ts";
import {getVehicleOwner, updateProfile} from "../../../services/vehicle-owner.service.ts";
import {deactivateUser} from "../../../services/user.service.ts";
import {AxiosError} from "axios";

const {Title, Text} = Typography;
const {confirm} = Modal;

const Profile: React.FC = () => {
    const role = useSelector((state: { user: { authUser: { role: string } } }) => state.user.authUser.role);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState<User>();
    const [vehicleOwnerData, setVehicleOwnerData] = useState<VehicleOwnerProfile>();
    const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
    const [loadingVehicleOwner, setLoadingVehicleOwner] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await getUserProfile();
                setProfileData(response.data.results[0]);
            } catch (err) {
                console.error("Error fetching user profile", err);
            } finally {
                setLoadingProfile(false);
            }
        };

        const fetchVehicleOwnerProfile = async () => {
            try {
                const response = await getVehicleOwner();
                setVehicleOwnerData(response.data.results[0]);
            } catch (err) {
                console.error("Error fetching vehicle owner profile", err);
            } finally {
                setLoadingVehicleOwner(false);
            }
        };

        fetchUserProfile();

        if (role === "VEHICLE_OWNER") {
            fetchVehicleOwnerProfile();
        }
    }, [role]);

    const handleUpdateProfile = async (values: { firstName: string; lastName: string; phoneNumber: string }) => {
        try {
            const response = await updateProfile(values.firstName, values.lastName, values.phoneNumber);
            message.success("Profile updated successfully!");
            setVehicleOwnerData(response.data.results[0]);
            setIsModalVisible(false);
        } catch (error) {
            const axiosError = error as AxiosError<ErrorResponse>;
            const errorMessage =
                axiosError.response?.data?.results?.[0]?.message ||
                "An unexpected error occurred. Please try again.";
            message.error(errorMessage);
        }
    };

    const handleResetPassword = async (values: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string
    }) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error("New password and confirmation do not match!");
            return;
        }

        try {
            await resetPassword(values.currentPassword, values.newPassword);
            message.success("Password successfully reset!");
            form.resetFields();
        } catch (err) {
            console.error("Error resetting password", err);
            message.error("Failed to reset password. Please try again.");
        }
    };

    const handleDeactivateAccount = async () => {
        try {
            await deactivateUser(String(profileData?.userId));
            message.success("Account successfully deactivated.");
            handleLogout();
        } catch (err) {
            console.error("Error deactivating account", err);
            message.error("Failed to deactivate account. Please try again.");
        }
    };

    const confirmDeactivation = () => {
        confirm({
            title: "Are you sure you want to deactivate your account?",
            content: "Deactivating your account will log you out and prevent you from accessing the system.",
            okText: "Yes, Deactivate",
            okType: "danger",
            cancelText: "No",
            onOk() {
                handleDeactivateAccount();
            },
            onCancel() {
                console.log("Account deactivation cancelled.");
            },
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        message.info("You have been logged out.");
    };

    return (
        <div style={{maxWidth: 800, margin: "0 auto", padding: "20px"}}>
            <Card bordered={false} style={{marginBottom: 20}}>
                <Title level={3}>Profile</Title>
                {loadingProfile ? (
                    <Skeleton active/>
                ) : (
                    <Descriptions bordered column={1} size="middle">
                        <Descriptions.Item label="Email">
                            <Text>{profileData?.email || "N/A"}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Role">
                            <Text>{profileData?.role?.replace("_", " ").toLowerCase() || "N/A"}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Card>

            {role === "VEHICLE_OWNER" && (
                <Card bordered={false} style={{marginBottom: 20}}>
                    <Title level={3}>Vehicle Owner Profile</Title>
                    {loadingVehicleOwner ? (
                        <Skeleton active/>
                    ) : (
                        <>
                            <Descriptions bordered column={1} size="middle" style={{marginBottom: 20}}>
                                <Descriptions.Item label="Vehicle Owner ID">
                                    <Text>{vehicleOwnerData?.vehicleOwnerId || "N/A"}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="First Name">
                                    <Text>{vehicleOwnerData?.firstName || "N/A"}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Name">
                                    <Text>{vehicleOwnerData?.lastName || "N/A"}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phone Number">
                                    <Text>{vehicleOwnerData?.phoneNumber || "N/A"}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                            <Button type="primary" onClick={() => setIsModalVisible(true)}>
                                Edit Profile
                            </Button>
                        </>
                    )}
                </Card>
            )}

            <Modal
                title="Update Profile"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    layout="vertical"
                    initialValues={{
                        firstName: vehicleOwnerData?.firstName,
                        lastName: vehicleOwnerData?.lastName,
                        phoneNumber: vehicleOwnerData?.phoneNumber,
                    }}
                    onFinish={handleUpdateProfile}
                >
                    <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[{required: true, message: "Please enter your first name!"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[{required: true, message: "Please enter your last name!"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Phone Number"
                        name="phoneNumber"
                        rules={[
                            {required: true, message: "Please enter your phone number!"},
                            {
                                pattern: /^[0-9]{10}$/,
                                message: "Please enter a valid phone number!",
                            },
                        ]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Card bordered={false} style={{marginBottom: 20}}>
                <Title level={4}>Change Password</Title>
                <Form form={form} layout="vertical" onFinish={handleResetPassword}>
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{required: true, message: "Please enter your current password"}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[
                            {required: true, message: "Please enter your new password"},
                            {min: 8, message: "Password must be at least 8 characters long"},
                        ]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        rules={[{required: true, message: "Please confirm your new password"}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Change Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {role === "VEHICLE_OWNER" && (
                <Card bordered={false}>
                    <Title level={4}>Account Management</Title>
                    <Button type="primary" style={{backgroundColor: "red"}} onClick={confirmDeactivation}>
                        Deactivate Account
                    </Button>
                </Card>
            )}
        </div>
    );
};

export default Profile;
