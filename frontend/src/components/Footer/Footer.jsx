import {
    MapPin,
    Phone,
    Mail,
    Clock3,
    ArrowRight,
    Smartphone,
    Send,
    ChevronRight,
    ShieldCheck,
    Headphones,
    Heart
} from "lucide-react";

import {
    FaFacebookF,
    FaWhatsapp,
    FaInstagram,
    FaTiktok,
    FaXTwitter
} from "react-icons/fa6";

import "./Footer.css";

import qrCode from "../../assets/images/centuria-app-qr.png";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-top-line"></div>

            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand-column">
                        <a
                            href="/home"
                            className="footer-logo"
                        >
                            <div className="footer-logo-symbol">
                                C
                            </div>

                            <div className="footer-logo-text">
                                <strong>
                                    CENTURIA
                                </strong>

                                <span>
                                    LAKE RESORT
                                </span>
                            </div>
                        </a>

                        <p className="footer-description">
                            Experience luxury, comfort and unforgettable
                            hospitality surrounded by the natural beauty of
                            Sri Lanka. Your perfect Centuria journey starts
                            here.
                        </p>

                        <div className="footer-socials">
                            <a
                                href="https://www.facebook.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Facebook"
                                className="facebook"
                            >
                                <FaFacebookF />
                            </a>

                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram"
                                className="instagram"
                            >
                                <FaInstagram />
                            </a>

                            <a
                                href="https://www.tiktok.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="TikTok"
                                className="tiktok"
                            >
                                <FaTiktok />
                            </a>

                            <a
                                href="https://x.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="X"
                                className="twitter"
                            >
                                <FaXTwitter />
                            </a>

                            <a
                                href="https://wa.me/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="WhatsApp"
                                className="whatsapp"
                            >
                                <FaWhatsapp />
                            </a>
                        </div>
                    </div>

                    <div className="footer-links-column">
                        <h3>
                            Quick Links
                        </h3>

                        <div className="footer-heading-line"></div>

                        <ul>
                            <li>
                                <a href="/home">
                                    <ChevronRight size={13} />
                                    Home
                                </a>
                            </li>

                            <li>
                                <a href="/home#about">
                                    <ChevronRight size={13} />
                                    About Us
                                </a>
                            </li>

                            <li>
                                <a href="/home#rooms">
                                    <ChevronRight size={13} />
                                    Rooms & Suites
                                </a>
                            </li>

                            <li>
                                <a href="/home#foods">
                                    <ChevronRight size={13} />
                                    Food & Dining
                                </a>
                            </li>

                            <li>
                                <a href="/home#tours">
                                    <ChevronRight size={13} />
                                    Tours
                                </a>
                            </li>

                            <li>
                                <a href="/home#spa">
                                    <ChevronRight size={13} />
                                    Spa & Wellness
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-links-column">
                        <h3>
                            Guest Services
                        </h3>

                        <div className="footer-heading-line"></div>

                        <ul>
                            <li>
                                <a href="/home#rooms">
                                    <ChevronRight size={13} />
                                    Book a Room
                                </a>
                            </li>

                            <li>
                                <a href="/home#foods">
                                    <ChevronRight size={13} />
                                    Restaurant
                                </a>
                            </li>

                            <li>
                                <a href="/home#tours">
                                    <ChevronRight size={13} />
                                    Tour Packages
                                </a>
                            </li>

                            <li>
                                <a href="/home#spa">
                                    <ChevronRight size={13} />
                                    Spa Treatments
                                </a>
                            </li>

                            <li>
                                <a href="/login">
                                    <ChevronRight size={13} />
                                    Guest Login
                                </a>
                            </li>

                            <li>
                                <a href="/register">
                                    <ChevronRight size={13} />
                                    Create Account
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-contact-column">
                        <h3>
                            Contact Us
                        </h3>

                        <div className="footer-heading-line"></div>

                        <div className="footer-contact-list">
                            <div className="footer-contact-item">
                                <div className="footer-contact-icon">
                                    <MapPin size={17} />
                                </div>

                                <div>
                                    <span>
                                        Our Location
                                    </span>

                                    <strong>
                                        Centuria Lake Resort,
                                        Embilipitiya,
                                        Sri Lanka
                                    </strong>
                                </div>
                            </div>

                            <div className="footer-contact-item">
                                <div className="footer-contact-icon">
                                    <Phone size={17} />
                                </div>

                                <div>
                                    <span>
                                        Reservations
                                    </span>

                                    <strong>
                                        +94 47 223 2232
                                    </strong>
                                </div>
                            </div>

                            <div className="footer-contact-item">
                                <div className="footer-contact-icon">
                                    <Mail size={17} />
                                </div>

                                <div>
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        info@centuria.lk
                                    </strong>
                                </div>
                            </div>

                            <div className="footer-contact-item">
                                <div className="footer-contact-icon">
                                    <Clock3 size={17} />
                                </div>

                                <div>
                                    <span>
                                        Guest Support
                                    </span>

                                    <strong>
                                        Available 24 / 7
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-app-column">
                        <div className="footer-app-card">
                            <div className="footer-app-title">
                                <div className="footer-phone-icon">
                                    <Smartphone size={19} />
                                </div>

                                <div>
                                    <span>
                                        CENTURIA MOBILE
                                    </span>

                                    <h3>
                                        Get Our App
                                    </h3>
                                </div>
                            </div>

                            <p>
                                Scan the QR code and enjoy faster bookings,
                                exclusive offers and easy access to your stay.
                            </p>

                            <div className="footer-qr-area">
                                <div className="footer-qr-frame">
                                    <img
                                        src={qrCode}
                                        alt="Centuria mobile app QR code"
                                    />
                                </div>

                                <div className="footer-scan-text">
                                    <span>
                                        SCAN & GET
                                    </span>

                                    <strong>
                                        Centuria
                                        Mobile App
                                    </strong>

                                    <small>
                                        Available for
                                        mobile devices
                                    </small>

                                    <div className="footer-scan-arrow">
                                        <ArrowRight size={14} />
                                        Scan Now
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-newsletter">
                    <div className="footer-newsletter-content">
                        <div className="footer-newsletter-icon">
                            <Send size={20} />
                        </div>

                        <div>
                            <span>
                                STAY CONNECTED
                            </span>

                            <h3>
                                Get Centuria Offers & Updates
                            </h3>
                        </div>
                    </div>

                    <form
                        className="footer-newsletter-form"
                        onSubmit={(event) =>
                            event.preventDefault()
                        }
                    >
                        <div className="footer-email-input">
                            <Mail size={16} />

                            <input
                                type="email"
                                placeholder="Enter your email address"
                                required
                            />
                        </div>

                        <button type="submit">
                            Subscribe
                            <ArrowRight size={15} />
                        </button>
                    </form>
                </div>

                <div className="footer-benefits">
                    <div>
                        <ShieldCheck size={17} />

                        <span>
                            Secure Booking
                        </span>
                    </div>

                    <div>
                        <Headphones size={17} />

                        <span>
                            24/7 Guest Support
                        </span>
                    </div>

                    <div>
                        <Heart size={17} />

                        <span>
                            Premium Hospitality
                        </span>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {currentYear} Centuria Lake Resort.
                        All Rights Reserved.
                    </p>

                    <div className="footer-bottom-links">
                        <a href="/privacy">
                            Privacy Policy
                        </a>

                        <span></span>

                        <a href="/terms">
                            Terms & Conditions
                        </a>

                        <span></span>

                        <a href="/contact">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;