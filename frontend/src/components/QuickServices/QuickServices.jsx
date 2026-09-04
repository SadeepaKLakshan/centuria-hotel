import React from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowRight,
    BedDouble,
    CalendarCheck,
    Camera,
    UtensilsCrossed
} from "lucide-react";

import "./QuickServices.css";

const services = [
    {
        id: "rooms",
        title: "Luxury Rooms",
        subtitle: "Comfortable & Spacious",
        description: "Premium rooms with beautiful views",
        action: "View Rooms",
        icon: BedDouble,
        iconClass: "qs-icon-rooms",
        target: "rooms"
    },
    {
        id: "foods",
        title: "Food & Dining",
        subtitle: "Delicious Food for You",
        description: "Discover our premium dining experience",
        action: "View Menu",
        icon: UtensilsCrossed,
        iconClass: "qs-icon-foods",
        target: "foods"
    },
    {
        id: "tours",
        title: "Tours & Activities",
        subtitle: "Explore Top Destinations",
        description: "Discover unforgettable Sri Lankan tours",
        action: "View Tours",
        icon: Camera,
        iconClass: "qs-icon-tours",
        target: "tours"
    },
    {
        id: "booking",
        title: "Easy Booking",
        subtitle: "Book Your Stay",
        description: "Reserve your Centuria experience easily",
        action: "Book Now",
        icon: CalendarCheck,
        iconClass: "qs-icon-booking",
        target: "booking"
    }
];

function QuickServices() {
    const navigate = useNavigate();

    const scrollToHomeSection = (sectionId) => {
        if (window.location.pathname === "/home") {
            const section = document.getElementById(sectionId);

            if (section) {
                section.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                return;
            }
        }

        window.location.href = `/home#${sectionId}`;
    };

    const handleCardClick = (service) => {
        if (service.target === "booking") {
            const bookingBar =
                document.getElementById("booking-bar");

            if (bookingBar) {
                bookingBar.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;
            }

            scrollToHomeSection("rooms");
            return;
        }

        scrollToHomeSection(service.target);
    };

    return (
        <section
            className="qs-section"
            aria-label="Centuria quick services"
        >
            <div className="qs-container">
                {services.map((service) => {
                    const Icon = service.icon;

                    return (
                        <button
                            key={service.id}
                            type="button"
                            className="qs-card"
                            onClick={() =>
                                handleCardClick(service)
                            }
                        >
                            <span className="qs-hover-border" />

                            <span
                                className={`qs-icon ${service.iconClass}`}
                            >
                                <span className="qs-icon-shine" />

                                <Icon
                                    size={29}
                                    strokeWidth={1.9}
                                />
                            </span>

                            <span className="qs-content">
                                <strong className="qs-title">
                                    {service.title}
                                </strong>

                                <span className="qs-subtitle">
                                    {service.subtitle}
                                </span>

                                <span className="qs-description">
                                    {service.description}
                                </span>

                                <span className="qs-action">
                                    {service.action}

                                    <ArrowRight
                                        className="qs-action-arrow"
                                        size={15}
                                        strokeWidth={2}
                                    />
                                </span>
                            </span>

                            <span className="qs-corner-decoration" />
                            <span className="qs-top-light" />
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default QuickServices;