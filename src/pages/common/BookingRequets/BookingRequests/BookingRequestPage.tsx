import {useSelector} from "react-redux";
import ServiceManagerBookingRequestPage from "../ServiceManager/ServiceManagerBookingRequestPage.tsx";
import VehicleOwnerBookingRequestPage from "../VehicleOwner/VehicleOwnerBookingRequestPage.tsx";
import GarageAdminBookingRequestPage from "../GarageAdmin/GarageAdminBookingRequestPage.tsx";

const BookingRequestPage = () => {

    const role = useSelector((state: { user: { authUser: { role: string } } }) => state.user.authUser.role);

    return (
        <>
            {
                role === "SERVICE_MANAGER" && (
                    <ServiceManagerBookingRequestPage/>
                )
            }

            {
                role === "VEHICLE_OWNER" && (
                    <VehicleOwnerBookingRequestPage/>
                )
            }

            {
                role === "GARAGE_ADMIN" && (
                    <GarageAdminBookingRequestPage/>
                )
            }
        </>
    );
}

export default BookingRequestPage;
