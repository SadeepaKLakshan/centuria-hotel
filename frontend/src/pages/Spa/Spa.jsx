import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    AnimatePresence,
    motion
} from "framer-motion";

import {
    useNavigate
} from "react-router-dom";

import {
    CalendarDays,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CreditCard,
    Flower2,
    Heart,
    HelpCircle,
    ImageOff,
    Leaf,
    Mail,
    MapPin,
    Minus,
    PackageCheck,
    Phone,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    User,
    Users,
    X
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaWhatsapp
} from "react-icons/fa";

import {
    FaTiktok
} from "react-icons/fa6";

import centuriaLogo from "../../assets/images/centuria-logo.png";

import "./Spa.css";


const GUEST_PRICE_EXTRAS = {
    women: 0,
    men: 1000,
    couple: 6500
};


const DURATION_PRICE_EXTRAS = {
    60: 0,
    90: 3500,
    120: 6500
};


const CARD_IMAGES = {
    aroma: [
        "/assets/spa/cards/aromatherapy-massage.jpg",
        "/assets/spa-aroma-massage-CgRYBiDE.jpg",
        "/spa/spa-aroma-massage-CgRYBiDE.jpg"
    ],

    herbal: [
        "/assets/spa/cards/herbal-wellness-therapy.jpg",
        "/assets/spa-herbal-therapy-UqIzaL1C.jpg",
        "/spa/spa-herbal-therapy-UqIzaL1C.jpg"
    ],

    facial: [
        "/assets/spa/cards/luxury-facial-ritual.jpg",
        "/assets/spa-facial-ritual-ngGK7XX7.jpg",
        "/spa/spa-facial-ritual-ngGK7XX7.jpg"
    ],

    stone: [
        "/assets/spa/cards/hot-stone-therapy.jpg",
        "/assets/spa-hot-stone-C5w_NRGc.jpg",
        "/spa/spa-hot-stone-C5w_NRGc.jpg"
    ],

    signature: [
        "/assets/spa/cards/centuria-signature-spa.jpg",
        "/assets/spa-signature-wellness-HRP0OnNn.jpg",
        "/spa/spa-signature-wellness-HRP0OnNn.jpg"
    ],

    couple: [
        "/assets/spa/cards/couple-serenity-retreat.jpg",
        "/spa/spa-couple-serenity-retreat.jpg"
    ],

    body: [
        "/assets/spa/cards/luxury-body-renewal.jpg",
        "/spa/spa-luxury-body-renewal-package.jpg"
    ],

    royal: [
        "/assets/spa/cards/royal-wellness-escape.jpg",
        "/spa/spa-royal-wellness-escape.jpg"
    ]
};


const HERO_SLIDES = [
    {
        id: 1,

        eyebrow:
            "RELAX • REJUVENATE • FEEL ALIVE",

        title:
            "A Moment",

        accent:
            "Just for You",

        description:
            "Indulge in world-class spa treatments at Centuria Lake Resort and rediscover your inner peace.",

        images: [
            "/assets/spa/hero/spa-hero-01.jpg",
            ...CARD_IMAGES.aroma
        ]
    },

    {
        id: 2,

        eyebrow:
            "NATURAL • HERBAL • PEACEFUL",

        title:
            "Wellness",

        accent:
            "From Within",

        description:
            "Reconnect with your body and mind through herbal therapies and restorative wellness rituals.",

        images: [
            "/assets/spa/hero/spa-hero-02.jpg",
            ...CARD_IMAGES.herbal,
            ...CARD_IMAGES.aroma
        ]
    },

    {
        id: 3,

        eyebrow:
            "BEAUTY • CARE • RADIANCE",

        title:
            "Glow",

        accent:
            "Beautifully",

        description:
            "Premium facial and skin rituals designed to refresh, nourish and restore your natural radiance.",

        images: [
            "/assets/spa/hero/spa-hero-03.jpg",
            ...CARD_IMAGES.facial,
            ...CARD_IMAGES.aroma
        ]
    },

    {
        id: 4,

        eyebrow:
            "WARMTH • BALANCE • COMFORT",

        title:
            "Deep",

        accent:
            "Relaxation",

        description:
            "Let warm stones and expert hands release tension and create a deeply calming spa experience.",

        images: [
            "/assets/spa/hero/spa-hero-04.jpg",
            ...CARD_IMAGES.stone,
            ...CARD_IMAGES.aroma
        ]
    },

    {
        id: 5,

        eyebrow:
            "SIGNATURE • PREMIUM • CENTURIA",

        title:
            "Luxury",

        accent:
            "Wellness",

        description:
            "Experience the signature Centuria spa journey with premium care, peaceful ambience and refined service.",

        images: [
            "/assets/spa/hero/spa-hero-05.jpg",
            ...CARD_IMAGES.signature,
            ...CARD_IMAGES.aroma
        ]
    }
];


const CATEGORIES = [
    {
        id: "all",
        label: "All Spa Services",
        icon: "🪷"
    },

    {
        id: "massage",
        label: "Massage Therapies",
        icon: "💆"
    },

    {
        id: "body",
        label: "Body Treatments",
        icon: "🧖"
    },

    {
        id: "facial",
        label: "Facial & Skin Care",
        icon: "✨"
    },

    {
        id: "wellness",
        label: "Beauty & Wellness",
        icon: "🌿"
    },

    {
        id: "couple",
        label: "Couple Spa",
        icon: "♡"
    },

    {
        id: "packages",
        label: "Spa Packages",
        icon: "🎁"
    },

    {
        id: "special",
        label: "Special Treatments",
        icon: "🕊️"
    }
];


