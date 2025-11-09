/* eslint-disable react/prop-types */
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Box,
    Typography,
    MenuItem,
    Divider,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PaymentMethodSelector from '../payment/PaymentMethodSelector';

const BuyNowModal = ({ addressInfo, setAddressInfo, buyNowFunction, totalAmount, orderInfo }) => {
    const [open, setOpen] = useState(false);
    const [loginPopupOpen, setLoginPopupOpen] = useState(false);
    const [showPaymentSelector, setShowPaymentSelector] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in by fetching the user data from localStorage
    const user = JSON.parse(localStorage.getItem('users'));

    const handleOpen = () => {
        if (!user) {
            // If user is not logged in, open the login popup
            setLoginPopupOpen(true);
            return;
        }
        setOpen(!open); // Toggle modal open/close
    };

    const handleProceedToPayment = () => {
        // Validate address fields
        if (!addressInfo.name || !addressInfo.address || !addressInfo.pincode || !addressInfo.mobileNumber) {
            return; // BuyNowModal will handle toast error
        }
        
        // Close address modal and open payment selector
        setOpen(false);
        setShowPaymentSelector(true);
    };

    const handlePaymentSuccess = (paymentData) => {
        // Call the original buyNowFunction with payment data
        buyNowFunction(paymentData);
        setShowPaymentSelector(false);
    };

    // Handle login popup button clicks
    const goToLogin = () => {
        navigate('/login');
        setLoginPopupOpen(false); // Close the popup
    };

    const goToCreateAccount = () => {
        navigate('/signup');
        setLoginPopupOpen(false); // Close the popup
    };

    return (
        <>
            {/* Modern Buy Now Button */}
            <Button
                type="button"
                onClick={handleOpen}
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ShoppingBagIcon />}
                sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '18px',
                    padding: '16px',
                    boxShadow: '0 6px 20px rgba(245, 87, 108, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                        boxShadow: '0 8px 25px rgba(245, 87, 108, 0.5)',
                        transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                }}
            >
                Buy Now
            </Button>

            {/* Main Buy Now Modal */}
            <Dialog 
                open={open} 
                onClose={handleOpen}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                    }
                }}
            >
                {/* Dialog Header */}
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <ShoppingBagIcon sx={{ fontSize: 28 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                                Complete Your Order
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                Fill in your delivery details
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={handleOpen}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        {/* Name Field */}
                        <Box>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                    color: '#495057',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 18 }} />
                                Full Name
                            </Typography>
                            <TextField
                                fullWidth
                                name="name"
                                value={addressInfo.name}
                                onChange={(e) => {
                                    setAddressInfo({
                                        ...addressInfo,
                                        name: e.target.value
                                    })
                                }}
                                placeholder='Enter your full name'
                                variant="outlined"
                                sx={{
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        }
                                    }
                                }}
                            />
                        </Box>

                        {/* Address Field */}
                        <Box>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                    color: '#495057',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <HomeIcon sx={{ fontSize: 18 }} />
                                Delivery Address
                            </Typography>
                            <TextField
                                fullWidth
                                name="address"
                                value={addressInfo.address}
                                onChange={(e) => {
                                    setAddressInfo({
                                        ...addressInfo,
                                        address: e.target.value
                                    })
                                }}
                                placeholder='Enter your full address'
                                multiline
                                rows={2}
                                variant="outlined"
                                sx={{
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        }
                                    }
                                }}
                            />
                        </Box>

                        {/* Postal Code Field */}
                        <Box>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                    color: '#495057',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <LocationOnIcon sx={{ fontSize: 18 }} />
                                Postal Code
                            </Typography>
                            <TextField
                                fullWidth
                                name="pincode"
                                type="number"
                                value={addressInfo.pincode}
                                onChange={(e) => {
                                    setAddressInfo({
                                        ...addressInfo,
                                        pincode: e.target.value
                                    })
                                }}
                                placeholder='Enter your postal code'
                                variant="outlined"
                                sx={{
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        }
                                    }
                                }}
                            />
                        </Box>

                        {/* Mobile Number Field */}
                        <Box>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    mb: 1,
                                    fontWeight: 600,
                                    color: '#495057',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <PhoneIcon sx={{ fontSize: 18 }} />
                                Mobile Number
                            </Typography>
                            <TextField
                                fullWidth
                                name="mobileNumber"
                                value={addressInfo.mobileNumber}
                                onChange={(e) => {
                                    setAddressInfo({
                                        ...addressInfo,
                                        mobileNumber: e.target.value
                                    })
                                }}
                                placeholder='Enter your mobile number'
                                variant="outlined"
                                sx={{
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                        '&:hover fieldset': {
                                            borderColor: '#667eea',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#667eea',
                                        }
                                    }
                                }}
                            />
                        </Box>

                        {/* Remove the old payment method field since we'll use the payment selector */}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, backgroundColor: 'white' }}>
                    <Button
                        onClick={handleOpen}
                        variant="outlined"
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '15px',
                            px: 3,
                            borderColor: '#dee2e6',
                            color: '#495057',
                            '&:hover': {
                                borderColor: '#adb5bd',
                                backgroundColor: '#f8f9fa'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleProceedToPayment}
                        variant="contained"
                        startIcon={<ShoppingBagIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '15px',
                            px: 4,
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                            }
                        }}
                    >
                        Proceed to Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Method Selector */}
            <PaymentMethodSelector
                open={showPaymentSelector}
                onClose={() => setShowPaymentSelector(false)}
                totalAmount={totalAmount}
                orderInfo={orderInfo}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Login Required Modal */}
            <Dialog 
                open={loginPopupOpen} 
                onClose={() => setLoginPopupOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    }
                }}
            >
                <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                        }}
                    >
                        <LockIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 700,
                            color: '#2c3e50',
                            mb: 1.5,
                            fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        Login Required
                    </Typography>
                    
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: '#7f8c8d',
                            mb: 3,
                            lineHeight: 1.6,
                        }}
                    >
                        You need to be logged in to place an order. Please login or create a new account to continue.
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AccountCircleIcon />}
                            onClick={goToLogin}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '15px',
                                py: 1.5,
                                borderColor: '#667eea',
                                color: '#667eea',
                                borderWidth: '2px',
                                '&:hover': {
                                    borderColor: '#764ba2',
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                    borderWidth: '2px',
                                }
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<PersonIcon />}
                            onClick={goToCreateAccount}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '15px',
                                py: 1.5,
                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                boxShadow: '0 4px 15px rgba(56, 239, 125, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
                                    boxShadow: '0 6px 20px rgba(56, 239, 125, 0.4)',
                                }
                            }}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default BuyNowModal;
