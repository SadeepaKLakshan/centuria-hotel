import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Splash from "./pages/Splash/Splash";
import Home from "./pages/Home/Home";
import Portal from "./pages/Portal/Portal";
import CustomerDashboard from "./pages/CustomerDashboard/CustomerDashboard";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminRoute from "./components/AdminRoute";

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={<Splash />}
                    />

                    <Route
                        path="/home"
                        element={<Home />}
                    />

                    <Route
                        path="/portal"
                        element={<Portal />}
                    />

                    <Route
                        path="/login"
                        element={<Portal />}
                    />

                    <Route
                        path="/register"
                        element={<Portal />}
                    />

                    <Route
                        path="/customer-dashboard"
                        element={<CustomerDashboard />}
                    />

                    <Route
                        path="/admin-dashboard"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;