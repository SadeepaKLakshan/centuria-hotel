import { motion } from "framer-motion";
import {
    BedDouble,
    UtensilsCrossed,
    Compass,
    ArrowRight
} from "lucide-react";
import "./About.css";

function About() {
    const stats = [
        {
            icon: <BedDouble size={24} />,
            number: "25+",
            label: "Luxury Rooms"
        },
        {
            icon: <UtensilsCrossed size={24} />,
            number: "10+",
            label: "Dining Experiences"
        },
        {
            icon: <Compass size={24} />,
            number: "15+",
            label: "Tours & Experiences"
        }
    ];

    return (
        <section
            className="about-section"
            id="about"
        >
            <div className="about-glow about-glow-one"></div>
            <div className="about-glow about-glow-two"></div>

            <div className="about-container">
                <motion.div
                    className="about-image-area"
                    initial={{
                        opacity: 0,
                        x: -60
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0
                    }}
                    transition={{
                        duration: 0.9,
                        ease: "easeOut"
                    }}
                    viewport={{
                        once: true,
                        amount: 0.25
                    }}
                >
                    <div className="about-main-image">
                        <img
                            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=90"
                            alt="Luxury resort"
                        />

                        <div className="about-image-overlay"></div>

                        <div className="about-floating-card">
                            <span>Since</span>
                            <strong>2015</strong>
                            <p>
                                Luxury hospitality
                            </p>
                        </div>
                    </div>

                    <div className="about-small-image">
                        <img
                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=90"
                            alt="Luxury hotel interior"
                        />
                    </div>

                    <div className="about-image-decoration"></div>
                </motion.div>

                <motion.div
                    className="about-content"
                    initial={{
                        opacity: 0,
                        x: 60
                    }}
                    whileInView={{
                        opacity: 1,
                        x: 0
                    }}
                    transition={{
                        duration: 0.9,
                        ease: "easeOut"
                    }}
                    viewport={{
                        once: true,
                        amount: 0.25
                    }}
                >
                    <div className="about-label">
                        <span></span>
                        ABOUT CENTURIA
                    </div>

                    <h2 className="about-title">
                        Discover Comfort
                        <span>
                            Beyond Expectations
                        </span>
                    </h2>

                    <p className="about-description">
                        Centuria Lake Resort offers a unique combination
                        of luxury, comfort, nature and unforgettable
                        experiences in the beautiful surroundings of
                        Udawalawe.
                    </p>

                    <p className="about-description about-description-secondary">
                        From relaxing rooms and exceptional dining to
                        wildlife adventures and peaceful wellness
                        experiences, every moment is designed to make
                        your stay memorable.
                    </p>

                    <div className="about-stats">
                        {stats.map(
                            (item, index) => (
                                <motion.div
                                    className="about-stat-card"
                                    key={index}
                                    initial={{
                                        opacity: 0,
                                        y: 25
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay:
                                            index *
                                            0.12
                                    }}
                                    viewport={{
                                        once: true
                                    }}
                                >
                                    <div className="about-stat-icon">
                                        {item.icon}
                                    </div>

                                    <div>
                                        <strong>
                                            {
                                                item.number
                                            }
                                        </strong>

                                        <span>
                                            {
                                                item.label
                                            }
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </div>

                    <button
                        type="button"
                        className="about-button"
                    >
                        Discover Centuria

                        <ArrowRight size={18} />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

export default About;