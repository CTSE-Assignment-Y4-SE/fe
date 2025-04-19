import {useNavigate} from "react-router";
import {useDispatch} from "react-redux";
import {jwtDecode} from "jwt-decode";
import {useEffect} from "react";
import {setAuthUser} from "../store/user.ts";
import {DecodedToken} from "../types/index.type.ts";

const useAuth = (): void => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const whiteListedRoutes = ["/", "/signup", "/forgot-password"];

    useEffect(() => {

        const isWhiteListed = whiteListedRoutes.includes(window.location.pathname);
        if (isWhiteListed) {
            return;
        }

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        try {
            const user = jwtDecode<DecodedToken>(token);
            dispatch(setAuthUser(user));
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            navigate("/");
        }
    }, [dispatch, navigate]);
};

export default useAuth;
