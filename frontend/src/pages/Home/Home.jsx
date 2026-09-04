import Header from "../../components/Header/Header";
import HeroSlider from "../../components/HeroSlider/HeroSlider";
import QuickServices from "../../components/QuickServices/QuickServices";
import About from "../../components/About/About";
import Foods from "../../components/Foods/Foods";
import Rooms from "../../components/Rooms/Rooms";
import Tours from "../../components/Tours/Tours";
import Spa from "../../components/Spa/Spa";
import Footer from "../../components/Footer/Footer";

import "./Home.css";

function Home() {
    return (
        <div className="home-page">
            <Header />

            <main className="home-content">
                <HeroSlider />

                <QuickServices />

                <About />

                <Foods />

                <Rooms />

                <Tours />

                <Spa />
            </main>

            <Footer />
        </div>
    );
}

export default Home;