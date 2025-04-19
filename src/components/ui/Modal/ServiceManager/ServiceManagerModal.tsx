import {Form, Input, Modal} from "antd";

interface ServiceManagerModalProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: { email: string }) => void;
    title: string;
}

const ServiceManagerModal: React.FC<ServiceManagerModalProps> = ({
                                                                     visible,
                                                                     onCancel,
                                                                     onSubmit,
                                                                     title,
                                                                 }) => {
    const [form] = Form.useForm();

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title={title}
            open={visible}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {required: true, message: "Please enter an email address."},
                        {type: "email", message: "Please enter a valid email address."},
                    ]}
                >
                    <Input placeholder="Enter email address"/>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ServiceManagerModal;
