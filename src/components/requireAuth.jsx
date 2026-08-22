import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/me", {
                    credentials: "include"
                });
                setStatus(response.ok ? "authenticated" : "unauthenticated");
            } catch (error) {
                setStatus("unauthenticated");
            }
        };
        checkAuth();
    }, []);

    if (status === "loading") {
        return null;
    }

    if (status === "unauthenticated") {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default RequireAuth;