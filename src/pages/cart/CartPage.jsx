import { Timestamp, addDoc, collection, doc, updateDoc, increment } from "firebase/firestore";
import { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import emailjs from "emailjs-com";
import {
    Box, Container, Typography, IconButton, Button, Divider, Chip, Paper, Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import Layout from "../../components/layout/Layout";
import BuyNowModal from "../../components/buyNowModal/BuyNowModal";
import { fireDB } from "../../firebase/FirebaseConfig";
import {
    decrementQuantity, deleteFromCart, incrementQuantity, orderSuccessful, addToCart, initializeCart,
} from "../../redux/cartSlice";
import MyContext from "../../context/myContext";

const CartPage = () => {
    const cartItems = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = getAuth();
    const { saveUserCart, loadUserCart } = useContext(MyContext);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setIsLoggedIn(!!user);
            if (user) {
                const savedCart = await loadUserCart(user.uid);
                if (savedCart && savedCart.length > 0) {
                    dispatch(initializeCart(savedCart));
                }
            }
        });
        setIsLoggedIn(!!auth.currentUser);
        return () => unsubscribe();
    }, [auth, dispatch]);

    useEffect(() => {
        if (auth.currentUser) {
            saveUserCart(auth.currentUser.uid, cartItems);
        }
    }, [cartItems, auth.currentUser]);

    const deleteCart = (item) => {
        dispatch(deleteFromCart(item));
        toast.success("Removed from cart");
    };

    const cartItemTotal = cartItems.reduce((t, i) => t + i.quantity, 0);
    const cartTotal = cartItems.reduce((t, i) => t + parseFloat(i.price || 0) * i.quantity, 0).toFixed(2);
    const shippingCost = parseFloat(cartTotal) >= 50 ? 0 : 4;
    const totalAmount = (Math.round((parseFloat(cartTotal) + shippingCost) * 100) / 100).toFixed(2);

    const [addressInfo, setAddressInfo] = useState({
        name: "", address: "", pincode: "", mobileNumber: "",
        time: Timestamp.now(),
        date: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    });

    const sendOrderConfirmationEmail = (order) => {
        const templateParams = {
            to_email: order.email,
            order_id: order.id,
            order_details: JSON.stringify(order.cartItems, null, 2),
            message: `Thank you for your purchase. Please make the deposit to the following IBANs:\n- Eurobank IBAN: GR12 3456 7891 2345\n- Piraeus IBAN: GR23 4567 8901 2345\n- Alpha IBAN: GR12 3456 7890 1234\n\nPlease make the deposit within the next 48 hours so we can process your order.`,
        };
        emailjs.send("service_4pq7vdd", "template_1unb31r", templateParams, "MLiyOAD--CSZFqkQm").catch(() => {});
    };

    const buyNowFunction = async (paymentData = {}) => {
        const currentUser = auth.currentUser;
        if (!currentUser) { toast.error("Please log in to place an order."); return; }
        if (!addressInfo.name || !addressInfo.address || !addressInfo.pincode || !addressInfo.mobileNumber) {
            return toast.error("All fields are required");
        }
        const formattedCartItems = cartItems.map((item) => ({
            ...item,
            price: (Math.round(parseFloat(item.price) * 100) / 100).toFixed(2),
        }));
        const orderInfo = {
            cartItems: formattedCartItems, addressInfo,
            email: currentUser.email, userid: currentUser.uid,
            status: paymentData.status || "confirmed",
            paymentMethod: paymentData.paymentMethod || "bank_transfer",
            paymentStatus: paymentData.paymentStatus || "pending",
            transactionId: paymentData.transactionId || null,
            time: Timestamp.now(),
            date: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        };
        try {
            await addDoc(collection(fireDB, "order"), orderInfo);

            // Decrement stock for each purchased item atomically
            await Promise.all(
                cartItems.map((item) =>
                    updateDoc(doc(fireDB, "products", item.id), {
                        stock: increment(-item.quantity),
                    })
                )
            );

            sendOrderConfirmationEmail(orderInfo);
            setAddressInfo({ name: "", address: "", pincode: "", mobileNumber: "" });
            dispatch(orderSuccessful());
            if (paymentData.paymentMethod === "cash") {
                toast.success("Order placed! Pay on delivery.");
            } else if (paymentData.paymentMethod === "bank_transfer") {
                toast.success("Order placed! Check your email for bank transfer details.");
            } else {
                toast.success("Payment successful! Order placed.");
            }
        } catch {
            toast.error("Failed to place order. Please try again.");
        }
    };

    return (
        <Layout>
            {/* Hero */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    py: 5, mb: 4, position: "relative", overflow: "hidden",
                    "&::before": {
                        content: '""', position: "absolute", inset: 0,
                        background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 1 }}>
                        <ShoppingCartOutlinedIcon sx={{ color: "white", fontSize: 36 }} />
                        <Typography variant="h3" sx={{ color: "white", fontWeight: 700, fontFamily: "'Poppins', sans-serif", letterSpacing: 1 }}>
                            Shopping Cart
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)", fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                        {cartItemTotal} {cartItemTotal === 1 ? "item" : "items"} in your cart
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 6 }}>
                {cartItems.length === 0 ? (
                    /* Empty state */
                    <Box sx={{ textAlign: "center", py: 10 }}>
                        <ShoppingCartOutlinedIcon sx={{ fontSize: 90, color: "#dee2e6", mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#2c3e50", mb: 1 }}>Your cart is empty</Typography>
                        <Typography variant="body1" sx={{ color: "#7f8c8d", mb: 4 }}>
                            Looks like you haven't added any products yet.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate("/")}
                            sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                borderRadius: "25px", px: 4, py: 1.5,
                                textTransform: "none", fontWeight: 600, fontSize: 16,
                                boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                                "&:hover": { background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)" },
                            }}
                        >
                            Continue Shopping
                        </Button>
                    </Box>
                ) : (
                    <Grid container spacing={3} alignItems="flex-start">
                        {/* Cart Items */}
                        <Grid item xs={12} lg={8}>
                            <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e9ecef", overflow: "hidden" }}>
                                {/* Header */}
                                <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#2c3e50" }}>
                                        Cart Items ({cartItemTotal})
                                    </Typography>
                                </Box>

                                {cartItems.map((item, index) => {
                                    const { id, title, price, productImageUrl, quantity, category, category2 } = item;
                                    const lineTotal = (parseFloat(price) * quantity).toFixed(2);
                                    return (
                                        <Box key={id || index}>
                                            <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2.5 }, display: "flex", gap: { xs: 1.5, sm: 2 }, alignItems: "flex-start" }}>
                                                {/* Image */}
                                                <Box
                                                    sx={{
                                                        width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 },
                                                        flexShrink: 0, borderRadius: "12px",
                                                        backgroundColor: "#fafafa", border: "1px solid #f0f0f0",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <img src={productImageUrl} alt={title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                                                </Box>

                                                {/* Right — info + qty + total */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    {/* Title + delete */}
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 0.5 }}>
                                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                                            <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, sm: 15 }, color: "#2c3e50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {title}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 11, color: "#adb5bd", mt: 0.2 }}>
                                                                {category}{category2 ? ` • ${category2}` : ""}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: { xs: 13, sm: 15 }, fontWeight: 700, color: "#667eea", mt: 0.3 }}>
                                                                €{parseFloat(price).toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                        <IconButton size="small" onClick={() => deleteCart(item.id)} sx={{ color: "#adb5bd", flexShrink: 0, p: 0.5, "&:hover": { color: "#e74c3c" } }}>
                                                            <DeleteOutlineIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                                                        </IconButton>
                                                    </Box>

                                                    {/* Qty + line total */}
                                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                            <IconButton
                                                                size="small"
                                                                disabled={quantity <= 1}
                                                                onClick={() => dispatch(decrementQuantity(id))}
                                                                sx={{
                                                                    width: { xs: 26, sm: 30 }, height: { xs: 26, sm: 30 },
                                                                    border: "1px solid #dee2e6", borderRadius: "8px",
                                                                    "&:hover": { backgroundColor: "#667eea", color: "white", borderColor: "#667eea" },
                                                                    "&:disabled": { backgroundColor: "#f8f9fa" },
                                                                }}
                                                            >
                                                                <RemoveIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                            <Typography sx={{ width: { xs: 24, sm: 28 }, textAlign: "center", fontWeight: 700, fontSize: { xs: 13, sm: 15 }, color: "#2c3e50" }}>
                                                                {quantity}
                                                            </Typography>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => dispatch(incrementQuantity(id))}
                                                                sx={{
                                                                    width: { xs: 26, sm: 30 }, height: { xs: 26, sm: 30 },
                                                                    border: "1px solid #dee2e6", borderRadius: "8px",
                                                                    "&:hover": { backgroundColor: "#667eea", color: "white", borderColor: "#667eea" },
                                                                }}
                                                            >
                                                                <AddIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Box>
                                                        <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 15 }, color: "#2c3e50" }}>
                                                            €{lineTotal}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {index < cartItems.length - 1 && <Divider sx={{ mx: { xs: 2, sm: 3 } }} />}
                                        </Box>
                                    );
                                })}
                            </Paper>
                        </Grid>

                        {/* Order Summary */}
                        <Grid item xs={12} lg={4}>
                            <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e9ecef", overflow: "hidden", position: "sticky", top: 20 }}>
                                {/* Header */}
                                <Box
                                    sx={{
                                        px: 3, py: 2,
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: "white" }}>
                                        Order Summary
                                    </Typography>
                                </Box>

                                <Box sx={{ px: 3, py: 2.5 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                                        <Typography sx={{ color: "#6c757d", fontSize: 14 }}>
                                            Subtotal ({cartItemTotal} {cartItemTotal === 1 ? "item" : "items"})
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#2c3e50" }}>€{cartTotal}</Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                            <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: "#6c757d" }} />
                                            <Typography sx={{ color: "#6c757d", fontSize: 14 }}>Delivery</Typography>
                                        </Box>
                                        {shippingCost === 0 ? (
                                            <Chip label="FREE" size="small" sx={{ backgroundColor: "rgba(22,163,74,0.1)", color: "#16a34a", fontWeight: 700, fontSize: 11 }} />
                                        ) : (
                                            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#2c3e50" }}>€{shippingCost}</Typography>
                                        )}
                                    </Box>

                                    {parseFloat(cartTotal) < 50 && (
                                        <Box sx={{ backgroundColor: "#fff3cd", borderRadius: "8px", px: 1.5, py: 1, mb: 2 }}>
                                            <Typography sx={{ fontSize: 12, color: "#856404" }}>
                                                Add €{(50 - parseFloat(cartTotal)).toFixed(2)} more for free delivery!
                                            </Typography>
                                        </Box>
                                    )}

                                    <Divider sx={{ my: 2, borderStyle: "dashed" }} />

                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#2c3e50" }}>Total</Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: 800, fontSize: 20,
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        >
                                            €{totalAmount}
                                        </Typography>
                                    </Box>

                                    {auth.currentUser ? (
                                        <BuyNowModal
                                            addressInfo={addressInfo}
                                            setAddressInfo={setAddressInfo}
                                            buyNowFunction={buyNowFunction}
                                            totalAmount={totalAmount}
                                            orderInfo={cartItems}
                                        />
                                    ) : (
                                        <Button
                                            fullWidth
                                            onClick={() => navigate("/login")}
                                            sx={{
                                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                borderRadius: "10px", py: 1.5,
                                                textTransform: "none", fontWeight: 700, fontSize: 15, color: "white",
                                                boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
                                                "&:hover": { background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)" },
                                            }}
                                        >
                                            Login to Checkout
                                        </Button>
                                    )}

                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => navigate("/")}
                                        sx={{
                                            mt: 1.5, borderRadius: "10px", py: 1.2,
                                            textTransform: "none", fontWeight: 600, fontSize: 14,
                                            borderColor: "#dee2e6", color: "#6c757d",
                                            "&:hover": { borderColor: "#adb5bd", backgroundColor: "#f8f9fa" },
                                        }}
                                    >
                                        Continue Shopping
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Layout>
    );
};

export default CartPage;
