import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {clearAuthUser} from "../../../store/user";
import {Notification} from "../../../types/notification.type";
import {Badge, Button, Dropdown, List, message, Space, Spin} from "antd";
import {BellOutlined} from "@ant-design/icons";
import "./Header.css";
import {getAllNotifications, markNotificationAsViewed} from "../../../services/notification.service.ts";

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const unreadCount = notifications.filter((n) => !n.viewed).length;

    const token = localStorage.getItem("token");
    const role = useSelector((state: { user: { authUser: { role: string } } }) => state.user.authUser.role);

    const whiteListedRoutes = ["/", "/signup", "/forgot-password"];

    useEffect(() => {
        if (whiteListedRoutes.includes(location.pathname)) {
            return;
        }

        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await getAllNotifications();
            const sortedNotifications = response.results.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(sortedNotifications);
        } catch (error) {
            console.error("Failed to load notifications", error);
            message.error("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notificationId: number) => {
        try {
            await markNotificationAsViewed(notificationId);
            setNotifications((prevNotifications) =>
                prevNotifications.map((n) =>
                    n.notificationId === notificationId ? {...n, viewed: true} : n
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as viewed", error);
            message.error("Failed to mark notification as viewed.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(clearAuthUser());
        navigate("/");
    };

    const items = [
        {
            key: "1",
            label: <Link to="/profile">Profile</Link>,
        },
        {
            key: "2",
            label: (
                <div onClick={handleLogout} style={{cursor: "pointer"}}>
                    Logout
                </div>
            ),
        },
    ];

    if (!token) {
        return null;
    }

    return (
        <header className="header">
            <div className="header-left">
                <h1>Garage</h1>
            </div>

            <div className="header-center">
                {role === "VEHICLE_OWNER" && (
                    <>
                        <Link to="/vehicles" className="header-link">
                            Vehicles
                        </Link>
                        <Link to="/slots" className="header-link">
                            Booking Slots
                        </Link>
                        <Link to="/requests" className="header-link">
                            Booking Requests
                        </Link>
                    </>
                )}
                {role === "SERVICE_MANAGER" && (
                    <>
                        <Link to="/slots" className="header-link">
                            Booking Slots
                        </Link>
                        <Link to="/requests" className="header-link">
                            Booking Requests
                        </Link>
                    </>
                )}
                {role === "GARAGE_ADMIN" && (
                    <>
                        <Link to="/slots" className="header-link">
                            Booking Slots
                        </Link>
                        <Link to="/vehicle-owners" className="header-link">
                            Vehicle Owners
                        </Link>
                        <Link to="/service-managers" className="header-link">
                            Service Managers
                        </Link>
                        <Link to="/requests" className="header-link">
                            Bookings Requests
                        </Link>
                    </>
                )}
            </div>

            <div className="header-right">
                <Dropdown
                    trigger={["click"]}
                    dropdownRender={() => (
                        <div style={{
                            width: 350,
                            maxHeight: 400,
                            overflowY: "auto",
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: 4
                        }}>
                            <h4 style={{
                                padding: "10px 15px",
                                margin: 0,
                                borderBottom: "1px solid #ddd"
                            }}>Notifications</h4>
                            {loading ? (
                                <Spin style={{display: "block", textAlign: "center", margin: "20px 0"}}/>
                            ) : (
                                <List
                                    dataSource={notifications}
                                    renderItem={(item) => (
                                        <List.Item
                                            style={{
                                                padding: "10px 15px",
                                                backgroundColor: item.viewed ? "transparent" : "#e6f7ff",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleNotificationClick(item.notificationId)}
                                        >
                                            <List.Item.Meta
                                                title={<strong>{item.title}</strong>}
                                                description={
                                                    <>
                                                        <div>{item.body}</div>
                                                        <div style={{fontSize: "12px", color: "#999"}}>
                                                            {new Date(item.createdAt).toLocaleString()}
                                                        </div>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            )}
                        </div>
                    )}
                >
                    <Badge count={unreadCount} overflowCount={99}>
                        <BellOutlined style={{fontSize: "20px", marginRight: "20px", cursor: "pointer"}}/>
                    </Badge>
                </Dropdown>

                <Space direction="vertical">
                    <Space wrap>
                        <Dropdown menu={{items}} placement="bottomLeft" trigger={["click"]}>
                            <Button>Profile</Button>
                        </Dropdown>
                    </Space>
                </Space>
            </div>
        </header>
    );
};

export default Header;
