import {useSelector} from "react-redux";
import VehicleOwnerSlotsPage from "../VehicleOwner/VehicleOwnerSlotsPage.tsx";
import ServiceManagerSlotsPage from "../ServiceManager/ServiceManagerSlotsPage.tsx";
import GarageAdminSlotPage from "../GarageAdmin/GarageAdminSlotPage.tsx";

const Slots = () => {

    const role = useSelector((state: { user: { authUser: { role: string } } }) => state.user.authUser.role);

    return (
        <>
            {role === "SERVICE_MANAGER" && (
                <ServiceManagerSlotsPage/>
            )}

            {
                role === "VEHICLE_OWNER" && (
                    <VehicleOwnerSlotsPage/>
                )
            }

            {
                role === "GARAGE_ADMIN" && (
                    <GarageAdminSlotPage/>
                )
            }
        </>
    );
}

export default Slots;
