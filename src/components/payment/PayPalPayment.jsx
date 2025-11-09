import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import toast from 'react-hot-toast';

const PayPalPayment = ({ open, onClose, totalAmount, onSuccess, orderInfo }) => {
    const paypalRef = useRef();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && totalAmount > 0) {
            // Load PayPal SDK
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR`;
            script.addEventListener('load', () => {
                setLoading(false);
                renderPayPalButtons();
            });
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
            };
        }
    }, [open, totalAmount]);

    const renderPayPalButtons = () => {
        if (window.paypal && paypalRef.current) {
            window.paypal
                .Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [
                                {
                                    amount: {
                                        value: totalAmount.toString(),
                                        currency_code: 'EUR',
                                    },
                                    description: 'Pet Store Order',
                                },
                            ],
                        });
                    },
                    onApprove: async (data, actions) => {
                        const order = await actions.order.capture();
                        toast.success('Payment successful!');
                        onSuccess(order);
                        onClose();
                    },
                    onError: (err) => {
                        console.error('PayPal error:', err);
                        toast.error('Payment failed. Please try again.');
                    },
                    style: {
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'paypal',
                    },
                })
                .render(paypalRef.current);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
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
                    background: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
                    color: 'white',
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PaymentIcon sx={{ fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                            PayPal Checkout
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Safe & Secure Payment
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

            <DialogContent sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: 300 }}>
                {/* Payment Amount */}
                <Box
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Total Amount
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                        €{totalAmount}
                    </Typography>
                </Box>

                {/* PayPal Buttons Container */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box ref={paypalRef} />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PayPalPayment;
