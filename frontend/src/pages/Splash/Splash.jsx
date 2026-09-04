import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Splash.css";

import centuriaLogo from "../../assets/images/centuria-logo.png";

const goldParticles = Array.from(
    { length: 42 },
    (_, index) => ({
        id: index,
        left: `${(index * 19) % 100}%`,
        top: `${(index * 31) % 100}%`,
        size: 2 + (index % 4),
        delay: (index % 12) * 0.12,
        duration: 2.3 + (index % 6) * 0.35
    })
);

function Splash() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = window.setTimeout(() => {
            navigate("/home", {
                replace: true
            });
        }, 5000);

        return () => {
            window.clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <main className="luxury-splash">
            <div className="luxury-splash-background" />

            <div className="luxury-splash-vignette" />

            <div className="luxury-splash-light luxury-light-one" />
            <div className="luxury-splash-light luxury-light-two" />

            <div className="gold-particle-layer">
                {goldParticles.map((particle) => (
                    <span
                        key={particle.id}
                        className="gold-particle"
                        style={{
                            left: particle.left,
                            top: particle.top,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`
                        }}
                    />
                ))}
            </div>

            <div className="gold-dust-stream gold-stream-left" />
            <div className="gold-dust-stream gold-stream-right" />

            <motion.div
                className="luxury-intro-content"
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: 1
                }}
                transition={{
                    duration: 0.5
                }}
            >
                <motion.div
                    className="luxury-logo-area"
                    initial={{
                        opacity: 0,
                        scale: 0.55,
                        rotate: -12
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: 0
                    }}
                    transition={{
                        duration: 1,
                        delay: 0.25,
                        ease: [0.2, 0.8, 0.2, 1]
                    }}
                >
                    <div className="luxury-logo-glow" />

                    <div className="luxury-logo-ring ring-one" />
                    <div className="luxury-logo-ring ring-two" />

                    <div className="luxury-logo-frame">
                        <img
                            src={centuriaLogo}
                            alt="Centuria Lake Resort"
                        />
                    </div>
                </motion.div>

                <motion.div
                    className="luxury-small-label"
                    initial={{
                        opacity: 0,
                        y: 10
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.5,
                        delay: 0.8
                    }}
                >
                    WELCOME TO
                </motion.div>

                <div className="centuria-writing-area">
                    <motion.div
                        className="centuria-word-mask"
                        initial={{
                            width: "0%"
                        }}
                        animate={{
                            width: "100%"
                        }}
                        transition={{
                            duration: 1.5,
                            delay: 1.05,
                            ease: [0.25, 0.7, 0.25, 1]
                        }}
                    >
                        <div className="centuria-main-word">
                            CENTURIA
                        </div>
                    </motion.div>

                    <motion.span
                        className="writing-gold-tip"
                        initial={{
                            left: "0%",
                            opacity: 0
                        }}
                        animate={{
                            left: "100%",
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{
                            duration: 1.5,
                            delay: 1.05,
                            ease: [0.25, 0.7, 0.25, 1]
                        }}
                    />

                    <motion.div
                        className="writing-spark"
                        initial={{
                            left: "0%",
                            opacity: 0,
                            scale: 0.5
                        }}
                        animate={{
                            left: "100%",
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.3, 1, 0.7]
                        }}
                        transition={{
                            duration: 1.5,
                            delay: 1.05,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <motion.div
                    className="luxury-gold-line"
                    initial={{
                        width: 0,
                        opacity: 0
                    }}
                    animate={{
                        width: 190,
                        opacity: 1
                    }}
                    transition={{
                        duration: 0.75,
                        delay: 2.35
                    }}
                >
                    <span />
                </motion.div>

                <motion.div
                    className="luxury-resort-name"
                    initial={{
                        opacity: 0,
                        y: 12,
                        letterSpacing: "16px"
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        letterSpacing: "9px"
                    }}
                    transition={{
                        duration: 0.8,
                        delay: 2.45
                    }}
                >
                    LAKE RESORT
                </motion.div>

                <motion.div
                    className="luxury-location"
                    initial={{
                        opacity: 0,
                        y: 8
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.6,
                        delay: 2.85
                    }}
                >
                    UDAWALAWA
                </motion.div>

                <motion.div
                    className="luxury-tagline"
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1
                    }}
                    transition={{
                        duration: 0.6,
                        delay: 3.2
                    }}
                >
                    <span />
                    YOUR LUXURY ESCAPE AWAITS
                    <span />
                </motion.div>
            </motion.div>

            <motion.div
                className="gold-sweep"
                initial={{
                    x: "-140vw",
                    opacity: 0
                }}
                animate={{
                    x: "140vw",
                    opacity: [0, 0.4, 0]
                }}
                transition={{
                    duration: 2.1,
                    delay: 1.4,
                    ease: "easeInOut"
                }}
            />

            <div className="luxury-loading">
                <div className="luxury-loading-track">
                    <motion.span
                        initial={{
                            width: "0%"
                        }}
                        animate={{
                            width: "100%"
                        }}
                        transition={{
                            duration: 4.4,
                            delay: 0.35,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <motion.small
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1
                    }}
                    transition={{
                        delay: 3.4
                    }}
                >
                    ENTERING CENTURIA
                </motion.small>
            </div>

            <motion.div
                className="luxury-final-fade"
                initial={{
                    opacity: 0
                }}
                animate={{
                    opacity: [0, 0, 0, 1]
                }}
                transition={{
                    duration: 5,
                    times: [0, 0.75, 0.9, 1]
                }}
            />
        </main>
    );
}

export default Splash;