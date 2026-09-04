import { useState } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    Star,
    Clock3,
    Sparkles,
    Leaf,
    ArrowRight,
    BadgeCheck,
    UserRound,
    UsersRound,
    Crown
} from "lucide-react";

import "./Spa.css";

import aromaMassageImage from "../../assets/images/spa-aroma-massage.jpg";
import herbalTherapyImage from "../../assets/images/spa-herbal-therapy.jpg";
import facialRitualImage from "../../assets/images/spa-facial-ritual.jpg";
import hotStoneImage from "../../assets/images/spa-hot-stone.jpg";
import signatureWellnessImage from "../../assets/images/spa-signature-wellness.jpg";

const spaItems = [
    {
        id: 1,
        image: aromaMassageImage,
        name: "Aromatherapy Massage",
        category: "Relaxation",
        rating: "4.9",
        reviews: "126",
        therapist: "Certified Therapist",
        benefit: "Deep Relaxation",
        description:
            "A calming full-body treatment using premium aromatic oils to relax muscles and restore natural balance.",
        basePrice: 8500
    },
    {
        id: 2,
        image: herbalTherapyImage,
        name: "Herbal Wellness Therapy",
        category: "Wellness",
        rating: "4.8",
        reviews: "104",
        therapist: "Wellness Specialist",
        benefit: "Body Recovery",
        description:
            "A soothing herbal wellness experience created to reduce tiredness, refresh the body and improve relaxation.",
        basePrice: 7800
    },
    {
        id: 3,
        image: facialRitualImage,
        name: "Luxury Facial Ritual",
        category: "Beauty",
        rating: "4.9",
        reviews: "142",
        therapist: "Skin Specialist",
        benefit: "Skin Renewal",
        description:
            "A premium facial ritual combining deep cleansing, hydration and nourishing care for refreshed glowing skin.",
        basePrice: 6900
    },
    {
        id: 4,
        image: hotStoneImage,
        name: "Hot Stone Therapy",
        category: "Premium",
        rating: "4.9",
        reviews: "118",
        therapist: "Senior Therapist",
        benefit: "Muscle Relief",
        description:
            "A deeply relaxing hot stone treatment designed to release muscle tension and create complete body comfort.",
        basePrice: 9800
    },
    {
        id: 5,
        image: signatureWellnessImage,
        name: "Centuria Signature Spa",
        category: "Signature",
        rating: "5.0",
        reviews: "186",
        therapist: "Master Therapist",
        benefit: "Total Wellness",
        description:
            "Our signature luxury wellness experience combines relaxation, premium care and an unforgettable spa journey.",
        basePrice: 12500
    }
];

