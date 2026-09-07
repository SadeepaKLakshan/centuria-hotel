import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    CreditCard,
    Heart,
    HelpCircle,
    LockKeyhole,
    Mail,
    MapPin,
    PackageCheck,
    Phone,
    Search,
    ShieldCheck,
    UserRound,
    X
} from "lucide-react";

import {
    FaAmazonPay,
    FaApplePay,
    FaCcAmex,
    FaCcDiscover,
    FaCcMastercard,
    FaCcVisa,
    FaPaypal
} from "react-icons/fa";

import {
    SiEbay
} from "react-icons/si";

import centuriaLogo
    from "../../assets/images/centuria-logo.png";

import "./Payment.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost/centuria-hotel/backend";


const PAYMENT_METHODS = [
    {
        id: "visa",
        name: "Visa",
        type: "card",
        Icon: FaCcVisa
    },
    {
        id: "mastercard",
        name: "Mastercard",
        type: "card",
        Icon: FaCcMastercard
    },
    {
        id: "amex",
        name: "American Express",
        type: "card",
        Icon: FaCcAmex
    },
    {
        id: "discover",
        name: "Discover",
        type: "card",
        Icon: FaCcDiscover
    },
    {
        id: "apple-pay",
        name: "Apple Pay",
        type: "wallet",
        Icon: FaApplePay
    },
    {
        id: "paypal",
        name: "PayPal",
        type: "wallet",
        Icon: FaPaypal
    },
    {
        id: "amazon-pay",
        name: "Amazon Pay",
        type: "wallet",
        Icon: FaAmazonPay
    },
    {
        id: "ebay",
        name: "eBay",
        type: "wallet",
        Icon: SiEbay
    }
];


const CHECKOUT_KEYS = [
    "centuria_checkout",
    "centuria_spa_checkout",
    "centuria_food_checkout",
    "centuria_room_checkout",
    "centuria_tour_checkout"
];


function readJson(
    key,
    fallback = null
) {
    try {
        const value =
            localStorage.getItem(
                key
            );

        if (!value) {
            return fallback;
        }

        return JSON.parse(
            value
        );
    } catch {
        return fallback;
    }
}


function getToken() {
    return (
        localStorage.getItem(
            "centuria_token"
        ) || ""
    );
}


function getAuthHeaders() {
    const token =
        getToken();

    if (!token) {
        return {};
    }

    return {
        Authorization:
            `Bearer ${token}`
    };
}


function getStoredUser() {
    return readJson(
        "centuria_user",
        null
    );
}


function getCheckout() {
    for (
        const key
        of CHECKOUT_KEYS
    ) {
        const value =
            readJson(
                key,
                null
            );

        if (
            value &&
            typeof value ===
                "object"
        ) {
            return {
                ...value,
                storageKey:
                    key
            };
        }
    }

    return null;
}


function normalizeType(
    value = ""
) {
    const text =
        String(
            value
        )
            .trim()
            .toLowerCase();

    if (
        text.includes(
            "food"
        ) ||
        text.includes(
            "dining"
        ) ||
        text.includes(
            "restaurant"
        )
    ) {
        return "dining";
    }

    if (
        text.includes(
            "room"
        )
    ) {
        return "room";
    }

    if (
        text.includes(
            "tour"
        ) ||
        text.includes(
            "travel"
        ) ||
        text.includes(
            "transport"
        )
    ) {
        return "tour";
    }

    if (
        text.includes(
            "spa"
        ) ||
        text.includes(
            "massage"
        ) ||
        text.includes(
            "wellness"
        )
    ) {
        return "spa";
    }

    return text ||
        "service";
}


function getServiceLabel(
    type
) {
    const normalized =
        normalizeType(
            type
        );

    if (
        normalized ===
        "dining"
    ) {
        return "Dining";
    }

    if (
        normalized ===
        "room"
    ) {
        return "Room";
    }

    if (
        normalized ===
        "tour"
    ) {
        return "Tour";
    }

    if (
        normalized ===
        "spa"
    ) {
        return "Spa";
    }

    return "Centuria Service";
}


