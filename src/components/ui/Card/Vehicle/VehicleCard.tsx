import React from "react";
import {Vehicle} from "../../../../types/index.type.ts";
import {Card} from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons";
import "./VehicleCard.css";

const {Meta} = Card;

interface VehicleCardProps {
    vehicle: Vehicle;
    onEdit: (vehicle: Vehicle) => void;
    onDelete: (vehicleId: number) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({vehicle, onEdit, onDelete}) => {
    return (
        <Card
            style={{width: 300, margin: 10}}
            cover={
                <img
                    alt="car"
                src={vehicle.image ? vehicle.image : "https://via.placeholder.com/300x200?text=No+Image"}
                    style={{height: 200, objectFit: "cover"}}
                />
            }
            actions={[
                <EditOutlined key="edit" onClick={() => onEdit(vehicle)}/>,
                <DeleteOutlined key="delete" onClick={() => onDelete(vehicle.vehicleId)}/>,
            ]}
        >
            <Meta
                title={`${vehicle.brand} ${vehicle.model}`}
                description={
                    <>
                        <p><strong>Year:</strong> {vehicle.year}</p>
                        <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
                    </>
                }
            />
        </Card>
    );
};

export default VehicleCard;
