import {useEffect, useState} from "react";
import {ErrorResponse, useNavigate} from "react-router";
import {Button, Form, Input, message} from "antd";
import {useDispatch} from "react-redux";
import {jwtDecode} from "jwt-decode";
import "./ForgotPassword.css";
import {forgotPassword, verifyOtp} from "../../../services/auth.service.ts";
import {DecodedToken} from "../../../types/auth.type.ts";
import {setAuthUser} from "../../../store/user.ts";
import {AxiosError} from "axios";

const OTP_EXPIRATION_TIME = 300; // 5 minutes in seconds

const ForgotPassword = () => {
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(OTP_EXPIRATION_TIME);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [emailForm] = Form.useForm();
    const [otpForm] = Form.useForm();

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (step === "otp" && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            message.error("OTP expired. Please resend OTP.");
            setStep("email");
        }

        return () => clearInterval(timer);
    }, [step, timeLeft]);

    const handleSendOtp = async () => {
        try {
            const values = await emailForm.validateFields();
            setLoading(true);
            await forgotPassword(values.email);
            message.success("OTP sent to your email. Please check your inbox.");
            setStep("otp");
            setTimeLeft(OTP_EXPIRATION_TIME);
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

    const handleVerifyOtp = async () => {
        try {
            const values = await otpForm.validateFields();
            setLoading(true);
            const response = await verifyOtp(values.otp, values.email);
            const token = response.data.results[0]["accessToken"];
            localStorage.setItem("token", token);

            const user = jwtDecode<DecodedToken>(token);
            dispatch(setAuthUser(user));

            message.success("OTP verified! Redirecting to profile...");
            navigate("/profile");
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
                <h1 className="login-title">Forgot Password</h1>

                {step === "email" && (
                    <Form
                        form={emailForm}
                        layout="vertical"
                        onFinish={handleSendOtp}
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

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                            >
                                {loading ? "Sending OTP..." : "Send OTP"}
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {step === "otp" && (
                    <Form
                        form={otpForm}
                        layout="vertical"
                        onFinish={handleVerifyOtp}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            initialValue={emailForm.getFieldValue("email")}
                            rules={[{required: true, message: "Email is required."}]}
                        >
                            <Input placeholder="Enter your email" disabled/>
                        </Form.Item>

                        <Form.Item
                            label="OTP"
                            name="otp"
                            rules={[
                                {required: true, message: "Please enter the OTP!"},
                                {len: 6, message: "OTP must be 6 digits."},
                            ]}
                        >
                            <Input placeholder="Enter the OTP"/>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                            >
                                {loading ? "Verifying OTP..." : "Verify OTP"}
                            </Button>
                        </Form.Item>

                        <p className="otp-timer">
                            Time remaining: {Math.floor(timeLeft / 60)}:
                            {String(timeLeft % 60).padStart(2, "0")}
                        </p>

                        <p className="signup-link">
                            Didn't receive the OTP?{" "}
                            <span
                                onClick={handleSendOtp}
                                className="forgot-password-resend-link"
                            >
                                Resend OTP
                            </span>
                        </p>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
