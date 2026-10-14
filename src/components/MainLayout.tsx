import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import OnboardingWizard from "./OnboardingWizard";

const MainLayout = () => {
    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-grow pb-16 md:pb-0">
                <Outlet />
            </div>
            <Footer />
            <MobileBottomNav />
            <OnboardingWizard />
        </main>
    );
};

export default MainLayout;
