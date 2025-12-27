import { useApp } from "@/contexts/AppContext";
import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoute() {
    const { user, isAuthLoading, isAuthError } = useApp();

    if (isAuthLoading) {
        return <div>Loading...</div>;
    }

    if (isAuthError || !user) return <Navigate to="/login" replace />;

    return <Outlet />
}

export default ProtectedRoute;
