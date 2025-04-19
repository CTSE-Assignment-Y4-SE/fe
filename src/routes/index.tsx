import {Route, Routes} from "react-router";
import Login from "../pages/common/Login/Login.tsx";
import useAuth from "../hooks/useAuth.tsx";
import Slots from "../pages/common/Slots/Slots/Slots.tsx";
import Profile from "../pages/common/Profile/Profile.tsx";
import ServiceManagerPage from "../pages/garage-owner/ServiceManagers/ServiceManagerPage.tsx";
import BookingRequestPage from "../pages/common/BookingRequets/BookingRequests/BookingRequestPage.tsx";
import VehicleOwnerVehiclePage from "../pages/vehicle-owner/Vehicles/VehicleOwnerVehiclePage.tsx";
import VehicleOwnerPage from "../pages/garage-owner/VehicleOwners/VehicleOwnersPage.tsx";
import SignUp from "../pages/common/SignUp/Signup.tsx";
import ForgotPassword from "../pages/common/ForgotPassword/ForgotPassword.tsx";

const AnimatedRoutes = () => {

    useAuth();

    return (
        <Routes>
            <Route index path="/" element={<Login/>}/>
            <Route path="/signup" element={<SignUp/>}/>
            <Route path="/slots" element={<Slots/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/requests" element=<BookingRequestPage/>/>
            <Route path="/forgot-password" element={<ForgotPassword/>}/>

            {/* vehicle owner */}
            <Route path="/vehicles" element={<VehicleOwnerVehiclePage/>}/>

            {/* garage admin routes */}
            <Route path="/service-managers" element={<ServiceManagerPage/>}/>
            <Route path="/vehicle-owners" element={<VehicleOwnerPage/>}/>

        </Routes>
    );
}

export default AnimatedRoutes;
