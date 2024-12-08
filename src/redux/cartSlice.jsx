// cartSlice.jsx
import { createSlice } from '@reduxjs/toolkit';
import { getAuth } from 'firebase/auth';

// Helper function to parse and format prices
const parsePrice = (price) => {
    const parsedPrice = parseFloat(price);
    return isNaN(parsedPrice) ? 0 : parsedPrice;
};

const formatPrice = (price) => {
    return (Math.round(price * 100) / 100).toFixed(2);
};

// Safely parse the JSON from localStorage
const getCurrentUserId = () => {
    const auth = getAuth();
    return auth.currentUser ? auth.currentUser.uid : null;
};

const initialState = [];

// Create the cart slice
export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action) {
            const userId = getCurrentUserId();
            const newItem = {
                ...action.payload,
                price: formatPrice(parsePrice(action.payload.price)),
                quantity: action.payload.quantity || 1,
                time: Date.now(),
                category: action.payload.category || '',
                subcategory: action.payload.subcategory || '',
                description: action.payload.description || '',
                title: action.payload.title || '',
            };
            const existingItem = state.find(item => item.id === newItem.id);
            if (existingItem) {
                existingItem.quantity += newItem.quantity;
                existingItem.price = formatPrice(parsePrice(newItem.price));
            } else {
                state.push(newItem);
            }
            if (userId) {
                const cartData = {
                    items: state,
                    timestamp: Date.now(),
                };
                localStorage.setItem(`cart_${userId}`, JSON.stringify(cartData));
            }
        },
        decrementQuantity(state, action) {
            const item = state.find(item => item.id === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
            } else if (item) {
                // Optionally remove the item if quantity is 1
                const index = state.indexOf(item);
                state.splice(index, 1);
            }
        },
        incrementQuantity(state, action) {
            const item = state.find(item => item.id === action.payload);
            if (item) {
                item.quantity += 1; // Increment the quantity
            }
        },
        deleteFromCart(state, action) {
            const index = state.findIndex(item => item.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1); // Remove the item from the cart
            }
        },
        initializeCart(state, action) {
            return action.payload; // Initialize the cart with the provided items
        },
        orderSuccessful(state) {
            // Clear the cart or perform any other action on successful order
            return []; // Example: Clear the cart
        },
        // ... other reducers ...
    },
});

export const loadCart = () => {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const cartData = JSON.parse(localStorage.getItem(`cart_${userId}`));
    if (cartData) {
        const { items, timestamp } = cartData;
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

        if (now - timestamp < sevenDays) {
            return items; // Return items if within 7 days
        } else {
            localStorage.removeItem(`cart_${userId}`); // Remove expired cart
        }
    }
    return [];
};

// Export actions and reducer
export const { addToCart, decrementQuantity, incrementQuantity, deleteFromCart, initializeCart, orderSuccessful } = cartSlice.actions;
export default cartSlice.reducer;
