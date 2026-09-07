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
    WalletCards,
    X
} from "lucide-react";

import centuriaLogo
    from "../../assets/images/centuria-logo.png";

import "./Payment.css";


const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost/centuria-hotel/backend";


const PAYMENT_METHODS = [
    {
        id: "mastercard",
        name: "Mastercard",
        short: "MC",
        type: "card"
    },
    {
        id: "visa",
        name: "Visa",
        short: "VISA",
        type: "card"
    },
    {
        id: "apple-pay",
        name: "Apple Pay",
        short: " Pay",
        type: "wallet"
    },
    {
        id: "amazon-pay",
        name: "Amazon Pay",
        short: "amazon",
        type: "wallet"
    },
    {
        id: "ebay-pay",
        name: "eBay Pay",
        short: "eBay",
        type: "wallet"
    },
    {
        id: "amex",
        name: "American Express",
        short: "AMEX",
        type: "card"
    },
    {
        id: "paypal",
        name: "PayPal",
        short: "PayPal",
        type: "wallet"
    },
    {
        id: "other-card",
        name: "Other Card",
        short: "CARD",
        type: "card"
    }
];


const DEMO_CARD = {
    holder: "Sadeepa Lakshan",
    number: "4242424242424242",
    expiry: "12/30",
    cvv: "123"
};


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

        return value
            ? JSON.parse(
                  value
              )
            : fallback;
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

    return token
        ? {
              Authorization:
                  `Bearer ${token}`
          }
        : {};
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
    return onlyDigits(
        value
    )
        .slice(
            0,
            19
        )
        .replace(
            /(.{4})/g,
            "$1 "
        )
        .trim();
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
        digits.length <=
        2
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


function isValidCard(
    number
) {
    const digits =
        onlyDigits(
            number
        );

    if (
        digits.length <
            13 ||
        digits.length >
            19
    ) {
        return false;
    }

    let sum = 0;
    let doubleDigit =
        false;

    for (
        let index =
            digits.length -
            1;
        index >= 0;
        index -= 1
    ) {
        let digit =
            Number(
                digits[
                    index
                ]
            );

        if (
            doubleDigit
        ) {
            digit *= 2;

            if (
                digit > 9
            ) {
                digit -= 9;
            }
        }

        sum += digit;

        doubleDigit =
            !doubleDigit;
    }

    return (
        sum % 10 ===
        0
    );
}


