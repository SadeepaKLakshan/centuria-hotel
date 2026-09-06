import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
    ArrowLeft,
    Check,
    ChevronDown,
    Eye,
    EyeOff,
    KeyRound,
    LoaderCircle,
    LockKeyhole,
    Mail,
    ShieldCheck,
    User,
    X
} from "lucide-react";

import {
    FaGoogle,
    FaFacebookF,
    FaApple,
    FaTiktok
} from "react-icons/fa6";

import "./Portal.css";
import centuriaLogo from "../../assets/images/centuria-logo.png";

const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost/centuria-hotel/backend";

const heroSlides = [
    {
        type: "HOTEL",
        eyebrow: "WELCOME TO",
        firstLine: "CENTURIA",
        secondLine: "LAKE RESORT",
        description:
            "Stay, dine, explore and relax with one seamless Centuria experience.",
        service: "Luxury Hotel",
        image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1800&q=90"
    },
    {
        type: "ROOMS",
        eyebrow: "RELAX IN COMFORT",
        firstLine: "LUXURY",
        secondLine: "ROOMS",
        description:
            "Discover elegant rooms, peaceful spaces and premium comfort designed for your perfect stay.",
        service: "Elegant Rooms",
        image:
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1800&q=90"
    },
    {
        type: "FOOD",
        eyebrow: "TASTE SOMETHING SPECIAL",
        firstLine: "PREMIUM",
        secondLine: "DINING",
        description:
            "Enjoy beautifully prepared dishes, fresh flavours and unforgettable dining experiences.",
        service: "Premium Dining",
        image:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=90"
    },
    {
        type: "TOURS",
        eyebrow: "DISCOVER THE ISLAND",
        firstLine: "EXPLORE",
        secondLine: "SRI LANKA",
        description:
            "Experience unforgettable destinations, wildlife, culture and breathtaking Sri Lankan landscapes.",
        service: "Curated Tours",
        image:
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=90"
    },
    {
        type: "SPA",
        eyebrow: "RELAX YOUR MIND",
        firstLine: "LUXURY",
        secondLine: "SPA",
        description:
            "Refresh your body and mind with peaceful treatments and a premium Centuria wellness experience.",
        service: "Luxury Spa",
        image:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=90"
    }
];

const initialLoginForm = {
    email: "",
    password: ""
};

const initialRegisterForm = {
    full_name: "",
    email: "",
    country: "Sri Lanka",
    password: "",
    confirm_password: "",
    role: "customer",
    role_keyword: ""
};

