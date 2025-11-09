# 💳 Cart Payment Integration Guide

## Overview
This guide will help you integrate multiple payment methods into your e-commerce cart:
- ✅ Stripe (Credit/Debit Cards)
- ✅ PayPal
- ✅ Bank Transfer
- ✅ Cash on Delivery

---

## 📦 Installation

### Step 1: Install Required Packages

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🔧 Setup Instructions

### Option 1: Stripe Payment (Recommended)

#### 1. Create Stripe Account
1. Go to https://stripe.com
2. Sign up for a free account
3. Complete account verification
4. Get your API keys from the Dashboard

#### 2. Get Your API Keys
- **Publishable Key**: `pk_test_...` (for frontend)
- **Secret Key**: `sk_test_...` (for backend)

#### 3. Update StripePayment.jsx
Replace line 15 in `/src/components/payment/StripePayment.jsx`:
```javascript
const stripePromise = loadStripe('YOUR_PUBLISHABLE_KEY_HERE');
```

#### 4. Set Up Backend (Choose One):

**Option A: Firebase Cloud Functions**
```bash
cd functions
npm install stripe
```

Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    try {
        const { amount, currency, orderInfo } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                customerEmail: orderInfo.email || '',
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

Deploy:
```bash
firebase deploy --only functions
```

**Option B: Express API**
Create `backend/server.js`:
```javascript
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, orderInfo } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency || 'eur',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

#### 5. Update API Endpoint
In `/src/components/payment/StripePayment.jsx`, update line 29:
```javascript
// For Firebase Functions:
const response = await fetch('https://YOUR-PROJECT.cloudfunctions.net/createPaymentIntent', {

// OR for Express:
const response = await fetch('http://localhost:3001/api/create-payment-intent', {
```

---

### Option 2: PayPal Payment

#### 1. Create PayPal Developer Account
1. Go to https://developer.paypal.com
2. Sign up for a developer account
3. Create a new app in the dashboard

#### 2. Get Your Client ID
- Go to Dashboard → My Apps & Credentials
- Copy your **Client ID**

#### 3. Update PayPalPayment.jsx
Replace line 26 in `/src/components/payment/PayPalPayment.jsx`:
```javascript
script.src = `https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR`;
```

---

## 🔄 Update CartPage.jsx

Update your buyNowFunction to handle payment data:

```javascript
const buyNowFunction = async (paymentData = {}) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast.error("Please log in to place an order.");
        return;
    }

    if (addressInfo.name === "" || addressInfo.address === "" || addressInfo.pincode === "" || addressInfo.mobileNumber === "") {
        return toast.error("All Fields are required");
    }

    const formattedCartItems = cartItems.map(item => ({
        ...item,
        price: (Math.round(parseFloat(item.price) * 100) / 100).toFixed(2)
    }));

    const orderInfo = {
        cartItems: formattedCartItems,
        addressInfo,
        email: currentUser.email,
        userid: currentUser.uid,
        status: paymentData.status || "pending",
        paymentMethod: paymentData.paymentMethod || "bank_transfer",
        paymentStatus: paymentData.status || "pending",
        transactionId: paymentData.transactionId || null,
        time: Timestamp.now(),
        date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        })
    };

    try {
        const orderRef = collection(fireDB, 'order');
        await addDoc(orderRef, orderInfo);
        
        // Send email confirmation for all payment methods
        sendOrderConfirmationEmail(orderInfo);
        
        setAddressInfo({
            name: "",
            address: "",
            pincode: "",
            mobileNumber: "",
        });
        dispatch(orderSuccessful());
        toast.success("Order Placed Successfully");
    } catch (error) {
        console.error('Order error:', error);
        toast.error("Failed to place order. Please try again.");
    }
};
```

Update the BuyNowModal component call:
```javascript
<BuyNowModal
    addressInfo={addressInfo}
    setAddressInfo={setAddressInfo}
    buyNowFunction={buyNowFunction}
    totalAmount={totalAmount}
    orderInfo={{
        email: auth.currentUser?.email,
        cartItems: cartItems,
        totalAmount: totalAmount
    }}
/>
```

---

## 🧪 Testing

### Stripe Test Cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184
- Any future expiry date
- Any 3-digit CVC

### PayPal Sandbox:
- Use sandbox accounts from PayPal Developer Dashboard
- Personal account for buyers
- Business account for sellers

---

## 🎨 Features Included

✅ Beautiful UI with gradient designs
✅ Multiple payment options
✅ Secure payment processing
✅ Payment confirmation
✅ Error handling
✅ Loading states
✅ Mobile responsive
✅ Transaction tracking

---

## 📝 Notes

1. **Testing Mode**: Use test API keys during development
2. **Production**: Replace with live API keys when going live
3. **Security**: Never expose secret keys in frontend code
4. **Compliance**: Ensure PCI compliance for handling payments
5. **SSL**: Use HTTPS in production for secure payments

---

## 🚀 Going Live

Before launching:
1. Switch to live API keys (Stripe & PayPal)
2. Test all payment flows thoroughly
3. Set up webhook handlers for payment confirmations
4. Implement proper error logging
5. Add payment receipt emails
6. Configure tax calculations if needed

---

## 🆘 Troubleshooting

**Stripe not loading?**
- Check API key is correct
- Ensure backend endpoint is accessible
- Check browser console for errors

**PayPal buttons not showing?**
- Verify Client ID is correct
- Check for script loading errors
- Ensure amount is valid

**Payment failing?**
- Check test card details
- Verify backend is running
- Check API key permissions

---

## 📧 Support

For issues:
- Stripe: https://support.stripe.com
- PayPal: https://developer.paypal.com/support

---

**Happy Selling! 🛍️**
