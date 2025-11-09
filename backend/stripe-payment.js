// This should be placed in your backend (Firebase Cloud Functions or Express API)
// Install: npm install stripe

const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency, orderInfo } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: currency || 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                orderId: orderInfo.orderId || '',
                customerEmail: orderInfo.email || '',
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
};

// For Firebase Cloud Functions:
// const functions = require('firebase-functions');
// exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
//     ... same code as above
// });
