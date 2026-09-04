import { useState } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    Star,
    Users,
    BedDouble,
    Maximize2,
    Bath,
    ArrowRight,
    Crown
} from "lucide-react";

import "./Rooms.css";

const roomItems = [
    {
        id: 1,
        image:
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=88",
        name: "Lake View Deluxe Room",
        category: "Lake View",
        rating: "4.9",
        reviews: "128",
        guests: "2 Guests",
        bed: "King Bed",
        size: "38 m²",
        bath: "Private Bath",
        description:
            "A stylish room with peaceful lake views, premium bedding and elegant modern comfort.",
        deluxePrice: 18500,
        premiumPrice: 22500,
        suitePrice: 27500
    },
    {
        id: 2,
        image:
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=88",
        name: "Family Garden Room",
        category: "Garden",
        rating: "4.8",
        reviews: "104",
        guests: "4 Guests",
        bed: "2 Queen Beds",
        size: "52 m²",
        bath: "Luxury Bath",
        description:
            "A spacious family room created for comfort, privacy and relaxing stays surrounded by nature.",
        deluxePrice: 24000,
        premiumPrice: 28500,
        suitePrice: 33000
    },
    {
        id: 3,
        image:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=88",
        name: "Honeymoon Luxury Suite",
        category: "Romantic",
        rating: "4.9",
        reviews: "156",
        guests: "2 Guests",
        bed: "King Bed",
        size: "65 m²",
        bath: "Jacuzzi Bath",
        description:
            "A romantic luxury suite with refined interiors, premium amenities and an unforgettable atmosphere.",
        deluxePrice: 31000,
        premiumPrice: 36500,
        suitePrice: 42500
    },
    {
        id: 4,
        image:
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=88",
        name: "Executive Pool Villa",
        category: "Private Villa",
        rating: "4.9",
        reviews: "142",
        guests: "4 Guests",
        bed: "2 King Beds",
        size: "82 m²",
        bath: "Spa Bath",
        description:
            "An exclusive villa designed with spacious interiors, privacy and a premium resort lifestyle.",
        deluxePrice: 38500,
        premiumPrice: 44500,
        suitePrice: 52000
    },
    {
        id: 5,
        image:
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=88",
        name: "Centuria Presidential Suite",
        category: "Signature",
        rating: "5.0",
        reviews: "186",
        guests: "4 Guests",
        bed: "2 King Beds",
        size: "105 m²",
        bath: "Premium Spa Bath",
        description:
            "Our signature suite offers exceptional space, elegant luxury and the finest Centuria experience.",
        deluxePrice: 48000,
        premiumPrice: 56000,
        suitePrice: 65000
    }
];

