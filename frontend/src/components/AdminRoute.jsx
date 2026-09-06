import React from "react";
import {
    Navigate
} from "react-router-dom";

import {
    getToken,
    getUser
} from "../utils/auth";

function AdminRoute({
    children
}) {
    const token = getToken();
    const user = getUser();

    if (
        !token ||
        !user
    ) {
        return (
            <Navigate
                to="/portal?mode=login"
                replace
            />
        );
    }

    const role = String(
        user.role || ""
    ).toLowerCase();

    if (
        ![
            "admin",
            "manager"
        ].includes(role)
    ) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}

export default AdminRoute;