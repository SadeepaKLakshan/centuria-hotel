import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
    AnimatePresence,
    motion
} from "framer-motion";

import {
    Award,
    Bell,
    BedDouble,
    CalendarDays,
    Camera,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Clock3,
    Compass,
    Crown,
    Edit3,
    Gift,
    Heart,
    Home,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Phone,
    Search,
    Send,
    Sparkles,
    Star,
    Ticket,
    User,
    UtensilsCrossed,
    WalletCards,
    Waves,
    X
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaTiktok,
    FaWhatsapp
} from "react-icons/fa6";

import { getAuthHeaders } from "../../utils/auth";
import "./CustomerDashboard.css";
import centuriaLogo from "../../assets/images/centuria-logo.png";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost/centuria-hotel/backend";

const TRACKING_STEPS = [
    "pending",
    "accepted",
    "confirmed",
    "processing",
    "completed"
];

function formatOrderMoney(value, currency = "LKR") {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: currency || "LKR",
        maximumFractionDigits: 0
    }).format(
        Number.isFinite(amount) ? amount : 0
    );
}

function formatOrderDate(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-LK", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    });
}

function getTrackingIndex(status) {
    const cleanStatus = String(
        status || "pending"
    ).toLowerCase();

    if (cleanStatus === "active") {
        return 3;
    }

    if (cleanStatus === "cancelled" || cleanStatus === "declined") {
        return -1;
    }

    const index = TRACKING_STEPS.indexOf(
        cleanStatus
    );

    return index >= 0 ? index : 0;
}

const heroSlides = [
    {
        id: 1,
        image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=90",
        eyebrow: "WELCOME BACK",
        title: "YOUR LUXURY",
        accent: "ESCAPE",
        description:
            "Discover elegant stays, premium dining and unforgettable experiences at Centuria Lake Resort.",
        button: "Explore Resort",
        route: "/home"
    },
    {
        id: 2,
        image:
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1800&q=90",
        eyebrow: "LUXURY ROOMS",
        title: "STAY IN",
        accent: "COMFORT",
        description:
            "Relax in beautifully designed rooms created for peaceful, private and memorable stays.",
        button: "Explore Rooms",
        route: "/rooms"
    },
    {
        id: 3,
        image:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=90",
        eyebrow: "PREMIUM DINING",
        title: "TASTE",
        accent: "CENTURIA",
        description:
            "Experience carefully prepared dishes, elegant presentation and exceptional hospitality.",
        button: "Explore Foods",
        route: "/foods"
    },
    {
        id: 4,
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=90",
        eyebrow: "CURATED TOURS",
        title: "DISCOVER",
        accent: "SRI LANKA",
        description:
            "Explore remarkable destinations and create unforgettable memories with curated Centuria tours.",
        button: "Explore Tours",
        route: "/tours"
    },
    {
        id: 5,
        image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=90",
        eyebrow: "SPA & WELLNESS",
        title: "RELAX &",
        accent: "REFRESH",
        description:
            "Restore your energy with peaceful spa experiences designed around comfort and wellness.",
        button: "Explore Spa",
        route: "/spa"
    }
];

const serviceItems = [
    {
        id: "foods",
        title: "Foods",
        subtitle: "Premium dining",
        route: "/foods",
        icon: UtensilsCrossed,
        className: "service-yellow"
    },
    {
        id: "rooms",
        title: "Rooms",
        subtitle: "Luxury stays",
        route: "/rooms",
        icon: BedDouble,
        className: "service-pink"
    },
    {
        id: "tours",
        title: "Tours",
        subtitle: "Explore destinations",
        route: "/tours",
        icon: Compass,
        className: "service-green"
    },
    {
        id: "spa",
        title: "Spa",
        subtitle: "Mind & body",
        route: "/spa",
        icon: Waves,
        className: "service-red"
    },
    {
        id: "offers",
        title: "Offers",
        subtitle: "Exclusive deals",
        route: "/offers",
        icon: Gift,
        className: "service-blue"
    }
];

const offerCards = [
    {
        id: 1,
        label: "DINING",
        title: "Delicious Food",
        subtitle: "Special Offer",
        description:
            "Discover premium dishes prepared especially for you.",
        image:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85",
        action: "View Foods",
        route: "/foods"
    },
    {
        id: 2,
        label: "STAY",
        title: "Luxury Room",
        subtitle: "Weekend Sale",
        description:
            "Enjoy a peaceful luxury stay with exclusive guest benefits.",
        image:
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=85",
        action: "View Rooms",
        route: "/rooms"
    },
    {
        id: 3,
        label: "ADVENTURE",
        title: "Tour Packages",
        subtitle: "Explore More",
        description:
            "Experience selected Sri Lankan destinations with Centuria.",
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
        action: "View Tours",
        route: "/tours"
    },
    {
        id: 4,
        label: "WELLNESS",
        title: "Premium Spa",
        subtitle: "Relax & Refresh",
        description:
            "Enjoy peaceful spa and wellness experiences designed for complete relaxation.",
        image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85",
        action: "View Spa",
        route: "/spa"
    }
];

const fallbackProfile = {
    id: null,
    name: "Centuria Guest",
    email: "guest@centuria.lk",
    phone: "",
    country: "Sri Lanka",
    membership: "Premium Member",
    image: ""
};

function getStoredUser() {
    try {
        const value =
            localStorage.getItem("centuria_user");

        return value
            ? JSON.parse(value)
            : null;
    } catch {
        return null;
    }
}

function buildProfile(user) {
    if (!user) {
        return fallbackProfile;
    }

    const email =
        user.email ||
        fallbackProfile.email;

    let savedProfile = null;

    try {
        savedProfile =
            JSON.parse(
                localStorage.getItem(
                    `centuria_profile_${email}`
                ) || "null"
            );
    } catch {
        savedProfile = null;
    }

    return {
        id: user.id || null,

        name:
            savedProfile?.name ||
            user.full_name ||
            user.name ||
            fallbackProfile.name,

        email,

        phone:
            savedProfile?.phone ||
            user.phone ||
            "",

        country:
            savedProfile?.country ||
            user.country ||
            "Sri Lanka",

        membership:
            savedProfile?.membership ||
            "Premium Member",

        image:
            savedProfile?.image ||
            user.profile_image ||
            ""
    };
}

