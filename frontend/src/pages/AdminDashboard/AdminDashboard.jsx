import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import {
    FaBars,
    FaBell,
    FaBed,
    FaBellConcierge,
    FaCalendarCheck,
    FaChartLine,
    FaCircleCheck,
    FaClock,
    FaComments,
    FaDoorOpen,
    FaGear,
    FaHouse,
    FaLeaf,
    FaMapLocationDot,
    FaMessage,
    FaMoneyBillWave,
    FaPeopleGroup,
    FaReceipt,
    FaRightFromBracket,
    FaRoute,
    FaStar,
    FaTags,
    FaUserGroup,
    FaUtensils,
    FaXmark
} from "react-icons/fa6";

import {
    getAuthHeaders,
    getUser,
    logout
} from "../../utils/auth";

import "./AdminDashboard.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost/centuria-hotel/backend";

const NAV_ITEMS = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: FaHouse
    },
    {
        id: "orders",
        label: "Orders",
        icon: FaReceipt
    },
    {
        id: "customers",
        label: "Customers",
        icon: FaUserGroup
    },
    {
        id: "rooms",
        label: "Rooms",
        icon: FaBed
    },
    {
        id: "dining",
        label: "Dining",
        icon: FaUtensils
    },
    {
        id: "tours",
        label: "Tours",
        icon: FaMapLocationDot
    },
    {
        id: "spa",
        label: "Spa",
        icon: FaLeaf
    },
    {
        id: "messages",
        label: "Messages",
        icon: FaMessage
    },
    {
        id: "reviews",
        label: "Reviews",
        icon: FaStar
    },
    {
        id: "reports",
        label: "Reports",
        icon: FaChartLine
    },
    {
        id: "staff",
        label: "Staff",
        icon: FaPeopleGroup
    },
    {
        id: "settings",
        label: "Settings",
        icon: FaGear
    }
];

const SERVICE_COLORS = [
    "#ff6b1a",
    "#1487e5",
    "#12b76a",
    "#7548d8",
    "#a0a7b4"
];

const STATUS_OPTIONS = [
    "pending",
    "accepted",
    "confirmed",
    "processing",
    "active",
    "completed",
    "declined",
    "cancelled"
];

function normalizeType(value = "") {
    const text = String(value).toLowerCase();

    if (
        text.includes("room") ||
        text.includes("booking")
    ) {
        return "rooms";
    }

    if (
        text.includes("food") ||
        text.includes("dining") ||
        text.includes("menu") ||
        text.includes("restaurant")
    ) {
        return "dining";
    }

    if (
        text.includes("tour") ||
        text.includes("travel") ||
        text.includes("transport")
    ) {
        return "tours";
    }

    if (
        text.includes("spa") ||
        text.includes("massage")
    ) {
        return "spa";
    }

    return "others";
}

function normalizeStatus(value = "") {
    return String(value).trim().toLowerCase();
}

function safeNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
    return new Intl.NumberFormat(
        "en-LK",
        {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0
        }
    ).format(safeNumber(value));
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString(
        "en-LK",
        {
            year: "numeric",
            month: "short",
            day: "2-digit"
        }
    );
}

function formatTime(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleTimeString(
        "en-LK",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good Morning";
    }

    if (hour < 17) {
        return "Good Afternoon";
    }

    return "Good Evening";
}