function Portal() {
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState(
        new URLSearchParams(location.search).get("mode") === "register"
            ? "register"
            : "login"
    );

    const [currentHero, setCurrentHero] = useState(0);

    const [loginForm, setLoginForm] =
        useState(initialLoginForm);

    const [registerForm, setRegisterForm] =
        useState(initialRegisterForm);

    const [
        showLoginPassword,
        setShowLoginPassword
    ] = useState(false);

    const [
        showRegisterPassword,
        setShowRegisterPassword
    ] = useState(false);

    const [
        showRegisterConfirmPassword,
        setShowRegisterConfirmPassword
    ] = useState(false);

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState({
            type: "",
            text: ""
        });

    const [otpModal, setOtpModal] =
        useState(false);

    const [otpPurpose, setOtpPurpose] =
        useState("register");

    const [otpEmail, setOtpEmail] =
        useState("");

    const [otp, setOtp] = useState([
        "",
        "",
        "",
        "",
        "",
        ""
    ]);

    const [countdown, setCountdown] =
        useState(120);

    const otpRefs = useRef([]);

    const [
        forgotModal,
        setForgotModal
    ] = useState(false);

    const [
        forgotStep,
        setForgotStep
    ] = useState("email");

    const [
        forgotEmail,
        setForgotEmail
    ] = useState("");

    const [
        resetToken,
        setResetToken
    ] = useState("");

    const [
        newPassword,
        setNewPassword
    ] = useState("");

    const [
        confirmNewPassword,
        setConfirmNewPassword
    ] = useState("");

    const [
        showNewPassword,
        setShowNewPassword
    ] = useState(false);

    const [
        showConfirmNewPassword,
        setShowConfirmNewPassword
    ] = useState(false);

    const [
        successModal,
        setSuccessModal
    ] = useState(false);

    const [
        successText,
        setSuccessText
    ] = useState("");

    useEffect(() => {
        const params =
            new URLSearchParams(
                location.search
            );

        const requestedMode =
            params.get("mode");

        if (
            requestedMode ===
            "register"
        ) {
            setMode("register");
        } else {
            setMode("login");
        }

        if (
            params.has("social_error") ||
            params.has("social_success") ||
            params.has("social_data")
        ) {
            const cleanMode =
                requestedMode ===
                "register"
                    ? "register"
                    : "login";

            navigate(
                `/portal?mode=${cleanMode}`,
                {
                    replace: true
                }
            );
        }
    }, [location.search, navigate]);

    useEffect(() => {
        const timer =
            window.setInterval(() => {
                setCurrentHero(
                    (current) =>
                        (current + 1) %
                        heroSlides.length
                );
            }, 5000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (
            !otpModal ||
            countdown <= 0
        ) {
            return;
        }

        const timer =
            window.setInterval(() => {
                setCountdown(
                    (current) =>
                        current > 0
                            ? current - 1
                            : 0
                );
            }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [otpModal, countdown]);

    const clearMessage = () => {
        setMessage({
            type: "",
            text: ""
        });
    };

    const showMessage = (
        type,
        text
    ) => {
        setMessage({
            type,
            text
        });
    };

    const formatTime = (
        seconds
    ) => {
        const minutes =
            Math.floor(seconds / 60);

        const remainingSeconds =
            seconds % 60;

        return `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    const request = async (
        endpoint,
        data
    ) => {
        const response =
            await fetch(
                `${API_BASE}/auth/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            data
                        )
                }
            );

        let result;

        try {
            result =
                await response.json();
        } catch {
            throw new Error(
                "The server returned an invalid response."
            );
        }

        if (
            !response.ok ||
            !result.success
        ) {
            throw new Error(
                result.message ||
                    "The request could not be completed."
            );
        }

        return result;
    };

    const switchMode = (
        newMode
    ) => {
        clearMessage();
        setMode(newMode);

        navigate(
            `/portal?mode=${newMode}`,
            {
                replace: true
            }
        );
    };

    const handleSocialLogin = (
        provider
    ) => {
        clearMessage();

        const providerUrls = {
            google:
                "https://accounts.google.com/",
            facebook:
                "https://www.facebook.com/login/",
            apple:
                "https://appleid.apple.com/",
            tiktok:
                "https://www.tiktok.com/login"
        };

        const targetUrl =
            providerUrls[provider];

        if (!targetUrl) {
            showMessage(
                "error",
                "This login provider is unavailable."
            );

            return;
        }

        window.open(
            targetUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    const handleLoginChange = (
        event
    ) => {
        const {
            name,
            value
        } = event.target;

        setLoginForm(
            (current) => ({
                ...current,
                [name]: value
            })
        );

        clearMessage();
    };

    const handleRegisterChange = (
        event
    ) => {
        const {
            name,
            value
        } = event.target;

        setRegisterForm(
            (current) => ({
                ...current,
                [name]: value,
                ...(name === "role" &&
                value === "customer"
                    ? {
                          role_keyword:
                              ""
                      }
                    : {})
            })
        );

        clearMessage();
    };

    const getRoleRedirect = (
        role
    ) => {
        switch (role) {
            case "admin":
                return "/admin-dashboard";

            case "manager":
                return "/manager-dashboard";

            case "staff":
                return "/staff-dashboard";

            default:
                return "/customer-dashboard";
        }
    };

    const handleLogin = async (
        event
    ) => {
        event.preventDefault();
        clearMessage();

        if (
            !loginForm.email.trim() ||
            !loginForm.password
        ) {
            showMessage(
                "error",
                "Please enter your email and password."
            );

            return;
        }

        try {
            setLoading(true);

            const result =
                await request(
                    "login.php",
                    {
                        email:
                            loginForm.email.trim(),
                        password:
                            loginForm.password
                    }
                );

            localStorage.setItem(
                "centuria_user",
                JSON.stringify(
                    result.user
                )
            );

            localStorage.setItem(
                "centuria_logged_in",
                "true"
            );

            if (result.token) {
                localStorage.setItem(
                    "centuria_token",
                    result.token
                );
            }

            if (result.expires_at) {
                localStorage.setItem(
                    "centuria_token_expires_at",
                    result.expires_at
                );
            }

            showMessage(
                "success",
                "Login successful. Redirecting..."
            );

            const redirect =
                result.redirect ||
                getRoleRedirect(
                    result.user?.role
                );

            window.setTimeout(
                () => {
                    navigate(
                        redirect
                    );
                },
                700
            );
        } catch (error) {
            showMessage(
                "error",
                error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const validateRegister =
        () => {
            if (
                !registerForm.full_name.trim()
            ) {
                return "Please enter your full name.";
            }

            if (
                !registerForm.email.trim()
            ) {
                return "Please enter your email address.";
            }

            if (
                registerForm.password
                    .length < 8
            ) {
                return "Password must contain at least 8 characters.";
            }

            if (
                registerForm.password !==
                registerForm.confirm_password
            ) {
                return "Passwords do not match.";
            }

            if (
                registerForm.role !==
                    "customer" &&
                !registerForm.role_keyword.trim()
            ) {
                return "Please enter the role access keyword.";
            }

            return "";
        };

    const handleRegister =
        async (event) => {
            event.preventDefault();
            clearMessage();

            const validationError =
                validateRegister();

            if (validationError) {
                showMessage(
                    "error",
                    validationError
                );

                return;
            }

            try {
                setLoading(true);

                const result =
                    await request(
                        "register-request.php",
                        {
                            full_name:
                                registerForm.full_name.trim(),
                            email:
                                registerForm.email.trim(),
                            country:
                                registerForm.country,
                            password:
                                registerForm.password,
                            role:
                                registerForm.role,
                            role_keyword:
                                registerForm.role_keyword.trim()
                        }
                    );

                setOtpEmail(
                    result.email ||
                        registerForm.email.trim()
                );

                setOtpPurpose(
                    "register"
                );

                setOtp([
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ]);

                setCountdown(
                    result.expires_in ||
                        120
                );

                setOtpModal(true);

                showMessage(
                    "success",
                    "Verification code sent to your email."
                );

                window.setTimeout(
                    () => {
                        otpRefs.current[
                            0
                        ]?.focus();
                    },
                    250
                );
            } catch (error) {
                showMessage(
                    "error",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    const handleOtpChange = (
        index,
        value
    ) => {
        const cleanValue =
            value
                .replace(/\D/g, "")
                .slice(-1);

        const updated = [
            ...otp
        ];

        updated[index] =
            cleanValue;

        setOtp(updated);

        if (
            cleanValue &&
            index < 5
        ) {
            otpRefs.current[
                index + 1
            ]?.focus();
        }
    };

    const handleOtpKeyDown = (
        index,
        event
    ) => {
        if (
            event.key ===
                "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            otpRefs.current[
                index - 1
            ]?.focus();
        }

        if (
            event.key ===
                "ArrowLeft" &&
            index > 0
        ) {
            otpRefs.current[
                index - 1
            ]?.focus();
        }

        if (
            event.key ===
                "ArrowRight" &&
            index < 5
        ) {
            otpRefs.current[
                index + 1
            ]?.focus();
        }
    };

    const handleOtpPaste = (
        event
    ) => {
        event.preventDefault();

        const pasted =
            event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);

        if (!pasted) {
            return;
        }

        const values = [
            "",
            "",
            "",
            "",
            "",
            ""
        ];

        pasted
            .split("")
            .forEach(
                (
                    number,
                    index
                ) => {
                    values[index] =
                        number;
                }
            );

        setOtp(values);

        const targetIndex =
            Math.min(
                pasted.length,
                6
            ) - 1;

        otpRefs.current[
            targetIndex
        ]?.focus();
    };

    const verifyOtp =
        async () => {
            const code =
                otp.join("");

            if (
                code.length !== 6
            ) {
                showMessage(
                    "error",
                    "Please enter the complete 6-digit verification code."
                );

                return;
            }

            if (
                countdown <= 0
            ) {
                showMessage(
                    "error",
                    "This verification code has expired. Please resend the code."
                );

                return;
            }

            try {
                setLoading(true);

                if (
                    otpPurpose ===
                    "register"
                ) {
                    await request(
                        "verify-register-otp.php",
                        {
                            email:
                                otpEmail,
                            otp: code
                        }
                    );

                    setOtpModal(
                        false
                    );

                    setLoginForm({
                        email:
                            otpEmail,
                        password: ""
                    });

                    setRegisterForm(
                        initialRegisterForm
                    );

                    setSuccessText(
                        "Your Centuria account has been created successfully. You can now log in."
                    );

                    setSuccessModal(
                        true
                    );

                    setMode(
                        "login"
                    );

                    navigate(
                        "/portal?mode=login",
                        {
                            replace:
                                true
                        }
                    );
                } else {
                    const result =
                        await request(
                            "verify-reset-otp.php",
                            {
                                email:
                                    otpEmail,
                                otp: code
                            }
                        );

                    setResetToken(
                        result.reset_token
                    );

                    setOtpModal(
                        false
                    );

                    setForgotModal(
                        true
                    );

                    setForgotStep(
                        "password"
                    );

                    clearMessage();
                }
            } catch (error) {
                showMessage(
                    "error",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    const resendOtp =
        async () => {
            if (
                countdown > 0
            ) {
                return;
            }

            try {
                setLoading(true);

                let result;

                if (
                    otpPurpose ===
                    "register"
                ) {
                    result =
                        await request(
                            "register-request.php",
                            {
                                full_name:
                                    registerForm.full_name.trim(),
                                email:
                                    registerForm.email.trim(),
                                country:
                                    registerForm.country,
                                password:
                                    registerForm.password,
                                role:
                                    registerForm.role,
                                role_keyword:
                                    registerForm.role_keyword.trim()
                            }
                        );
                } else {
                    result =
                        await request(
                            "forgot-password.php",
                            {
                                email:
                                    otpEmail
                            }
                        );
                }

                setOtp([
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ]);

                setCountdown(
                    result.expires_in ||
                        120
                );

                showMessage(
                    "success",
                    "A new verification code has been sent."
                );

                window.setTimeout(
                    () => {
                        otpRefs.current[
                            0
                        ]?.focus();
                    },
                    200
                );
            } catch (error) {
                showMessage(
                    "error",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    const openForgotPassword =
        () => {
            clearMessage();

            setForgotEmail(
                loginForm.email.trim()
            );

            setForgotStep(
                "email"
            );

            setResetToken("");
            setNewPassword("");
            setConfirmNewPassword(
                ""
            );

            setForgotModal(
                true
            );
        };

    const sendForgotOtp =
        async (event) => {
            event.preventDefault();
            clearMessage();

            if (
                !forgotEmail.trim()
            ) {
                showMessage(
                    "error",
                    "Please enter your registered email address."
                );

                return;
            }

            try {
                setLoading(true);

                const result =
                    await request(
                        "forgot-password.php",
                        {
                            email:
                                forgotEmail.trim()
                        }
                    );

                setOtpEmail(
                    result.email ||
                        forgotEmail.trim()
                );

                setOtpPurpose(
                    "password_reset"
                );

                setOtp([
                    "",
                    "",
                    "",
                    "",
                    "",
                    ""
                ]);

                setCountdown(
                    result.expires_in ||
                        120
                );

                setForgotModal(
                    false
                );

                setOtpModal(
                    true
                );

                showMessage(
                    "success",
                    "Password reset code sent to your email."
                );
            } catch (error) {
                showMessage(
                    "error",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    const handleResetPassword =
        async (event) => {
            event.preventDefault();
            clearMessage();

            if (
                newPassword.length <
                8
            ) {
                showMessage(
                    "error",
                    "New password must contain at least 8 characters."
                );

                return;
            }

            if (
                !/[A-Z]/.test(
                    newPassword
                ) ||
                !/[a-z]/.test(
                    newPassword
                ) ||
                !/[0-9]/.test(
                    newPassword
                )
            ) {
                showMessage(
                    "error",
                    "Use uppercase, lowercase and at least one number."
                );

                return;
            }

            if (
                newPassword !==
                confirmNewPassword
            ) {
                showMessage(
                    "error",
                    "New passwords do not match."
                );

                return;
            }

            try {
                setLoading(true);

                await request(
                    "reset-password.php",
                    {
                        email:
                            otpEmail,
                        reset_token:
                            resetToken,
                        new_password:
                            newPassword,
                        confirm_password:
                            confirmNewPassword
                    }
                );

                setForgotModal(
                    false
                );

                setSuccessText(
                    "Your password has been changed successfully. Please log in with your new password."
                );

                setSuccessModal(
                    true
                );

                setLoginForm({
                    email:
                        otpEmail,
                    password: ""
                });

                setForgotStep(
                    "email"
                );

                setResetToken("");
                setNewPassword("");
                setConfirmNewPassword(
                    ""
                );
            } catch (error) {
                showMessage(
                    "error",
                    error.message
                );
            } finally {
                setLoading(false);
            }
        };

    const SocialLoginSection =
        () => (
            <div className="portal-social-section">
                <div className="portal-divider">
                    <span>
                        OR CONTINUE WITH
                    </span>
                </div>

                <div className="portal-social-grid">
                    <button
                        type="button"
                        className="portal-social-btn google"
                        onClick={() =>
                            handleSocialLogin(
                                "google"
                            )
                        }
                    >
                        <FaGoogle />
                        <span>
                            Google
                        </span>
                    </button>

                    <button
                        type="button"
                        className="portal-social-btn facebook"
                        onClick={() =>
                            handleSocialLogin(
                                "facebook"
                            )
                        }
                    >
                        <FaFacebookF />
                        <span>
                            Facebook
                        </span>
                    </button>

                    <button
                        type="button"
                        className="portal-social-btn apple"
                        onClick={() =>
                            handleSocialLogin(
                                "apple"
                            )
                        }
                    >
                        <FaApple />
                        <span>
                            Apple
                        </span>
                    </button>

                    <button
                        type="button"
                        className="portal-social-btn tiktok"
                        onClick={() =>
                            handleSocialLogin(
                                "tiktok"
                            )
                        }
                    >
                        <FaTiktok />
                        <span>
                            TikTok
                        </span>
                    </button>
                </div>
            </div>
        );

    const currentSlide =
        heroSlides[currentHero];

    return (
        <main className="portal-page">
            <section className="portal-visual">
                <div className="portal-slideshow">
                    {heroSlides.map(
                        (
                            slide,
                            index
                        ) => (
                            <div
                                key={
                                    slide.type
                                }
                                className={`portal-slide ${
                                    index ===
                                    currentHero
                                        ? "active"
                                        : ""
                                }`}
                                style={{
                                    backgroundImage: `url("${slide.image}")`
                                }}
                            />
                        )
                    )}
                </div>

                <div className="portal-image-overlay" />

                <button
                    className="portal-back"
                    type="button"
                    onClick={() =>
                        navigate(
                            "/home"
                        )
                    }
                >
                    <ArrowLeft
                        size={18}
                    />

                    Back to Home
                </button>

                <div className="portal-brand">
                    <div className="portal-brand-logo">
                        <img
                            src={
                                centuriaLogo
                            }
                            alt="Centuria Lake Resort"
                        />
                    </div>

                    <div className="portal-brand-copy">
                        <strong>
                            CENTURIA
                        </strong>

                        <span>
                            LAKE RESORT
                        </span>
                    </div>
                </div>

                <div className="portal-hero-content">
                    <AnimatePresence
                        mode="wait"
                    >
                        <motion.div
                            key={
                                currentHero
                            }
                            className="portal-hero-copy"
                            initial={{
                                opacity: 0,
                                y: 28
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0,
                                y: -20
                            }}
                            transition={{
                                duration:
                                    0.55
                            }}
                        >
                            <div className="portal-hero-eyebrow">
                                <span />
                                {
                                    currentSlide.eyebrow
                                }
                            </div>

                            <h1 className="portal-hero-title">
                                <span>
                                    {
                                        currentSlide.firstLine
                                    }
                                </span>

                                <strong>
                                    {
                                        currentSlide.secondLine
                                    }
                                </strong>
                            </h1>

                            <p className="portal-hero-description">
                                {
                                    currentSlide.description
                                }
                            </p>

                            <div className="portal-current-service">
                                <span>
                                    Discover
                                </span>

                                <strong>
                                    {
                                        currentSlide.service
                                    }
                                </strong>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="portal-features">
                        <div>
                            <Check
                                size={17}
                            />
                            Luxury Stays
                        </div>

                        <div>
                            <Check
                                size={17}
                            />
                            Premium Dining
                        </div>

                        <div>
                            <Check
                                size={17}
                            />
                            Curated Tours
                        </div>
                    </div>
                </div>

                <div className="portal-slide-status">
                    <div className="portal-slide-dots">
                        {heroSlides.map(
                            (
                                slide,
                                index
                            ) => (
                                <button
                                    key={
                                        slide.type
                                    }
                                    type="button"
                                    title={
                                        slide.service
                                    }
                                    aria-label={`Show ${slide.service}`}
                                    className={
                                        index ===
                                        currentHero
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setCurrentHero(
                                            index
                                        )
                                    }
                                />
                            )
                        )}
                    </div>
                </div>

                <div className="portal-visual-footer">
                    © 2026 Centuria Lake Resort
                </div>
            </section>

            <section className="portal-auth">
                <motion.div
                    className="portal-auth-card"
                    initial={{
                        opacity: 0,
                        x: 35
                    }}
                    animate={{
                        opacity: 1,
                        x: 0
                    }}
                    transition={{
                        duration: 0.55
                    }}
                >
                    <div className="portal-tabs">
                        <button
                            type="button"
                            className={
                                mode ===
                                "login"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchMode(
                                    "login"
                                )
                            }
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            className={
                                mode ===
                                "register"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchMode(
                                    "register"
                                )
                            }
                        >
                            Register
                        </button>
                    </div>

                    <AnimatePresence
                        mode="wait"
                    >
                        {mode ===
                        "login" ? (
                            <motion.div
                                key="login"
                                initial={{
                                    opacity: 0,
                                    y: 12
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -10
                                }}
                            >
                                <div className="portal-heading">
                                    <span>
                                        WELCOME BACK
                                    </span>

                                    <h2>
                                        Login to your account
                                    </h2>

                                    <p>
                                        Continue your Centuria experience.
                                    </p>
                                </div>

                                <form
                                    onSubmit={
                                        handleLogin
                                    }
                                    className="portal-form"
                                >
                                    <label>
                                        Email Address
                                    </label>

                                    <div className="portal-input">
                                        <Mail
                                            size={18}
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                loginForm.email
                                            }
                                            onChange={
                                                handleLoginChange
                                            }
                                            placeholder="name@gmail.com"
                                            autoComplete="email"
                                        />
                                    </div>

                                    <label>
                                        Password
                                    </label>

                                    <div className="portal-input">
                                        <LockKeyhole
                                            size={18}
                                        />

                                        <input
                                            type={
                                                showLoginPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            value={
                                                loginForm.password
                                            }
                                            onChange={
                                                handleLoginChange
                                            }
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                        />

                                        <button
                                            type="button"
                                            className="portal-eye"
                                            onClick={() =>
                                                setShowLoginPassword(
                                                    (
                                                        current
                                                    ) =>
                                                        !current
                                                )
                                            }
                                        >
                                            {showLoginPassword ? (
                                                <EyeOff
                                                    size={18}
                                                />
                                            ) : (
                                                <Eye
                                                    size={18}
                                                />
                                            )}
                                        </button>
                                    </div>

                                    <div className="portal-login-options">
                                        <label className="portal-remember">
                                            <input
                                                type="checkbox"
                                            />
                                            <span>
                                                Remember me
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={
                                                openForgotPassword
                                            }
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    {message.text && (
                                        <div
                                            className={`portal-message ${message.type}`}
                                        >
                                            {
                                                message.text
                                            }
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="portal-primary-btn"
                                        disabled={
                                            loading
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <LoaderCircle
                                                    className="portal-spinner"
                                                    size={19}
                                                />
                                                Logging in...
                                            </>
                                        ) : (
                                            "Login to Centuria"
                                        )}
                                    </button>
                                </form>

                                <SocialLoginSection />

                                <p className="portal-switch-text">
                                    New to Centuria?
                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "register"
                                            )
                                        }
                                    >
                                        Create Account
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register"
                                initial={{
                                    opacity: 0,
                                    y: 12
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -10
                                }}
                            >
                                <div className="portal-heading">
                                    <span>
                                        JOIN CENTURIA
                                    </span>

                                    <h2>
                                        Create your account
                                    </h2>

                                    <p>
                                        Register with your email and verify it securely.
                                    </p>
                                </div>

                                <form
                                    onSubmit={
                                        handleRegister
                                    }
                                    className="portal-form"
                                >
                                    <div className="portal-two-columns">
                                        <div>
                                            <label>
                                                Full Name
                                            </label>

                                            <div className="portal-input">
                                                <User
                                                    size={18}
                                                />

                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={
                                                        registerForm.full_name
                                                    }
                                                    onChange={
                                                        handleRegisterChange
                                                    }
                                                    placeholder="Your full name"
                                                    autoComplete="name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label>
                                                Account Role
                                            </label>

                                            <div className="portal-input">
                                                <ShieldCheck
                                                    size={18}
                                                />

                                                <select
                                                    name="role"
                                                    value={
                                                        registerForm.role
                                                    }
                                                    onChange={
                                                        handleRegisterChange
                                                    }
                                                >
                                                    <option value="customer">
                                                        Customer
                                                    </option>
                                                    <option value="staff">
                                                        Staff
                                                    </option>
                                                    <option value="manager">
                                                        Manager
                                                    </option>
                                                    <option value="admin">
                                                        Admin
                                                    </option>
                                                </select>

                                                <ChevronDown
                                                    className="portal-select-arrow"
                                                    size={17}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <label>
                                        Email Address
                                    </label>

                                    <div className="portal-input">
                                        <Mail
                                            size={18}
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                registerForm.email
                                            }
                                            onChange={
                                                handleRegisterChange
                                            }
                                            placeholder="name@gmail.com"
                                            autoComplete="email"
                                        />
                                    </div>

                                    {registerForm.role !==
                                        "customer" && (
                                        <>
                                            <label>
                                                Role Access Keyword
                                            </label>

                                            <div className="portal-input">
                                                <KeyRound
                                                    size={18}
                                                />

                                                <input
                                                    type="password"
                                                    name="role_keyword"
                                                    value={
                                                        registerForm.role_keyword
                                                    }
                                                    onChange={
                                                        handleRegisterChange
                                                    }
                                                    placeholder={`Enter ${registerForm.role} keyword`}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="portal-two-columns">
                                        <div>
                                            <label>
                                                Password
                                            </label>

                                            <div className="portal-input">
                                                <LockKeyhole
                                                    size={18}
                                                />

                                                <input
                                                    type={
                                                        showRegisterPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    value={
                                                        registerForm.password
                                                    }
                                                    onChange={
                                                        handleRegisterChange
                                                    }
                                                    placeholder="Min. 8 characters"
                                                    autoComplete="new-password"
                                                />

                                                <button
                                                    type="button"
                                                    className="portal-eye"
                                                    onClick={() =>
                                                        setShowRegisterPassword(
                                                            (
                                                                current
                                                            ) =>
                                                                !current
                                                        )
                                                    }
                                                >
                                                    {showRegisterPassword ? (
                                                        <EyeOff
                                                            size={18}
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={18}
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label>
                                                Confirm Password
                                            </label>

                                            <div className="portal-input">
                                                <LockKeyhole
                                                    size={18}
                                                />

                                                <input
                                                    type={
                                                        showRegisterConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="confirm_password"
                                                    value={
                                                        registerForm.confirm_password
                                                    }
                                                    onChange={
                                                        handleRegisterChange
                                                    }
                                                    placeholder="Repeat password"
                                                    autoComplete="new-password"
                                                />

                                                <button
                                                    type="button"
                                                    className="portal-eye"
                                                    onClick={() =>
                                                        setShowRegisterConfirmPassword(
                                                            (
                                                                current
                                                            ) =>
                                                                !current
                                                        )
                                                    }
                                                >
                                                    {showRegisterConfirmPassword ? (
                                                        <EyeOff
                                                            size={18}
                                                        />
                                                    ) : (
                                                        <Eye
                                                            size={18}
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {message.text && (
                                        <div
                                            className={`portal-message ${message.type}`}
                                        >
                                            {
                                                message.text
                                            }
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="portal-primary-btn"
                                        disabled={
                                            loading
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <LoaderCircle
                                                    className="portal-spinner"
                                                    size={19}
                                                />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </button>
                                </form>

                                <SocialLoginSection />

                                <p className="portal-switch-text">
                                    Already have an account?
                                    <button
                                        type="button"
                                        onClick={() =>
                                            switchMode(
                                                "login"
                                            )
                                        }
                                    >
                                        Login
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>

            <AnimatePresence>
                {otpModal && (
                    <motion.div
                        className="portal-modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                    >
                        <motion.div
                            className="portal-modal"
                            initial={{
                                opacity: 0,
                                scale: 0.9,
                                y: 25
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.9
                            }}
                        >
                            <button
                                type="button"
                                className="portal-modal-close"
                                onClick={() =>
                                    setOtpModal(
                                        false
                                    )
                                }
                            >
                                <X size={19} />
                            </button>

                            <div className="portal-modal-icon">
                                <Mail size={28} />
                            </div>

                            <span className="portal-modal-kicker">
                                EMAIL VERIFICATION
                            </span>

                            <h3>
                                Check your inbox
                            </h3>

                            <p>
                                We sent a 6-digit verification code to
                            </p>

                            <strong className="portal-otp-email">
                                {otpEmail}
                            </strong>

                            <div
                                className="portal-otp-inputs"
                                onPaste={
                                    handleOtpPaste
                                }
                            >
                                {otp.map(
                                    (
                                        value,
                                        index
                                    ) => (
                                        <input
                                            key={
                                                index
                                            }
                                            ref={(
                                                element
                                            ) => {
                                                otpRefs.current[
                                                    index
                                                ] =
                                                    element;
                                            }}
                                            value={
                                                value
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleOtpChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            onKeyDown={(
                                                event
                                            ) =>
                                                handleOtpKeyDown(
                                                    index,
                                                    event
                                                )
                                            }
                                            maxLength={1}
                                            inputMode="numeric"
                                        />
                                    )
                                )}
                            </div>

                            <div className="portal-countdown">
                                Code expires in{" "}
                                <strong>
                                    {formatTime(
                                        countdown
                                    )}
                                </strong>
                            </div>

                            {message.text && (
                                <div
                                    className={`portal-message ${message.type}`}
                                >
                                    {
                                        message.text
                                    }
                                </div>
                            )}

                            <button
                                type="button"
                                className="portal-primary-btn"
                                onClick={
                                    verifyOtp
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify Code"}
                            </button>

                            <div className="portal-resend">
                                Didn't receive it?
                                <button
                                    type="button"
                                    onClick={
                                        resendOtp
                                    }
                                    disabled={
                                        countdown >
                                            0 ||
                                        loading
                                    }
                                >
                                    Resend Code
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {forgotModal && (
                    <motion.div
                        className="portal-modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                    >
                        <motion.div
                            className="portal-modal"
                            initial={{
                                opacity: 0,
                                scale: 0.92,
                                y: 25
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0
                            }}
                        >
                            <button
                                type="button"
                                className="portal-modal-close"
                                onClick={() =>
                                    setForgotModal(
                                        false
                                    )
                                }
                            >
                                <X size={19} />
                            </button>

                            <div className="portal-modal-icon">
                                <KeyRound
                                    size={28}
                                />
                            </div>

                            {forgotStep ===
                            "email" ? (
                                <>
                                    <span className="portal-modal-kicker">
                                        ACCOUNT RECOVERY
                                    </span>

                                    <h3>
                                        Forgot Password?
                                    </h3>

                                    <p>
                                        Enter your registered email address.
                                    </p>

                                    <form
                                        className="portal-modal-form"
                                        onSubmit={
                                            sendForgotOtp
                                        }
                                    >
                                        <label>
                                            Email Address
                                        </label>

                                        <div className="portal-input">
                                            <Mail
                                                size={18}
                                            />

                                            <input
                                                type="email"
                                                value={
                                                    forgotEmail
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setForgotEmail(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="name@gmail.com"
                                            />
                                        </div>

                                        {message.text && (
                                            <div
                                                className={`portal-message ${message.type}`}
                                            >
                                                {
                                                    message.text
                                                }
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="portal-primary-btn"
                                            disabled={
                                                loading
                                            }
                                        >
                                            {loading
                                                ? "Sending..."
                                                : "Send Reset Code"}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <span className="portal-modal-kicker">
                                        SECURE PASSWORD RESET
                                    </span>

                                    <h3>
                                        Create New Password
                                    </h3>

                                    <p>
                                        Create a strong new password for your Centuria account.
                                    </p>

                                    <form
                                        className="portal-modal-form"
                                        onSubmit={
                                            handleResetPassword
                                        }
                                    >
                                        <label>
                                            New Password
                                        </label>

                                        <div className="portal-input">
                                            <LockKeyhole
                                                size={18}
                                            />

                                            <input
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    newPassword
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setNewPassword(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="New password"
                                            />

                                            <button
                                                type="button"
                                                className="portal-eye"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        (
                                                            current
                                                        ) =>
                                                            !current
                                                    )
                                                }
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff
                                                        size={18}
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={18}
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        <label>
                                            Confirm New Password
                                        </label>

                                        <div className="portal-input">
                                            <LockKeyhole
                                                size={18}
                                            />

                                            <input
                                                type={
                                                    showConfirmNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    confirmNewPassword
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setConfirmNewPassword(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Repeat new password"
                                            />

                                            <button
                                                type="button"
                                                className="portal-eye"
                                                onClick={() =>
                                                    setShowConfirmNewPassword(
                                                        (
                                                            current
                                                        ) =>
                                                            !current
                                                    )
                                                }
                                            >
                                                {showConfirmNewPassword ? (
                                                    <EyeOff
                                                        size={18}
                                                    />
                                                ) : (
                                                    <Eye
                                                        size={18}
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        {message.text && (
                                            <div
                                                className={`portal-message ${message.type}`}
                                            >
                                                {
                                                    message.text
                                                }
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="portal-primary-btn"
                                            disabled={
                                                loading
                                            }
                                        >
                                            {loading
                                                ? "Updating..."
                                                : "Update Password"}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {successModal && (
                    <motion.div
                        className="portal-modal-overlay"
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                    >
                        <motion.div
                            className="portal-modal portal-success-modal"
                            initial={{
                                opacity: 0,
                                scale: 0.82
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1
                            }}
                        >
                            <div className="portal-success-icon">
                                <Check
                                    size={35}
                                />
                            </div>

                            <span className="portal-modal-kicker">
                                SUCCESS
                            </span>

                            <h3>
                                All Done!
                            </h3>

                            <p>
                                {successText}
                            </p>

                            <button
                                type="button"
                                className="portal-primary-btn"
                                onClick={() => {
                                    setSuccessModal(
                                        false
                                    );

                                    switchMode(
                                        "login"
                                    );
                                }}
                            >
                                Continue to Login
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default Portal;