function CustomerDashboard() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [
        currentSlide,
        setCurrentSlide
    ] = useState(0);

    const [
        profileOpen,
        setProfileOpen
    ] = useState(false);

    const [
        mobileMenuOpen,
        setMobileMenuOpen
    ] = useState(false);

    const [
        notificationOpen,
        setNotificationOpen
    ] = useState(false);

    const [
        infoModal,
        setInfoModal
    ] = useState("");

    const [
        searchValue,
        setSearchValue
    ] = useState("");

    const [
        profile,
        setProfile
    ] = useState(() =>
        buildProfile(
            getStoredUser()
        )
    );

    const [
        editProfile,
        setEditProfile
    ] = useState(profile);

    const [
        saveSuccess,
        setSaveSuccess
    ] = useState(false);

    const [
        profileSaving,
        setProfileSaving
    ] = useState(false);

    const [
        rating,
        setRating
    ] = useState(5);

    const [
        reviewText,
        setReviewText
    ] = useState("");

    const [
        reviewMessage,
        setReviewMessage
    ] = useState("");

    const [
        realReviews,
        setRealReviews
    ] = useState([]);

    const [
        reviewsLoading,
        setReviewsLoading
    ] = useState(true);

    const [
        reviewSaving,
        setReviewSaving
    ] = useState(false);

    const [
        orders,
        setOrders
    ] = useState([]);

    const [
        ordersLoading,
        setOrdersLoading
    ] = useState(true);

    const [
        ordersError,
        setOrdersError
    ] = useState("");

    const [
        selectedOrder,
        setSelectedOrder
    ] = useState(null);

    const currentHero =
        heroSlides[currentSlide];

    const firstName =
        useMemo(() => {
            const name =
                profile.name?.trim() ||
                "";

            return name
                ? name.split(/\s+/)[0]
                : "Guest";
        }, [profile.name]);

    const fetchProfile =
        useCallback(
            async () => {
                try {
                    const response =
                        await fetch(
                            `${API_URL}/customer/profile.php`,
                            {
                                method: "GET",
                                headers:
                                    getAuthHeaders()
                            }
                        );

                    const data =
                        await response.json();

                    if (response.status === 401) {
                        localStorage.removeItem(
                            "centuria_logged_in"
                        );
                        localStorage.removeItem(
                            "centuria_token"
                        );
                        localStorage.removeItem(
                            "centuria_user"
                        );

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
                        data.success === false ||
                        !data.user
                    ) {
                        throw new Error(
                            data.message ||
                            "Unable to load your profile."
                        );
                    }

                    const serverUser =
                        data.user;

                    const updatedProfile = {
                        id:
                            serverUser.id ||
                            null,

                        name:
                            serverUser.full_name ||
                            fallbackProfile.name,

                        email:
                            serverUser.email ||
                            fallbackProfile.email,

                        phone:
                            serverUser.phone ||
                            "",

                        country:
                            serverUser.country ||
                            "Sri Lanka",

                        membership:
                            "Premium Member",

                        image:
                            serverUser.profile_image ||
                            ""
                    };

                    setProfile(
                        updatedProfile
                    );

                    setEditProfile(
                        updatedProfile
                    );

                    localStorage.setItem(
                        `centuria_profile_${updatedProfile.email}`,
                        JSON.stringify(
                            updatedProfile
                        )
                    );

                    const storedUser =
                        getStoredUser();

                    localStorage.setItem(
                        "centuria_user",
                        JSON.stringify({
                            ...(storedUser || {}),
                            id:
                                serverUser.id,
                            full_name:
                                serverUser.full_name,
                            email:
                                serverUser.email,
                            phone:
                                serverUser.phone || "",
                            country:
                                serverUser.country || "Sri Lanka",
                            country_code:
                                serverUser.country_code || "",
                            role:
                                serverUser.role || "customer",
                            profile_image:
                                serverUser.profile_image || ""
                        })
                    );
                } catch (error) {
                    console.error(
                        "Customer profile load error:",
                        error
                    );
                }
            },
            [navigate]
        );

    const fetchOrders =
        useCallback(
            async (showLoader = false) => {
                try {
                    if (showLoader) {
                        setOrdersLoading(true);
                    }

                    setOrdersError("");

                    const response =
                        await fetch(
                            `${API_URL}/customer/orders.php`,
                            {
                                method: "GET",
                                headers:
                                    getAuthHeaders()
                            }
                        );

                    const data =
                        await response.json();

                    if (response.status === 401) {
                        localStorage.removeItem(
                            "centuria_logged_in"
                        );
                        localStorage.removeItem(
                            "centuria_token"
                        );
                        localStorage.removeItem(
                            "centuria_user"
                        );

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
                            "Unable to load your orders."
                        );
                    }

                    setOrders(
                        Array.isArray(
                            data.orders
                        )
                            ? data.orders
                            : []
                    );
                } catch (error) {
                    setOrdersError(
                        error.message ||
                        "Unable to load your orders."
                    );
                } finally {
                    setOrdersLoading(false);
                }
            },
            [navigate]
        );

    const fetchReviews =
        useCallback(
            async (
                showLoader = false
            ) => {
                try {
                    if (showLoader) {
                        setReviewsLoading(
                            true
                        );
                    }

                    const response =
                        await fetch(
                            `${API_URL}/customer/reviews.php`,
                            {
                                method: "GET",
                                headers:
                                    getAuthHeaders()
                            }
                        );

                    const data =
                        await response.json();

                    if (
                        response.status ===
                        401
                    ) {
                        localStorage.removeItem(
                            "centuria_logged_in"
                        );

                        localStorage.removeItem(
                            "centuria_token"
                        );

                        localStorage.removeItem(
                            "centuria_user"
                        );

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
                            "Unable to load reviews."
                        );
                    }

                    setRealReviews(
                        Array.isArray(
                            data.reviews
                        )
                            ? data.reviews
                            : []
                    );

                    if (data.my_review) {
                        setRating(
                            Number(
                                data.my_review.rating ||
                                5
                            )
                        );

                        setReviewText(
                            data.my_review.review_text ||
                            ""
                        );
                    }
                } catch (error) {
                    console.error(
                        "Reviews load error:",
                        error
                    );
                } finally {
                    setReviewsLoading(
                        false
                    );
                }
            },
            [navigate]
        );

    useEffect(() => {
        const user =
            getStoredUser();

        if (!user) {
            navigate(
                "/portal?mode=login",
                {
                    replace: true
                }
            );

            return;
        }

        setProfile(
            buildProfile(user)
        );

        fetchProfile();
    }, [
        navigate,
        fetchProfile
    ]);

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
        fetchReviews(true);
    }, [fetchReviews]);

    useEffect(() => {
        const timer =
            window.setInterval(
                () => {
                    setCurrentSlide(
                        (previous) =>
                            previous ===
                            heroSlides.length - 1
                                ? 0
                                : previous + 1
                    );
                },
                5500
            );

        return () =>
            window.clearInterval(
                timer
            );
    }, []);

    const goHome = () => {
        navigate("/home");
    };

    const goRoute = (
        route
    ) => {
        navigate(route);
    };

    const showComingSoon = (
        title
    ) => {
        setInfoModal(title);
    };

    const handleNavigation = (
        item
    ) => {
        setMobileMenuOpen(false);

        if (item === "home") {
            navigate("/home");
            return;
        }

        if (item === "packages") {
            navigate("/tours");
            return;
        }

        if (item === "offers") {
            navigate("/offers");
            return;
        }

        if (item === "bookings") {
            document
                .getElementById(
                    "customer-orders-section"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            return;
        }

        if (item === "tracking") {
            if (orders.length > 0) {
                setSelectedOrder(
                    orders[0]
                );
            } else {
                document
                    .getElementById(
                        "customer-orders-section"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
            }
            return;
        }

        if (item === "contact") {
            document
                .getElementById(
                    "dashboard-contact"
                )
                ?.scrollIntoView({
                    behavior:
                        "smooth",
                    block:
                        "start"
                });
        }
    };

    const openSocial = (
        url
    ) => {
        const width = 820;
        const height = 650;

        const left =
            window.screenX +
            (window.outerWidth -
                width) /
                2;

        const top =
            window.screenY +
            (window.outerHeight -
                height) /
                2;

        window.open(
            url,
            "centuriaSocial",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    };

    const openProfile = () => {
        setEditProfile(profile);
        setSaveSuccess(false);
        setProfileOpen(true);
    };

    const handleEditChange = (
        event
    ) => {
        const {
            name,
            value
        } = event.target;

        setEditProfile(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    const handleProfileImage = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {
            setInfoModal(
                "Please select a valid image."
            );
            return;
        }

        if (
            file.size >
            1800000
        ) {
            setInfoModal(
                "Please select an image smaller than 1.8 MB."
            );
            return;
        }

        const reader =
            new FileReader();

        reader.onload = () => {
            setEditProfile(
                (previous) => ({
                    ...previous,
                    image:
                        reader.result
                })
            );
        };

        reader.readAsDataURL(
            file
        );
    };

    const saveProfile = async (
        event
    ) => {
        event.preventDefault();

        const updatedProfile = {
            ...editProfile,

            name:
                editProfile.name.trim(),

            email:
                profile.email,

            phone:
                editProfile.phone.trim(),

            country:
                editProfile.country.trim() ||
                "Sri Lanka"
        };

        if (!updatedProfile.name) {
            setInfoModal(
                "Please enter your full name."
            );
            return;
        }

        try {
            setProfileSaving(true);
            setSaveSuccess(false);

            const response =
                await fetch(
                    `${API_URL}/customer/profile.php`,
                    {
                        method: "PATCH",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify({
                                full_name:
                                    updatedProfile.name,
                                phone:
                                    updatedProfile.phone,
                                country:
                                    updatedProfile.country,
                                country_code:
                                    "",
                                profile_image:
                                    updatedProfile.image || ""
                            })
                    }
                );

            const data =
                await response.json();

            if (response.status === 401) {
                localStorage.removeItem(
                    "centuria_logged_in"
                );
                localStorage.removeItem(
                    "centuria_token"
                );
                localStorage.removeItem(
                    "centuria_user"
                );

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
                data.success === false ||
                !data.user
            ) {
                throw new Error(
                    data.message ||
                    "Unable to save your profile."
                );
            }

            const serverUser =
                data.user;

            const permanentProfile = {
                id:
                    serverUser.id ||
                    updatedProfile.id ||
                    null,

                name:
                    serverUser.full_name ||
                    updatedProfile.name,

                email:
                    serverUser.email ||
                    updatedProfile.email,

                phone:
                    serverUser.phone ||
                    "",

                country:
                    serverUser.country ||
                    "Sri Lanka",

                membership:
                    updatedProfile.membership ||
                    "Premium Member",

                image:
                    serverUser.profile_image ||
                    ""
            };

            setProfile(
                permanentProfile
            );

            setEditProfile(
                permanentProfile
            );

            localStorage.setItem(
                `centuria_profile_${permanentProfile.email}`,
                JSON.stringify(
                    permanentProfile
                )
            );

            const storedUser =
                getStoredUser();

            localStorage.setItem(
                "centuria_user",
                JSON.stringify({
                    ...(storedUser || {}),
                    id:
                        serverUser.id,
                    full_name:
                        serverUser.full_name,
                    email:
                        serverUser.email,
                    phone:
                        serverUser.phone || "",
                    country:
                        serverUser.country || "Sri Lanka",
                    country_code:
                        serverUser.country_code || "",
                    role:
                        serverUser.role || "customer",
                    profile_image:
                        serverUser.profile_image || ""
                })
            );

            setSaveSuccess(true);

            window.setTimeout(
                () => {
                    setProfileOpen(false);
                    setSaveSuccess(false);
                },
                900
            );
        } catch (error) {
            setInfoModal(
                error.message ||
                "Unable to save your profile."
            );
        } finally {
            setProfileSaving(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(
            "centuria_logged_in"
        );

        localStorage.removeItem(
            "centuria_user"
        );

        localStorage.removeItem(
            "centuria_token"
        );

        navigate(
            "/portal?mode=login",
            {
                replace: true
            }
        );
    };

    const submitReview = async (
        event
    ) => {
        event.preventDefault();

        const cleanReview =
            reviewText.trim();

        if (!cleanReview) {
            setReviewMessage(
                "Please write your review first."
            );

            return;
        }

        try {
            setReviewSaving(true);
            setReviewMessage("");

            const response =
                await fetch(
                    `${API_URL}/customer/reviews.php`,
                    {
                        method: "POST",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify({
                                rating:
                                    rating,
                                review_text:
                                    cleanReview
                            })
                    }
                );

            const data =
                await response.json();

            if (
                response.status ===
                401
            ) {
                localStorage.removeItem(
                    "centuria_logged_in"
                );

                localStorage.removeItem(
                    "centuria_token"
                );

                localStorage.removeItem(
                    "centuria_user"
                );

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
                    "Unable to save your review."
                );
            }

            setReviewMessage(
                data.message ||
                "Your review has been saved successfully."
            );

            await fetchReviews(
                false
            );

            window.setTimeout(
                () => {
                    setReviewMessage(
                        ""
                    );
                },
                3500
            );
        } catch (error) {
            setReviewMessage(
                error.message ||
                "Unable to save your review."
            );
        } finally {
            setReviewSaving(
                false
            );
        }
    };

    return (
        <div className="customer-dashboard">
            <header className="customer-header">
                <button
                    type="button"
                    className="customer-brand"
                    onClick={goHome}
                >
                    <span className="customer-brand-logo">
                        <img
                            src={centuriaLogo}
                            alt="Centuria Lake Resort"
                        />
                    </span>

                    <span className="customer-brand-text">
                        <strong>
                            CENTURIA
                        </strong>

                        <small>
                            LAKE RESORT
                        </small>
                    </span>
                </button>

                <nav className="customer-navigation">
                    <button
                        type="button"
                        className="active"
                        onClick={() =>
                            handleNavigation(
                                "home"
                            )
                        }
                    >
                        <Home size={17} />
                        Home
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                "packages"
                            )
                        }
                    >
                        <Ticket size={17} />
                        Packages
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                "offers"
                            )
                        }
                    >
                        <Gift size={17} />
                        Offers
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                "bookings"
                            )
                        }
                    >
                        <CalendarDays
                            size={17}
                        />
                        My Bookings
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                "tracking"
                            )
                        }
                    >
                        <Clock3 size={17} />
                        Tracking
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleNavigation(
                                "contact"
                            )
                        }
                    >
                        <Phone size={17} />
                        Contact Us
                    </button>
                </nav>

                <div className="customer-header-actions">
                    <label className="customer-search">
                        <Search size={17} />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(
                                    event.target.value
                                )
                            }
                            placeholder="Search..."
                        />
                    </label>

                    <div className="notification-wrapper">
                        <button
                            type="button"
                            className="notification-button"
                            onClick={() =>
                                setNotificationOpen(
                                    (previous) =>
                                        !previous
                                )
                            }
                        >
                            <Bell size={19} />
                            <span>3</span>
                        </button>

                        <AnimatePresence>
                            {notificationOpen && (
                                <motion.div
                                    className="notification-dropdown"
                                    initial={{
                                        opacity: 0,
                                        y: -10
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -10
                                    }}
                                >
                                    <div className="notification-title">
                                        <div>
                                            <strong>
                                                Notifications
                                            </strong>

                                            <span>
                                                Latest Centuria updates
                                            </span>
                                        </div>

                                        <Sparkles
                                            size={18}
                                        />
                                    </div>

                                    <div className="notification-item">
                                        <Gift size={17} />

                                        <div>
                                            <strong>
                                                New Resort Offer
                                            </strong>

                                            <span>
                                                Exclusive guest deals are available.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="notification-item">
                                        <BedDouble
                                            size={17}
                                        />

                                        <div>
                                            <strong>
                                                Premium Rooms
                                            </strong>

                                            <span>
                                                Discover our latest rooms.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="notification-item">
                                        <Compass
                                            size={17}
                                        />

                                        <div>
                                            <strong>
                                                New Tours
                                            </strong>

                                            <span>
                                                Explore curated destinations.
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="button"
                        className="header-profile"
                        onClick={openProfile}
                    >
                        <span className="header-profile-image">
                            {profile.image ? (
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                />
                            ) : (
                                <User size={19} />
                            )}
                        </span>

                        <span>
                            <strong>
                                {profile.name}
                            </strong>

                            <small>
                                {profile.membership}
                            </small>
                        </span>

                        <ChevronRight
                            size={17}
                        />
                    </button>

                    <button
                        type="button"
                        className="mobile-menu-button"
                        onClick={() =>
                            setMobileMenuOpen(
                                (previous) =>
                                    !previous
                            )
                        }
                    >
                        {mobileMenuOpen ? (
                            <X size={21} />
                        ) : (
                            <Menu size={21} />
                        )}
                    </button>
                </div>
            </header>

            <main className="customer-main">
                <div className="customer-content-column">
                    <section className="customer-hero">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentHero.id}
                                className="customer-hero-background"
                                initial={{
                                    opacity: 0,
                                    scale: 1.03
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1
                                }}
                                exit={{
                                    opacity: 0
                                }}
                                transition={{
                                    duration: 0.8
                                }}
                            >
                                <img
                                    src={currentHero.image}
                                    alt={currentHero.title}
                                />
                            </motion.div>
                        </AnimatePresence>

                        <div className="customer-hero-overlay" />

                        <motion.div
                            key={`hero-${currentHero.id}`}
                            className="customer-hero-content"
                            initial={{
                                opacity: 0,
                                y: 18
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                        >
                            <span className="hero-eyebrow">
                                {currentSlide === 0
                                    ? `${currentHero.eyebrow}, ${firstName}`
                                    : currentHero.eyebrow}
                            </span>

                            <h1>
                                {currentHero.title}
                                <br />

                                <span>
                                    {currentHero.accent}
                                </span>
                            </h1>

                            <div className="hero-accent-line" />

                            <p>
                                {currentHero.description}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    goRoute(
                                        currentHero.route
                                    )
                                }
                            >
                                {currentHero.button}

                                <ChevronRight
                                    size={18}
                                />
                            </button>
                        </motion.div>

                        <div className="customer-hero-dots">
                            {heroSlides.map(
                                (slide, index) => (
                                    <button
                                        key={slide.id}
                                        type="button"
                                        className={
                                            currentSlide ===
                                            index
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setCurrentSlide(
                                                index
                                            )
                                        }
                                    />
                                )
                            )}
                        </div>
                    </section>

                    <section className="customer-services">
                        {serviceItems.map(
                            (service) => {
                                const Icon =
                                    service.icon;

                                return (
                                    <motion.button
                                        key={service.id}
                                        type="button"
                                        className="customer-service-item"
                                        whileHover={{
                                            y: -6
                                        }}
                                        whileTap={{
                                            scale: 0.98
                                        }}
                                        onClick={() =>
                                            goRoute(
                                                service.route
                                            )
                                        }
                                    >
                                        <span
                                            className={`customer-service-icon ${service.className}`}
                                        >
                                            <Icon size={26} />
                                        </span>

                                        <strong>
                                            {service.title}
                                        </strong>

                                        <small>
                                            {service.subtitle}
                                        </small>
                                    </motion.button>
                                );
                            }
                        )}
                    </section>

                    <section className="customer-section-heading">
                        <div>
                            <span>
                                CENTURIA COLLECTION
                            </span>

                            <h2>
                                Recommended for You
                            </h2>
                        </div>
                    </section>

                    <section className="customer-offer-grid">
                        {offerCards.map(
                            (offer) => (
                                <motion.article
                                    key={offer.id}
                                    className="customer-offer-card"
                                    whileHover={{
                                        y: -9,
                                        scale: 1.01
                                    }}
                                    whileTap={{
                                        scale: 0.99
                                    }}
                                    onClick={() =>
                                        goRoute(
                                            offer.route
                                        )
                                    }
                                >
                                    <img
                                        src={offer.image}
                                        alt={offer.title}
                                    />

                                    <div className="offer-card-overlay" />

                                    <div className="offer-card-content">
                                        <span>
                                            {offer.label}
                                        </span>

                                        <h3>
                                            {offer.title}
                                            <br />
                                            {offer.subtitle}
                                        </h3>

                                        <p>
                                            {offer.description}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();

                                                goRoute(
                                                    offer.route
                                                );
                                            }}
                                        >
                                            {offer.action}

                                            <ChevronRight
                                                size={16}
                                            />
                                        </button>
                                    </div>
                                </motion.article>
                            )
                        )}
                    </section>

                    <section
                        id="customer-orders-section"
                        className="customer-orders-section"
                    >
                        <div className="customer-orders-heading">
                            <div>
                                <span>
                                    MY CENTURIA
                                </span>

                                <h2>
                                    My Orders & Tracking
                                </h2>

                                <p>
                                    View your real orders and follow every status update from the resort team.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchOrders(true)
                                }
                            >
                                <Clock3 size={16} />
                                Refresh Orders
                            </button>
                        </div>

                        {ordersError && (
                            <div className="customer-orders-error">
                                {ordersError}
                            </div>
                        )}

                        {ordersLoading ? (
                            <div className="customer-orders-empty">
                                Loading your orders...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="customer-orders-empty">
                                <CalendarDays size={30} />
                                <strong>
                                    No orders yet
                                </strong>
                                <span>
                                    Your room, dining, tour and spa requests will appear here after you place an order.
                                </span>
                            </div>
                        ) : (
                            <div className="customer-orders-grid">
                                {orders.map(
                                    (order) => {
                                        const status =
                                            String(
                                                order.status ||
                                                "pending"
                                            ).toLowerCase();

                                        const trackingIndex =
                                            getTrackingIndex(
                                                status
                                            );

                                        return (
                                            <motion.article
                                                key={order.id}
                                                className="customer-order-card"
                                                whileHover={{
                                                    y: -5
                                                }}
                                            >
                                                <div className="customer-order-card-top">
                                                    <div>
                                                        <span>
                                                            {order.order_number ||
                                                                `ORDER #${order.id}`}
                                                        </span>

                                                        <h3>
                                                            {order.title ||
                                                                order.order_type ||
                                                                "Centuria Order"}
                                                        </h3>
                                                    </div>

                                                    <span
                                                        className={`customer-order-status ${status}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>

                                                <div className="customer-order-meta">
                                                    <div>
                                                        <small>
                                                            Service
                                                        </small>
                                                        <strong>
                                                            {order.order_type ||
                                                                "Service"}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <small>
                                                            Date
                                                        </small>
                                                        <strong>
                                                            {formatOrderDate(
                                                                order.created_at
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <small>
                                                            Amount
                                                        </small>
                                                        <strong>
                                                            {formatOrderMoney(
                                                                order.total_amount,
                                                                order.currency
                                                            )}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {status === "declined" &&
                                                    order.decline_reason && (
                                                        <div className="customer-order-decline">
                                                            <strong>
                                                                Decline reason
                                                            </strong>
                                                            <span>
                                                                {order.decline_reason}
                                                            </span>
                                                        </div>
                                                    )}

                                                {status !== "declined" &&
                                                    status !== "cancelled" && (
                                                        <div className="customer-mini-track">
                                                            {TRACKING_STEPS.map(
                                                                (step, index) => (
                                                                    <span
                                                                        key={step}
                                                                        className={
                                                                            index <=
                                                                            trackingIndex
                                                                                ? "active"
                                                                                : ""
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                                <div className="customer-order-card-footer">
                                                    <span>
                                                        {order.assigned_admin_name
                                                            ? `Handled by ${order.assigned_admin_name}`
                                                            : "Waiting for resort team"}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedOrder(
                                                                order
                                                            )
                                                        }
                                                    >
                                                        Track Order
                                                        <ChevronRight
                                                            size={15}
                                                        />
                                                    </button>
                                                </div>
                                            </motion.article>
                                        );
                                    }
                                )}
                            </div>
                        )}
                    </section>

                    <section className="customer-review-section">
                        <div className="review-heading">
                            <span>
                                GUEST EXPERIENCES
                            </span>

                            <h2>
                                Reviews & Ratings
                            </h2>
                        </div>

                        <div className="review-layout">
                            <div className="review-list">
                                {reviewsLoading ? (
                                    <div className="review-empty">
                                        Loading real guest reviews...
                                    </div>
                                ) : realReviews.length === 0 ? (
                                    <div className="review-empty">
                                        <Star size={25} />

                                        <strong>
                                            No reviews yet
                                        </strong>

                                        <span>
                                            Be the first Centuria guest to share an experience.
                                        </span>
                                    </div>
                                ) : (
                                    realReviews.map(
                                        (review) => (
                                            <article
                                                key={review.id}
                                                className={
                                                    `review-card ${
                                                        review.is_mine
                                                            ? "my-review-card"
                                                            : ""
                                                    }`
                                                }
                                            >
                                                <div className="review-avatar">
                                                    {review.profile_image ? (
                                                        <img
                                                            src={
                                                                review.profile_image
                                                            }
                                                            alt={
                                                                review.name
                                                            }
                                                        />
                                                    ) : (
                                                        review.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                        "C"
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="review-card-top">
                                                        <div className="review-name-row">
                                                            <strong>
                                                                {review.name}
                                                            </strong>

                                                            {review.is_mine && (
                                                                <span className="review-you-badge">
                                                                    Your Review
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="review-stars">
                                                            {[1, 2, 3, 4, 5].map(
                                                                (
                                                                    star
                                                                ) => (
                                                                    <Star
                                                                        key={
                                                                            star
                                                                        }
                                                                        size={
                                                                            13
                                                                        }
                                                                        fill={
                                                                            star <=
                                                                            review.rating
                                                                                ? "currentColor"
                                                                                : "none"
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p>
                                                        {
                                                            review.review_text
                                                        }
                                                    </p>

                                                    {review.country && (
                                                        <small className="review-country">
                                                            {
                                                                review.country
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </article>
                                        )
                                    )
                                )}
                            </div>

                            <form
                                className="rating-card"
                                onSubmit={submitReview}
                            >
                                <span>
                                    RATE YOUR EXPERIENCE
                                </span>

                                <h3>
                                    Share Your Experience
                                </h3>

                                <div className="rating-stars">
                                    {[1, 2, 3, 4, 5].map(
                                        (value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                className={
                                                    value <=
                                                    rating
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    setRating(
                                                        value
                                                    )
                                                }
                                            >
                                                <Star
                                                    size={22}
                                                    fill={
                                                        value <=
                                                        rating
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />
                                            </button>
                                        )
                                    )}
                                </div>

                                <textarea
                                    value={reviewText}
                                    onChange={(event) =>
                                        setReviewText(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Write your review..."
                                />

                                {reviewMessage && (
                                    <div className="review-message">
                                        {reviewMessage}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="submit-review-button"
                                    disabled={
                                        reviewSaving
                                    }
                                >
                                    <Send size={16} />

                                    {reviewSaving
                                        ? "Saving..."
                                        : realReviews.some(
                                            (review) =>
                                                review.is_mine
                                        )
                                            ? "Update Review"
                                            : "Submit Review"}
                                </button>
                            </form>
                        </div>
                    </section>

                    <section
                        id="dashboard-contact"
                        className="customer-contact-section"
                    >
                        <div className="contact-main">
                            <span className="contact-eyebrow">
                                CENTURIA GUEST SUPPORT
                            </span>

                            <h2>
                                Contact Us Anytime
                            </h2>

                            <p>
                                Our guest service team is ready to help with reservations, rooms, dining, tours and spa services.
                            </p>

                            <div className="contact-card-grid">
                                <a
                                    className="contact-card call"
                                    href="tel:+94472232232"
                                >
                                    <span className="contact-card-icon">
                                        <Phone size={20} />
                                    </span>

                                    <span>
                                        <small>
                                            PHONE
                                        </small>

                                        <strong>
                                            +94 47 223 2232
                                        </strong>
                                    </span>
                                </a>

                                <a
                                    className="contact-card email"
                                    href="mailto:info@centuria.lk"
                                >
                                    <span className="contact-card-icon">
                                        <Mail size={20} />
                                    </span>

                                    <span>
                                        <small>
                                            EMAIL
                                        </small>

                                        <strong>
                                            info@centuria.lk
                                        </strong>
                                    </span>
                                </a>

                                <div className="contact-card location">
                                    <span className="contact-card-icon">
                                        <MapPin size={20} />
                                    </span>

                                    <span>
                                        <small>
                                            LOCATION
                                        </small>

                                        <strong>
                                            Sri Lanka
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="contact-social">
                            <Sparkles size={27} />

                            <span>
                                FOLLOW CENTURIA
                            </span>

                            <h3>
                                Stay Connected
                            </h3>

                            <p>
                                Open our social platforms in a separate window.
                            </p>

                            <div className="cd-social-links">
                                <button
                                    type="button"
                                    className="cd-social-button cd-social-facebook"
                                    onClick={() =>
                                        openSocial(
                                            "https://www.facebook.com/"
                                        )
                                    }
                                >
                                    <FaFacebookF />
                                </button>

                                <button
                                    type="button"
                                    className="cd-social-button cd-social-instagram"
                                    onClick={() =>
                                        openSocial(
                                            "https://www.instagram.com/"
                                        )
                                    }
                                >
                                    <FaInstagram />
                                </button>

                                <button
                                    type="button"
                                    className="cd-social-button cd-social-whatsapp"
                                    onClick={() =>
                                        openSocial(
                                            "https://web.whatsapp.com/"
                                        )
                                    }
                                >
                                    <FaWhatsapp />
                                </button>

                                <button
                                    type="button"
                                    className="cd-social-button cd-social-tiktok"
                                    onClick={() =>
                                        openSocial(
                                            "https://www.tiktok.com/"
                                        )
                                    }
                                >
                                    <FaTiktok />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="customer-sidebar-column">
                    <div className="customer-profile-panel">
                        <div className="profile-panel-heading">
                            <div>
                                <span>
                                    MY ACCOUNT
                                </span>

                                <h2>
                                    Customer Profile
                                </h2>
                            </div>

                            <Sparkles
                                size={22}
                            />
                        </div>

                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar">
                                {profile.image ? (
                                    <img
                                        src={profile.image}
                                        alt={profile.name}
                                    />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>

                            <button
                                type="button"
                                className="profile-camera-button"
                                onClick={openProfile}
                            >
                                <Camera size={15} />
                            </button>
                        </div>

                        <div className="profile-information">
                            <h3>
                                {profile.name}
                            </h3>

                            <p>
                                {profile.email}
                            </p>

                            <div className="membership-badge">
                                <Crown size={14} />
                                {profile.membership}
                            </div>
                        </div>

                        <button
                            type="button"
                            className="edit-profile-button"
                            onClick={openProfile}
                        >
                            <Edit3 size={16} />
                            Edit Profile
                        </button>

                        <div className="profile-contact-grid">
                            <div>
                                <Phone size={17} />

                                <span>
                                    <small>
                                        Phone
                                    </small>

                                    <strong>
                                        {profile.phone ||
                                            "Add phone"}
                                    </strong>
                                </span>
                            </div>

                            <div>
                                <MapPin size={17} />

                                <span>
                                    <small>
                                        Country
                                    </small>

                                    <strong>
                                        {profile.country}
                                    </strong>
                                </span>
                            </div>
                        </div>

                        <div className="profile-divider" />

                        <div className="quick-actions">
                            <h4>
                                Quick Actions
                            </h4>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "bookings"
                                    )
                                }
                            >
                                <span>
                                    <CalendarDays
                                        size={17}
                                    />
                                    My Bookings
                                </span>

                                <ChevronRight
                                    size={16}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/offers"
                                    )
                                }
                            >
                                <span>
                                    <Heart size={17} />
                                    Saved Packages
                                </span>

                                <ChevronRight
                                    size={16}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    showComingSoon(
                                        "Payment Methods"
                                    )
                                }
                            >
                                <span>
                                    <WalletCards
                                        size={17}
                                    />
                                    Payment Methods
                                </span>

                                <ChevronRight
                                    size={16}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setNotificationOpen(
                                        true
                                    )
                                }
                            >
                                <span>
                                    <Bell size={17} />
                                    Notifications
                                </span>

                                <ChevronRight
                                    size={16}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleNavigation(
                                        "contact"
                                    )
                                }
                            >
                                <span>
                                    <CircleHelp
                                        size={17}
                                    />
                                    Support & Help
                                </span>

                                <ChevronRight
                                    size={16}
                                />
                            </button>
                        </div>

                        <div className="profile-divider" />

                        <div className="profile-main-actions">
                            <motion.button
                                type="button"
                                className="premium-home-button"
                                whileHover={{
                                    y: -2
                                }}
                                whileTap={{
                                    scale: 0.98
                                }}
                                onClick={goHome}
                            >
                                <span className="profile-main-action-icon">
                                    <Home size={19} />
                                </span>

                                <span className="profile-main-action-text">
                                    <strong>
                                        Resort Home
                                    </strong>

                                    <small>
                                        Return to Centuria home
                                    </small>
                                </span>

                                <ChevronRight
                                    className="profile-main-action-arrow"
                                    size={18}
                                />
                            </motion.button>

                            <motion.button
                                type="button"
                                className="premium-logout-button"
                                whileHover={{
                                    y: -2
                                }}
                                whileTap={{
                                    scale: 0.98
                                }}
                                onClick={logout}
                            >
                                <span className="profile-main-action-icon">
                                    <LogOut size={19} />
                                </span>

                                <span className="profile-main-action-text">
                                    <strong>
                                        Logout
                                    </strong>

                                    <small>
                                        Securely end your session
                                    </small>
                                </span>

                                <ChevronRight
                                    className="profile-main-action-arrow"
                                    size={18}
                                />
                            </motion.button>
                        </div>
                    </div>

                    <div className="sidebar-loyalty-card">
                        <div className="sidebar-card-top">
                            <span className="sidebar-card-icon gold">
                                <Award size={22} />
                            </span>

                            <div>
                                <small>
                                    CENTURIA REWARDS
                                </small>

                                <h3>
                                    Loyalty Points
                                </h3>
                            </div>
                        </div>

                        <strong className="loyalty-number">
                            2,450
                        </strong>

                        <span className="loyalty-label">
                            Premium reward points
                        </span>

                        <div className="loyalty-progress">
                            <span />
                        </div>
                    </div>

                    <div className="sidebar-help-card">
                        <CircleHelp size={23} />

                        <div>
                            <small>
                                NEED ASSISTANCE?
                            </small>

                            <h3>
                                Guest Support
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                handleNavigation(
                                    "contact"
                                )
                            }
                        >
                            Contact Support
                        </button>
                    </div>
                </aside>
            </main>

            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        className="customer-tracking-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() =>
                            setSelectedOrder(null)
                        }
                    >
                        <motion.div
                            className="customer-tracking-modal"
                            initial={{
                                opacity: 0,
                                y: 25,
                                scale: 0.96
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                y: 20,
                                scale: 0.96
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <button
                                type="button"
                                className="customer-tracking-close"
                                onClick={() =>
                                    setSelectedOrder(null)
                                }
                            >
                                <X size={19} />
                            </button>

                            <span className="customer-tracking-kicker">
                                LIVE ORDER TRACKING
                            </span>

                            <h2>
                                {selectedOrder.title ||
                                    selectedOrder.order_type ||
                                    "Centuria Order"}
                            </h2>

                            <div className="customer-tracking-summary">
                                <div>
                                    <small>
                                        Order
                                    </small>
                                    <strong>
                                        {selectedOrder.order_number ||
                                            `#${selectedOrder.id}`}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        Amount
                                    </small>
                                    <strong>
                                        {formatOrderMoney(
                                            selectedOrder.total_amount,
                                            selectedOrder.currency
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <small>
                                        Created
                                    </small>
                                    <strong>
                                        {formatOrderDate(
                                            selectedOrder.created_at
                                        )}
                                    </strong>
                                </div>
                            </div>

                            {String(
                                selectedOrder.status ||
                                "pending"
                            ).toLowerCase() ===
                            "declined" ? (
                                <div className="customer-tracking-declined">
                                    <strong>
                                        Request Declined
                                    </strong>
                                    <p>
                                        {selectedOrder.decline_reason ||
                                            "Please contact Centuria support for more information."}
                                    </p>
                                </div>
                            ) : (
                                <div className="customer-tracking-timeline">
                                    {TRACKING_STEPS.map(
                                        (step, index) => {
                                            const currentIndex =
                                                getTrackingIndex(
                                                    selectedOrder.status
                                                );

                                            const complete =
                                                index <=
                                                currentIndex;

                                            return (
                                                <div
                                                    key={step}
                                                    className={
                                                        complete
                                                            ? "complete"
                                                            : ""
                                                    }
                                                >
                                                    <span>
                                                        {complete ? (
                                                            <CheckCircle2
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <Clock3
                                                                size={18}
                                                            />
                                                        )}
                                                    </span>

                                                    <div>
                                                        <strong>
                                                            {step === "pending"
                                                                ? "Request Sent"
                                                                : step === "accepted"
                                                                ? "Accepted"
                                                                : step === "confirmed"
                                                                ? "Confirmed"
                                                                : step === "processing"
                                                                ? "Processing / Active"
                                                                : "Completed"}
                                                        </strong>

                                                        <small>
                                                            {complete
                                                                ? "Completed stage"
                                                                : "Waiting for update"}
                                                        </small>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            )}

                            {Array.isArray(
                                selectedOrder.history
                            ) &&
                                selectedOrder.history.length >
                                    0 && (
                                    <div className="customer-order-history">
                                        <h3>
                                            Status History
                                        </h3>

                                        {selectedOrder.history.map(
                                            (history, index) => (
                                                <div
                                                    key={
                                                        history.id ||
                                                        `${history.status}-${index}`
                                                    }
                                                >
                                                    <span />

                                                    <div>
                                                        <strong>
                                                            {history.status}
                                                        </strong>

                                                        <small>
                                                            {formatOrderDate(
                                                                history.created_at
                                                            )}
                                                        </small>

                                                        {history.note && (
                                                            <p>
                                                                {history.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {infoModal && (
                    <motion.div
                        className="cd-info-backdrop"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() =>
                            setInfoModal("")
                        }
                    >
                        <motion.div
                            className="cd-info-modal"
                            initial={{
                                opacity: 0,
                                y: 20,
                                scale: 0.94
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                y: 15,
                                scale: 0.94
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <span>
                                <Sparkles size={25} />
                            </span>

                            <h3>
                                {infoModal}
                            </h3>

                            <p>
                                This feature will be connected with the next Centuria module.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setInfoModal("")
                                }
                            >
                                Okay
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {profileOpen && (
                    <motion.div
                        className="profile-modal-backdrop"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={() =>
                            setProfileOpen(
                                false
                            )
                        }
                    >
                        <motion.div
                            className="profile-modal"
                            initial={{
                                opacity: 0,
                                scale: 0.96,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.96,
                                y: 15
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="profile-modal-header">
                                <div>
                                    <span>
                                        CENTURIA ACCOUNT
                                    </span>

                                    <h2>
                                        Edit Profile
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setProfileOpen(
                                            false
                                        )
                                    }
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                className="profile-edit-form"
                                onSubmit={saveProfile}
                            >
                                <div className="edit-profile-avatar">
                                    <div>
                                        {editProfile.image ? (
                                            <img
                                                src={
                                                    editProfile.image
                                                }
                                                alt="Profile"
                                            />
                                        ) : (
                                            <User size={40} />
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <Camera size={16} />
                                        Change Photo
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleProfileImage
                                        }
                                        hidden
                                    />
                                </div>

                                <div className="profile-form-grid">
                                    <label>
                                        <span>
                                            Full Name
                                        </span>

                                        <div className="profile-input">
                                            <User size={16} />

                                            <input
                                                name="name"
                                                value={
                                                    editProfile.name
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>
                                    </label>

                                    <label>
                                        <span>
                                            Email Address
                                        </span>

                                        <div className="profile-input profile-input-disabled">
                                            <Mail size={16} />

                                            <input
                                                value={
                                                    profile.email
                                                }
                                                disabled
                                            />
                                        </div>
                                    </label>

                                    <label>
                                        <span>
                                            Phone Number
                                        </span>

                                        <div className="profile-input">
                                            <Phone size={16} />

                                            <input
                                                name="phone"
                                                value={
                                                    editProfile.phone
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>
                                    </label>

                                    <label>
                                        <span>
                                            Country
                                        </span>

                                        <div className="profile-input">
                                            <MapPin size={16} />

                                            <input
                                                name="country"
                                                value={
                                                    editProfile.country
                                                }
                                                onChange={
                                                    handleEditChange
                                                }
                                            />
                                        </div>
                                    </label>
                                </div>

                                {saveSuccess && (
                                    <div className="profile-save-success">
                                        <CheckCircle2
                                            size={16}
                                        />
                                        Profile updated successfully.
                                    </div>
                                )}

                                <div className="profile-modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-profile-button"
                                        disabled={
                                            profileSaving
                                        }
                                        onClick={() =>
                                            setProfileOpen(
                                                false
                                            )
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-profile-button"
                                        disabled={
                                            profileSaving
                                        }
                                    >
                                        {profileSaving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default CustomerDashboard;