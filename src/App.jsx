import { Toaster } from "react-hot-toast";
import 'semantic-ui-css/semantic.min.css';

import {
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ScrollTop from "./components/scrollTop/ScrollTop";
import MyState from "./context/myState";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UpdateProductPage from "./pages/admin/UpdateProductPage";
import CartPage from "./pages/cart/CartPage";
import CategoryPage from "./pages/category/CategoryPage";
import HomePage from "./pages/home/HomePage";
import NoPage from "./pages/noPage/NoPage";
import ProductInfo from "./pages/productInfo/ProductInfo";
import Login from "./pages/registration/Login";
import Signup from "./pages/registration/Signup";
import ProductsPage from "./components/homePageProductCard/HomePageProductCard";
import { ProtectedRouteForAdmin } from "./protectedRoute/ProtectedRouteForAdmin";
import { ProtectedRouteForUser } from "./protectedRoute/ProtectedRouteForUser";
import AddProduct from "./pages/admin/AddProductPage";
import UserSettings from './components/user/ProfileDetail';
import Contact from "./pages/footer/contact/Contact";
import PPolicy from "./pages/footer/privacyPolicy/privacyPolicy";
import ReturnPolicy from './pages/footer/returnPolicy/ReturnPolicy';
import Mission from './pages/footer/mission/Mission';
import Team from './pages/footer/team/Team';
import Newsletter from './pages/footer/newsletter/Newsletter';
import FAQ from './pages/footer/faq/faq';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeCart } from './redux/cartSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(initializeCart());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <MyState>
      <Router>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/*" element={<NoPage />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/team" element={<Team />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/privacypolicy" element={<PPolicy />} />
          <Route path="/refund-policy" element={<ReturnPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/productinfo/:id" element={<ProductInfo />} />
          <Route path="/cart" element={<CartPage isDialog={false} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/category/:categoryname" element={<CategoryPage />} />

          <Route path="/user-dashboard" element={
            <ProtectedRouteForUser>
              <UserSettings />
            </ProtectedRouteForUser>
          } />

          <Route path="/admin-dashboard" element={
            <ProtectedRouteForAdmin>
              <AdminDashboard />
            </ProtectedRouteForAdmin>
          } />
         
          <Route path="/updateproduct/:id" element={
            <ProtectedRouteForAdmin>
              <UpdateProductPage />
            </ProtectedRouteForAdmin>
          } />
          <Route path="/admin-settings" element={
            <ProtectedRouteForAdmin>
              <UserSettings />
            </ProtectedRouteForAdmin>
          } />

          <Route path="/addproduct" element={
            <ProtectedRouteForAdmin>
              <AddProduct />
            </ProtectedRouteForAdmin>
          } />

          <Route path="/faq" element={
            <ProtectedRouteForAdmin>
              <FAQ />
            </ProtectedRouteForAdmin>
          } />
        </Routes>
        <Toaster />
      </Router>
      
    </MyState>
  );
}

export default App;