function Rooms() {
    const [savedRooms, setSavedRooms] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});

    const toggleSaved = (roomId) => {
        setSavedRooms((previous) =>
            previous.includes(roomId)
                ? previous.filter((id) => id !== roomId)
                : [...previous, roomId]
        );
    };

    const getSelectedOption = (roomId) => {
        return selectedOptions[roomId] || "deluxe";
    };

    const selectOption = (roomId, option) => {
        setSelectedOptions((previous) => ({
            ...previous,
            [roomId]: option
        }));
    };

    const getRoomPrice = (room) => {
        const selected = getSelectedOption(room.id);

        if (selected === "premium") {
            return room.premiumPrice;
        }

        if (selected === "suite") {
            return room.suitePrice;
        }

        return room.deluxePrice;
    };

    const formatPrice = (price) => {
        return `LKR ${price.toLocaleString()}`;
    };

    return (
        <section className="rooms-section" id="rooms">
            <div className="rooms-glow rooms-glow-left"></div>
            <div className="rooms-glow rooms-glow-right"></div>

            <div className="rooms-container">
                <motion.div
                    className="rooms-header"
                    initial={{
                        opacity: 0,
                        y: 22
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    viewport={{
                        once: true,
                        amount: 0.15
                    }}
                >
                    <div className="rooms-heading">
                        <div className="rooms-label">
                            <span></span>
                            CENTURIA STAYS
                        </div>

                        <h2>
                            Find Your
                            <strong>
                                Perfect Stay
                            </strong>
                        </h2>

                        <p>
                            Explore elegant rooms and suites with premium
                            comfort, carefully selected amenities and flexible
                            stay options.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="rooms-view-all-button"
                    >
                        <span>
                            View All Rooms
                        </span>

                        <ArrowRight size={18} />
                    </button>
                </motion.div>

                <div className="rooms-grid">
                    {roomItems.map((room, index) => {
                        const saved =
                            savedRooms.includes(room.id);

                        const selected =
                            getSelectedOption(room.id);

                        const price =
                            getRoomPrice(room);

                        return (
                            <motion.article
                                key={room.id}
                                className="room-card"
                                initial={{
                                    opacity: 0,
                                    y: 28
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0
                                }}
                                whileHover={{
                                    y: -19,
                                    scale: 1.018
                                }}
                                transition={{
                                    opacity: {
                                        duration: 0.45,
                                        delay: index * 0.05
                                    },
                                    y: {
                                        duration: 0.34,
                                        ease: [0.22, 1, 0.36, 1]
                                    },
                                    scale: {
                                        duration: 0.34,
                                        ease: [0.22, 1, 0.36, 1]
                                    }
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.1
                                }}
                            >
                                <div className="room-card-shine"></div>

                                <div className="room-image-frame">
                                    <div className="room-image-area">
                                        <img
                                            src={room.image}
                                            alt={room.name}
                                            loading="lazy"
                                        />

                                        <div className="room-image-overlay"></div>

                                        <div className="room-rating">
                                            <Star
                                                size={14}
                                                fill="currentColor"
                                            />

                                            <strong>
                                                {room.rating}
                                            </strong>

                                            <span>
                                                ({room.reviews})
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className={`room-save-button ${
                                                saved
                                                    ? "saved"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                toggleSaved(room.id)
                                            }
                                            aria-label={`Save ${room.name}`}
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

                                        <div className="room-category">
                                            <Crown size={13} />
                                            {room.category}
                                        </div>
                                    </div>
                                </div>

                                <div className="room-card-body">
                                    <h3>
                                        {room.name}
                                    </h3>

                                    <p>
                                        {room.description}
                                    </p>

                                    <div className="room-details-grid">
                                        <div>
                                            <Users size={15} />

                                            <span>
                                                {room.guests}
                                            </span>
                                        </div>

                                        <div>
                                            <BedDouble size={15} />

                                            <span>
                                                {room.bed}
                                            </span>
                                        </div>

                                        <div>
                                            <Maximize2 size={15} />

                                            <span>
                                                {room.size}
                                            </span>
                                        </div>

                                        <div>
                                            <Bath size={15} />

                                            <span>
                                                {room.bath}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="room-option-area">
                                        <div className="room-option-heading">
                                            <span>
                                                Stay Option
                                            </span>

                                            <strong>
                                                Choose Package
                                            </strong>
                                        </div>

                                        <div className="room-option-buttons">
                                            <button
                                                type="button"
                                                className={
                                                    selected === "deluxe"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectOption(
                                                        room.id,
                                                        "deluxe"
                                                    )
                                                }
                                            >
                                                Deluxe
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    selected === "premium"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectOption(
                                                        room.id,
                                                        "premium"
                                                    )
                                                }
                                            >
                                                Premium
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    selected === "suite"
                                                        ? "active"
                                                        : ""
                                                }
                                                onClick={() =>
                                                    selectOption(
                                                        room.id,
                                                        "suite"
                                                    )
                                                }
                                            >
                                                Suite
                                            </button>
                                        </div>
                                    </div>

                                    <div className="room-price-area">
                                        <div>
                                            <span>
                                                Starting From
                                            </span>

                                            <strong>
                                                {formatPrice(price)}
                                            </strong>

                                            <small>
                                                per night
                                            </small>
                                        </div>

                                        <div className="room-selected-badge">
                                            {selected
                                                .charAt(0)
                                                .toUpperCase() +
                                                selected.slice(1)}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="room-book-button"
                                    >
                                        <span>
                                            Select Room
                                        </span>

                                        <ArrowRight size={16} />
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

export default Rooms;