const SPA_ITEMS = [
    {
        id: 1,

        category: "massage",

        name:
            "Aromatherapy Massage",

        images:
            CARD_IMAGES.aroma,

        badge:
            "RELAXATION",

        therapist:
            "Certified Therapist",

        benefit:
            "Deep Relaxation",

        description:
            "A calming full-body treatment using premium aromatic oils to relax muscles and restore natural balance.",

        basePrice:
            8500,

        rating:
            4.9,

        reviews:
            126,

        defaultGuest:
            "women",

        defaultDuration:
            60
    },

    {
        id: 2,

        category:
            "wellness",

        name:
            "Herbal Wellness Therapy",

        images:
            CARD_IMAGES.herbal,

        badge:
            "WELLNESS",

        therapist:
            "Wellness Specialist",

        benefit:
            "Body Recovery",

        description:
            "A soothing herbal wellness experience created to reduce tiredness, refresh the body and improve relaxation.",

        basePrice:
            7800,

        rating:
            4.8,

        reviews:
            104,

        defaultGuest:
            "women",

        defaultDuration:
            60
    },

    {
        id: 3,

        category:
            "facial",

        name:
            "Luxury Facial Ritual",

        images:
            CARD_IMAGES.facial,

        badge:
            "BEAUTY",

        therapist:
            "Skin Specialist",

        benefit:
            "Skin Renewal",

        description:
            "A premium facial ritual combining deep cleansing, hydration and nourishing care for refreshed glowing skin.",

        basePrice:
            6900,

        rating:
            4.9,

        reviews:
            142,

        defaultGuest:
            "women",

        defaultDuration:
            60
    },

    {
        id: 4,

        category:
            "special",

        name:
            "Hot Stone Therapy",

        images:
            CARD_IMAGES.stone,

        badge:
            "PREMIUM",

        therapist:
            "Senior Therapist",

        benefit:
            "Muscle Relief",

        description:
            "A deeply relaxing hot stone treatment designed to release muscle tension and create complete body comfort.",

        basePrice:
            9800,

        rating:
            4.9,

        reviews:
            118,

        defaultGuest:
            "women",

        defaultDuration:
            60
    },

    {
        id: 5,

        category:
            "packages",

        name:
            "Centuria Signature Spa",

        images:
            CARD_IMAGES.signature,

        badge:
            "SIGNATURE",

        therapist:
            "Master Therapist",

        benefit:
            "Total Wellness",

        description:
            "Our signature luxury wellness experience combines relaxation, premium care and an unforgettable spa journey.",

        basePrice:
            12500,

        rating:
            5.0,

        reviews:
            186,

        defaultGuest:
            "women",

        defaultDuration:
            60
    },

    {
        id: 6,

        category:
            "couple",

        name:
            "Couple Serenity Retreat",

        images:
            CARD_IMAGES.couple,

        badge:
            "COUPLE",

        therapist:
            "Couple Spa Team",

        benefit:
            "Shared Relaxation",

        description:
            "A romantic spa ritual for two with relaxing massage, aromatic oils and a peaceful private treatment setting.",

        basePrice:
            11000,

        rating:
            4.9,

        reviews:
            92,

        defaultGuest:
            "couple",

        defaultDuration:
            90
    },

    {
        id: 7,

        category:
            "body",

        name:
            "Luxury Body Renewal Package",

        images:
            CARD_IMAGES.body,

        badge:
            "BODY CARE",

        therapist:
            "Body Care Expert",

        benefit:
            "Full Body Renewal",

        description:
            "A complete body renewal package with exfoliation, nourishing treatment and a relaxing finishing ritual.",

        basePrice:
            13500,

        rating:
            4.8,

        reviews:
            74,

        defaultGuest:
            "women",

        defaultDuration:
            90
    },

    {
        id: 8,

        category:
            "packages",

        name:
            "Royal Wellness Escape",

        images:
            CARD_IMAGES.royal,

        badge:
            "ROYAL",

        therapist:
            "Premium Spa Team",

        benefit:
            "Ultimate Wellness",

        description:
            "A premium Centuria wellness package combining massage, facial care, body relaxation and luxury finishing touches.",

        basePrice:
            20500,

        rating:
            5.0,

        reviews:
            61,

        defaultGuest:
            "women",

        defaultDuration:
            120
    }
];


const GUESTS = [
    {
        id: "women",
        label: "Women"
    },

    {
        id: "men",
        label: "Men"
    },

    {
        id: "couple",
        label: "Couple"
    }
];


const DURATIONS = [
    60,
    90,
    120
];


const FILTERS = [
    {
        label:
            "Massage Therapy",
        value:
            "massage"
    },

    {
        label:
            "Body Treatment",
        value:
            "body"
    },

    {
        label:
            "Facial Care",
        value:
            "facial"
    },

    {
        label:
            "Beauty & Wellness",
        value:
            "wellness"
    },

    {
        label:
            "Couple Spa",
        value:
            "couple"
    },

    {
        label:
            "Spa Packages",
        value:
            "packages"
    },

    {
        label:
            "Special Treatments",
        value:
            "special"
    }
];


function money(value) {
    return `LKR ${Number(
        value || 0
    ).toLocaleString(
        "en-LK"
    )}`;
}


function readJson(
    key,
    fallback
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


function getTreatmentPrice(
    item,
    guest,
    duration
) {
    const guestExtra =
        GUEST_PRICE_EXTRAS[
            guest
        ] || 0;

    const durationExtra =
        DURATION_PRICE_EXTRAS[
            Number(
                duration
            )
        ] || 0;

    return (
        Number(
            item.basePrice
        ) +
        guestExtra +
        durationExtra
    );
}


function HeroImage({
    slide
}) {
    const [
        imageIndex,
        setImageIndex
    ] = useState(0);


    useEffect(() => {
        setImageIndex(0);
    }, [
        slide.id
    ]);


    const source =
        slide.images[
            imageIndex
        ];


    if (!source) {
        return (
            <div className="spa-page__image-placeholder">
                <ImageOff />

                <strong>
                    Hero image unavailable
                </strong>
            </div>
        );
    }


    return (
        <img
            src={source}
            alt={slide.title}
            loading="eager"
            decoding="async"
            onError={() =>
                setImageIndex(
                    previous =>
                        previous + 1
                )
            }
        />
    );
}


function SpaImage({
    item,
    className = ""
}) {
    const [
        imageIndex,
        setImageIndex
    ] = useState(0);


    useEffect(() => {
        setImageIndex(0);
    }, [
        item.id
    ]);


    const source =
        item.images[
            imageIndex
        ];


    return (
        <div
            className={
                `spa-page__image-slot ${className}`
            }
        >
            {source ? (
                <img
                    src={source}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                        setImageIndex(
                            previous =>
                                previous +
                                1
                        )
                    }
                />
            ) : (
                <div className="spa-page__image-placeholder">
                    <ImageOff
                        size={30}
                    />

                    <strong>
                        Image not added
                    </strong>

                    <span>
                        {item.name}
                    </span>
                </div>
            )}
        </div>
    );
}


