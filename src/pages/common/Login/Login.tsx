import {useState} from "react";
import {ErrorResponse, useNavigate} from "react-router";
import {useDispatch} from "react-redux";
import {Button, Form, Input, message} from "antd";
import {EyeInvisibleOutlined, EyeTwoTone} from "@ant-design/icons";
import {AxiosError} from "axios";
import {jwtDecode} from "jwt-decode";
import {login} from "../../../services/auth.service.ts";
import {setAuthUser} from "../../../store/user.ts";
import {DecodedToken} from "../../../types/index.type.ts";
import "./Login.css";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState<boolean>(false);

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const response = await login(values.email, values.password);
            const token = response.data.results[0]["accessToken"];
            localStorage.setItem("token", token);

            const user = jwtDecode<DecodedToken>(token);
            dispatch(setAuthUser(user));

            message.success("Login successful!");
            navigate("/slots");
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

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Welcome to Garage!</h1>
                <p className="login-subtitle">Please sign in to continue</p>

                <Form
                    name="login-form"
                    layout="vertical"
                    onFinish={handleLogin}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {required: true, message: "Please enter your email!"},
                            {type: "email", message: "Please enter a valid email!"},
                        ]}
                    >
                        <Input placeholder="Enter your email"/>
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{required: true, message: "Please enter your password!"}]}
                    >
                        <Input.Password
                            placeholder="Enter your password"
                            iconRender={(visible) =>
                                visible ? <EyeTwoTone/> : <EyeInvisibleOutlined/>
                            }
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </Form.Item>
                </Form>

                <p className="signup-link">
                    Don't have an account? <a href="/signup">Create one</a>
                </p>
                <p className="signup-link">
                    Forgot your password? <a href="/forgot-password">Reset it</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
