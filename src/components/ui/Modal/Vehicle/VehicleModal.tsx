import React, { useState, useEffect } from "react";
import { Button, Form, Input, Modal } from "antd";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { Vehicle } from "../../../../types/vehicle";
import { app } from "../../../../helper/firebase";

interface VehicleModalProps {
    title: string;
    onSubmitTitle: string;
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Record<string, unknown>) => void;
    initialValues?: Partial<Omit<Vehicle, "vehicleId" | "vehicleOwner">>;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
                                                       title,
                                                       onSubmitTitle,
                                                       visible,
                                                       onCancel,
                                                       onSubmit,
                                                       initialValues,
                                                   }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [image, setImage] = useState<string | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            form.resetFields();
            setImage(initialValues?.image || null);
        } else {
            form.resetFields();
            setImage(null);
        }
    }, [visible, initialValues, form]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const storage = getStorage(app);
        const storageRef = ref(storage, `vehicles/${file.name}_${new Date().toISOString()}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setImage(downloadURL);
                setIsUploading(false);
                setUploadProgress(0);
            }
        );
    };

    const handleFormSubmit = (values: Record<string, unknown>) => {
        if (!image) {
            alert("Please wait for the image upload to complete.");
            return;
        }
        const updatedValues = { ...values, image };
        onSubmit(updatedValues);
    };

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={() => {
                form.resetFields(); // Ensure form is reset when modal is canceled
                setImage(null); // Reset image state
                onCancel();
            }}
            footer={null}
        >
            <Form
                form={form} // Attach form instance to Form component
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={initialValues as Record<string, unknown>}
            >
                <Form.Item
                    label="Brand"
                    name="brand"
                    rules={[{ required: true, message: "Please enter the vehicle brand!" }]}
                >
                    <Input placeholder="Enter vehicle brand" />
                </Form.Item>
                <Form.Item
                    label="Model"
                    name="model"
                    rules={[{ required: true, message: "Please enter the vehicle model!" }]}
                >
                    <Input placeholder="Enter vehicle model" />
                </Form.Item>
                <Form.Item
                    label="Year"
                    name="year"
                    rules={[
                        { required: true, message: "Please enter the vehicle year!" },
                        {
                            validator: (_, value) =>
                                value && value > 0
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Year must be greater than 0!")),
                        },
                    ]}
                >
                    <Input
                        type="number"
                        onKeyPress={(e) => {
                            if (e.key === "-" || e.key === "+") {
                                e.preventDefault();
                            }
                        }}
                    />
                </Form.Item>
                <Form.Item
                    label="License Plate"
                    name="licensePlate"
                    rules={[
                        { required: true, message: "Please enter the vehicle license plate!" },
                        {
                            pattern: /^[A-Z]{3}-\d{4}$/,
                            message:
                                "License plate must be in the format: ABC-1234 (3 uppercase letters, a dash, and 4 numbers).",
                        },
                    ]}
                >
                    <Input placeholder="Enter vehicle license plate" />
                </Form.Item>
                <Form.Item label="Vehicle Image">
                    <input type="file" onChange={handleImageChange} />
                    {isUploading && (
                        <div className="progress-bar">
                            Uploading: {Math.round(uploadProgress)}%
                        </div>
                    )}
                    <img
                        src={image || "https://via.placeholder.com/300x200?text=No+Image"}
                        alt="Uploaded"
                        style={{ width: "100%", marginTop: 10 }}
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" disabled={isUploading}>
                        {onSubmitTitle}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VehicleModal;
