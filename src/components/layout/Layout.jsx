import Footer from "../footer/Footer";
import Navbar from "../navbar/Navbar";
import { Box, useMediaQuery, useTheme } from "@mui/material";

/* eslint-disable react/prop-types */
const Layout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 py-1 px-4 text-m" role="alert">
                <p className="font-bold text-center">Demo Project</p>
                <p className="text-center">This is a demo e-shop project and not a real store. No real transactions will be processed.</p>
            </div>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1, pb: isMobile ? '88px' : 0 }}>
                {children}
            </Box>
            {!isMobile && <Footer />}
        </div>
    );
}

export default Layout;
