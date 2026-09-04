import { motion } from "framer-motion";
import {
    ShieldCheck,
    Sparkles
} from "lucide-react";

import "./AuthSplash.css";

import centuriaLogo from "../../assets/images/centuria-logo.png";

function AuthSplash() {
    return (
        <motion.div
            className="auth-splash"
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
                duration: 0.28
            }}
        >
            <div className="auth-splash-glow auth-splash-glow-one" />
            <div className="auth-splash-glow auth-splash-glow-two" />

            <motion.div
                className="auth-splash-content"
                initial={{
                    opacity: 0,
                    scale: 0.92,
                    y: 18
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                }}
                transition={{
                    duration: 0.55,
                    ease: "easeOut"
                }}
            >
                <motion.div
                    className="auth-splash-logo-shell"
                    initial={{
                        scale: 0.78,
                        rotate: -6
                    }}
                    animate={{
                        scale: 1,
                        rotate: 0
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 145,
                        damping: 12
                    }}
                >
                    <div className="auth-splash-logo-ring">
                        <img
                            src={centuriaLogo}
                            alt="Centuria Lake Resort"
                            className="auth-splash-logo-image"
                        />
                    </div>

                    <motion.div
                        className="auth-splash-logo-pulse"
                        animate={{
                            scale: [1, 1.18, 1],
                            opacity: [0.4, 0, 0.4]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                <motion.span
                    className="auth-splash-brand-small"
                    initial={{
                        opacity: 0,
                        y: 8
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: 0.2,
                        duration: 0.45
                    }}
                >
                    CENTURIA LAKE RESORT
                </motion.span>

                <motion.h1
                    initial={{
                        opacity: 0,
                        y: 10
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: 0.27,
                        duration: 0.45
                    }}
                >
                    Welcome to Centuria
                </motion.h1>

                <motion.p
                    initial={{
                        opacity: 0
                    }}
                    animate={{
                        opacity: 1
                    }}
                    transition={{
                        delay: 0.36,
                        duration: 0.45
                    }}
                >
                    Preparing your secure guest portal
                </motion.p>

                <motion.div
                    className="auth-splash-features"
                    initial={{
                        opacity: 0,
                        y: 8
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: 0.42,
                        duration: 0.45
                    }}
                >
                    <div>
                        <ShieldCheck size={17} />
                        <span>Secure Access</span>
                    </div>

                    <Sparkles
                        size={17}
                        className="auth-splash-sparkle"
                    />
                </motion.div>

                <div className="auth-splash-loader">
                    <motion.div
                        className="auth-splash-loader-bar"
                        initial={{
                            width: "0%"
                        }}
                        animate={{
                            width: "100%"
                        }}
                        transition={{
                            duration: 1.1,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}

export default AuthSplash;