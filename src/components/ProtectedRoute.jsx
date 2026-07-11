import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

function ProtectedRoute({ children }) {
    const location = useLocation();

    if (!isAuthenticated()) {
        sessionStorage.setItem(
            "redirectAfterLogin",
            `${location.pathname}${location.search}`
        );

        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;