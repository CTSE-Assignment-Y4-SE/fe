import {useState} from "react";
import {useNavigate} from "react-router";
import {Button, Form, Input, message} from "antd";
import {signup} from "../../../services/auth.service.ts";
import {AxiosError} from "axios";
import "./Signup.css";

interface ErrorResponse {
    message: string;
    results?: { message: string }[];
}

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSignup = async (values: { email: string; password: string; confirmPassword: string }) => {
        if (values.password !== values.confirmPassword) {
            message.error("Passwords do not match. Please try again.");
            return;
        }

        setLoading(true);
        try {
            await signup({email: values.email, password: values.password});
            message.success("Signup successful! Please login.");
            navigate("/");
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
        <div className="signup-container">
            <div className="signup-card">
                <h1 className="signup-title">Create Your Account</h1>
                <p className="signup-subtitle">Sign up to continue</p>

                <Form
                    name="signup-form"
                    layout="vertical"
                    onFinish={handleSignup}
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
                        rules={[
                            {required: true, message: "Please enter your password!"},
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                    "Password must be at least 8 characters long, include one uppercase, one lowercase, one number, and one special character.",
                            },
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder="Enter your password"/>
                    </Form.Item>

                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            {required: true, message: "Please confirm your password!"},
                            ({getFieldValue}) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Passwords do not match!")
                                    );
                                },
                            }),
                        ]}
                        hasFeedback
                    >
                        <Input.Password placeholder="Confirm your password"/>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </Button>
                    </Form.Item>
                </Form>

                <p className="login-link">
                    Already have an account? <a href="/">Login</a>
                </p>
            </div>
        </div>
    );
};

export default Signup;
