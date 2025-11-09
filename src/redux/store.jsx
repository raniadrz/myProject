import { configureStore } from '@reduxjs/toolkit';
import cartSlice from './cartSlice';
import { getAuth } from 'firebase/auth';

// Create a function to load the persisted state
const loadState = () => {
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return undefined;

    const serializedState = localStorage.getItem(`cart_${userId}`);
    if (serializedState === null) return undefined;
    
    const cartData = JSON.parse(serializedState);
    // Check if it's the new format with items and timestamp
    if (cartData && cartData.items) {
      return { cart: cartData.items };
    }
    // Fallback for old format (just array of items)
    return { cart: cartData };
  } catch (err) {
    return undefined;
  }
};

// Create a function to save the state
const saveState = (state) => {
  try {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const cartData = {
      items: state.cart,
      timestamp: Date.now(),
    };
    const serializedState = JSON.stringify(cartData);
    localStorage.setItem(`cart_${userId}`, serializedState);
  } catch (err) {
    // Handle errors
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    cart: cartSlice,
   
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['cart/initializeCart'],
        ignoredPaths: ['cart.time', 'payload.time'],
      },
    }),
  devTools: true,
});

// Subscribe to store changes
store.subscribe(() => {
  saveState(store.getState());
});