function validExpiry(
    value
) {
    const match =
        String(
            value
        ).match(
            /^(\d{2})\/(\d{2})$/
        );

    if (
        !match
    ) {
        return false;
    }

    const month =
        Number(
            match[
                1
            ]
        );

    const year =
        2000 +
        Number(
            match[
                2
            ]
        );

    if (
        month < 1 ||
        month > 12
    ) {
        return false;
    }

    const today =
        new Date();

    const expiryDate =
        new Date(
            year,
            month,
            0,
            23,
            59,
            59
        );

    return (
        expiryDate >=
        today
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
        "mastercard"
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
        const latestCheckout =
            getCheckout();

        if (
            latestCheckout
        ) {
            setCheckout(
                latestCheckout
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
            if (
                !checkout
            ) {
                return null;
            }

            const quantity =
                Math.max(
                    1,
                    Number(
                        checkout.quantity ||
                        checkout.qty ||
                        checkout.sessions ||
                        checkout.guests ||
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
                        checkout.service_type
                    ),

                serviceLabel:
                    getServiceLabel(
                        checkout.type ||
                        checkout.order_type ||
                        checkout.serviceType ||
                        checkout.service_type
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
                    "Centuria Booking",

                description:
                    checkout.description ||
                    checkout.category ||
                    checkout.package ||
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
                    "",

                duration:
                    checkout.duration ||
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
                    "",

                spice:
                    checkout.spice ||
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


    const fillDemoCard =
        () => {
            setMethod(
                "visa"
            );

            setHolderName(
                DEMO_CARD.holder
            );

            setCardNumber(
                formatCardNumber(
                    DEMO_CARD.number
                )
            );

            setExpiry(
                DEMO_CARD.expiry
            );

            setCvv(
                DEMO_CARD.cvv
            );

            setError("");
        };


    const createDescription =
        () => {
            if (
                !summary
            ) {
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
                `Payment: ${selectedMethod.name}`
            );


            return parts.join(
                " | "
            );
        };


    const validate =
        () => {
            setError("");


            if (
                !summary
            ) {
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
                    "The selected booking does not contain a valid amount."
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
                !isValidCard(
                    cardNumber
                )
            ) {
                setError(
                    "Please enter a valid card number."
                );

                return false;
            }


            if (
                !validExpiry(
                    expiry
                )
            ) {
                setError(
                    "Please enter a valid expiry date."
                );

                return false;
            }


            if (
                !/^\d{3,4}$/.test(
                    cvv
                )
            ) {
                setError(
                    "Please enter a valid CVV."
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


                await new Promise(
                    resolve =>
                        window.setTimeout(
                            resolve,
                            900
                        )
                );


                const paymentReference =
                    `DEMO-PAY-${Date.now()}-${Math.floor(
                        1000 +
                        Math.random() *
                            9000
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
                        summary.total,

                    amount:
                        summary.total,

                    currency:
                        "LKR",

                    status:
                        "pending",

                    payment_status:
                        "demo_paid",

                    payment_method:
                        selectedMethod.name,

                    payment_reference:
                        paymentReference,

                    payment_last4:
                        last4,

                    details: {
                        ...checkout,

                        normalized: {
                            type:
                                summary.type,

                            serviceLabel:
                                summary.serviceLabel,

                            title:
                                summary.title,

                            description:
                                summary.description,

                            image:
                                summary.image,

                            guestType:
                                summary.guestType,

                            duration:
                                summary.duration,

                            date:
                                summary.date,

                            time:
                                summary.time,

                            portion:
                                summary.portion,

                            spice:
                                summary.spice,

                            transport:
                                summary.transport,

                            quantity:
                                summary.quantity,

                            unitPrice:
                                summary.unitPrice,

                            total:
                                summary.total
                        },

                        payment: {
                            mode:
                                "assignment_demo",

                            method:
                                selectedMethod.name,

                            reference:
                                paymentReference,

                            last4,

                            amount:
                                summary.total,

                            currency:
                                "LKR",

                            completedAt:
                                new Date()
                                    .toISOString()
                        }
                    }
                };


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
                        "The server returned an invalid response."
                    );
                }


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
                        data.message ||
                        data.error ||
                        "Unable to create the booking."
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
                            "pending",

                        paymentStatus:
                            "demo_paid",

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
                        paymentReference
                });


                setCardNumber("");
                setExpiry("");
                setCvv("");
            } catch (
                requestError
            ) {
                setError(
                    requestError.message ||
                    "The payment could not be completed."
                );
            } finally {
                setLoading(
                    false
                );
            }
        };


    if (
        !summary
    ) {
        return (
            <div className="payment-empty-page">

                <img
                    src={
                        centuriaLogo
                    }
                    alt="Centuria Lake Resort"
                />

                <PackageCheck
                    size={
                        54
                    }
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
                        Complete your booking using our assignment demonstration checkout experience.
                    </p>

                </div>


                <div className="payment-secure-label">

                    <LockKeyhole />

                    <span>

                        <strong>
                            Demo Secure Checkout
                        </strong>

                        <small>
                            No real money will be charged.
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
                                Choose your preferred demo payment method
                            </p>

                        </div>

                    </div>


                    <div className="payment-method-grid">

                        {PAYMENT_METHODS.map(
                            item => (
                                <button
                                    key={
                                        item.id
                                    }
                                    type="button"
                                    className={`payment-method ${item.id} ${
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

                                    <strong>
                                        {
                                            item.short
                                        }
                                    </strong>

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
                            )
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
                                        Enter demo card information
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                className="payment-demo-card"
                                onClick={
                                    fillDemoCard
                                }
                            >

                                <CreditCard
                                    size={
                                        17
                                    }
                                />

                                Use Demo Card

                                <span>
                                    Assignment Mode
                                </span>

                            </button>


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
                                        placeholder="John Doe"
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
                                            placeholder="4242 4242 4242 4242"
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
                                        CVV
                                    </span>


                                    <div className="payment-input-icon">

                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={
                                                4
                                            }
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
                                            placeholder="123"
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

                                Remember card name and last 4 digits for this demo

                            </label>

                        </>
                    ) : (
                        <div className="payment-wallet-panel">

                            <WalletCards />

                            <div>

                                <strong>
                                    {
                                        selectedMethod.name
                                    }
                                </strong>

                                <p>
                                    This is an assignment demonstration. No external wallet or real money transaction will be started.
                                </p>

                            </div>

                        </div>
                    )}


                    <div className="payment-security-note">

                        <ShieldCheck />

                        <span>
                            Demo mode is enabled. Full card numbers and CVV values are not stored in the Centuria database.
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
                                ? "Processing Demo Payment..."
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
                                Review your selection before confirmation
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

                        <ShieldCheck />

                        <span>
                            After demo payment, this booking will be stored with
                            <strong>
                                {" "}
                                Pending
                            </strong>
                            {" "}
                            status until the admin accepts or declines it.
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
                            Demo payment completed and your booking was submitted successfully.
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


                        <div className="payment-success-pending">

                            <Clock3 />

                            <span>
                                Your booking is now
                                <strong>
                                    {" "}
                                    Pending
                                </strong>
                                . The admin can accept or decline it from the Admin Dashboard.
                            </span>

                        </div>


                        <div className="payment-success-buttons">

                            <button
                                type="button"
                                onClick={() => {
                                    navigate(
                                        "/customer-dashboard"
                                    );

                                    window.setTimeout(
                                        () => {
                                            document
                                                .getElementById(
                                                    "customer-orders-section"
                                                )
                                                ?.scrollIntoView({
                                                    behavior:
                                                        "smooth",
                                                    block:
                                                        "start"
                                                });
                                        },
                                        400
                                    );
                                }}
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