function Spa() {
    const [savedItems, setSavedItems] = useState([]);
    const [guestTypes, setGuestTypes] = useState({});
    const [durations, setDurations] = useState({});

    const toggleSaved = (spaId) => {
        setSavedItems((previous) =>
            previous.includes(spaId)
                ? previous.filter((id) => id !== spaId)
                : [...previous, spaId]
        );
    };

    const getGuestType = (spaId) => {
        return guestTypes[spaId] || "women";
    };

    const getDuration = (spaId) => {
        return durations[spaId] || "60";
    };

    const selectGuestType = (spaId, type) => {
        setGuestTypes((previous) => ({
            ...previous,
            [spaId]: type
        }));
    };

    const selectDuration = (spaId, duration) => {
        setDurations((previous) => ({
            ...previous,
            [spaId]: duration
        }));
    };

    const getPrice = (spa) => {
        const guestType = getGuestType(spa.id);
        const duration = getDuration(spa.id);

        let price = spa.basePrice;

        if (guestType === "men") {
            price += 1000;
        }

        if (guestType === "couple") {
            price += 6500;
        }

        if (duration === "90") {
            price += 3500;
        }

        if (duration === "120") {
            price += 6500;
        }

        return price;
    };

    const formatPrice = (price) => {
        return `LKR ${price.toLocaleString()}`;
    };

    return (
        <section
            className="spa-section"
            id="spa"
        >
            <div className="spa-background-detail spa-detail-left"></div>
            <div className="spa-background-detail spa-detail-right"></div>

            <div className="spa-container">
                <motion.div
                    className="spa-header"
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
                    <div className="spa-heading">
                        <div className="spa-label">
                            <span></span>
                            CENTURIA WELLNESS
                        </div>

                        <h2>
                            Discover Pure
                            <strong>
                                Luxury Wellness
                            </strong>
                        </h2>

                        <p>
                            Restore your body and calm your mind with
                            carefully selected spa treatments created for a
                            relaxing and luxurious Centuria experience.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="spa-view-all-button"
                    >
                        View Spa Menu
                        <ArrowRight size={18} />
                    </button>
                </motion.div>

                <div className="spa-grid">
                    {spaItems.map((spa, index) => {
                        const saved =
                            savedItems.includes(spa.id);

                        const selectedGuest =
                            getGuestType(spa.id);

                        const selectedDuration =
                            getDuration(spa.id);

                        const currentPrice =
                            getPrice(spa);

                        return (
                            <motion.article
                                key={spa.id}
                                className="spa-card"
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
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1
                                        ]
                                    },
                                    scale: {
                                        duration: 0.32,
                                        ease: [
                                            0.22,
                                            1,
                                            0.36,
                                            1
                                        ]
                                    }
                                }}
                                viewport={{
                                    once: true
                                }}
                            >
                                <div className="spa-card-shine"></div>

                                <div className="spa-image-frame">
                                    <div className="spa-image-area">
                                        <img
                                            src={spa.image}
                                            alt={spa.name}
                                            loading="lazy"
                                        />

                                        <div className="spa-image-overlay"></div>

                                        <div className="spa-rating">
                                            <Star
                                                size={14}
                                                fill="currentColor"
                                            />

                                            <strong>
                                                {spa.rating}
                                            </strong>

                                            <span>
                                                ({spa.reviews})
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className={`spa-save-button ${
                                                saved
                                                    ? "saved"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                toggleSaved(
                                                    spa.id
                                                )
                                            }
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

                                        <div className="spa-category">
                                            <Crown size={13} />
                                            {spa.category}
                                        </div>
                                    </div>
                                </div>

                                <div className="spa-card-body">
                                    <h3>
                                        {spa.name}
                                    </h3>

                                    <p className="spa-description">
                                        {spa.description}
                                    </p>

                                    <div className="spa-info-grid">
                                        <div>
                                            <BadgeCheck size={15} />

                                            <span>
                                                {spa.therapist}
                                            </span>
                                        </div>

                                        <div>
                                            <Sparkles size={15} />

                                            <span>
                                                {spa.benefit}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="spa-selection-box">
                                        <div className="spa-selection-heading">
                                            <div>
                                                <Leaf size={13} />

                                                <span>
                                                    Treatment For
                                                </span>
                                            </div>

                                            <strong>
                                                Choose Guest
                                            </strong>
                                        </div>

                                        <div className="spa-guest-options">
                                            <button
                                                type="button"
                                                className={
                                                    selectedGuest ===
                                                    "women"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectGuestType(
                                                        spa.id,
                                                        "women"
                                                    )
                                                }
                                            >
                                                <UserRound
                                                    size={13}
                                                />

                                                Women
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    selectedGuest ===
                                                    "men"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectGuestType(
                                                        spa.id,
                                                        "men"
                                                    )
                                                }
                                            >
                                                <UserRound
                                                    size={13}
                                                />

                                                Men
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    selectedGuest ===
                                                    "couple"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectGuestType(
                                                        spa.id,
                                                        "couple"
                                                    )
                                                }
                                            >
                                                <UsersRound
                                                    size={13}
                                                />

                                                Couple
                                            </button>
                                        </div>
                                    </div>

                                    <div className="spa-duration-box">
                                        <div className="spa-duration-heading">
                                            <div>
                                                <Clock3 size={13} />

                                                <span>
                                                    Duration
                                                </span>
                                            </div>

                                            <strong>
                                                Choose Time
                                            </strong>
                                        </div>

                                        <div className="spa-duration-options">
                                            <button
                                                type="button"
                                                className={
                                                    selectedDuration ===
                                                    "60"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectDuration(
                                                        spa.id,
                                                        "60"
                                                    )
                                                }
                                            >
                                                60 Min
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    selectedDuration ===
                                                    "90"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectDuration(
                                                        spa.id,
                                                        "90"
                                                    )
                                                }
                                            >
                                                90 Min
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    selectedDuration ===
                                                    "120"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectDuration(
                                                        spa.id,
                                                        "120"
                                                    )
                                                }
                                            >
                                                120 Min
                                            </button>
                                        </div>
                                    </div>

                                    <div className="spa-price-area">
                                        <div>
                                            <span>
                                                Treatment Price
                                            </span>

                                            <strong>
                                                {formatPrice(
                                                    currentPrice
                                                )}
                                            </strong>

                                            <small>
                                                per session
                                            </small>
                                        </div>

                                        <div className="spa-price-summary">
                                            <span>
                                                {selectedGuest ===
                                                "couple"
                                                    ? "Couple"
                                                    : selectedGuest ===
                                                      "men"
                                                    ? "Men"
                                                    : "Women"}
                                            </span>

                                            <small>
                                                {
                                                    selectedDuration
                                                }{" "}
                                                Min
                                            </small>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="spa-book-button"
                                    >
                                        Book Treatment

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
    );
}

export default Spa;