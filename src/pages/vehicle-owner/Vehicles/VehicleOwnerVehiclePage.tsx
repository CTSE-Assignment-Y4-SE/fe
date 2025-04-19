import { useEffect, useState } from "react";
import { addVehicle, deleteVehicle, fetchVehicles, updateVehicle } from "../../../services/vehicle.service.ts";
import { Button, message, Modal, Spin } from "antd";
import "./Vehicle.css";
import VehicleModal from "../../../components/ui/Modal/Vehicle/VehicleModal.tsx";
import VehicleCard from "../../../components/ui/Card/Vehicle/VehicleCard.tsx";
import { Vehicle } from "../../../types/index.type.ts";
import {AxiosError} from "axios";
import {ErrorResponse} from "react-router";

const VehicleOwnerVehiclePage = () => {
    const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

    useEffect(() => {
        const getVehicles = async () => {
            try {
                const response = await fetchVehicles();
                setVehicles(response.data.results);
            } catch (err) {
                console.error("Error fetching vehicles:", err);
                setError("Failed to fetch vehicles");
            }
        };

        getVehicles();
    }, []);

    const handleAddVehicle = async (values: Record<string, unknown>) => {
        const { brand, model, year, licensePlate, image } = values;
        try {
            const response = await addVehicle({ brand, model, year, licensePlate, image });
            message.success("Vehicle added successfully!");
            setVehicles((prevVehicles) =>
                prevVehicles ? [...prevVehicles, response.data.results[0]] : [response.data.results[0]]
            );
            setIsModalVisible(false);
        } catch (err) {
            console.error("Error adding vehicle:", err);
            message.error("Failed to add vehicle.");
        }
    };

    const handleEditVehicle = async (values: Record<string, unknown>) => {
        if (!editingVehicle) return;
        const updatedVehicle = { ...editingVehicle, ...values };
        try {
            await updateVehicle(editingVehicle.vehicleId, updatedVehicle);
            setVehicles((prevVehicles) =>
                prevVehicles?.map((vehicle) =>
                    vehicle.vehicleId === editingVehicle.vehicleId ? updatedVehicle : vehicle
                ) || null
            );
            message.success("Vehicle updated successfully!");
            setIsModalVisible(false);
            setEditingVehicle(null);
        } catch (err) {
            console.error("Error updating vehicle:", err);
            message.error("Failed to update vehicle.");
        }
    };

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsModalVisible(true);
    };

    const handleDelete = async (vehicleId: number) => {
        Modal.confirm({
            title: "Are you sure?",
            content: "You won't be able to revert this!",
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: async () => {
                try {
                    await deleteVehicle(vehicleId.toString());
                    message.success("Vehicle has been deleted.");
                    setVehicles((prevVehicles) =>
                        prevVehicles?.filter((vehicle) => vehicle.vehicleId !== vehicleId) || null
                    );
                } catch (error) {
                    const axiosError = error as AxiosError<ErrorResponse>;
                    const errorMessage =
                        axiosError.response?.data?.results?.[0]?.message ||
                        "An unexpected error occurred. Please try again.";
                    message.error(errorMessage);
                }
            },
        });
    };

    if (error) {
        return <div style={{ color: "red" }}>{error}</div>;
    }

    if (!vehicles) {
        return <Spin />;
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Manage Your Vehicles</h1>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Add New Vehicle
            </Button>

            <VehicleModal
                key={editingVehicle?.vehicleId || "new"}
                title={editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
                onSubmitTitle={editingVehicle ? "Update" : "Add"}
                visible={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingVehicle(null);
                }}
                onSubmit={editingVehicle ? handleEditVehicle : handleAddVehicle}
                initialValues={editingVehicle ? { ...editingVehicle } : undefined}
            />

            <div className="vehicle-grid">
                {vehicles.map((vehicle) => (
                    <VehicleCard
                        key={vehicle.vehicleId}
                        vehicle={vehicle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default VehicleOwnerVehiclePage;
