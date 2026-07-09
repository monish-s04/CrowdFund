import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const location = useLocation();

    if (!isLoggedIn) {
        localStorage.setItem("redirectAfterLogin", location.pathname);
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;