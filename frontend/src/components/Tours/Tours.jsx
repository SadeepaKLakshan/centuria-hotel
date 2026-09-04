import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    Star,
    MapPin,
    Clock3,
    Users,
    Mountain,
    ArrowRight,
    Compass,
    Car,
    Bike,
    BusFront,
    X,
    Check,
    Truck,
    Navigation
} from "lucide-react";

import "./Tours.css";

import yalaImage from "../../assets/images/tour-yala.jpg";
import udawalaweImage from "../../assets/images/tour-udawalawe.jpg";
import galleFortImage from "../../assets/images/tour-galle-fort.jpg";
import sinharajaImage from "../../assets/images/tour-sinharaja.jpg";
import nuwaraEliyaImage from "../../assets/images/tour-nuwara-eliya.jpg";

const tourItems = [
    {
        id: 1,
        image: yalaImage,
        name: "Yala National Park",
        category: "Wildlife Safari",
        rating: "4.9",
        reviews: "186",
        location: "Yala",
        duration: "Full Day",
        group: "Up to 6",
        difficulty: "Easy",
        description:
            "Experience the famous Yala wilderness with an exciting guided safari, wildlife viewing and breathtaking natural scenery.",
        basePrice: 14500
    },
    {
        id: 2,
        image: udawalaweImage,
        name: "Udawalawe Safari",
        category: "Safari",
        rating: "4.9",
        reviews: "164",
        location: "Udawalawe",
        duration: "6 Hours",
        group: "Up to 6",
        difficulty: "Easy",
        description:
            "Explore Udawalawe National Park and discover elephants, birds and beautiful landscapes through a premium safari experience.",
        basePrice: 12500
    },
    {
        id: 3,
        image: galleFortImage,
        name: "Galle Fort Heritage Tour",
        category: "Heritage",
        rating: "4.8",
        reviews: "142",
        location: "Galle",
        duration: "Full Day",
        group: "Up to 8",
        difficulty: "Easy",
        description:
            "Walk through the historic Galle Fort, explore colonial architecture, coastal views and memorable cultural landmarks.",
        basePrice: 10500
    },
    {
        id: 4,
        image: sinharajaImage,
        name: "Sinharaja Forest Adventure",
        category: "Rainforest",
        rating: "4.9",
        reviews: "128",
        location: "Sinharaja",
        duration: "Full Day",
        group: "Up to 6",
        difficulty: "Medium",
        description:
            "Discover the beauty of Sinharaja rainforest with guided trails, tropical wildlife, waterfalls and an unforgettable forest journey.",
        basePrice: 13800
    },
    {
        id: 5,
        image: nuwaraEliyaImage,
        name: "Nuwara Eliya Escape",
        category: "Hill Country",
        rating: "5.0",
        reviews: "196",
        location: "Nuwara Eliya",
        duration: "Full Day",
        group: "Up to 8",
        difficulty: "Easy",
        description:
            "Enjoy cool mountain weather, tea estates, scenic viewpoints and the unique beauty of Sri Lanka's famous hill country.",
        basePrice: 15500
    }
];

const transportOptions = [
    {
        id: "bike",
        name: "Motor Bike",
        description: "Ideal for one traveller",
        price: 2500,
        icon: Bike
    },
    {
        id: "car",
        name: "Private Car",
        description: "Comfort for 1 - 3 guests",
        price: 6500,
        icon: Car
    },
    {
        id: "van",
        name: "Premium Van",
        description: "Comfort for 4 - 8 guests",
        price: 9500,
        icon: Truck
    },
    {
        id: "bus",
        name: "Star Bus",
        description: "Perfect for large groups",
        price: 16500,
        icon: BusFront
    },
    {
        id: "jeep",
        name: "Safari Jeep",
        description: "Best for safari tours",
        price: 12500,
        icon: Navigation
    },
    {
        id: "tuk",
        name: "Tuk Tuk",
        description: "Local travel experience",
        price: 3500,
        icon: Car
    }
];

