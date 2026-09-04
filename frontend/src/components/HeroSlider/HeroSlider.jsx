import { useEffect, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Users,
    BedDouble,
    Search
} from "lucide-react";

import "./HeroSlider.css";

import resortImage from "../../assets/images/centuria-resort.jpg";
import roomsImage from "../../assets/images/centuria-rooms.jpg";
import foodsImage from "../../assets/images/centuria-foods.jpg";
import toursImage from "../../assets/images/centuria-tours.jpg";
import spaImage from "../../assets/images/centuria-spa.jpg";
import luxuryImage from "../../assets/images/centuria-luxury.jpg";

const slides = [
    {
        image: resortImage,
        category: "WELCOME TO",
        title: "CENTURIA",
        highlight: "LAKE RESORT"
    },
    {
        image: roomsImage,
        category: "LUXURY STAY",
        title: "BEAUTIFUL",
        highlight: "ROOMS"
    },
    {
        image: foodsImage,
        category: "FINE DINING",
        title: "TASTE",
        highlight: "CENTURIA"
    },
    {
        image: toursImage,
        category: "ADVENTURE",
        title: "EXPLORE",
        highlight: "UDAWALAWE"
    },
    {
        image: spaImage,
        category: "WELLNESS",
        title: "RELAX",
        highlight: "SPA"
    },
    {
        image: luxuryImage,
        category: "PREMIUM EXPERIENCE",
        title: "CREATE",
        highlight: "MEMORIES"
    }
];

function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((previous) =>
            previous === slides.length - 1
                ? 0
                : previous + 1
        );
    };

    const previousSlide = () => {
        setCurrentSlide((previous) =>
            previous === 0
                ? slides.length - 1
                : previous - 1
        );
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((previous) =>
                previous === slides.length - 1
                    ? 0
                    : previous + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const current = slides[currentSlide];

    return (
        <section
            className="centuria-hero"
            id="home"
        >
            <div className="hero-images">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`hero-slide ${
                            currentSlide === index
                                ? "active"
                                : ""
                        }`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.highlight}
                        />
                    </div>
                ))}
            </div>

            <div className="hero-dark-overlay"></div>
            <div className="hero-warm-overlay"></div>

            <button
                type="button"
                className="hero-navigation hero-navigation-left"
                onClick={previousSlide}
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                type="button"
                className="hero-navigation hero-navigation-right"
                onClick={nextSlide}
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            <div
                key={currentSlide}
                className="hero-content"
            >
                <div className="hero-category">
                    <span className="hero-category-line"></span>
                    <span>{current.category}</span>
                </div>

                <h1 className="hero-title">
                    {current.title}

                    <strong>
                        {current.highlight}
                    </strong>
                </h1>
            </div>

            <div className="hero-slide-buttons">
                {slides.map((slide, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`hero-slide-button ${
                            currentSlide === index
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            goToSlide(index)
                        }
                        aria-label={`Open slide ${index + 1}`}
                    >
                        <span></span>
                    </button>
                ))}
            </div>

            <div className="hero-booking-bar">
                <div className="booking-field">
                    <div className="booking-icon">
                        <CalendarDays size={19} />
                    </div>

                    <div className="booking-field-content">
                        <span>Check In</span>

                        <input
                            type="date"
                            aria-label="Check in date"
                        />
                    </div>
                </div>

                <div className="booking-divider"></div>

                <div className="booking-field">
                    <div className="booking-icon">
                        <CalendarDays size={19} />
                    </div>

                    <div className="booking-field-content">
                        <span>Check Out</span>

                        <input
                            type="date"
                            aria-label="Check out date"
                        />
                    </div>
                </div>

                <div className="booking-divider"></div>

                <div className="booking-field">
                    <div className="booking-icon">
                        <Users size={19} />
                    </div>

                    <div className="booking-field-content">
                        <span>Guests</span>

                        <select
                            defaultValue="2"
                            aria-label="Guests"
                        >
                            <option value="1">
                                1 Guest
                            </option>

                            <option value="2">
                                2 Guests
                            </option>

                            <option value="3">
                                3 Guests
                            </option>

                            <option value="4">
                                4 Guests
                            </option>

                            <option value="5">
                                5 Guests
                            </option>

                            <option value="6">
                                6 Guests
                            </option>
                        </select>
                    </div>
                </div>

                <div className="booking-divider"></div>

                <div className="booking-field">
                    <div className="booking-icon">
                        <BedDouble size={19} />
                    </div>

                    <div className="booking-field-content">
                        <span>Room Type</span>

                        <select
                            defaultValue="all"
                            aria-label="Room type"
                        >
                            <option value="all">
                                All Rooms
                            </option>

                            <option value="deluxe">
                                Deluxe Room
                            </option>

                            <option value="family">
                                Family Room
                            </option>

                            <option value="suite">
                                Luxury Suite
                            </option>
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    className="booking-search-button"
                >
                    <span>
                        Check Availability
                    </span>

                    <Search size={17} />
                </button>
            </div>

            <div className="hero-soft-fog fog-one"></div>
            <div className="hero-soft-fog fog-two"></div>
            <div className="hero-soft-fog fog-three"></div>

            <div className="hero-bottom-shadow"></div>
        </section>
    );
}

export default HeroSlider;