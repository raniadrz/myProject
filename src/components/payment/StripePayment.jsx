import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    CircularProgress,
    IconButton,
    Divider,
    Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import toast from 'react-hot-toast';

// Replace with your Stripe publishable key
const stripePromise = loadStripe('pk_test_51P6Feq066R1dyNUyGmP7XnDJ6lntAX6FsDOmy39mkxGPXPRMm4RlN3l83dYyRW5YbB5wtE5sKFBC2mY9WyvOs1Na00ttd93Jt2');

const CheckoutForm = ({ totalAmount, onSuccess, onClose, orderInfo }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // TEST MODE: Simulate payment without backend
            // In production, you need to create a payment intent on your backend
            
            const cardElement = elements.getElement(CardElement);
            
            // Create a payment method
            const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (pmError) {
                setError(pmError.message);
                toast.error(pmError.message);
                setLoading(false);
                return;
            }

            // In TEST MODE, we simulate a successful payment
            // The card is validated but no actual charge is made
            toast.success('Payment validated successfully (Test Mode)!');
            
            // Simulate successful payment
            const mockPaymentIntent = {
                id: `pi_test_${Date.now()}`,
                status: 'succeeded',
                amount: Math.round(totalAmount * 100),
                currency: 'eur',
                payment_method: paymentMethod.id,
            };
            
            onSuccess(mockPaymentIntent);
            
        } catch (err) {
            console.error('Payment error:', err);
            setError('Payment failed. Please try again.');
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const CARD_ELEMENT_OPTIONS = {
        style: {
            base: {
                fontSize: '16px',
                color: '#2c3e50',
                fontFamily: '"Poppins", sans-serif',
                '::placeholder': {
                    color: '#adb5bd',
                },
            },
            invalid: {
                color: '#e74c3c',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogContent sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                {/* Payment Amount */}
                <Box
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

                {/* Test Mode Warning */}
                <Alert 
                    severity="info" 
                    sx={{ 
                        mb: 2, 
                        borderRadius: '12px',
                        backgroundColor: '#e3f2fd',
                        '& .MuiAlert-icon': {
                            color: '#1976d2'
                        }
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        🧪 Test Mode Active
                    </Typography>
                    <Typography variant="caption">
                        Use test card: 4242 4242 4242 4242 | Any future date | Any CVC
                    </Typography>
                </Alert>

                {/* Card Element */}
                <Box
                    sx={{
                        p: 3,
                        mb: 2,
                        borderRadius: '16px',
                        backgroundColor: 'white',
                        border: '2px solid #e9ecef',
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: '#495057',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        <CreditCardIcon sx={{ fontSize: 18 }} />
                        Card Details
                    </Typography>
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </Box>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                        {error}
                    </Alert>
                )}

                {/* Security Notice */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        backgroundColor: '#e7f3ff',
                        borderRadius: '12px',
                        border: '1px solid #b3d9ff',
                    }}
                >
                    <LockIcon sx={{ fontSize: 18, color: '#0066cc' }} />
                    <Typography variant="caption" sx={{ color: '#0066cc', fontWeight: 500 }}>
                        Your payment information is secure and encrypted
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, backgroundColor: 'white' }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '15px',
                        px: 3,
                        borderColor: '#dee2e6',
                        color: '#495057',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || loading}
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <CreditCardIcon />}
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
                        },
                        '&:disabled': {
                            background: '#ccc',
                            color: '#666',
                        },
                    }}
                >
                    {loading ? 'Processing...' : `Pay €${totalAmount}`}
                </Button>
            </DialogActions>
        </form>
    );
};

const StripePayment = ({ open, onClose, totalAmount, onSuccess, orderInfo }) => {
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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CreditCardIcon sx={{ fontSize: 28 }} />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                            Secure Payment
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Powered by Stripe
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

            <Elements stripe={stripePromise}>
                <CheckoutForm
                    totalAmount={totalAmount}
                    onSuccess={onSuccess}
                    onClose={onClose}
                    orderInfo={orderInfo}
                />
            </Elements>
        </Dialog>
    );
};

export default StripePayment;