function Tours() {
    const [savedTours, setSavedTours] = useState([]);
    const [selectedTransport, setSelectedTransport] = useState({});
    const [transportModal, setTransportModal] = useState(null);

    const toggleSaved = (tourId) => {
        setSavedTours((previous) =>
            previous.includes(tourId)
                ? previous.filter((id) => id !== tourId)
                : [...previous, tourId]
        );
    };

    const openTransportModal = (tourId) => {
        setTransportModal(tourId);
    };

    const closeTransportModal = () => {
        setTransportModal(null);
    };

    const chooseTransport = (tourId, transportId) => {
        setSelectedTransport((previous) => ({
            ...previous,
            [tourId]: transportId
        }));

        setTransportModal(null);
    };

    const removeTransport = (tourId) => {
        setSelectedTransport((previous) => {
            const updated = { ...previous };
            delete updated[tourId];
            return updated;
        });
    };

    const getSelectedTransport = (tourId) => {
        const transportId = selectedTransport[tourId];

        if (!transportId) {
            return null;
        }

        return transportOptions.find(
            (transport) => transport.id === transportId
        );
    };

    const getTotalPrice = (tour) => {
        const transport = getSelectedTransport(tour.id);

        if (!transport) {
            return tour.basePrice;
        }

        return tour.basePrice + transport.price;
    };

    const formatPrice = (price) => {
        return `LKR ${price.toLocaleString()}`;
    };

    const activeTour =
        tourItems.find(
            (tour) => tour.id === transportModal
        ) || null;

    return (
        <>
            <section
                className="tours-section"
                id="tours"
            >
                <div className="tours-background-glow tours-glow-one"></div>
                <div className="tours-background-glow tours-glow-two"></div>

                <div className="tours-container">
                    <motion.div
                        className="tours-header"
                        initial={{
                            opacity: 0,
                            y: 25
                        }}
                        whileInView={{
                            opacity: 1,
                            y: 0
                        }}
                        transition={{
                            duration: 0.65,
                            ease: [0.22, 1, 0.36, 1]
                        }}
                        viewport={{
                            once: true
                        }}
                    >
                        <div className="tours-heading">
                            <div className="tours-label">
                                <span></span>
                                CENTURIA TOURS
                            </div>

                            <h2>
                                Discover
                                <strong>
                                    Sri Lanka
                                </strong>
                            </h2>

                            <p>
                                Explore some of Sri Lanka's most beautiful
                                destinations with premium guided experiences,
                                comfortable travel and flexible transport
                                options.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="tours-view-all-button"
                        >
                            View All Tours

                            <ArrowRight
                                size={18}
                            />
                        </button>
                    </motion.div>

                    <div className="tours-grid">
                        {tourItems.map((tour, index) => {
                            const saved =
                                savedTours.includes(tour.id);

                            const transport =
                                getSelectedTransport(tour.id);

                            const totalPrice =
                                getTotalPrice(tour);

                            return (
                                <motion.article
                                    key={tour.id}
                                    className="tour-card"
                                    initial={{
                                        opacity: 0,
                                        y: 28
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    whileHover={{
                                        y: -18,
                                        scale: 1.018
                                    }}
                                    transition={{
                                        opacity: {
                                            duration: 0.45,
                                            delay: index * 0.05
                                        },
                                        y: {
                                            duration: 0.32,
                                            ease: [0.22, 1, 0.36, 1]
                                        },
                                        scale: {
                                            duration: 0.32,
                                            ease: [0.22, 1, 0.36, 1]
                                        }
                                    }}
                                    viewport={{
                                        once: true
                                    }}
                                >
                                    <div className="tour-card-shine"></div>

                                    <div className="tour-image-frame">
                                        <div className="tour-image-area">
                                            <img
                                                src={tour.image}
                                                alt={tour.name}
                                                loading="lazy"
                                            />

                                            <div className="tour-image-overlay"></div>

                                            <div className="tour-rating">
                                                <Star
                                                    size={14}
                                                    fill="currentColor"
                                                />

                                                <strong>
                                                    {tour.rating}
                                                </strong>

                                                <span>
                                                    ({tour.reviews})
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className={`tour-save-button ${
                                                    saved
                                                        ? "saved"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    toggleSaved(tour.id)
                                                }
                                                aria-label={`Save ${tour.name}`}
                                            >
                                                <Heart
                                                    size={19}
                                                    fill={
                                                        saved
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />
                                            </button>

                                            <div className="tour-category">
                                                <Compass
                                                    size={13}
                                                />

                                                {tour.category}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tour-card-body">
                                        <h3>
                                            {tour.name}
                                        </h3>

                                        <p className="tour-description">
                                            {tour.description}
                                        </p>

                                        <div className="tour-details-grid">
                                            <div>
                                                <MapPin
                                                    size={15}
                                                />

                                                <span>
                                                    {tour.location}
                                                </span>
                                            </div>

                                            <div>
                                                <Clock3
                                                    size={15}
                                                />

                                                <span>
                                                    {tour.duration}
                                                </span>
                                            </div>

                                            <div>
                                                <Users
                                                    size={15}
                                                />

                                                <span>
                                                    {tour.group}
                                                </span>
                                            </div>

                                            <div>
                                                <Mountain
                                                    size={15}
                                                />

                                                <span>
                                                    {tour.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="tour-transport-area">
                                            <div className="tour-transport-heading">
                                                <div>
                                                    <Car
                                                        size={14}
                                                    />

                                                    <span>
                                                        Transport
                                                    </span>
                                                </div>

                                                <strong>
                                                    Optional
                                                </strong>
                                            </div>

                                            {transport ? (
                                                <div className="selected-transport">
                                                    <div className="selected-transport-info">
                                                        <div className="selected-transport-icon">
                                                            {(() => {
                                                                const TransportIcon =
                                                                    transport.icon;

                                                                return (
                                                                    <TransportIcon
                                                                        size={16}
                                                                    />
                                                                );
                                                            })()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {transport.name}
                                                            </strong>

                                                            <span>
                                                                +
                                                                {formatPrice(
                                                                    transport.price
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="selected-transport-actions">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openTransportModal(
                                                                    tour.id
                                                                )
                                                            }
                                                        >
                                                            Change
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="remove-transport-button"
                                                            onClick={() =>
                                                                removeTransport(
                                                                    tour.id
                                                                )
                                                            }
                                                        >
                                                            <X
                                                                size={12}
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="choose-transport-button"
                                                    onClick={() =>
                                                        openTransportModal(
                                                            tour.id
                                                        )
                                                    }
                                                >
                                                    <Car
                                                        size={15}
                                                    />

                                                    Choose Transport

                                                    <ArrowRight
                                                        size={14}
                                                    />
                                                </button>
                                            )}
                                        </div>

                                        <div className="tour-price-area">
                                            <div>
                                                <span>
                                                    Total Price
                                                </span>

                                                <strong>
                                                    {formatPrice(
                                                        totalPrice
                                                    )}
                                                </strong>

                                                <small>
                                                    {transport
                                                        ? "Tour + transport"
                                                        : "Tour only"}
                                                </small>
                                            </div>

                                            <div className="tour-price-badge">
                                                {transport ? (
                                                    <>
                                                        <span>
                                                            {transport.name}
                                                        </span>

                                                        <small>
                                                            Included
                                                        </small>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>
                                                            Tour
                                                        </span>

                                                        <small>
                                                            Only
                                                        </small>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="tour-book-button"
                                        >
                                            Book Tour

                                            <ArrowRight
                                                size={16}
                                            />
                                        </button>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <AnimatePresence>
                {transportModal && activeTour && (
                    <motion.div
                        className="transport-modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        onClick={closeTransportModal}
                    >
                        <motion.div
                            className="transport-modal"
                            initial={{
                                opacity: 0,
                                y: 30,
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
                                scale: 0.97
                            }}
                            transition={{
                                duration: 0.28,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="transport-modal-header">
                                <div>
                                    <span>
                                        SELECT TRANSPORT
                                    </span>

                                    <h3>
                                        Choose Your Vehicle
                                    </h3>

                                    <p>
                                        {activeTour.name}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="transport-close-button"
                                    onClick={closeTransportModal}
                                >
                                    <X
                                        size={19}
                                    />
                                </button>
                            </div>

                            <div className="transport-tour-summary">
                                <div>
                                    <Compass
                                        size={17}
                                    />

                                    <span>
                                        Tour Base Price
                                    </span>
                                </div>

                                <strong>
                                    {formatPrice(
                                        activeTour.basePrice
                                    )}
                                </strong>
                            </div>

                            <div className="transport-options-grid">
                                {transportOptions.map(
                                    (transport) => {
                                        const TransportIcon =
                                            transport.icon;

                                        const selected =
                                            selectedTransport[
                                                activeTour.id
                                            ] === transport.id;

                                        return (
                                            <button
                                                type="button"
                                                key={transport.id}
                                                className={`transport-option ${
                                                    selected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    chooseTransport(
                                                        activeTour.id,
                                                        transport.id
                                                    )
                                                }
                                            >
                                                <div className="transport-icon">
                                                    <TransportIcon
                                                        size={23}
                                                    />
                                                </div>

                                                <div className="transport-option-content">
                                                    <strong>
                                                        {transport.name}
                                                    </strong>

                                                    <span>
                                                        {
                                                            transport.description
                                                        }
                                                    </span>

                                                    <small>
                                                        +
                                                        {formatPrice(
                                                            transport.price
                                                        )}
                                                    </small>
                                                </div>

                                                <div className="transport-check">
                                                    {selected && (
                                                        <Check
                                                            size={14}
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    }
                                )}
                            </div>

                            <div className="transport-modal-footer">
                                <div>
                                    <span>
                                        Selected Tour
                                    </span>

                                    <small>
                                        {activeTour.name}
                                    </small>
                                </div>

                                <strong>
                                    {formatPrice(
                                        activeTour.basePrice
                                    )}
                                </strong>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default Tours;