function AdminDashboard() {
    const navigate = useNavigate();

    const adminUser =
        getUser() || {
            full_name: "Admin User",
            email: "admin@centuria.lk",
            role: "admin"
        };

    const [activePage, setActivePage] =
        useState("dashboard");

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [updatingId, setUpdatingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedOrder, setSelectedOrder] =
        useState(null);

    const [clock, setClock] =
        useState(new Date());

    const [toast, setToast] =
        useState("");

    const fetchOrders = useCallback(
        async (showLoader = false) => {
            try {
                if (showLoader) {
                    setLoading(true);
                }

                setError("");

                const response =
                    await fetch(
                        `${API_URL}/admin/orders.php`,
                        {
                            method: "GET",
                            headers:
                                getAuthHeaders()
                        }
                    );

                let data = {};

                try {
                    data =
                        await response.json();
                } catch {
                    throw new Error(
                        "Invalid response from the server."
                    );
                }

                if (response.status === 401) {
                    logout();

                    navigate(
                        "/portal?mode=login",
                        {
                            replace: true
                        }
                    );

                    return;
                }

                if (
                    !response.ok ||
                    data.success === false
                ) {
                    throw new Error(
                        data.message ||
                        "Unable to load orders."
                    );
                }

                const resultOrders =
                    Array.isArray(data.orders)
                        ? data.orders
                        : Array.isArray(data.data)
                        ? data.data
                        : [];

                setOrders(resultOrders);
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Unable to connect to the server."
                );
            } finally {
                setLoading(false);
            }
        },
        [navigate]
    );

    useEffect(() => {
        fetchOrders(true);

        const polling =
            window.setInterval(
                () => {
                    fetchOrders(false);
                },
                8000
            );

        return () =>
            window.clearInterval(
                polling
            );
    }, [fetchOrders]);

    useEffect(() => {
        const timer =
            window.setInterval(
                () => {
                    setClock(
                        new Date()
                    );
                },
                1000
            );

        return () =>
            window.clearInterval(
                timer
            );
    }, []);

    const showToast = (
        message
    ) => {
        setToast(message);

        window.setTimeout(
            () => {
                setToast("");
            },
            2500
        );
    };

    const updateOrder = async (
        orderId,
        status,
        declineReason = ""
    ) => {
        try {
            setUpdatingId(orderId);

            const response =
                await fetch(
                    `${API_URL}/admin/update-order.php`,
                    {
                        method: "PATCH",
                        headers:
                            getAuthHeaders(),
                        body:
                            JSON.stringify({
                                order_id:
                                    Number(
                                        orderId
                                    ),
                                status,
                                decline_reason:
                                    declineReason
                            })
                    }
                );

            const data =
                await response.json();

            if (response.status === 401) {
                logout();

                navigate(
                    "/portal?mode=login",
                    {
                        replace: true
                    }
                );

                return;
            }

            if (
                !response.ok ||
                data.success === false
            ) {
                throw new Error(
                    data.message ||
                    "Unable to update the order."
                );
            }

            showToast(
                `Order #${orderId} updated to ${status}.`
            );

            await fetchOrders(false);

            if (
                selectedOrder &&
                Number(
                    selectedOrder.id
                ) === Number(orderId)
            ) {
                setSelectedOrder(
                    (current) => ({
                        ...current,
                        status
                    })
                );
            }
        } catch (requestError) {
            showToast(
                requestError.message ||
                "Order update failed."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAccept = (
        order
    ) => {
        updateOrder(
            order.id,
            "accepted"
        );
    };

    const handleDecline = (
        order
    ) => {
        const reason =
            window.prompt(
                "Enter the reason for declining this order:"
            );

        if (reason === null) {
            return;
        }

        if (!reason.trim()) {
            showToast(
                "Please enter a decline reason."
            );

            return;
        }

        updateOrder(
            order.id,
            "declined",
            reason.trim()
        );
    };

    const totalOrders =
        orders.length;

    const pendingOrders =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.status
                ) === "pending"
        ).length;

    const activeOrders =
        orders.filter((order) =>
            [
                "accepted",
                "confirmed",
                "processing",
                "active"
            ].includes(
                normalizeStatus(
                    order.status
                )
            )
        ).length;

    const completedOrders =
        orders.filter(
            (order) =>
                normalizeStatus(
                    order.status
                ) === "completed"
        ).length;

    const completedRevenue =
        orders
            .filter(
                (order) =>
                    normalizeStatus(
                        order.status
                    ) === "completed"
            )
            .reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    safeNumber(
                        order.total_amount ??
                        order.amount ??
                        order.total
                    ),
                0
            );

    const customers =
        useMemo(() => {
            const map =
                new Map();

            orders.forEach(
                (order) => {
                    const id =
                        order.user_id ??
                        order.customer_id ??
                        order.customer_email ??
                        order.email ??
                        order.customer_name;

                    if (!id) {
                        return;
                    }

                    if (
                        !map.has(id)
                    ) {
                        map.set(
                            id,
                            {
                                id,
                                name:
                                    order.customer_name ??
                                    order.full_name ??
                                    order.name ??
                                    "Customer",
                                email:
                                    order.customer_email ??
                                    order.email ??
                                    "-",
                                phone:
                                    order.customer_phone ??
                                    order.phone ??
                                    "-",
                                orders: 0,
                                totalSpent: 0
                            }
                        );
                    }

                    const customer =
                        map.get(id);

                    customer.orders += 1;

                    customer.totalSpent +=
                        safeNumber(
                            order.total_amount ??
                            order.amount ??
                            order.total
                        );
                }
            );

            return Array.from(
                map.values()
            );
        }, [orders]);

    const weeklyActivity =
        useMemo(() => {
            const days = [
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat"
            ];

            const today =
                new Date();

            const result = [];

            for (
                let offset = 6;
                offset >= 0;
                offset -= 1
            ) {
                const date =
                    new Date(today);

                date.setHours(
                    0,
                    0,
                    0,
                    0
                );

                date.setDate(
                    today.getDate() -
                    offset
                );

                const next =
                    new Date(date);

                next.setDate(
                    date.getDate() + 1
                );

                const count =
                    orders.filter(
                        (order) => {
                            const source =
                                order.created_at ??
                                order.order_date ??
                                order.createdAt;

                            if (!source) {
                                return false;
                            }

                            const created =
                                new Date(
                                    source
                                );

                            return (
                                created >=
                                    date &&
                                created <
                                    next
                            );
                        }
                    ).length;

                result.push({
                    day:
                        days[
                            date.getDay()
                        ],
                    orders: count
                });
            }

            return result;
        }, [orders]);

    const serviceData =
        useMemo(() => {
            const counts = {
                rooms: 0,
                dining: 0,
                tours: 0,
                spa: 0,
                others: 0
            };

            orders.forEach(
                (order) => {
                    const type =
                        normalizeType(
                            order.order_type ??
                            order.service_type ??
                            order.type ??
                            order.title
                        );

                    counts[type] += 1;
                }
            );

            return [
                {
                    name: "Rooms",
                    value:
                        counts.rooms
                },
                {
                    name: "Dining",
                    value:
                        counts.dining
                },
                {
                    name: "Tours",
                    value:
                        counts.tours
                },
                {
                    name: "Spa",
                    value:
                        counts.spa
                },
                {
                    name: "Others",
                    value:
                        counts.others
                }
            ];
        }, [orders]);

    const roomOrders =
        serviceData[0].value;

    const diningOrders =
        serviceData[1].value;

    const tourOrders =
        serviceData[2].value;

    const spaOrders =
        serviceData[3].value;

    const pageFilteredOrders =
        useMemo(() => {
            let data = [
                ...orders
            ];

            if (
                [
                    "rooms",
                    "dining",
                    "tours",
                    "spa"
                ].includes(
                    activePage
                )
            ) {
                data =
                    data.filter(
                        (order) =>
                            normalizeType(
                                order.order_type ??
                                order.service_type ??
                                order.type ??
                                order.title
                            ) ===
                            activePage
                    );
            }

            if (
                statusFilter !==
                "all"
            ) {
                data =
                    data.filter(
                        (order) =>
                            normalizeStatus(
                                order.status
                            ) ===
                            statusFilter
                    );
            }

            const keyword =
                search
                    .trim()
                    .toLowerCase();

            if (keyword) {
                data =
                    data.filter(
                        (order) => {
                            const text =
                                [
                                    order.id,
                                    order.order_number,
                                    order.customer_name,
                                    order.customer_email,
                                    order.email,
                                    order.order_type,
                                    order.service_type,
                                    order.title,
                                    order.status
                                ]
                                    .join(
                                        " "
                                    )
                                    .toLowerCase();

                            return text.includes(
                                keyword
                            );
                        }
                    );
            }

            return data;
        }, [
            orders,
            activePage,
            search,
            statusFilter
        ]);

    const recentOrders =
        pageFilteredOrders.slice(
            0,
            7
        );

    const setPage = (
        page
    ) => {
        setActivePage(page);
        setSidebarOpen(false);
        setSearch("");
        setStatusFilter("all");
    };

    const handleLogout = () => {
        logout();

        navigate(
            "/portal?mode=login",
            {
                replace: true
            }
        );
    };

    const stats = [
        {
            label: "Total Orders",
            value: totalOrders,
            icon: FaCalendarCheck,
            className: "purple"
        },
        {
            label: "Pending Requests",
            value: pendingOrders,
            icon: FaClock,
            className: "orange"
        },
        {
            label: "Active Orders",
            value: activeOrders,
            icon: FaRoute,
            className: "blue"
        },
        {
            label: "Completed",
            value: completedOrders,
            icon: FaCircleCheck,
            className: "green"
        }
    ];

    const renderStatus =
        (status) => {
            const clean =
                normalizeStatus(
                    status
                );

            return (
                <span
                    className={`admin-status ${clean}`}
                >
                    {clean ||
                        "unknown"}
                </span>
            );
        };

    const renderOrderTable =
        (
            title =
                "Recent Orders / Requests",
            data =
                recentOrders
        ) => (
            <section className="admin-card admin-orders-card">
                <div className="admin-section-heading">
                    <div>
                        <h3>
                            {title}
                        </h3>

                        <p>
                            Latest customer
                            requests across
                            Centuria services
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-outline-btn"
                        onClick={() =>
                            setPage(
                                "orders"
                            )
                        }
                    >
                        View All
                    </button>
                </div>

                <div className="admin-table-wrap">
                    <table className="admin-orders-table">
                        <thead>
                            <tr>
                                <th>
                                    #
                                </th>
                                <th>
                                    Customer
                                </th>
                                <th>
                                    Service
                                </th>
                                <th>
                                    Details
                                </th>
                                <th>
                                    Amount
                                </th>
                                <th>
                                    Status
                                </th>
                                <th>
                                    Date
                                </th>
                                <th>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="admin-empty-cell"
                                    >
                                        Loading
                                        orders...
                                    </td>
                                </tr>
                            ) : data.length ===
                              0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="admin-empty-cell"
                                    >
                                        No
                                        orders
                                        found.
                                    </td>
                                </tr>
                            ) : (
                                data.map(
                                    (
                                        order
                                    ) => {
                                        const status =
                                            normalizeStatus(
                                                order.status
                                            );

                                        const service =
                                            normalizeType(
                                                order.order_type ??
                                                order.service_type ??
                                                order.type ??
                                                order.title
                                            );

                                        return (
                                            <tr
                                                key={
                                                    order.id
                                                }
                                            >
                                                <td className="admin-order-number">
                                                    #
                                                    {order.id}
                                                </td>

                                                <td>
                                                    <div className="admin-customer-cell">
                                                        <div className="admin-avatar">
                                                            {String(
                                                                order.customer_name ??
                                                                order.full_name ??
                                                                "C"
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {order.customer_name ??
                                                                    order.full_name ??
                                                                    "Customer"}
                                                            </strong>

                                                            <span>
                                                                {order.customer_email ??
                                                                    order.email ??
                                                                    "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className={`admin-service-tag ${service}`}>
                                                        {service ===
                                                            "rooms" && (
                                                            <FaBed />
                                                        )}

                                                        {service ===
                                                            "dining" && (
                                                            <FaUtensils />
                                                        )}

                                                        {service ===
                                                            "tours" && (
                                                            <FaMapLocationDot />
                                                        )}

                                                        {service ===
                                                            "spa" && (
                                                            <FaLeaf />
                                                        )}

                                                        {service ===
                                                            "others" && (
                                                            <FaTags />
                                                        )}

                                                        <span>
                                                            {order.order_type ??
                                                                order.service_type ??
                                                                order.type ??
                                                                "Service"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-order-details">
                                                        <strong>
                                                            {order.title ??
                                                                order.order_title ??
                                                                "Customer Request"}
                                                        </strong>

                                                        <span>
                                                            {order.description ??
                                                                order.notes ??
                                                                order.special_request ??
                                                                "View full details"}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="admin-amount">
                                                    {formatMoney(
                                                        order.total_amount ??
                                                        order.amount ??
                                                        order.total
                                                    )}
                                                </td>

                                                <td>
                                                    {renderStatus(
                                                        order.status
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="admin-date-cell">
                                                        <span>
                                                            {formatDate(
                                                                order.created_at ??
                                                                order.order_date
                                                            )}
                                                        </span>

                                                        <small>
                                                            {formatTime(
                                                                order.created_at ??
                                                                order.order_date
                                                            )}
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="admin-table-actions">
                                                        {status ===
                                                            "pending" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="admin-accept-btn"
                                                                    disabled={
                                                                        updatingId ===
                                                                        order.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleAccept(
                                                                            order
                                                                        )
                                                                    }
                                                                >
                                                                    Accept
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="admin-decline-btn"
                                                                    disabled={
                                                                        updatingId ===
                                                                        order.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDecline(
                                                                            order
                                                                        )
                                                                    }
                                                                >
                                                                    Decline
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="admin-view-btn"
                                                            onClick={() =>
                                                                setSelectedOrder(
                                                                    order
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        );

    const renderDashboard =
        () => (
            <>
                <section className="admin-hero">
                    <div className="admin-hero-overlay" />

                    <div className="admin-hero-content">
                        <span className="admin-hero-small">
                            CENTURIA LAKE
                            RESORT
                        </span>

                        <h1>
                            {getGreeting()},
                            <br />
                            {adminUser.full_name ??
                                adminUser.name ??
                                "Admin"}
                            ! 👋
                        </h1>

                        <p>
                            Manage your hotel,
                            dining, tours, spa
                            and customer requests
                            in one place.
                        </p>

                        <em>
                            “Create
                            Unforgettable
                            Experiences”
                        </em>
                    </div>

                    <div className="admin-date-panel">
                        <span>
                            {clock.toLocaleDateString(
                                "en-US",
                                {
                                    weekday:
                                        "long"
                                }
                            )}
                        </span>

                        <small>
                            {clock.toLocaleDateString(
                                "en-US",
                                {
                                    month:
                                        "short",
                                    day:
                                        "2-digit",
                                    year:
                                        "numeric"
                                }
                            )}
                        </small>

                        <strong>
                            {clock.toLocaleTimeString(
                                "en-US",
                                {
                                    hour:
                                        "2-digit",
                                    minute:
                                        "2-digit"
                                }
                            )}
                        </strong>

                        <p>
                            Embilipitiya,
                            Sri Lanka
                        </p>
                    </div>
                </section>

                <section className="admin-service-stats">
                    <button
                        type="button"
                        onClick={() =>
                            setPage(
                                "orders"
                            )
                        }
                    >
                        <div className="service-stat-icon orange">
                            <FaReceipt />
                        </div>

                        <div>
                            <span>
                                Total Orders
                            </span>
                            <strong>
                                {totalOrders}
                            </strong>
                            <small>
                                All requests
                            </small>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setPage(
                                "customers"
                            )
                        }
                    >
                        <div className="service-stat-icon red">
                            <FaUserGroup />
                        </div>

                        <div>
                            <span>
                                Total Customers
                            </span>
                            <strong>
                                {customers.length}
                            </strong>
                            <small>
                                Active customers
                            </small>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setPage(
                                "rooms"
                            )
                        }
                    >
                        <div className="service-stat-icon orange">
                            <FaBed />
                        </div>

                        <div>
                            <span>
                                Room Bookings
                            </span>
                            <strong>
                                {roomOrders}
                            </strong>
                            <small>
                                Customer requests
                            </small>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setPage(
                                "dining"
                            )
                        }
                    >
                        <div className="service-stat-icon orange">
                            <FaUtensils />
                        </div>

                        <div>
                            <span>
                                Dining Orders
                            </span>
                            <strong>
                                {diningOrders}
                            </strong>
                            <small>
                                Food requests
                            </small>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setPage(
                                "tours"
                            )
                        }
                    >
                        <div className="service-stat-icon orange">
                            <FaMapLocationDot />
                        </div>

                        <div>
                            <span>
                                Tour Bookings
                            </span>
                            <strong>
                                {tourOrders}
                            </strong>
                            <small>
                                Travel requests
                            </small>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setPage(
                                "spa"
                            )
                        }
                    >
                        <div className="service-stat-icon orange">
                            <FaLeaf />
                        </div>

                        <div>
                            <span>
                                Spa Bookings
                            </span>
                            <strong>
                                {spaOrders}
                            </strong>
                            <small>
                                Wellness requests
                            </small>
                        </div>
                    </button>
                </section>

                <section className="admin-main-grid">
                    {renderOrderTable()}

                    <div className="admin-side-charts">
                        <section className="admin-card admin-chart-card">
                            <div className="admin-section-heading compact">
                                <div>
                                    <h3>
                                        Order
                                        Overview
                                    </h3>
                                </div>

                                <span className="admin-period-pill">
                                    This Week
                                </span>
                            </div>

                            <div className="admin-small-chart">
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >
                                    <AreaChart
                                        data={
                                            weeklyActivity
                                        }
                                    >
                                        <defs>
                                            <linearGradient
                                                id="orderOverviewGradient"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#ff6b1a"
                                                    stopOpacity={
                                                        0.34
                                                    }
                                                />

                                                <stop
                                                    offset="100%"
                                                    stopColor="#ff6b1a"
                                                    stopOpacity={
                                                        0.02
                                                    }
                                                />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid
                                            strokeDasharray="4 4"
                                            vertical={
                                                false
                                            }
                                        />

                                        <XAxis
                                            dataKey="day"
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                        />

                                        <YAxis
                                            allowDecimals={
                                                false
                                            }
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                        />

                                        <Tooltip />

                                        <Area
                                            type="monotone"
                                            dataKey="orders"
                                            stroke="#ff6b1a"
                                            strokeWidth={
                                                3
                                            }
                                            fill="url(#orderOverviewGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        <section className="admin-card admin-breakdown-card">
                            <div className="admin-section-heading compact">
                                <div>
                                    <h3>
                                        Service
                                        Breakdown
                                    </h3>
                                </div>

                                <span className="admin-period-pill">
                                    Live Data
                                </span>
                            </div>

                            <div className="admin-breakdown-content">
                                <div className="admin-pie-wrap">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={
                                                    serviceData
                                                }
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={
                                                    50
                                                }
                                                outerRadius={
                                                    78
                                                }
                                                paddingAngle={
                                                    1
                                                }
                                            >
                                                {serviceData.map(
                                                    (
                                                        entry,
                                                        index
                                                    ) => (
                                                        <Cell
                                                            key={
                                                                entry.name
                                                            }
                                                            fill={
                                                                SERVICE_COLORS[
                                                                    index
                                                                ]
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Pie>

                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    <div className="admin-pie-center">
                                        <strong>
                                            {totalOrders}
                                        </strong>

                                        <span>
                                            Total
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-chart-legend">
                                    {serviceData.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    item.name
                                                }
                                            >
                                                <span
                                                    style={{
                                                        background:
                                                            SERVICE_COLORS[
                                                                index
                                                            ]
                                                    }}
                                                />

                                                <p>
                                                    {
                                                        item.name
                                                    }
                                                </p>

                                                <strong>
                                                    {
                                                        item.value
                                                    }
                                                </strong>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </section>

                <section className="admin-bottom-grid">
                    <section className="admin-card admin-quick-card">
                        <h3>
                            Quick Actions
                        </h3>

                        <div className="admin-quick-actions">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        "rooms"
                                    )
                                }
                            >
                                <span>
                                    <FaBed />
                                </span>
                                Rooms
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        "tours"
                                    )
                                }
                            >
                                <span>
                                    <FaMapLocationDot />
                                </span>
                                Tours
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        "dining"
                                    )
                                }
                            >
                                <span>
                                    <FaUtensils />
                                </span>
                                Dining
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        "messages"
                                    )
                                }
                            >
                                <span>
                                    <FaComments />
                                </span>
                                Messages
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPage(
                                        "reports"
                                    )
                                }
                            >
                                <span>
                                    <FaChartLine />
                                </span>
                                Reports
                            </button>
                        </div>
                    </section>

                    <section className="admin-resort-banner">
                        <div>
                            <h3>
                                Centuria Lake
                                Resort
                            </h3>

                            <p>
                                More than a
                                stay, a story to
                                remember.
                            </p>
                        </div>
                    </section>

                    <section className="admin-card admin-system-card">
                        <h3>
                            System Status
                        </h3>

                        <div>
                            <span />
                            Server
                            <strong>
                                Online
                            </strong>
                        </div>

                        <div>
                            <span />
                            Database
                            <strong>
                                Online
                            </strong>
                        </div>

                        <div>
                            <span />
                            Order API
                            <strong>
                                Online
                            </strong>
                        </div>

                        <div>
                            <span />
                            All Systems
                            <strong>
                                Operational
                            </strong>
                        </div>
                    </section>
                </section>
            </>
        );

    const renderStatsRow =
        () => (
            <section className="admin-top-stats">
                {stats.map(
                    (stat) => {
                        const Icon =
                            stat.icon;

                        return (
                            <article
                                className="admin-top-stat"
                                key={
                                    stat.label
                                }
                            >
                                <div
                                    className={`admin-top-stat-icon ${stat.className}`}
                                >
                                    <Icon />
                                </div>

                                <div>
                                    <span>
                                        {
                                            stat.label
                                        }
                                    </span>

                                    <strong>
                                        {
                                            stat.value
                                        }
                                    </strong>
                                </div>
                            </article>
                        );
                    }
                )}

                <article className="admin-top-stat revenue">
                    <div className="admin-top-stat-icon gold">
                        <FaMoneyBillWave />
                    </div>

                    <div>
                        <span>
                            Completed
                            Revenue
                        </span>

                        <strong>
                            {formatMoney(
                                completedRevenue
                            )}
                        </strong>
                    </div>
                </article>
            </section>
        );

    const renderWeeklyActivity =
        () => (
            <section className="admin-card admin-weekly-card">
                <div className="admin-section-heading">
                    <div>
                        <span className="admin-section-kicker">
                            PERFORMANCE
                        </span>

                        <h3>
                            Weekly Activity
                        </h3>
                    </div>

                    <FaChartLine className="admin-weekly-icon" />
                </div>

                <div className="admin-weekly-chart">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={
                                weeklyActivity
                            }
                            margin={{
                                top: 10,
                                right: 18,
                                left: 0,
                                bottom: 0
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="weeklyGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#6f54ff"
                                        stopOpacity={
                                            0.42
                                        }
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#6f54ff"
                                        stopOpacity={
                                            0.02
                                        }
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="5 5"
                                vertical={
                                    false
                                }
                            />

                            <XAxis
                                dataKey="day"
                                tickLine={
                                    false
                                }
                            />

                            <YAxis
                                allowDecimals={
                                    false
                                }
                                tickLine={
                                    false
                                }
                            />

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="orders"
                                stroke="#6f54ff"
                                strokeWidth={
                                    4
                                }
                                fill="url(#weeklyGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>
        );

    const renderCustomers =
        () => (
            <>
                {renderStatsRow()}

                <section className="admin-card admin-data-card">
                    <div className="admin-section-heading">
                        <div>
                            <span className="admin-section-kicker">
                                CUSTOMERS
                            </span>

                            <h3>
                                Customer
                                Directory
                            </h3>

                            <p>
                                Generated from
                                customer order
                                records
                            </p>
                        </div>
                    </div>

                    <div className="admin-table-wrap">
                        <table className="admin-orders-table">
                            <thead>
                                <tr>
                                    <th>
                                        Customer
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                    <th>
                                        Phone
                                    </th>
                                    <th>
                                        Orders
                                    </th>
                                    <th>
                                        Total
                                        Value
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {customers.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="admin-empty-cell"
                                        >
                                            No
                                            customer
                                            records
                                            available.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map(
                                        (
                                            customer
                                        ) => (
                                            <tr
                                                key={
                                                    customer.id
                                                }
                                            >
                                                <td>
                                                    <strong>
                                                        {
                                                            customer.name
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        customer.email
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        customer.phone
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        customer.orders
                                                    }
                                                </td>

                                                <td className="admin-amount">
                                                    {formatMoney(
                                                        customer.totalSpent
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </>
        );

    const renderReports =
        () => (
            <>
                {renderStatsRow()}

                {renderWeeklyActivity()}

                <section className="admin-report-grid">
                    <section className="admin-card">
                        <div className="admin-section-heading">
                            <div>
                                <span className="admin-section-kicker">
                                    SERVICES
                                </span>

                                <h3>
                                    Service
                                    Performance
                                </h3>
                            </div>
                        </div>

                        <div className="admin-report-bars">
                            {serviceData.map(
                                (
                                    item,
                                    index
                                ) => {
                                    const percentage =
                                        totalOrders >
                                        0
                                            ? Math.round(
                                                  (item.value /
                                                      totalOrders) *
                                                      100
                                              )
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                item.name
                                            }
                                        >
                                            <div className="admin-report-label">
                                                <span>
                                                    {
                                                        item.name
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        item.value
                                                    }{" "}
                                                    (
                                                    {
                                                        percentage
                                                    }
                                                    %)
                                                </strong>
                                            </div>

                                            <div className="admin-report-track">
                                                <span
                                                    style={{
                                                        width: `${percentage}%`,
                                                        background:
                                                            SERVICE_COLORS[
                                                                index
                                                            ]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </section>

                    <section className="admin-card admin-revenue-card">
                        <div>
                            <span>
                                Completed
                                Revenue
                            </span>

                            <strong>
                                {formatMoney(
                                    completedRevenue
                                )}
                            </strong>

                            <p>
                                Based on
                                completed
                                customer
                                orders.
                            </p>
                        </div>

                        <FaMoneyBillWave />
                    </section>
                </section>
            </>
        );

    const renderNotConnected =
        (
            title,
            description,
            Icon
        ) => (
            <>
                {renderStatsRow()}

                <section className="admin-card admin-empty-module">
                    <div className="admin-empty-module-icon">
                        <Icon />
                    </div>

                    <h2>
                        {title}
                    </h2>

                    <p>
                        {description}
                    </p>

                    <button
                        type="button"
                        className="admin-primary-btn"
                        onClick={() =>
                            setPage(
                                "dashboard"
                            )
                        }
                    >
                        Back to Dashboard
                    </button>
                </section>

                {renderWeeklyActivity()}
            </>
        );

    const renderPageContent =
        () => {
            if (
                activePage ===
                "dashboard"
            ) {
                return renderDashboard();
            }

            if (
                activePage ===
                "customers"
            ) {
                return renderCustomers();
            }

            if (
                activePage ===
                "reports"
            ) {
                return renderReports();
            }

            if (
                [
                    "orders",
                    "rooms",
                    "dining",
                    "tours",
                    "spa"
                ].includes(
                    activePage
                )
            ) {
                const labels = {
                    orders:
                        "All Customer Orders",
                    rooms:
                        "Room Bookings",
                    dining:
                        "Dining Orders",
                    tours:
                        "Tour Bookings",
                    spa:
                        "Spa Bookings"
                };

                return (
                    <>
                        {renderStatsRow()}

                        <section className="admin-filter-row">
                            <div className="admin-page-heading">
                                <span>
                                    CENTURIA
                                    MANAGEMENT
                                </span>

                                <h2>
                                    {
                                        labels[
                                            activePage
                                        ]
                                    }
                                </h2>
                            </div>

                            <div className="admin-filter-controls">
                                <input
                                    type="search"
                                    placeholder="Search customer, order, service..."
                                    value={
                                        search
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                                <select
                                    value={
                                        statusFilter
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setStatusFilter(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    <option value="all">
                                        All
                                        Statuses
                                    </option>

                                    {STATUS_OPTIONS.map(
                                        (
                                            status
                                        ) => (
                                            <option
                                                key={
                                                    status
                                                }
                                                value={
                                                    status
                                                }
                                            >
                                                {
                                                    status
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </section>

                        {renderOrderTable(
                            labels[
                                activePage
                            ],
                            pageFilteredOrders
                        )}

                        {renderWeeklyActivity()}
                    </>
                );
            }

            if (
                activePage ===
                "messages"
            ) {
                return renderNotConnected(
                    "Messages",
                    "The Messages interface is ready. The conversations/messages database tables exist, but the admin message API endpoint must be connected before live chat records can be loaded.",
                    FaMessage
                );
            }

            if (
                activePage ===
                "reviews"
            ) {
                return renderNotConnected(
                    "Guest Reviews",
                    "The Reviews page is ready for integration. A review API and review database workflow are required for live guest reviews.",
                    FaStar
                );
            }

            if (
                activePage ===
                "staff"
            ) {
                return renderNotConnected(
                    "Staff Management",
                    "The staff interface is ready. A dedicated staff listing and management endpoint is required for database CRUD.",
                    FaPeopleGroup
                );
            }

            return renderNotConnected(
                "Admin Settings",
                "Account settings can be connected to a dedicated profile and security API in the next backend stage.",
                FaGear
            );
        };

    return (
        <div className="admin-dashboard">
            <aside
                className={`admin-sidebar ${
                    sidebarOpen
                        ? "open"
                        : ""
                }`}
            >
                <div className="admin-logo">
                    <div className="admin-logo-mark">
                        <FaLeaf />
                    </div>

                    <div>
                        <strong>
                            CENTURIA
                        </strong>

                        <span>
                            LAKE RESORT
                        </span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {NAV_ITEMS.map(
                        (item) => {
                            const Icon =
                                item.icon;

                            return (
                                <button
                                    key={
                                        item.id
                                    }
                                    type="button"
                                    className={
                                        activePage ===
                                        item.id
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setPage(
                                            item.id
                                        )
                                    }
                                >
                                    <Icon />

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>

                                    {item.id ===
                                        "orders" &&
                                        pendingOrders >
                                            0 && (
                                            <b>
                                                {
                                                    pendingOrders
                                                }
                                            </b>
                                        )}
                                </button>
                            );
                        }
                    )}
                </nav>

                <div className="admin-user-card">
                    <div className="admin-user-avatar">
                        {String(
                            adminUser.full_name ??
                            adminUser.name ??
                            "A"
                        )
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div>
                        <strong>
                            {adminUser.full_name ??
                                adminUser.name ??
                                "Admin User"}
                        </strong>

                        <span>
                            {adminUser.email ??
                                "admin@centuria.lk"}
                        </span>
                    </div>

                    <button
                        type="button"
                        title="Logout"
                        onClick={
                            handleLogout
                        }
                    >
                        <FaRightFromBracket />
                    </button>
                </div>
            </aside>

            {sidebarOpen && (
                <button
                    className="admin-sidebar-backdrop"
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() =>
                        setSidebarOpen(
                            false
                        )
                    }
                />
            )}

            <main className="admin-main">
                <header className="admin-topbar">
                    <div className="admin-topbar-left">
                        <button
                            type="button"
                            className="admin-menu-btn"
                            onClick={() =>
                                setSidebarOpen(
                                    (
                                        current
                                    ) =>
                                        !current
                                )
                            }
                        >
                            {sidebarOpen ? (
                                <FaXmark />
                            ) : (
                                <FaBars />
                            )}
                        </button>

                        <div className="admin-global-search">
                            <input
                                type="search"
                                placeholder="Search orders, customers, rooms..."
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="admin-topbar-user">
                        <button
                            type="button"
                            className="admin-notification-btn"
                            onClick={() =>
                                setPage(
                                    "orders"
                                )
                            }
                        >
                            <FaBell />

                            {pendingOrders >
                                0 && (
                                <span>
                                    {
                                        pendingOrders
                                    }
                                </span>
                            )}
                        </button>

                        <div className="admin-top-avatar">
                            {String(
                                adminUser.full_name ??
                                adminUser.name ??
                                "A"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                Centuria
                                Lake Resort
                            </strong>

                            <span>
                                Welcome
                                Back,
                                Admin!
                            </span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {error && (
                        <div className="admin-error-banner">
                            {error}

                            <button
                                type="button"
                                onClick={() =>
                                    fetchOrders(
                                        true
                                    )
                                }
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {renderPageContent()}
                </div>
            </main>

            {selectedOrder && (
                <div
                    className="admin-modal-overlay"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedOrder(
                                null
                            );
                        }
                    }}
                >
                    <section className="admin-order-modal">
                        <button
                            type="button"
                            className="admin-modal-close"
                            onClick={() =>
                                setSelectedOrder(
                                    null
                                )
                            }
                        >
                            <FaXmark />
                        </button>

                        <span className="admin-section-kicker">
                            ORDER DETAILS
                        </span>

                        <h2>
                            Order #
                            {
                                selectedOrder.id
                            }
                        </h2>

                        <div className="admin-modal-status">
                            {renderStatus(
                                selectedOrder.status
                            )}
                        </div>

                        <div className="admin-order-info-grid">
                            <div>
                                <span>
                                    Customer
                                </span>
                                <strong>
                                    {selectedOrder.customer_name ??
                                        selectedOrder.full_name ??
                                        "Customer"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Email
                                </span>
                                <strong>
                                    {selectedOrder.customer_email ??
                                        selectedOrder.email ??
                                        "-"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Service
                                </span>
                                <strong>
                                    {selectedOrder.order_type ??
                                        selectedOrder.service_type ??
                                        selectedOrder.type ??
                                        "-"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Amount
                                </span>
                                <strong>
                                    {formatMoney(
                                        selectedOrder.total_amount ??
                                        selectedOrder.amount ??
                                        selectedOrder.total
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Created
                                </span>
                                <strong>
                                    {formatDate(
                                        selectedOrder.created_at ??
                                        selectedOrder.order_date
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Assigned
                                    Admin
                                </span>
                                <strong>
                                    {selectedOrder.admin_name ??
                                        selectedOrder.assigned_admin_name ??
                                        "Not assigned"}
                                </strong>
                            </div>
                        </div>

                        <div className="admin-order-description">
                            <span>
                                Request Details
                            </span>

                            <p>
                                {selectedOrder.description ??
                                    selectedOrder.notes ??
                                    selectedOrder.special_request ??
                                    selectedOrder.title ??
                                    "No additional details were provided."}
                            </p>
                        </div>

                        <label className="admin-status-control">
                            <span>
                                Update Order
                                Status
                            </span>

                            <select
                                value={
                                    normalizeStatus(
                                        selectedOrder.status
                                    )
                                }
                                disabled={
                                    updatingId ===
                                    selectedOrder.id
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateOrder(
                                        selectedOrder.id,
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                {STATUS_OPTIONS.map(
                                    (
                                        status
                                    ) => (
                                        <option
                                            key={
                                                status
                                            }
                                            value={
                                                status
                                            }
                                        >
                                            {
                                                status
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <div className="admin-modal-actions">
                            {normalizeStatus(
                                selectedOrder.status
                            ) ===
                                "pending" && (
                                <>
                                    <button
                                        type="button"
                                        className="admin-accept-btn large"
                                        onClick={() =>
                                            handleAccept(
                                                selectedOrder
                                            )
                                        }
                                    >
                                        Accept
                                        Order
                                    </button>

                                    <button
                                        type="button"
                                        className="admin-decline-btn large"
                                        onClick={() =>
                                            handleDecline(
                                                selectedOrder
                                            )
                                        }
                                    >
                                        Decline
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            )}

            {toast && (
                <div className="admin-toast">
                    {toast}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;