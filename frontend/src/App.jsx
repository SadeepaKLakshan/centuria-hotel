import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Home from "./pages/Home/Home";
import Portal from "./pages/Portal/Portal";
import CustomerDashboard from "./pages/CustomerDashboard/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Foods from "./pages/Foods/Foods";
import Spa from "./pages/Spa/Spa";
import Payment from "./pages/Payment/Payment";

import "./App.css";


function getStoredUser() {
    try {
        const rawUser =
            localStorage.getItem(
                "centuria_user"
            );

        if (!rawUser) {
            return null;
        }

        return JSON.parse(
            rawUser
        );
    } catch {
        return null;
    }
}


function getToken() {
    return (
        localStorage.getItem(
            "centuria_token"
        ) || ""
    );
}


function isLoggedIn() {
    const user =
        getStoredUser();

    const token =
        getToken();

    return Boolean(
        user &&
        token
    );
}


function CustomerRoute({
    children
}) {
    const user =
        getStoredUser();

    if (
        !isLoggedIn()
    ) {
        return (
            <Navigate
                to="/portal?mode=login"
                replace
            />
        );
    }

    const role =
        String(
            user?.role ||
            ""
        ).toLowerCase();

    if (
        role !== "customer"
    ) {
        if (
            role === "admin" ||
            role === "manager"
        ) {
            return (
                <Navigate
                    to="/admin-dashboard"
                    replace
                />
            );
        }

        return (
            <Navigate
                to="/home"
                replace
            />
        );
    }

    return children;
}


function AdminRoute({
    children
}) {
    const user =
        getStoredUser();

    if (
        !isLoggedIn()
    ) {
        return (
            <Navigate
                to="/portal?mode=login"
                replace
            />
        );
    }

    const role =
        String(
            user?.role ||
            ""
        ).toLowerCase();

    if (
        role !== "admin" &&
        role !== "manager"
    ) {
        return (
            <Navigate
                to="/customer-dashboard"
                replace
            />
        );
    }

    return children;
}


function PortalRoute() {
    const user =
        getStoredUser();

    if (
        !isLoggedIn()
    ) {
        return <Portal />;
    }

    const role =
        String(
            user?.role ||
            ""
        ).toLowerCase();

    if (
        role === "admin" ||
        role === "manager"
    ) {
        return (
            <Navigate
                to="/admin-dashboard"
                replace
            />
        );
    }

    if (
        role === "customer"
    ) {
        return (
            <Navigate
                to="/customer-dashboard"
                replace
            />
        );
    }

    return <Portal />;
}


function HomeRedirect({
    section
}) {
    return (
        <Navigate
            to={`/home${
                section
                    ? `#${section}`
                    : ""
            }`}
            replace
        />
    );
}


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/home"
                            replace
                        />
                    }
                />


                <Route
                    path="/home"
                    element={
                        <Home />
                    }
                />


                <Route
                    path="/portal"
                    element={
                        <PortalRoute />
                    }
                />


                <Route
                    path="/foods"
                    element={
                        <Foods />
                    }
                />


                <Route
                    path="/spa"
                    element={
                        <Spa />
                    }
                />


                <Route
                    path="/customer-dashboard"
                    element={
                        <CustomerRoute>
                            <CustomerDashboard />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />


                <Route
                    path="/payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/spa-payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/food-payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/room-payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/tour-payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/rooms-payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/tours-payment"
                    element={
                        <CustomerRoute>
                            <Payment />
                        </CustomerRoute>
                    }
                />


                <Route
                    path="/about"
                    element={
                        <HomeRedirect section="about" />
                    }
                />


                <Route
                    path="/rooms"
                    element={
                        <HomeRedirect section="rooms" />
                    }
                />


                <Route
                    path="/tours"
                    element={
                        <HomeRedirect section="tours" />
                    }
                />


                <Route
                    path="/offers"
                    element={
                        <HomeRedirect section="offers" />
                    }
                />


                <Route
                    path="/contact"
                    element={
                        <HomeRedirect section="contact" />
                    }
                />


                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/home"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}


export default App;