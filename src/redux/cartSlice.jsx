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

const loadCartFromLocalStorage = () => {
    const userId = getCurrentUserId();
    if (!userId) return []; // Return empty cart if no user is logged in
    
    try {
        const storedCart = localStorage.getItem(`cart_${userId}`);
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            return Array.isArray(parsedCart) ? parsedCart : [];
        }
    } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
    }
    return [];
};

const initialState = loadCartFromLocalStorage();

// Helper function to ensure timestamp is serializable
const serializeTimestamp = (timestamp) => {
    if (typeof timestamp === 'number') {
        return timestamp;
    }
    return Date.now();
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        initializeCart: (state, action) => {
            const userId = getCurrentUserId();
            if (userId) {
                const storedCart = localStorage.getItem(`cart_${userId}`);
                return storedCart ? JSON.parse(storedCart) : [];
            }
            return [];
        },
        addToCart(state, action) {
            const userId = getCurrentUserId();
            if (!userId) return state; // Don't modify cart if no user is logged in

            const newItem = {
                ...action.payload,
                price: formatPrice(parsePrice(action.payload.price)),
                quantity: action.payload.quantity || 1,
                time: serializeTimestamp(action.payload.time),
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
            localStorage.setItem(`cart_${userId}`, JSON.stringify(state));
        },

        deleteFromCart(state, action) {
            const userId = getCurrentUserId();
            if (!userId) return state;

            const updatedState = state.filter(item => item.id !== action.payload.id);
            localStorage.setItem(`cart_${userId}`, JSON.stringify(updatedState));
            return updatedState;
        },

        incrementQuantity(state, action) {
            const userId = getCurrentUserId();
            if (!userId) return state;

            const existingItem = state.find(item => item.id === action.payload);
            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.price = formatPrice(parsePrice(existingItem.price));
            }
            localStorage.setItem(`cart_${userId}`, JSON.stringify(state));
        },

        decrementQuantity(state, action) {
            const userId = getCurrentUserId();
            if (!userId) return state;

            const existingItem = state.find(item => item.id === action.payload);
            if (existingItem && existingItem.quantity > 1) {
                existingItem.quantity -= 1;
                existingItem.price = formatPrice(parsePrice(existingItem.price));
            }
            localStorage.setItem(`cart_${userId}`, JSON.stringify(state));
        },

        clearCart(state) {
            const userId = getCurrentUserId();
            if (userId) {
                localStorage.removeItem(`cart_${userId}`);
            }
            return [];
        },

        orderSuccessful(state) {
            const userId = getCurrentUserId();
            if (userId) {
                localStorage.removeItem(`cart_${userId}`);
            }
            return [];
        },

        // Add this new reducer to handle user logout
        clearCartOnLogout() {
            return [];
        },
    },
});

export const {
    initializeCart,
    addToCart,
    deleteFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    orderSuccessful,
    clearCartOnLogout,
} = cartSlice.actions;

export default cartSlice.reducer;
