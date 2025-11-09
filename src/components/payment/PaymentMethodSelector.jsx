import React, { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Paper,
    Grid,
    Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import StripePayment from './StripePayment';
import PayPalPayment from './PayPalPayment';

const PaymentMethodSelector = ({ open, onClose, totalAmount, orderInfo, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [showStripe, setShowStripe] = useState(false);
    const [showPayPal, setShowPayPal] = useState(false);

    const paymentMethods = [
        {
            id: 'stripe',
            name: 'Credit/Debit Card',
            description: 'Pay with Visa, Mastercard, or American Express',
            icon: <CreditCardIcon sx={{ fontSize: 48, color: '#667eea' }} />,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            action: () => setShowStripe(true),
        },
        {
            id: 'paypal',
            name: 'PayPal',
            description: 'Fast and secure payment with PayPal',
            icon: <PaymentIcon sx={{ fontSize: 48, color: '#0070ba' }} />,
            gradient: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
            action: () => setShowPayPal(true),
        },
        {
            id: 'bank',
            name: 'Bank Transfer',
            description: 'Direct bank transfer (Manual processing)',
            icon: <AccountBalanceIcon sx={{ fontSize: 48, color: '#28a745' }} />,
            gradient: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            action: () => handleBankTransfer(),
        },
        {
            id: 'cash',
            name: 'Cash on Delivery',
            description: 'Pay when you receive your order',
            icon: <LocalAtmIcon sx={{ fontSize: 48, color: '#ff9800' }} />,
            gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            action: () => handleCashOnDelivery(),
        },
    ];

    const handleBankTransfer = () => {
        // Bank transfer - process order with pending payment status
        onPaymentSuccess({ 
            paymentMethod: 'bank_transfer', 
            status: 'confirmed',
            paymentStatus: 'pending' 
        });
        onClose();
    };

    const handleCashOnDelivery = () => {
        // Cash on delivery - process order with pending payment status
        onPaymentSuccess({ 
            paymentMethod: 'cash', 
            status: 'confirmed',
            paymentStatus: 'pending' 
        });
        onClose();
    };

    const handleStripeSuccess = (paymentIntent) => {
        // Save to Firebase with pending status first, then mark as paid
        onPaymentSuccess({
            paymentMethod: 'stripe',
            status: 'confirmed',
            paymentStatus: 'pending',
            transactionId: paymentIntent.id,
        });
        setShowStripe(false);
        onClose();
    };

    const handlePayPalSuccess = (order) => {
        // Save to Firebase with pending status first, then mark as paid
        onPaymentSuccess({
            paymentMethod: 'paypal',
            status: 'confirmed',
            paymentStatus: 'pending',
            transactionId: order.id,
        });
        setShowPayPal(false);
        onClose();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '20px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                    },
                }}
            >
                {/* Dialog Header */}
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PaymentIcon sx={{ fontSize: 30 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                                Choose Payment Method
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                Select how you'd like to pay
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
                    {/* Order Total */}
                    <Box
                        sx={{
                            p: 2,
                            mb: 4,
                            marginTop: 3,
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            Order Total
                        </Typography>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                            €{totalAmount}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600 }}>
                            SELECT PAYMENT METHOD
                        </Typography>
                    </Divider>

                    {/* Payment Method Cards */}
                    <Grid container spacing={3}>
                        {paymentMethods.map((method) => (
                            <Grid item xs={12} sm={6} key={method.id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1,
                                        borderRadius: '10px',
                                        border: '1px solid',
                                        borderColor: selectedMethod === method.id ? '#667eea' : '#e9ecef',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            borderColor: '#667eea',
                                        },
                                    }}
                                    onClick={() => setSelectedMethod(method.id)}
                                >
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '10%',
                                            background: method.gradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 1,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {method.icon}
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        {method.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 2 }}>
                                        {method.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            method.action();
                                        }}
                                        sx={{
                                            background: method.gradient,
                                            borderRadius: '10px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            mt: 'auto',
                                            '&:hover': {
                                                opacity: 0.9,
                                            },
                                        }}
                                    >
                                        Select
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>

            {/* Stripe Payment Modal */}
            <StripePayment
                open={showStripe}
                onClose={() => setShowStripe(false)}
                totalAmount={totalAmount}
                onSuccess={handleStripeSuccess}
                orderInfo={orderInfo}
            />

            {/* PayPal Payment Modal */}
            <PayPalPayment
                open={showPayPal}
                onClose={() => setShowPayPal(false)}
                totalAmount={totalAmount}
                onSuccess={handlePayPalSuccess}
                orderInfo={orderInfo}
            />
        </>
    );
};

export default PaymentMethodSelector;
