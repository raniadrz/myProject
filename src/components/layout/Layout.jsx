import Footer from "../footer/Footer";
import Navbar from "../navbar/Navbar";

/* eslint-disable react/prop-types */
const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 py-1 px-4 text-m" role="alert">
                <p className="font-bold text-center">Demo Project</p>
                <p className="text-center">This is a demo e-shop project and not a real store. No real transactions will be processed.</p>
            </div>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
}

export default Layout;
