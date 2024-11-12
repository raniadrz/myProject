import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { ThemeProvider } from "@material-tailwind/react";
import { Provider } from "react-redux";
import { store } from './redux/store';

// Analytics Vercel
import { inject } from '@vercel/analytics';

// Call inject() outside the render method
inject();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
        <ThemeProvider>
          <App />
          
      
        </ThemeProvider>

    </Provider>,

  </React.StrictMode>
);