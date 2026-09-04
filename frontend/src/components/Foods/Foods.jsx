import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Star,
    Heart,
    Clock3,
    ChefHat,
    ArrowRight,
    ShoppingCart,
    Utensils
} from "lucide-react";

import "./Foods.css";

import devilledChickenImage from "../../assets/images/food-devilled-chicken.jpg";
import chickenKottuImage from "../../assets/images/food-chicken-kottu.jpg";
import chocolateLavaCakeImage from "../../assets/images/food-chocolate-lava-cake.jpg";
import pizzaImage from "../../assets/images/food-pizza.jpg";

const foodItems = [
    {
        id: 1,
        image: devilledChickenImage,
        name: "Devilled Chicken",
        category: "Sri Lankan",
        rating: "4.9",
        reviews: "148",
        time: "25 Min",
        type: "Signature Dish",
        basePrice: 2450,
        mediumPrice: 2950,
        largePrice: 3450,
        description:
            "Spicy devilled chicken tossed with onions, capsicum, tomato and our signature Centuria sauce.",
        color: "deep-red"
    },
    {
        id: 2,
        image: chickenKottuImage,
        name: "Chicken Kottu",
        category: "Local Favourite",
        rating: "4.9",
        reviews: "176",
        time: "20 Min",
        type: "Fresh Made",
        basePrice: 1850,
        mediumPrice: 2350,
        largePrice: 2850,
        description:
            "Freshly chopped roti mixed with chicken, vegetables, egg, herbs and authentic Sri Lankan spices.",
        color: "orange"
    },
    {
        id: 3,
        image: chocolateLavaCakeImage,
        name: "Chocolate Lava Cake",
        category: "Dessert",
        rating: "4.9",
        reviews: "164",
        time: "18 Min",
        type: "Chef Dessert",
        basePrice: 1450,
        mediumPrice: 1850,
        largePrice: 2250,
        description:
            "Warm chocolate cake with a rich molten centre, served as a luxurious sweet finish.",
        color: "olive"
    },
    {
        id: 4,
        image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=90",
        name: "Cheeseburger",
        category: "Western",
        rating: "4.7",
        reviews: "95",
        time: "20 Min",
        type: "Premium Burger",
        basePrice: 2250,
        mediumPrice: 2750,
        largePrice: 3250,
        description:
            "Juicy grilled burger layered with cheese, fresh vegetables and our creamy house-made sauce.",
        color: "crimson"
    },
    {
        id: 5,
        image: pizzaImage,
        name: "Italian Pizza",
        category: "Italian",
        rating: "4.8",
        reviews: "132",
        time: "30 Min",
        type: "Stone Baked",
        basePrice: 3200,
        mediumPrice: 3900,
        largePrice: 4600,
        description:
            "Stone-baked pizza topped with rich tomato sauce, mozzarella and premium fresh ingredients.",
        color: "purple"
    }
];