function money(
    value
) {
    return `LKR ${Number(
        value || 0
    ).toLocaleString(
        "en-LK"
    )}`;
}


function onlyDigits(
    value
) {
    return String(
        value || ""
    ).replace(
        /\D/g,
        ""
    );
}


function formatCardNumber(
    value
) {
    const digits =
        onlyDigits(
            value
        ).slice(
            0,
            19
        );

    return digits
        .replace(
            /(.{4})/g,
            "$1 "
        )
        .trim();
}


function validCardInput(
    value
) {
    const digits =
        onlyDigits(
            value
        );

    return (
        digits.length >= 4 &&
        digits.length <= 19
    );
}


function formatExpiry(
    value
) {
    const digits =
        onlyDigits(
            value
        ).slice(
            0,
            4
        );

    if (
        digits.length <= 2
    ) {
        return digits;
    }

    return `${digits.slice(
        0,
        2
    )}/${digits.slice(
        2
    )}`;
}


function validExpiryInput(
    value
) {
    const match =
        String(
            value
        ).match(
            /^(\d{2})\/(\d{2})$/
        );

    if (!match) {
        return false;
    }

    const month =
        Number(
            match[
                1
            ]
        );

    return (
        month >= 1 &&
        month <= 12
    );
}


function Payment() {
    const navigate =
        useNavigate();


    const [
        checkout,
        setCheckout
    ] = useState(
        () =>
            getCheckout()
    );


    const [
        method,
        setMethod
    ] = useState(
        "visa"
    );


    const [
        holderName,
        setHolderName
    ] = useState("");


    const [
        cardNumber,
        setCardNumber
    ] = useState("");


    const [
        expiry,
        setExpiry
    ] = useState("");


    const [
        cvv,
        setCvv
    ] = useState("");


    const [
        saveCard,
        setSaveCard
    ] = useState(true);


    const [
        loading,
        setLoading
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState(
        null
    );


    const user =
        getStoredUser();


    useEffect(() => {
        if (
            user?.full_name ||
            user?.name
        ) {
            setHolderName(
                user.full_name ||
                user.name
            );
        }
    }, [
        user?.full_name,
        user?.name
    ]);


    useEffect(() => {
        const latest =
            getCheckout();

        if (latest) {
            setCheckout(
                latest
            );
        }
    }, []);


    const selectedMethod =
        useMemo(
            () =>
                PAYMENT_METHODS.find(
                    item =>
                        item.id ===
                        method
                ) ||
                PAYMENT_METHODS[
                    0
                ],
            [
                method
            ]
        );


    const summary =
        useMemo(() => {
            if (!checkout) {
                return null;
            }


            const quantity =
                Math.max(
                    1,
                    Number(
                        checkout.quantity ||
                        checkout.qty ||
                        checkout.sessions ||
                        1
                    )
                );


            const unitPrice =
                Number(
                    checkout.unitPrice ||
                    checkout.unit_price ||
                    checkout.price ||
                    checkout.basePrice ||
                    checkout.base_price ||
                    0
                );


            let total =
                Number(
                    checkout.total ||
                    checkout.totalAmount ||
                    checkout.total_amount ||
                    checkout.amount ||
                    0
                );


            if (
                !total &&
                unitPrice
            ) {
                total =
                    unitPrice *
                    quantity;
            }


            return {
                type:
                    normalizeType(
                        checkout.type ||
                        checkout.order_type ||
                        checkout.serviceType ||
                        checkout.service_type ||
                        checkout.category
                    ),

                serviceLabel:
                    getServiceLabel(
                        checkout.type ||
                        checkout.order_type ||
                        checkout.serviceType ||
                        checkout.service_type ||
                        checkout.category
                    ),

                title:
                    checkout.name ||
                    checkout.title ||
                    checkout.packageName ||
                    checkout.package_name ||
                    checkout.roomName ||
                    checkout.room_name ||
                    checkout.foodName ||
                    checkout.food_name ||
                    checkout.tourName ||
                    checkout.tour_name ||
                    checkout.treatmentName ||
                    checkout.treatment_name ||
                    "Centuria Booking",

                description:
                    checkout.description ||
                    checkout.category ||
                    checkout.subtitle ||
                    "Premium Centuria Lake Resort experience.",

                image:
                    checkout.image ||
                    checkout.imageUrl ||
                    checkout.image_url ||
                    checkout.thumbnail ||
                    checkout.fallback ||
                    "",

                guestType:
                    checkout.guestType ||
                    checkout.guest_type ||
                    checkout.guest ||
                    checkout.people ||
                    checkout.personType ||
                    checkout.person_type ||
                    "",

                duration:
                    checkout.duration ||
                    checkout.durationLabel ||
                    checkout.duration_label ||
                    checkout.nights ||
                    "",

                date:
                    checkout.date ||
                    checkout.bookingDate ||
                    checkout.booking_date ||
                    checkout.checkIn ||
                    checkout.check_in ||
                    "",

                time:
                    checkout.time ||
                    checkout.bookingTime ||
                    checkout.booking_time ||
                    "",

                portion:
                    checkout.portion ||
                    checkout.size ||
                    "",

                spice:
                    checkout.spice ||
                    checkout.spiceLevel ||
                    checkout.spice_level ||
                    "",

                transport:
                    checkout.transport ||
                    checkout.vehicle ||
                    "",

                quantity,

                unitPrice,

                total
            };
        }, [
            checkout
        ]);


    const createDescription =
        () => {
            if (!summary) {
                return "";
            }


            const parts = [
                `${summary.serviceLabel}: ${summary.title}`
            ];


            if (
                summary.guestType
            ) {
                parts.push(
                    `Guest: ${summary.guestType}`
                );
            }


            if (
                summary.duration
            ) {
                parts.push(
                    `Duration: ${summary.duration}`
                );
            }


            if (
                summary.portion
            ) {
                parts.push(
                    `Portion: ${summary.portion}`
                );
            }


            if (
                summary.spice
            ) {
                parts.push(
                    `Spice: ${summary.spice}`
                );
            }


            if (
                summary.transport
            ) {
                parts.push(
                    `Transport: ${summary.transport}`
                );
            }


            if (
                summary.date
            ) {
                parts.push(
                    `Date: ${summary.date}`
                );
            }


            if (
                summary.time
            ) {
                parts.push(
                    `Time: ${summary.time}`
                );
            }


            parts.push(
                `Payment Method: ${selectedMethod.name}`
            );


            return parts.join(
                " | "
            );
        };


    const validate =
        () => {
            setError("");


            if (!summary) {
                setError(
                    "No booking has been selected."
                );

                return false;
            }


            if (
                !user ||
                !getToken()
            ) {
                setError(
                    "Please login before continuing."
                );

                return false;
            }


            if (
                Number(
                    summary.total
                ) <= 0
            ) {
                setError(
                    "The booking amount is invalid."
                );

                return false;
            }


            if (
                selectedMethod.type ===
                "wallet"
            ) {
                return true;
            }


            if (
                holderName
                    .trim()
                    .length <
                2
            ) {
                setError(
                    "Please enter the cardholder name."
                );

                return false;
            }


            if (
                !validCardInput(
                    cardNumber
                )
            ) {
                setError(
                    "Please enter a card number."
                );

                return false;
            }


            if (
                !validExpiryInput(
                    expiry
                )
            ) {
                setError(
                    "Please enter the expiry date as MM/YY."
                );

                return false;
            }


            if (
                !/^\d{3,4}$/.test(
                    cvv
                )
            ) {
                setError(
                    "Please enter a 3 or 4 digit security code."
                );

                return false;
            }


            return true;
        };


    const handlePayment =
        async () => {
            if (
                !validate()
            ) {
                return;
            }


            try {
                setLoading(
                    true
                );

                setError("");


                const paymentReference =
                    `PAY-${Date.now()}-${Math.floor(
                        100000 +
                        Math.random() *
                            900000
                    )}`;


                const digits =
                    onlyDigits(
                        cardNumber
                    );


                const last4 =
                    selectedMethod.type ===
                    "card"
                        ? digits.slice(
                              -4
                          )
                        : "";


                const payload = {
                    order_type:
                        summary.type,

                    service_type:
                        summary.type,

                    title:
                        summary.title,

                    description:
                        createDescription(),

                    total_amount:
                        Number(
                            summary.total
                        ),

                    amount:
                        Number(
                            summary.total
                        ),

                    currency:
                        "LKR",

                    status:
                        "pending",

                    payment_status:
                        "pending",

                    payment_method:
                        selectedMethod.name,

                    payment_reference:
                        paymentReference,

                    payment_last4:
                        last4,

                    details: {
                        ...checkout,

                        type:
                            summary.type,

                        service_type:
                            summary.type,

                        title:
                            summary.title,

                        name:
                            summary.title,

                        description:
                            summary.description,

                        image:
                            summary.image,

                        guestType:
                            summary.guestType,

                        guest_type:
                            summary.guestType,

                        duration:
                            summary.duration,

                        date:
                            summary.date,

                        booking_date:
                            summary.date,

                        time:
                            summary.time,

                        booking_time:
                            summary.time,

                        portion:
                            summary.portion,

                        spice:
                            summary.spice,

                        transport:
                            summary.transport,

                        quantity:
                            summary.quantity,

                        sessions:
                            summary.quantity,

                        unitPrice:
                            summary.unitPrice,

                        unit_price:
                            summary.unitPrice,

                        total:
                            summary.total,

                        total_amount:
                            summary.total,

                        payment: {
                            method:
                                selectedMethod.name,

                            reference:
                                paymentReference,

                            last4,

                            amount:
                                summary.total,

                            currency:
                                "LKR",

                            status:
                                "pending",

                            submittedAt:
                                new Date()
                                    .toISOString()
                        }
                    }
                };


                console.log(
                    "Centuria payment payload:",
                    payload
                );


                const response =
                    await fetch(
                        `${API_URL}/customer/create-order.php`,
                        {
                            method:
                                "POST",

                            headers: {
                                ...getAuthHeaders(),

                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                let data = {};


                try {
                    data =
                        await response.json();
                } catch {
                    throw new Error(
                        `Invalid server response. HTTP ${response.status}`
                    );
                }


                console.log(
                    "Centuria booking response:",
                    data
                );


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
                            replace:
                                true
                        }
                    );

                    return;
                }


                if (
                    !response.ok ||
                    data.success ===
                        false
                ) {
                    throw new Error(
                        data.error ||
                        data.message ||
                        `Unable to create the booking. HTTP ${response.status}`
                    );
                }


                if (
                    saveCard &&
                    selectedMethod.type ===
                        "card"
                ) {
                    localStorage.setItem(
                        "centuria_saved_payment_hint",
                        JSON.stringify({
                            method:
                                selectedMethod.name,

                            holder:
                                holderName.trim(),

                            last4
                        })
                    );
                }


                const serverOrder =
                    data.order ||
                    {};


                const orderId =
                    serverOrder.order_number ||
                    data.order_number ||
                    serverOrder.id ||
                    data.order_id ||
                    `CENT-${Date.now()}`;


                localStorage.setItem(
                    "centuria_last_order",
                    JSON.stringify({
                        id:
                            serverOrder.id ||
                            data.order_id ||
                            null,

                        orderId,

                        orderNumber:
                            orderId,

                        status:
                            serverOrder.status ||
                            data.status ||
                            "pending",

                        paymentStatus:
                            serverOrder.payment_status ||
                            "pending",

                        type:
                            summary.type,

                        service:
                            summary.serviceLabel,

                        title:
                            summary.title,

                        total:
                            summary.total,

                        paymentMethod:
                            selectedMethod.name,

                        paymentReference,

                        createdAt:
                            new Date()
                                .toISOString()
                    })
                );


                CHECKOUT_KEYS.forEach(
                    key => {
                        localStorage.removeItem(
                            key
                        );
                    }
                );


                setSuccess({
                    id:
                        serverOrder.id ||
                        data.order_id ||
                        null,

                    orderId,

                    title:
                        summary.title,

                    service:
                        summary.serviceLabel,

                    total:
                        summary.total,

                    paymentMethod:
                        selectedMethod.name,

                    reference:
                        paymentReference,

                    status:
                        serverOrder.status ||
                        data.status ||
                        "pending"
                });


                setCardNumber("");
                setExpiry("");
                setCvv("");
            } catch (
                requestError
            ) {
                console.error(
                    "Payment error:",
                    requestError
                );

                setError(
                    requestError.message ||
                    "Unable to create the booking."
                );
            } finally {
                setLoading(
                    false
                );
            }
        };


    if (!summary) {
        return (
            <div className="payment-empty-page">

                <img
                    src={
                        centuriaLogo
                    }
                    alt="Centuria Lake Resort"
                />

                <PackageCheck
                    size={54}
                />

                <h1>
                    No Booking Selected
                </h1>

                <p>
                    Select a room, food item, tour or spa treatment before continuing to payment.
                </p>


                <div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/foods"
                            )
                        }
                    >
                        Foods
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/rooms"
                            )
                        }
                    >
                        Rooms
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/tours"
                            )
                        }
                    >
                        Tours
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/spa"
                            )
                        }
                    >
                        Spa
                    </button>

                </div>

            </div>
        );
    }


    return (
        <div className="payment-page">

            <div className="payment-topbar">

                <div>

                    <a href="mailto:info@centuria.lk">
                        <Mail />
                        info@centuria.lk
                    </a>

                    <span />

                    <a href="tel:+94472232232">
                        <Phone />
                        +94 47 223 2232
                    </a>

                </div>


                <div>

                    <button
                        type="button"
                    >
                        <MapPin />
                        Location
                    </button>

                    <button
                        type="button"
                    >
                        <HelpCircle />
                        Help Center
                    </button>

                </div>

            </div>


            <header className="payment-header">

                <button
                    type="button"
                    className="payment-brand"
                    onClick={() =>
                        navigate(
                            "/home"
                        )
                    }
                >

                    <img
                        src={
                            centuriaLogo
                        }
                        alt="Centuria Lake Resort"
                    />


                    <div>

                        <strong>
                            CENTURIA
                        </strong>

                        <span>
                            LAKE RESORT
                        </span>

                    </div>

                </button>


                <nav>

                    {[
                        [
                            "Home",
                            "/home"
                        ],
                        [
                            "About",
                            "/about"
                        ],
                        [
                            "Rooms",
                            "/rooms"
                        ],
                        [
                            "Foods",
                            "/foods"
                        ],
                        [
                            "Tours",
                            "/tours"
                        ],
                        [
                            "Spa",
                            "/spa"
                        ],
                        [
                            "Offers",
                            "/offers"
                        ],
                        [
                            "Contact",
                            "/contact"
                        ]
                    ].map(
                        ([
                            label,
                            route
                        ]) => (
                            <button
                                key={
                                    label
                                }
                                type="button"
                                onClick={() =>
                                    navigate(
                                        route
                                    )
                                }
                            >
                                {
                                    label
                                }
                            </button>
                        )
                    )}

                </nav>


                <div className="payment-header-right">

                    <label>

                        <Search />

                        <input
                            type="text"
                            placeholder="Search..."
                        />

                    </label>


                    <button
                        type="button"
                        className="payment-heart"
                    >
                        <Heart />
                    </button>


                    <button
                        type="button"
                        className="payment-user"
                        onClick={() =>
                            navigate(
                                "/customer-dashboard"
                            )
                        }
                    >

                        <span>

                            {user?.profile_image ? (
                                <img
                                    src={
                                        user.profile_image
                                    }
                                    alt="Profile"
                                />
                            ) : (
                                <UserRound />
                            )}

                        </span>


                        <div>

                            <strong>
                                {user?.full_name ||
                                    user?.name ||
                                    "Centuria Guest"}
                            </strong>

                            <small>
                                Premium Member
                            </small>

                        </div>

                    </button>

                </div>

            </header>


            <section className="payment-hero">

                {summary.image && (
                    <img
                        src={
                            summary.image
                        }
                        alt={
                            summary.title
                        }
                    />
                )}


                <div className="payment-hero-overlay" />


                <div className="payment-hero-copy">

                    <span>
                        CENTURIA SECURE CHECKOUT
                    </span>

                    <h1>
                        Secure{" "}
                        <em>
                            Payment
                        </em>
                    </h1>

                    <p>
                        Complete your booking using our secure checkout experience.
                    </p>

                </div>


                <div className="payment-secure-label">

                    <LockKeyhole />

                    <span>

                        <strong>
                            Secure Checkout
                        </strong>

                        <small>
                            Protected booking details
                        </small>

                    </span>

                </div>

            </section>


            <section className="payment-progress">

                <div className="done">

                    <span>
                        <Check />
                    </span>

                    Select Package

                </div>


                <i />


                <div className="active">

                    <span>
                        2
                    </span>

                    Payment Details

                </div>


                <i />


                <div>

                    <span>
                        3
                    </span>

                    Confirm Booking

                </div>


                <i />


                <div>

                    <span>
                        4
                    </span>

                    Success

                </div>

            </section>


            <main className="payment-layout">

                <section className="payment-main-card">

                    <div className="payment-section-heading">

                        <CreditCard />

                        <div>

                            <h2>
                                Payment Method
                            </h2>

                            <p>
                                Select your preferred payment option
                            </p>

                        </div>

                    </div>


                    <div className="payment-method-grid">

                        {PAYMENT_METHODS.map(
                            item => {
                                const Icon =
                                    item.Icon;

                                return (
                                    <button
                                        key={
                                            item.id
                                        }
                                        type="button"
                                        className={`payment-method payment-method--${item.id} ${
                                            method ===
                                            item.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setMethod(
                                                item.id
                                            );

                                            setError(
                                                ""
                                            );
                                        }}
                                    >

                                        <div className="payment-method-logo">

                                            <Icon />

                                        </div>


                                        <span>
                                            {
                                                item.name
                                            }
                                        </span>


                                        {method ===
                                            item.id && (
                                            <b>
                                                <Check />
                                            </b>
                                        )}

                                    </button>
                                );
                            }
                        )}

                    </div>


                    <div className="payment-divider" />


                    {selectedMethod.type ===
                    "card" ? (
                        <>

                            <div className="payment-section-heading">

                                <CreditCard />

                                <div>

                                    <h2>
                                        Card Details
                                    </h2>

                                    <p>
                                        Enter your payment information
                                    </p>

                                </div>

                            </div>


                            <div className="payment-form">

                                <label className="payment-full">

                                    <span>
                                        Cardholder Name
                                    </span>

                                    <input
                                        type="text"
                                        value={
                                            holderName
                                        }
                                        onChange={
                                            event =>
                                                setHolderName(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        placeholder="Name on card"
                                        autoComplete="off"
                                    />

                                </label>


                                <label className="payment-full">

                                    <span>
                                        Card Number
                                    </span>


                                    <div className="payment-input-icon">

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                                cardNumber
                                            }
                                            onChange={
                                                event =>
                                                    setCardNumber(
                                                        formatCardNumber(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    )
                                            }
                                            placeholder="0000 0000 0000 0000"
                                            autoComplete="off"
                                        />

                                        <CreditCard />

                                    </div>

                                </label>


                                <label>

                                    <span>
                                        Expiry Date
                                    </span>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            expiry
                                        }
                                        onChange={
                                            event =>
                                                setExpiry(
                                                    formatExpiry(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                )
                                        }
                                        placeholder="MM/YY"
                                        autoComplete="off"
                                    />

                                </label>


                                <label>

                                    <span>
                                        Security Code
                                    </span>


                                    <div className="payment-input-icon">

                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={
                                                cvv
                                            }
                                            onChange={
                                                event =>
                                                    setCvv(
                                                        onlyDigits(
                                                            event
                                                                .target
                                                                .value
                                                        ).slice(
                                                            0,
                                                            4
                                                        )
                                                    )
                                            }
                                            placeholder="CVV"
                                            autoComplete="off"
                                        />

                                        <LockKeyhole />

                                    </div>

                                </label>

                            </div>


                            <label className="payment-save-card">

                                <input
                                    type="checkbox"
                                    checked={
                                        saveCard
                                    }
                                    onChange={
                                        event =>
                                            setSaveCard(
                                                event
                                                    .target
                                                    .checked
                                            )
                                    }
                                />

                                <span>
                                    <Check />
                                </span>

                                Save this payment method for future bookings

                            </label>

                        </>
                    ) : (
                        <div className="payment-wallet-panel">

                            <div className="payment-wallet-logo">

                                {(() => {
                                    const Icon =
                                        selectedMethod.Icon;

                                    return (
                                        <Icon />
                                    );
                                })()}

                            </div>


                            <div>

                                <strong>
                                    {
                                        selectedMethod.name
                                    }
                                </strong>

                                <p>
                                    Continue below to confirm your booking using the selected payment method.
                                </p>

                            </div>

                        </div>
                    )}


                    <div className="payment-security-note">

                        <ShieldCheck />

                        <span>
                            Card number and security code are not saved with your booking record.
                        </span>

                    </div>


                    {error && (
                        <div className="payment-error">
                            {
                                error
                            }
                        </div>
                    )}


                    <div className="payment-actions">

                        <button
                            type="button"
                            className="payment-back"
                            onClick={() =>
                                navigate(
                                    -1
                                )
                            }
                        >

                            <ArrowLeft />

                            Back

                        </button>


                        <button
                            type="button"
                            className="payment-confirm"
                            disabled={
                                loading
                            }
                            onClick={
                                handlePayment
                            }
                        >

                            {loading
                                ? "Processing..."
                                : `Confirm & Pay ${money(
                                      summary.total
                                  )}`}


                            {!loading && (
                                <>
                                    <LockKeyhole />
                                    <ChevronRight />
                                </>
                            )}

                        </button>

                    </div>

                </section>


                <aside className="payment-summary-card">

                    <div className="payment-summary-title">

                        <CalendarDays />

                        <div>

                            <h2>
                                Booking Summary
                            </h2>

                            <p>
                                Review your selected service
                            </p>

                        </div>

                    </div>


                    <div className="payment-package">

                        <div className="payment-package-image">

                            {summary.image ? (
                                <img
                                    src={
                                        summary.image
                                    }
                                    alt={
                                        summary.title
                                    }
                                    onError={
                                        event => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }
                                    }
                                />
                            ) : (
                                <PackageCheck />
                            )}

                        </div>


                        <div>

                            <span>
                                {
                                    summary.serviceLabel
                                }
                            </span>

                            <h3>
                                {
                                    summary.title
                                }
                            </h3>

                            <p>
                                {
                                    summary.description
                                }
                            </p>

                        </div>

                    </div>


                    <div className="payment-summary-info">

                        {summary.guestType && (
                            <div>

                                <UserRound />

                                <span>
                                    Guest
                                </span>

                                <strong>
                                    {
                                        summary.guestType
                                    }
                                </strong>

                            </div>
                        )}


                        {summary.portion && (
                            <div>

                                <PackageCheck />

                                <span>
                                    Portion
                                </span>

                                <strong>
                                    {
                                        summary.portion
                                    }
                                </strong>

                            </div>
                        )}


                        {summary.spice && (
                            <div>

                                <PackageCheck />

                                <span>
                                    Spice Level
                                </span>

                                <strong>
                                    {
                                        summary.spice
                                    }
                                </strong>

                            </div>
                        )}


                        {summary.duration && (
                            <div>

                                <Clock3 />

                                <span>
                                    Duration
                                </span>

                                <strong>
                                    {
                                        summary.duration
                                    }
                                </strong>

                            </div>
                        )}


                        {summary.date && (
                            <div>

                                <CalendarDays />

                                <span>
                                    Booking Date
                                </span>

                                <strong>
                                    {
                                        summary.date
                                    }
                                </strong>

                            </div>
                        )}


                        {summary.time && (
                            <div>

                                <Clock3 />

                                <span>
                                    Booking Time
                                </span>

                                <strong>
                                    {
                                        summary.time
                                    }
                                </strong>

                            </div>
                        )}


                        {summary.transport && (
                            <div>

                                <PackageCheck />

                                <span>
                                    Transport
                                </span>

                                <strong>
                                    {
                                        summary.transport
                                    }
                                </strong>

                            </div>
                        )}

                    </div>


                    <div className="payment-price-box">

                        <h3>
                            Price Breakdown
                        </h3>


                        <div>

                            <span>
                                Unit Price
                            </span>

                            <strong>
                                {money(
                                    summary.unitPrice
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Quantity / Sessions
                            </span>

                            <strong>
                                {
                                    summary.quantity
                                }
                            </strong>

                        </div>


                        {Number(
                            checkout?.guestExtra ||
                            checkout?.guest_extra ||
                            0
                        ) > 0 && (
                            <div>

                                <span>
                                    Guest Option
                                </span>

                                <strong>
                                    +{" "}
                                    {money(
                                        checkout.guestExtra ||
                                        checkout.guest_extra
                                    )}
                                </strong>

                            </div>
                        )}


                        {Number(
                            checkout?.durationExtra ||
                            checkout?.duration_extra ||
                            0
                        ) > 0 && (
                            <div>

                                <span>
                                    Duration Option
                                </span>

                                <strong>
                                    +{" "}
                                    {money(
                                        checkout.durationExtra ||
                                        checkout.duration_extra
                                    )}
                                </strong>

                            </div>
                        )}


                        {Number(
                            checkout?.transportExtra ||
                            checkout?.transport_extra ||
                            0
                        ) > 0 && (
                            <div>

                                <span>
                                    Transport
                                </span>

                                <strong>
                                    +{" "}
                                    {money(
                                        checkout.transportExtra ||
                                        checkout.transport_extra
                                    )}
                                </strong>

                            </div>
                        )}

                    </div>


                    <div className="payment-total">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            {money(
                                summary.total
                            )}
                        </strong>

                    </div>


                    <div className="payment-pending-note">

                        <Clock3 />

                        <span>
                            Booking status:
                            <strong>
                                {" "}
                                Pending
                            </strong>
                            . Your reservation will be confirmed after approval by Centuria Lake Resort.
                        </span>

                    </div>

                </aside>

            </main>


            {success && (
                <div className="payment-success-bg">

                    <div className="payment-success-modal">

                        <button
                            type="button"
                            className="payment-success-close"
                            onClick={() =>
                                setSuccess(
                                    null
                                )
                            }
                        >
                            <X />
                        </button>


                        <div className="payment-success-icon">

                            <CheckCircle2 />

                        </div>


                        <span className="payment-success-small">
                            CENTURIA LAKE RESORT
                        </span>


                        <h2>
                            Payment Successful!
                        </h2>


                        <p>
                            Your booking request has been submitted successfully.
                        </p>


                        <div className="payment-success-id">

                            Booking ID:

                            <strong>
                                {" "}
                                #
                                {
                                    success.orderId
                                }
                            </strong>

                        </div>


                        <div className="payment-success-amount">

                            <span>
                                Total
                            </span>

                            <strong>
                                {money(
                                    success.total
                                )}
                            </strong>

                        </div>


                        <div className="payment-success-pending">

                            <Clock3 />

                            <span>
                                Your booking is currently
                                <strong>
                                    {" "}
                                    Pending
                                </strong>
                                . Once the administrator accepts the booking, the status will change to
                                <strong>
                                    {" "}
                                    Confirmed
                                </strong>
                                .
                            </span>

                        </div>


                        <div className="payment-success-buttons">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/customer-dashboard#customer-orders-section"
                                    )
                                }
                            >
                                View My Bookings
                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/customer-dashboard"
                                    )
                                }
                            >

                                Go to Dashboard

                                <ChevronRight />

                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}


export default Payment;