function Spa() {
    const navigate =
        useNavigate();

    const categoryRef =
        useRef(null);

    const treatmentsRef =
        useRef(null);


    const [
        splash,
        setSplash
    ] = useState(true);

    const [
        heroIndex,
        setHeroIndex
    ] = useState(0);

    const [
        category,
        setCategory
    ] = useState("all");

    const [
        search,
        setSearch
    ] = useState("");

    const [
        maxPrice,
        setMaxPrice
    ] = useState(50000);

    const [
        selectedFilters,
        setSelectedFilters
    ] = useState([]);

    const [
        sort,
        setSort
    ] = useState("popular");

    const [
        favorites,
        setFavorites
    ] = useState(
        () =>
            readJson(
                "centuria_spa_favorites",
                []
            )
    );

    const [
        selections,
        setSelections
    ] = useState({});

    const [
        savedOnly,
        setSavedOnly
    ] = useState(false);

    const [
        booking,
        setBooking
    ] = useState(null);

    const [
        bookingGuest,
        setBookingGuest
    ] = useState("women");

    const [
        bookingDuration,
        setBookingDuration
    ] = useState(60);

    const [
        bookingDate,
        setBookingDate
    ] = useState("");

    const [
        bookingTime,
        setBookingTime
    ] = useState("10:00");

    const [
        bookingQuantity,
        setBookingQuantity
    ] = useState(1);


    const user =
        readJson(
            "centuria_user",
            null
        );


    const hero =
        HERO_SLIDES[
            heroIndex
        ];


    useEffect(() => {
        const timer =
            window.setTimeout(
                () => {
                    setSplash(
                        false
                    );
                },
                850
            );

        return () =>
            window.clearTimeout(
                timer
            );
    }, []);


    useEffect(() => {
        const timer =
            window.setInterval(
                () => {
                    setHeroIndex(
                        previous =>
                            previous ===
                            HERO_SLIDES.length -
                                1
                                ? 0
                                : previous +
                                  1
                    );
                },
                6000
            );

        return () =>
            window.clearInterval(
                timer
            );
    }, []);


    useEffect(() => {
        localStorage.setItem(
            "centuria_spa_favorites",
            JSON.stringify(
                favorites
            )
        );
    }, [
        favorites
    ]);


    const smoothScrollTo =
        element => {
            if (!element) {
                return;
            }

            const headerOffset =
                112;

            const target =
                element
                    .getBoundingClientRect()
                    .top +
                window.scrollY -
                headerOffset;

            window.requestAnimationFrame(
                () => {
                    window.scrollTo({
                        top:
                            Math.max(
                                0,
                                target
                            ),

                        behavior:
                            "smooth"
                    });
                }
            );
        };


    const getSelection =
        item =>
            selections[
                item.id
            ] || {
                guest:
                    item.defaultGuest,

                duration:
                    item.defaultDuration
            };


    const updateSelection =
        (
            item,
            field,
            value
        ) => {
            setSelections(
                previous => ({
                    ...previous,

                    [item.id]: {
                        ...getSelection(
                            item
                        ),

                        [field]:
                            value
                    }
                })
            );
        };


    const getCardPrice =
        item => {
            const selected =
                getSelection(
                    item
                );

            return getTreatmentPrice(
                item,
                selected.guest,
                selected.duration
            );
        };


    const filteredItems =
        useMemo(() => {
            const keyword =
                search
                    .trim()
                    .toLowerCase();


            let items =
                SPA_ITEMS.filter(
                    item => {
                        if (
                            category !==
                                "all" &&
                            item.category !==
                                category
                        ) {
                            return false;
                        }


                        if (
                            savedOnly &&
                            !favorites.includes(
                                item.id
                            )
                        ) {
                            return false;
                        }


                        if (
                            item.basePrice >
                            maxPrice
                        ) {
                            return false;
                        }


                        if (
                            selectedFilters.length >
                                0 &&
                            !selectedFilters.includes(
                                item.category
                            )
                        ) {
                            return false;
                        }


                        if (
                            keyword &&
                            !`${item.name} ${item.category} ${item.badge} ${item.description}`
                                .toLowerCase()
                                .includes(
                                    keyword
                                )
                        ) {
                            return false;
                        }


                        return true;
                    }
                );


            items =
                [...items].sort(
                    (
                        a,
                        b
                    ) => {
                        if (
                            sort ===
                            "rating"
                        ) {
                            return (
                                b.rating -
                                a.rating
                            );
                        }


                        if (
                            sort ===
                            "price-low"
                        ) {
                            return (
                                a.basePrice -
                                b.basePrice
                            );
                        }


                        if (
                            sort ===
                            "price-high"
                        ) {
                            return (
                                b.basePrice -
                                a.basePrice
                            );
                        }


                        if (
                            sort ===
                            "name"
                        ) {
                            return a.name.localeCompare(
                                b.name
                            );
                        }


                        return (
                            b.reviews -
                            a.reviews
                        );
                    }
                );


            return items;
        }, [
            category,
            favorites,
            maxPrice,
            savedOnly,
            search,
            selectedFilters,
            sort
        ]);


    const savedItems =
        useMemo(
            () =>
                SPA_ITEMS.filter(
                    item =>
                        favorites.includes(
                            item.id
                        )
                ),
            [
                favorites
            ]
        );


    const toggleFavorite =
        id => {
            setFavorites(
                previous =>
                    previous.includes(
                        id
                    )
                        ? previous.filter(
                              value =>
                                  value !==
                                  id
                          )
                        : [
                              ...previous,
                              id
                          ]
            );
        };


    const chooseCategory =
        id => {
            setCategory(
                id
            );

            setSavedOnly(
                false
            );

            window.requestAnimationFrame(
                () => {
                    smoothScrollTo(
                        treatmentsRef.current
                    );
                }
            );
        };


    const toggleFilter =
        value => {
            setSelectedFilters(
                previous =>
                    previous.includes(
                        value
                    )
                        ? previous.filter(
                              item =>
                                  item !==
                                  value
                          )
                        : [
                              ...previous,
                              value
                          ]
            );
        };


    const clearFilters =
        () => {
            setSearch("");

            setMaxPrice(
                50000
            );

            setSelectedFilters(
                []
            );

            setCategory(
                "all"
            );

            setSavedOnly(
                false
            );

            setSort(
                "popular"
            );
        };


    const openBooking =
        item => {
            const selected =
                getSelection(
                    item
                );

            setBooking(
                item
            );

            setBookingGuest(
                selected.guest
            );

            setBookingDuration(
                selected.duration
            );

            setBookingDate("");

            setBookingTime(
                "10:00"
            );

            setBookingQuantity(
                1
            );
        };


    const bookingUnitPrice =
        booking
            ? getTreatmentPrice(
                  booking,
                  bookingGuest,
                  bookingDuration
              )
            : 0;


    const bookingTotal =
        bookingUnitPrice *
        bookingQuantity;


    const continuePayment =
        () => {
            if (!booking) {
                return;
            }


            const checkout = {
                type:
                    "spa",

                spaId:
                    booking.id,

                name:
                    booking.name,

                category:
                    booking.category,

                image:
                    booking.images[
                        0
                    ],

                guestType:
                    bookingGuest,

                duration:
                    bookingDuration,

                date:
                    bookingDate,

                time:
                    bookingTime,

                quantity:
                    bookingQuantity,

                basePrice:
                    booking.basePrice,

                guestExtra:
                    GUEST_PRICE_EXTRAS[
                        bookingGuest
                    ],

                durationExtra:
                    DURATION_PRICE_EXTRAS[
                        bookingDuration
                    ],

                unitPrice:
                    bookingUnitPrice,

                total:
                    bookingTotal,

                createdAt:
                    new Date()
                        .toISOString()
            };


            localStorage.setItem(
                "centuria_spa_checkout",
                JSON.stringify(
                    checkout
                )
            );


            setBooking(
                null
            );

            navigate(
                "/spa-payment"
            );
        };


    return (
        <div className="spa-page">

            <AnimatePresence>
                {splash && (
                    <motion.div
                        className="spa-page__splash"
                        initial={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        transition={{
                            duration: 0.3
                        }}
                    >
                        <motion.div
                            className="spa-page__splash-logo"
                            initial={{
                                scale: 0.88,
                                opacity: 0
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1
                            }}
                            transition={{
                                duration: 0.4
                            }}
                        >
                            <img
                                src={
                                    centuriaLogo
                                }
                                alt="Centuria"
                            />
                        </motion.div>

                        <h2>
                            CENTURIA SPA
                        </h2>

                        <span>
                            RELAX • REJUVENATE • RESTORE
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>


            <div className="spa-page__topbar">

                <div>
                    <a href="mailto:info@centuria.lk">
                        <Mail />
                        info@centuria.lk
                    </a>

                    <i />

                    <a href="tel:+94472232232">
                        <Phone />
                        +94 47 223 2232
                    </a>
                </div>


                <div>
                    <button type="button">
                        <MapPin />
                        Location
                    </button>

                    <button type="button">
                        <HelpCircle />
                        Help Center
                    </button>
                </div>

            </div>


            <header className="spa-page__header">

                <button
                    type="button"
                    className="spa-page__brand"
                    onClick={() =>
                        navigate(
                            "/home"
                        )
                    }
                >
                    <span>
                        <img
                            src={
                                centuriaLogo
                            }
                            alt="Centuria Lake Resort"
                        />
                    </span>

                    <div>
                        <strong>
                            CENTURIA
                        </strong>

                        <small>
                            LAKE RESORT
                        </small>
                    </div>
                </button>


                <nav className="spa-page__nav">

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
                                className={
                                    label ===
                                    "Spa"
                                        ? "active"
                                        : ""
                                }
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


                <div className="spa-page__header-actions">

                    <label className="spa-page__search">
                        <Search />

                        <input
                            value={
                                search
                            }
                            onChange={
                                event =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                            }
                            placeholder="Search spa treatments..."
                        />
                    </label>


                    <button
                        type="button"
                        className="spa-page__saved-top"
                        onClick={() => {
                            setSavedOnly(
                                true
                            );

                            setCategory(
                                "all"
                            );

                            smoothScrollTo(
                                treatmentsRef.current
                            );
                        }}
                    >
                        <Heart />

                        {favorites.length >
                            0 && (
                            <span>
                                {
                                    favorites.length
                                }
                            </span>
                        )}
                    </button>


                    {user ? (
                        <button
                            type="button"
                            className="spa-page__user"
                            onClick={() =>
                                navigate(
                                    "/customer-dashboard"
                                )
                            }
                        >
                            <span>
                                {user.profile_image ? (
                                    <img
                                        src={
                                            user.profile_image
                                        }
                                        alt="Profile"
                                    />
                                ) : (
                                    <User />
                                )}
                            </span>

                            <div>
                                <strong>
                                    {user.full_name ||
                                        user.name ||
                                        "Centuria Guest"}
                                </strong>

                                <small>
                                    Premium Member
                                </small>
                            </div>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="spa-page__login"
                            onClick={() =>
                                navigate(
                                    "/portal?mode=login"
                                )
                            }
                        >
                            <User />
                            Login
                        </button>
                    )}

                </div>

            </header>


            <section className="spa-page__hero">

                <AnimatePresence
                    mode="wait"
                >
                    <motion.div
                        key={
                            hero.id
                        }
                        className="spa-page__hero-picture"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        transition={{
                            duration: 0.45
                        }}
                    >
                        <HeroImage
                            slide={
                                hero
                            }
                        />
                    </motion.div>
                </AnimatePresence>


                <div className="spa-page__hero-overlay" />


                <button
                    type="button"
                    className="spa-page__hero-arrow left"
                    onClick={() =>
                        setHeroIndex(
                            previous =>
                                previous ===
                                0
                                    ? HERO_SLIDES.length -
                                      1
                                    : previous -
                                      1
                        )
                    }
                >
                    <ChevronLeft />
                </button>


                <div className="spa-page__hero-copy">

                    <span>
                        {
                            hero.eyebrow
                        }
                    </span>


                    <h1>
                        {
                            hero.title
                        }

                        <em>
                            {
                                hero.accent
                            }
                        </em>
                    </h1>


                    <p>
                        {
                            hero.description
                        }
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            smoothScrollTo(
                                treatmentsRef.current
                            )
                        }
                    >
                        Book Your Spa Experience

                        <ChevronRight />
                    </button>

                </div>


                <div className="spa-page__hero-benefits">

                    {[
                        [
                            User,
                            "Professional Therapists"
                        ],

                        [
                            Leaf,
                            "Natural & Herbal Products"
                        ],

                        [
                            Sparkles,
                            "Peaceful Lake View"
                        ],

                        [
                            Heart,
                            "Unforgettable Experience"
                        ]
                    ].map(
                        ([
                            Icon,
                            label
                        ]) => (
                            <div
                                key={
                                    label
                                }
                            >
                                <Icon />

                                <strong>
                                    {
                                        label
                                    }
                                </strong>
                            </div>
                        )
                    )}

                </div>


                <button
                    type="button"
                    className="spa-page__hero-arrow right"
                    onClick={() =>
                        setHeroIndex(
                            previous =>
                                previous ===
                                HERO_SLIDES.length -
                                    1
                                    ? 0
                                    : previous +
                                      1
                        )
                    }
                >
                    <ChevronRight />
                </button>


                <div className="spa-page__hero-dots">

                    {HERO_SLIDES.map(
                        (
                            slide,
                            index
                        ) => (
                            <button
                                key={
                                    slide.id
                                }
                                type="button"
                                className={
                                    heroIndex ===
                                    index
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setHeroIndex(
                                        index
                                    )
                                }
                            />
                        )
                    )}

                </div>

            </section>


            <section className="spa-page__categories">

                <button
                    type="button"
                    className="spa-page__category-arrow"
                    onClick={() =>
                        categoryRef
                            .current
                            ?.scrollBy({
                                left:
                                    -600,

                                behavior:
                                    "smooth"
                            })
                    }
                >
                    <ChevronLeft />
                </button>


                <div
                    ref={
                        categoryRef
                    }
                    className="spa-page__category-list"
                >

                    {CATEGORIES.map(
                        item => (
                            <button
                                key={
                                    item.id
                                }
                                type="button"
                                className={`spa-page__category ${
                                    category ===
                                        item.id &&
                                    !savedOnly
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    chooseCategory(
                                        item.id
                                    )
                                }
                            >
                                <span>
                                    {
                                        item.icon
                                    }
                                </span>

                                <strong>
                                    {
                                        item.label
                                    }
                                </strong>
                            </button>
                        )
                    )}

                </div>


                <button
                    type="button"
                    className="spa-page__category-arrow"
                    onClick={() =>
                        categoryRef
                            .current
                            ?.scrollBy({
                                left:
                                    600,

                                behavior:
                                    "smooth"
                            })
                    }
                >
                    <ChevronRight />
                </button>

            </section>


            <main className="spa-page__main">

                <aside className="spa-page__filters">

                    <div className="spa-page__panel-title">
                        <Search />

                        <span>
                            <strong>
                                Search & Filter
                            </strong>

                            <small>
                                Find your ideal treatment
                            </small>
                        </span>
                    </div>


                    <label className="spa-page__filter-search">
                        <Search />

                        <input
                            value={
                                search
                            }
                            onChange={
                                event =>
                                    setSearch(
                                        event
                                            .target
                                            .value
                                    )
                            }
                            placeholder="Search treatments..."
                        />
                    </label>


                    <div className="spa-page__filter-block">

                        <div>
                            <strong>
                                Price Range
                            </strong>

                            <span>
                                LKR 2,500 -{" "}
                                {Number(
                                    maxPrice
                                ).toLocaleString()}
                            </span>
                        </div>


                        <input
                            type="range"
                            min="2500"
                            max="50000"
                            step="500"
                            value={
                                maxPrice
                            }
                            onChange={
                                event =>
                                    setMaxPrice(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                            }
                        />

                    </div>


                    <div className="spa-page__filter-block">

                        <strong>
                            Treatment Type
                        </strong>


                        {FILTERS.map(
                            item => (
                                <label
                                    key={
                                        item.value
                                    }
                                    className="spa-page__checkbox"
                                >
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedFilters.includes(
                                                item.value
                                            )
                                        }
                                        onChange={() =>
                                            toggleFilter(
                                                item.value
                                            )
                                        }
                                    />

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>
                                </label>
                            )
                        )}

                    </div>


                    <div className="spa-page__filter-actions">

                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear Filters
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                smoothScrollTo(
                                    treatmentsRef.current
                                )
                            }
                        >
                            Apply Filters
                        </button>

                    </div>

                </aside>


                <div className="spa-page__center">

                    {savedItems.length >
                        0 && (
                        <section className="spa-page__saved">

                            <div className="spa-page__section-head">

                                <div>
                                    <Heart />

                                    <span>
                                        <strong>
                                            Saved Spa Treatments
                                        </strong>

                                        <small>
                                            Your favourite wellness experiences
                                        </small>
                                    </span>
                                </div>


                                <button
                                    type="button"
                                    onClick={() => {
                                        setSavedOnly(
                                            true
                                        );

                                        setCategory(
                                            "all"
                                        );
                                    }}
                                >
                                    View All
                                </button>

                            </div>


                            <div className="spa-page__saved-grid">

                                {savedItems
                                    .slice(
                                        0,
                                        4
                                    )
                                    .map(
                                        item => (
                                            <button
                                                key={
                                                    item.id
                                                }
                                                type="button"
                                                className="spa-page__saved-card"
                                                onClick={() =>
                                                    openBooking(
                                                        item
                                                    )
                                                }
                                            >
                                                <SpaImage
                                                    item={
                                                        item
                                                    }
                                                />

                                                <div />

                                                <span>
                                                    <strong>
                                                        {
                                                            item.name
                                                        }
                                                    </strong>

                                                    <small>
                                                        {money(
                                                            getCardPrice(
                                                                item
                                                            )
                                                        )}
                                                    </small>
                                                </span>
                                            </button>
                                        )
                                    )}

                            </div>

                        </section>
                    )}


                    <section
                        ref={
                            treatmentsRef
                        }
                        className="spa-page__treatments"
                    >

                        <div className="spa-page__section-head">

                            <div>
                                <Flower2 />

                                <span>
                                    <strong>
                                        {savedOnly
                                            ? "Saved Spa Treatments"
                                            : category ===
                                              "all"
                                            ? "Popular Spa Treatments"
                                            : CATEGORIES.find(
                                                  item =>
                                                      item.id ===
                                                      category
                                              )
                                                  ?.label}
                                    </strong>

                                    <small>
                                        {
                                            filteredItems.length
                                        }{" "}
                                        premium experiences available
                                    </small>
                                </span>
                            </div>


                            <select
                                value={
                                    sort
                                }
                                onChange={
                                    event =>
                                        setSort(
                                            event
                                                .target
                                                .value
                                        )
                                }
                            >
                                <option value="popular">
                                    Sort by: Popular
                                </option>

                                <option value="rating">
                                    Highest Rated
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="name">
                                    Name: A-Z
                                </option>
                            </select>

                        </div>


                        {filteredItems.length ===
                        0 ? (
                            <div className="spa-page__empty">

                                <Search />

                                <h3>
                                    No treatments found
                                </h3>

                                <p>
                                    Change your search or filters and try again.
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Reset Filters
                                </button>

                            </div>
                        ) : (
                            <div className="spa-page__grid">

                                {filteredItems.map(
                                    item => {
                                        const selected =
                                            getSelection(
                                                item
                                            );

                                        const cardPrice =
                                            getTreatmentPrice(
                                                item,
                                                selected.guest,
                                                selected.duration
                                            );


                                        return (
                                            <article
                                                key={
                                                    item.id
                                                }
                                                className="spa-page__card"
                                            >

                                                <div className="spa-page__card-line" />

                                                <div className="spa-page__card-shine" />


                                                <div className="spa-page__card-media">

                                                    <SpaImage
                                                        item={
                                                            item
                                                        }
                                                    />


                                                    <span className="spa-page__rating">

                                                        <Star
                                                            fill="currentColor"
                                                        />

                                                        {
                                                            item.rating
                                                        }

                                                        <small>
                                                            (
                                                            {
                                                                item.reviews
                                                            }
                                                            )
                                                        </small>

                                                    </span>


                                                    <button
                                                        type="button"
                                                        className={`spa-page__heart ${
                                                            favorites.includes(
                                                                item.id
                                                            )
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            toggleFavorite(
                                                                item.id
                                                            )
                                                        }
                                                    >
                                                        <Heart
                                                            fill={
                                                                favorites.includes(
                                                                    item.id
                                                                )
                                                                    ? "currentColor"
                                                                    : "none"
                                                            }
                                                        />
                                                    </button>


                                                    <span className="spa-page__badge">

                                                        <Sparkles />

                                                        {
                                                            item.badge
                                                        }

                                                    </span>

                                                </div>


                                                <div className="spa-page__card-body">

                                                    <h3>
                                                        {
                                                            item.name
                                                        }
                                                    </h3>


                                                    <p>
                                                        {
                                                            item.description
                                                        }
                                                    </p>


                                                    <div className="spa-page__features">

                                                        <div>
                                                            <CheckCircle2 />

                                                            <strong>
                                                                {
                                                                    item.therapist
                                                                }
                                                            </strong>
                                                        </div>


                                                        <div>
                                                            <Sparkles />

                                                            <strong>
                                                                {
                                                                    item.benefit
                                                                }
                                                            </strong>
                                                        </div>

                                                    </div>


                                                    <div className="spa-page__option-box">

                                                        <div className="spa-page__option-title">

                                                            <span>
                                                                <Leaf />

                                                                TREATMENT FOR
                                                            </span>

                                                            <small>
                                                                Choose Guest
                                                            </small>

                                                        </div>


                                                        <div className="spa-page__guest-options">

                                                            {GUESTS.map(
                                                                guest => (
                                                                    <button
                                                                        key={
                                                                            guest.id
                                                                        }
                                                                        type="button"
                                                                        className={
                                                                            selected.guest ===
                                                                            guest.id
                                                                                ? "active"
                                                                                : ""
                                                                        }
                                                                        onClick={() =>
                                                                            updateSelection(
                                                                                item,
                                                                                "guest",
                                                                                guest.id
                                                                            )
                                                                        }
                                                                    >
                                                                        {guest.id ===
                                                                        "couple" ? (
                                                                            <Users />
                                                                        ) : (
                                                                            <User />
                                                                        )}

                                                                        {
                                                                            guest.label
                                                                        }
                                                                    </button>
                                                                )
                                                            )}

                                                        </div>

                                                    </div>


                                                    <div className="spa-page__option-box">

                                                        <div className="spa-page__option-title">

                                                            <span>
                                                                <Clock3 />

                                                                DURATION
                                                            </span>

                                                            <small>
                                                                Choose Time
                                                            </small>

                                                        </div>


                                                        <div className="spa-page__duration-options">

                                                            {DURATIONS.map(
                                                                duration => (
                                                                    <button
                                                                        key={
                                                                            duration
                                                                        }
                                                                        type="button"
                                                                        className={
                                                                            Number(
                                                                                selected.duration
                                                                            ) ===
                                                                            duration
                                                                                ? "active"
                                                                                : ""
                                                                        }
                                                                        onClick={() =>
                                                                            updateSelection(
                                                                                item,
                                                                                "duration",
                                                                                duration
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            duration
                                                                        }{" "}
                                                                        Min
                                                                    </button>
                                                                )
                                                            )}

                                                        </div>

                                                    </div>


                                                    <div className="spa-page__price">

                                                        <span>
                                                            <small>
                                                                TREATMENT PRICE
                                                            </small>

                                                            <strong>
                                                                {money(
                                                                    cardPrice
                                                                )}
                                                            </strong>

                                                            <em>
                                                                per session
                                                            </em>
                                                        </span>


                                                        <b>
                                                            {GUESTS.find(
                                                                guest =>
                                                                    guest.id ===
                                                                    selected.guest
                                                            )
                                                                ?.label ||
                                                                "Women"}

                                                            <small>
                                                                {
                                                                    selected.duration
                                                                }{" "}
                                                                Min
                                                            </small>
                                                        </b>

                                                    </div>


                                                    <div className="spa-page__price-breakdown">

                                                        <span>
                                                            Base{" "}
                                                            {money(
                                                                item.basePrice
                                                            )}
                                                        </span>

                                                        {GUEST_PRICE_EXTRAS[
                                                            selected
                                                                .guest
                                                        ] >
                                                            0 && (
                                                            <span>
                                                                Guest +
                                                                {money(
                                                                    GUEST_PRICE_EXTRAS[
                                                                        selected
                                                                            .guest
                                                                    ]
                                                                )}
                                                            </span>
                                                        )}

                                                        {DURATION_PRICE_EXTRAS[
                                                            selected
                                                                .duration
                                                        ] >
                                                            0 && (
                                                            <span>
                                                                Duration +
                                                                {money(
                                                                    DURATION_PRICE_EXTRAS[
                                                                        selected
                                                                            .duration
                                                                    ]
                                                                )}
                                                            </span>
                                                        )}

                                                    </div>


                                                    <button
                                                        type="button"
                                                        className="spa-page__book"
                                                        onClick={() =>
                                                            openBooking(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        <CalendarDays />

                                                        Book Now

                                                        <ChevronRight />
                                                    </button>

                                                </div>

                                            </article>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </section>

                </div>


                <aside className="spa-page__right">

                    <section className="spa-page__offer">

                        <SpaImage
                            item={
                                SPA_ITEMS[0]
                            }
                        />

                        <div />

                        <span>
                            Special
                        </span>

                        <h3>
                            Spa Offers
                        </h3>

                        <p>
                            Pamper yourself with exclusive spa packages and premium wellness experiences.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/offers"
                                )
                            }
                        >
                            View Offers
                            <ChevronRight />
                        </button>

                    </section>


                    <section className="spa-page__why">

                        <h3>
                            Why Choose Our Spa?
                        </h3>


                        {[
                            [
                                User,
                                "Professional & Certified Therapists"
                            ],

                            [
                                Leaf,
                                "Natural & Herbal Products"
                            ],

                            [
                                ShieldCheck,
                                "Hygienic & Safe Environment"
                            ],

                            [
                                Sparkles,
                                "Stunning Lake View"
                            ],

                            [
                                Users,
                                "Customized Treatments"
                            ],

                            [
                                Heart,
                                "Relaxing & Peaceful Ambience"
                            ]
                        ].map(
                            ([
                                Icon,
                                text
                            ]) => (
                                <span
                                    key={
                                        text
                                    }
                                >
                                    <Icon />

                                    {
                                        text
                                    }
                                </span>
                            )
                        )}

                    </section>


                    <section className="spa-page__safe">

                        <div>
                            <PackageCheck />

                            <span>
                                <strong>
                                    Easy Booking
                                </strong>

                                <small>
                                    Choose treatment, guest and duration.
                                </small>
                            </span>
                        </div>


                        <div>
                            <CreditCard />

                            <span>
                                <strong>
                                    Secure Payment
                                </strong>

                                <small>
                                    Continue safely to payment.
                                </small>
                            </span>
                        </div>

                    </section>

                </aside>

            </main>


            <footer className="spa-page__footer">

                <div className="spa-page__footer-main">

                    <div className="spa-page__footer-brand">

                        <div>
                            <img
                                src={
                                    centuriaLogo
                                }
                                alt="Centuria"
                            />

                            <span>
                                <strong>
                                    CENTURIA
                                </strong>

                                <small>
                                    LAKE RESORT
                                </small>
                            </span>
                        </div>


                        <p>
                            Relax, restore and reconnect with premium wellness experiences at Centuria Lake Resort.
                        </p>


                        <div className="spa-page__socials">

                            <button
                                type="button"
                                aria-label="Facebook"
                            >
                                <FaFacebookF />
                            </button>

                            <button
                                type="button"
                                aria-label="Instagram"
                            >
                                <FaInstagram />
                            </button>

                            <button
                                type="button"
                                aria-label="WhatsApp"
                            >
                                <FaWhatsapp />
                            </button>

                            <button
                                type="button"
                                aria-label="TikTok"
                            >
                                <FaTiktok />
                            </button>

                        </div>

                    </div>


                    <div className="spa-page__footer-column">

                        <h4>
                            Spa Services
                        </h4>

                        <button
                            type="button"
                            onClick={() =>
                                chooseCategory(
                                    "massage"
                                )
                            }
                        >
                            Massage Therapies
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                chooseCategory(
                                    "facial"
                                )
                            }
                        >
                            Facial & Skin Care
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                chooseCategory(
                                    "couple"
                                )
                            }
                        >
                            Couple Spa
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                chooseCategory(
                                    "packages"
                                )
                            }
                        >
                            Spa Packages
                        </button>

                    </div>


                    <div className="spa-page__footer-column">

                        <h4>
                            Guest Policies
                        </h4>

                        <button type="button">
                            Spa Etiquette
                        </button>

                        <button type="button">
                            Booking Policy
                        </button>

                        <button type="button">
                            Cancellation Policy
                        </button>

                        <button type="button">
                            Privacy Policy
                        </button>

                    </div>


                    <div className="spa-page__footer-contact">

                        <h4>
                            Contact Us
                        </h4>

                        <span>
                            <MapPin />
                            Centuria Lake Resort, Sri Lanka
                        </span>

                        <span>
                            <Phone />
                            +94 47 223 2232
                        </span>

                        <span>
                            <Mail />
                            info@centuria.lk
                        </span>

                    </div>

                </div>


                <div className="spa-page__footer-bottom">

                    <span>
                        © 2026 Centuria Lake Resort. All Rights Reserved.
                    </span>

                    <div>
                        <button type="button">
                            Privacy Policy
                        </button>

                        <button type="button">
                            Terms & Conditions
                        </button>

                        <button type="button">
                            Cancellation Policy
                        </button>
                    </div>

                </div>

            </footer>


            <AnimatePresence>

                {booking && (
                    <motion.div
                        className="spa-page__modal-bg"
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
                            setBooking(
                                null
                            )
                        }
                    >
                        <motion.div
                            className="spa-page__modal"
                            initial={{
                                opacity: 0,
                                y: 20,
                                scale: 0.98
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                y: 15,
                                scale: 0.98
                            }}
                            transition={{
                                duration: 0.23
                            }}
                            onClick={
                                event =>
                                    event.stopPropagation()
                            }
                        >
                            <button
                                type="button"
                                className="spa-page__modal-close"
                                onClick={() =>
                                    setBooking(
                                        null
                                    )
                                }
                            >
                                <X />
                            </button>


                            <SpaImage
                                item={
                                    booking
                                }
                                className="spa-page__modal-image"
                            />


                            <div className="spa-page__modal-content">

                                <span className="spa-page__modal-badge">
                                    {
                                        booking.badge
                                    }
                                </span>


                                <h2>
                                    {
                                        booking.name
                                    }
                                </h2>


                                <p>
                                    {
                                        booking.description
                                    }
                                </p>


                                <div className="spa-page__modal-rating">
                                    <Star
                                        fill="currentColor"
                                    />

                                    {
                                        booking.rating
                                    }

                                    <span>
                                        (
                                        {
                                            booking.reviews
                                        }{" "}
                                        reviews)
                                    </span>
                                </div>


                                <div className="spa-page__modal-section">

                                    <label>
                                        Treatment For
                                    </label>


                                    <div>
                                        {GUESTS.map(
                                            guest => (
                                                <button
                                                    key={
                                                        guest.id
                                                    }
                                                    type="button"
                                                    className={
                                                        bookingGuest ===
                                                        guest.id
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        setBookingGuest(
                                                            guest.id
                                                        )
                                                    }
                                                >
                                                    {
                                                        guest.label
                                                    }

                                                    {GUEST_PRICE_EXTRAS[
                                                        guest
                                                            .id
                                                    ] >
                                                        0 && (
                                                        <small>
                                                            +
                                                            {money(
                                                                GUEST_PRICE_EXTRAS[
                                                                    guest
                                                                        .id
                                                                ]
                                                            )}
                                                        </small>
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>

                                </div>


                                <div className="spa-page__modal-section">

                                    <label>
                                        Duration
                                    </label>


                                    <div>
                                        {DURATIONS.map(
                                            duration => (
                                                <button
                                                    key={
                                                        duration
                                                    }
                                                    type="button"
                                                    className={
                                                        Number(
                                                            bookingDuration
                                                        ) ===
                                                        duration
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        setBookingDuration(
                                                            duration
                                                        )
                                                    }
                                                >
                                                    {
                                                        duration
                                                    }{" "}
                                                    Min

                                                    {DURATION_PRICE_EXTRAS[
                                                        duration
                                                    ] >
                                                        0 && (
                                                        <small>
                                                            +
                                                            {money(
                                                                DURATION_PRICE_EXTRAS[
                                                                    duration
                                                                ]
                                                            )}
                                                        </small>
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>

                                </div>


                                <div className="spa-page__booking-fields">

                                    <label>
                                        <span>
                                            Booking Date
                                        </span>

                                        <input
                                            type="date"
                                            value={
                                                bookingDate
                                            }
                                            onChange={
                                                event =>
                                                    setBookingDate(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        />
                                    </label>


                                    <label>
                                        <span>
                                            Booking Time
                                        </span>

                                        <select
                                            value={
                                                bookingTime
                                            }
                                            onChange={
                                                event =>
                                                    setBookingTime(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        >
                                            <option value="09:00">
                                                09:00 AM
                                            </option>

                                            <option value="10:00">
                                                10:00 AM
                                            </option>

                                            <option value="11:30">
                                                11:30 AM
                                            </option>

                                            <option value="13:00">
                                                01:00 PM
                                            </option>

                                            <option value="14:30">
                                                02:30 PM
                                            </option>

                                            <option value="16:00">
                                                04:00 PM
                                            </option>

                                            <option value="17:30">
                                                05:30 PM
                                            </option>
                                        </select>
                                    </label>

                                </div>


                                <div className="spa-page__qty">

                                    <span>
                                        Sessions
                                    </span>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBookingQuantity(
                                                    value =>
                                                        Math.max(
                                                            1,
                                                            value -
                                                                1
                                                        )
                                                )
                                            }
                                        >
                                            <Minus />
                                        </button>

                                        <strong>
                                            {
                                                bookingQuantity
                                            }
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBookingQuantity(
                                                    value =>
                                                        Math.min(
                                                            5,
                                                            value +
                                                                1
                                                        )
                                                )
                                            }
                                        >
                                            <Plus />
                                        </button>
                                    </div>

                                </div>


                                <div className="spa-page__modal-breakdown">

                                    <span>
                                        <b>
                                            Base Treatment
                                        </b>

                                        <strong>
                                            {money(
                                                booking.basePrice
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        <b>
                                            Guest Option
                                        </b>

                                        <strong>
                                            +
                                            {money(
                                                GUEST_PRICE_EXTRAS[
                                                    bookingGuest
                                                ] || 0
                                            )}
                                        </strong>
                                    </span>


                                    <span>
                                        <b>
                                            Duration Option
                                        </b>

                                        <strong>
                                            +
                                            {money(
                                                DURATION_PRICE_EXTRAS[
                                                    bookingDuration
                                                ] || 0
                                            )}
                                        </strong>
                                    </span>

                                </div>


                                <div className="spa-page__modal-total">

                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>
                                        {money(
                                            bookingTotal
                                        )}
                                    </strong>

                                </div>


                                <button
                                    type="button"
                                    className="spa-page__pay"
                                    onClick={
                                        continuePayment
                                    }
                                >
                                    <CreditCard />

                                    Continue to Payment

                                    <ChevronRight />
                                </button>

                            </div>

                        </motion.div>
                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
}


export default Spa;