function Foods() {
    const [searchTerm, setSearchTerm] = useState("");
    const [savedItems, setSavedItems] = useState([]);
    const [portions, setPortions] = useState({});

    const filteredFoods = useMemo(() => {
        const value = searchTerm.trim().toLowerCase();

        if (!value) {
            return foodItems;
        }

        return foodItems.filter((food) => {
            return (
                food.name.toLowerCase().includes(value) ||
                food.category.toLowerCase().includes(value) ||
                food.type.toLowerCase().includes(value)
            );
        });
    }, [searchTerm]);

    const toggleSaved = (foodId) => {
        setSavedItems((previous) =>
            previous.includes(foodId)
                ? previous.filter((id) => id !== foodId)
                : [...previous, foodId]
        );
    };

    const handlePortionChange = (foodId, portion) => {
        setPortions((previous) => ({
            ...previous,
            [foodId]: portion
        }));
    };

    const getSelectedPortion = (foodId) => {
        return portions[foodId] || "regular";
    };

    const getPrice = (food) => {
        const portion = getSelectedPortion(food.id);

        if (portion === "medium") {
            return food.mediumPrice;
        }

        if (portion === "large") {
            return food.largePrice;
        }

        return food.basePrice;
    };

    const formatPrice = (price) => {
        return `LKR ${price.toLocaleString()}`;
    };

    return (
        <section
            className="foods-section"
            id="foods"
        >
            <div className="foods-glow foods-glow-left"></div>
            <div className="foods-glow foods-glow-right"></div>

            <div className="foods-container">
                <motion.div
                    className="foods-header"
                    initial={{
                        opacity: 0,
                        y: 30
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    viewport={{
                        once: true
                    }}
                >
                    <div className="foods-header-content">
                        <div className="foods-label">
                            <span></span>
                            CENTURIA DINING
                        </div>

                        <h2 className="foods-main-title">
                            Our{" "}
                            <span className="foods-script-title">
                                Delicious
                            </span>{" "}
                            Food
                        </h2>

                        <p>
                            specially prepared
                           
                        </p>
                    </div>

                    <button
                        type="button"
                        className="foods-full-menu-button"
                    >
                        <span>
                            View Full Menu
                        </span>

                        <ArrowRight size={18} />
                    </button>
                </motion.div>

                <motion.div
                    className="foods-search-area"
                    initial={{
                        opacity: 0,
                        y: 20
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.7,
                        delay: 0.1
                    }}
                    viewport={{
                        once: true
                    }}
                >
                    <div className="foods-search-box">
                        <div className="foods-search-icon">
                            <Search size={19} />
                        </div>

                        <input
                            type="text"
                            placeholder="Search Devilled Chicken, Kottu, Cheeseburger..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                        <button
                            type="button"
                            className="foods-search-button"
                        >
                            Search
                        </button>
                    </div>
                </motion.div>

                <div className="foods-grid">
                    {filteredFoods.map(
                        (food, index) => {
                            const saved =
                                savedItems.includes(
                                    food.id
                                );

                            const selectedPortion =
                                getSelectedPortion(
                                    food.id
                                );

                            const currentPrice =
                                getPrice(food);

                            return (
                                <motion.article
                                    key={food.id}
                                    className={`food-card food-card-${food.color}`}
                                    initial={{
                                        opacity: 0,
                                        y: 40
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0
                                    }}
                                    transition={{
                                        duration: 0.65,
                                        delay:
                                            index * 0.08
                                    }}
                                    viewport={{
                                        once: true
                                    }}
                                >
                                    <div className="food-page-flip"></div>

                                    <div className="food-image-frame">
                                        <div className="food-image-area">
                                            <img
                                                src={
                                                    food.image
                                                }
                                                alt={
                                                    food.name
                                                }
                                            />

                                            <div className="food-image-overlay"></div>

                                            <div className="food-rating">
                                                <Star
                                                    size={14}
                                                    fill="currentColor"
                                                />

                                                <strong>
                                                    {
                                                        food.rating
                                                    }
                                                </strong>

                                                <span>
                                                    (
                                                    {
                                                        food.reviews
                                                    }
                                                    )
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className={`food-save-button ${
                                                    saved
                                                        ? "saved"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    toggleSaved(
                                                        food.id
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

                                            <div className="food-category">
                                                <ChefHat size={13} />
                                                {food.category}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="food-card-body">
                                        <h3>
                                            {food.name}
                                        </h3>

                                        <p className="food-description">
                                            {
                                                food.description
                                            }
                                        </p>

                                        <div className="food-top-details">
                                            <div className="food-detail-box">
                                                <Clock3 size={15} />

                                                <div>
                                                    <span>
                                                        Ready In
                                                    </span>

                                                    <strong>
                                                        {
                                                            food.time
                                                        }
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="food-detail-box">
                                                <Utensils size={15} />

                                                <div>
                                                    <span>
                                                        Style
                                                    </span>

                                                    <strong>
                                                        {
                                                            food.type
                                                        }
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="food-portion-area">
                                            <div className="portion-heading">
                                                <span>
                                                    Portion
                                                </span>

                                                <strong>
                                                    Choose Size
                                                </strong>
                                            </div>

                                            <div className="portion-buttons">
                                                <button
                                                    type="button"
                                                    className={
                                                        selectedPortion ===
                                                        "regular"
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        handlePortionChange(
                                                            food.id,
                                                            "regular"
                                                        )
                                                    }
                                                >
                                                    Regular
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        selectedPortion ===
                                                        "medium"
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        handlePortionChange(
                                                            food.id,
                                                            "medium"
                                                        )
                                                    }
                                                >
                                                    Medium
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        selectedPortion ===
                                                        "large"
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        handlePortionChange(
                                                            food.id,
                                                            "large"
                                                        )
                                                    }
                                                >
                                                    Large
                                                </button>
                                            </div>
                                        </div>

                                        <div className="food-price-row">
                                            <div>
                                                <span>
                                                    Total Price
                                                </span>

                                                <strong>
                                                    {formatPrice(
                                                        currentPrice
                                                    )}
                                                </strong>
                                            </div>

                                            <div className="food-price-badge">
                                                {
                                                    selectedPortion
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    selectedPortion.slice(1)
                                                }
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="food-view-button"
                                        >
                                            <ShoppingCart size={16} />

                                            <span>
                                                View Dish
                                            </span>

                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </motion.article>
                            );
                        }
                    )}
                </div>

                {filteredFoods.length === 0 && (
                    <div className="foods-empty">
                        No matching dishes found.
                    </div>
                )}
            </div>
        </section>
    );
}

export default Foods;