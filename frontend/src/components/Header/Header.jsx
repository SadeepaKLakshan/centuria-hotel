import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    Mail,
    Phone,
    Search,
    Menu,
    X,
    UserRound,
    HelpCircle,
    ChevronRight
} from "lucide-react";

import AuthSplash from "../AuthSplash/AuthSplash";
import centuriaLogo from "../../assets/images/centuria-logo.png";

import "./Header.css";

function Header() {
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const [searchOpen, setSearchOpen] =
        useState(false);

    const [searchText, setSearchText] =
        useState("");

    const [showAuthSplash, setShowAuthSplash] =
        useState(false);

    const openAuthPortal = (mode) => {
        setMobileMenuOpen(false);
        setShowAuthSplash(true);

        setTimeout(() => {
            navigate(`/portal?mode=${mode}`);
        }, 1100);
    };

    const handleNavigation = (
        event,
        sectionId
    ) => {
        event.preventDefault();

        setMobileMenuOpen(false);

        if (
            window.location.pathname !==
            "/home"
        ) {
            navigate(
                `/home#${sectionId}`
            );

            return;
        }

        const section =
            document.getElementById(
                sectionId
            );

        if (section) {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    };

    const goHome = (event) => {
        event.preventDefault();

        setMobileMenuOpen(false);

        if (
            window.location.pathname ===
            "/home"
        ) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;
        }

        navigate("/home");
    };

    const handleSearch = (
        event
    ) => {
        event.preventDefault();

        const query =
            searchText
                .trim()
                .toLowerCase();

        if (!query) {
            return;
        }

        const searchMap = {
            home: "home",
            about: "about",
            room: "rooms",
            rooms: "rooms",
            food: "foods",
            foods: "foods",
            dining: "foods",
            tour: "tours",
            tours: "tours",
            safari: "tours",
            spa: "spa",
            wellness: "spa",
            offer: "offers",
            offers: "offers",
            contact: "contact"
        };

        let destination = null;

        Object.keys(
            searchMap
        ).forEach((keyword) => {
            if (
                query.includes(
                    keyword
                )
            ) {
                destination =
                    searchMap[
                        keyword
                    ];
            }
        });

        if (!destination) {
            return;
        }

        setSearchOpen(false);
        setSearchText("");

        if (
            destination ===
            "home"
        ) {
            navigate("/home");

            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }, 100);

            return;
        }

        if (
            window.location.pathname !==
            "/home"
        ) {
            navigate(
                `/home#${destination}`
            );

            return;
        }

        const section =
            document.getElementById(
                destination
            );

        if (section) {
            section.scrollIntoView({
                behavior:
                    "smooth",
                block: "start"
            });
        }
    };

    return (
        <>
            <header className="main-header">
                <div className="header-topbar">
                    <div className="header-topbar-container">
                        <div className="header-contact-info">
                            <a
                                href="mailto:info@centuria.lk"
                            >
                                <Mail
                                    size={12}
                                />

                                <span>
                                    info@centuria.lk
                                </span>
                            </a>

                            <span className="header-contact-divider"></span>

                            <a
                                href="tel:+94472232232"
                            >
                                <Phone
                                    size={12}
                                />

                                <span>
                                    +94 47 223 2232
                                </span>
                            </a>
                        </div>

                        <div className="header-topbar-right">
                            <span>
                                Welcome to
                                Centuria Lake Resort
                            </span>

                            <button
                                type="button"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "contact"
                                    )
                                }
                            >
                                <HelpCircle
                                    size={12}
                                />

                                Help Center
                            </button>
                        </div>
                    </div>
                </div>

                <nav className="header-navbar">
                    <div className="header-navbar-container">
                        <a
                            href="/home"
                            className="header-logo"
                            onClick={goHome}
                        >
                            <motion.div
                                className="header-logo-symbol"
                                whileHover={{
                                    rotate: -4,
                                    scale: 1.05
                                }}
                                transition={{
                                    duration: 0.25
                                }}
                            >
                                <img
                                    src={centuriaLogo}
                                    alt="Centuria Lake Resort Logo"
                                />
                            </motion.div>

                            <div className="header-logo-text">
                                <strong>
                                    CENTURIA
                                </strong>

                                <span>
                                    LAKE RESORT
                                </span>
                            </div>
                        </a>

                        <div className="header-nav-links">
                            <a
                                href="/home"
                                onClick={goHome}
                            >
                                Home
                            </a>

                            <a
                                href="/home#about"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "about"
                                    )
                                }
                            >
                                About
                            </a>

                            <a
                                href="/home#rooms"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "rooms"
                                    )
                                }
                            >
                                Rooms
                            </a>

                            <a
                                href="/home#foods"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "foods"
                                    )
                                }
                            >
                                Foods
                            </a>

                            <a
                                href="/home#tours"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "tours"
                                    )
                                }
                            >
                                Tours
                            </a>

                            <a
                                href="/home#spa"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "spa"
                                    )
                                }
                            >
                                Spa
                            </a>

                            <a
                                href="/home#offers"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "offers"
                                    )
                                }
                            >
                                Offers
                            </a>

                            <a
                                href="/home#contact"
                                onClick={(
                                    event
                                ) =>
                                    handleNavigation(
                                        event,
                                        "contact"
                                    )
                                }
                            >
                                Contact
                            </a>
                        </div>

                        <div className="header-actions">
                            <button
                                type="button"
                                className="header-search-button"
                                onClick={() =>
                                    setSearchOpen(true)
                                }
                                aria-label="Search"
                            >
                                <Search
                                    size={18}
                                />
                            </button>

                            <div className="header-auth-buttons">
                                <button
                                    type="button"
                                    className="header-login-button"
                                    onClick={() =>
                                        openAuthPortal(
                                            "login"
                                        )
                                    }
                                >
                                    <UserRound
                                        size={14}
                                    />

                                    Login
                                </button>

                                <button
                                    type="button"
                                    className="header-register-button"
                                    onClick={() =>
                                        openAuthPortal(
                                            "register"
                                        )
                                    }
                                >
                                    Register

                                    <ChevronRight
                                        size={14}
                                    />
                                </button>
                            </div>

                            <button
                                type="button"
                                className="header-mobile-toggle"
                                onClick={() =>
                                    setMobileMenuOpen(
                                        (
                                            previous
                                        ) =>
                                            !previous
                                    )
                                }
                            >
                                {mobileMenuOpen ? (
                                    <X
                                        size={21}
                                    />
                                ) : (
                                    <Menu
                                        size={21}
                                    />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            className="header-mobile-menu"
                            initial={{
                                opacity: 0,
                                y: -15
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0,
                                y: -15
                            }}
                            transition={{
                                duration: 0.25
                            }}
                        >
                            <div className="header-mobile-menu-inner">
                                <a
                                    href="/home"
                                    onClick={goHome}
                                >
                                    Home
                                </a>

                                <a
                                    href="/home#about"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "about"
                                        )
                                    }
                                >
                                    About
                                </a>

                                <a
                                    href="/home#rooms"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "rooms"
                                        )
                                    }
                                >
                                    Rooms
                                </a>

                                <a
                                    href="/home#foods"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "foods"
                                        )
                                    }
                                >
                                    Foods
                                </a>

                                <a
                                    href="/home#tours"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "tours"
                                        )
                                    }
                                >
                                    Tours
                                </a>

                                <a
                                    href="/home#spa"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "spa"
                                        )
                                    }
                                >
                                    Spa
                                </a>

                                <a
                                    href="/home#offers"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "offers"
                                        )
                                    }
                                >
                                    Offers
                                </a>

                                <a
                                    href="/home#contact"
                                    onClick={(
                                        event
                                    ) =>
                                        handleNavigation(
                                            event,
                                            "contact"
                                        )
                                    }
                                >
                                    Contact
                                </a>

                                <div className="header-mobile-auth">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openAuthPortal(
                                                "login"
                                            )
                                        }
                                    >
                                        Login
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openAuthPortal(
                                                "register"
                                            )
                                        }
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        className="header-search-overlay"
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
                            setSearchOpen(false)
                        }
                    >
                        <motion.div
                            className="header-search-modal"
                            initial={{
                                opacity: 0,
                                scale: 0.94,
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
                            transition={{
                                duration: 0.25
                            }}
                            onClick={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="header-search-heading">
                                <div>
                                    <span>
                                        SEARCH CENTURIA
                                    </span>

                                    <h3>
                                        What are you
                                        looking for?
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchOpen(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={18}
                                    />
                                </button>
                            </div>

                            <form
                                className="header-search-form"
                                onSubmit={
                                    handleSearch
                                }
                            >
                                <Search
                                    size={19}
                                />

                                <input
                                    type="text"
                                    placeholder="Search rooms, foods, tours, spa..."
                                    value={searchText}
                                    onChange={(
                                        event
                                    ) =>
                                        setSearchText(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    autoFocus
                                />

                                <button
                                    type="submit"
                                >
                                    Search
                                </button>
                            </form>

                            <div className="header-search-suggestions">
                                <span>
                                    Popular:
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchText(
                                            "Rooms"
                                        )
                                    }
                                >
                                    Rooms
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchText(
                                            "Foods"
                                        )
                                    }
                                >
                                    Foods
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchText(
                                            "Tours"
                                        )
                                    }
                                >
                                    Tours
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchText(
                                            "Spa"
                                        )
                                    }
                                >
                                    Spa
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAuthSplash && (
                    <AuthSplash />
                )}
            </AnimatePresence>
        </>
    );
}

export default Header;