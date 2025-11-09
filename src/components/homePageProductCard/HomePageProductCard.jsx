import React, { useContext, useEffect, useState } from "react";
import { Button, Card, CardContent, CardMedia, Grid, Typography, Container, Chip, CircularProgress, Box, IconButton, Pagination, Stack } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete'; // Import delete icon
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // Import cart icon
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import Category  from "../category/Category";
import myContext from "../../context/myContext";
import Layout from "../layout/Layout";
import { addToCart, incrementQuantity, decrementQuantity, deleteFromCart } from '../../redux/cartSlice';
import "./HomePageProductCard.css";
import OutOfStockImage from '../../pages/category/stockOut.png';

const HomePageProductCard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const context = useContext(myContext);
    const { loading, getAllProduct } = context;

    const cartItems = useSelector((state) => state.cart);

    // Show all products without filtering by status
    const visibleProducts = getAllProduct;

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;

    // Calculate products to display for the current page
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = visibleProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Calculate total pages
    const totalPages = Math.ceil(visibleProducts.length / productsPerPage);

    // Handle page change
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const addCart = (item) => {
        if (item.stock === 0) {
            toast.error("Cannot add to cart. Item is out of stock.");
            return;
        }
        const itemWithTime = { ...item, time: new Date().toISOString() };
        dispatch(addToCart(itemWithTime));
        toast.success("Added to cart");
    };

    const increaseQuantity = (id) => {
        dispatch(incrementQuantity(id));
    };

    const decreaseQuantity = (id) => {
        dispatch(decrementQuantity(id));
    };

    const deleteCart = (item) => {
        dispatch(deleteFromCart(item)); // Pass the item instead of just the id
        toast.success("Deleted from cart");
    };

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Helper function to find if an item is in the cart and return its quantity
    const findCartItem = (id) => {
        return cartItems.find(item => item.id === id);
    };

    return (
        <Layout>
            {/* Hero Section with Gradient Background */}
            <Box 
                sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 6,
                    mb: 4,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            color: '#ffffff',  
                            fontWeight: '700',
                            fontFamily: "'Poppins', sans-serif",
                            mb: 1,
                            textAlign: 'center',
                            letterSpacing: '1px',
                            textShadow: '2px 4px 8px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        Bestselling Products
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: '400',
                            textAlign: 'center',
                            fontFamily: "'Poppins', sans-serif",
                        }}
                    >
                        Discover our most popular items loved by pet owners
                    </Typography>
                </Container>
            </Box>

            
            <Container maxWidth="lg"  sx={{ mt: 4 }}>
                {/* Categories Section */}
                <Box sx={{ mb: 4 }}>
                    <Category />
                </Box>

                {/* Product Count */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: '#666',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        {visibleProducts.length} {visibleProducts.length === 1 ? 'Product' : 'Products'} Available
                    </Typography>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                <Grid 
                    container 
                    spacing={3} 
                    justifyContent="flex-start"
                    sx={{ mt: 1 }}
                >
                {currentProducts.map((item, index) => {
                    const { id, title, price, productImageUrl, productType, stock } = item;
                    const cartItem = findCartItem(id);

                    return (
                        <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    borderRadius: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.15)',
                                    },
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease',
                                    },
                                    '&:hover::before': {
                                        opacity: 1,
                                    }
                                }} 
                                onClick={() => navigate(`/productinfo/${id}`)}
                            >
                                {/* Product Image Section */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    height: 220,
                                    backgroundColor: '#fafafa',
                                    p: 2,
                                    position: 'relative',
                                }}>
                                    {stock === 0 ? (
                                        <CardMedia
                                            component="img"
                                            image={OutOfStockImage}
                                            alt="Out of Stock"
                                            sx={{ 
                                                width: 'auto',
                                                maxHeight: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    ) : (
                                        <CardMedia
                                            component="img"
                                            image={productImageUrl}
                                            alt="product"
                                            sx={{ 
                                                width: 'auto',
                                                maxHeight: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                                transition: 'transform 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                }
                                            }}
                                        />
                                    )}

                                    {/* Product Type Badge */}
                                    {productType === "New Product" && (
                                        <Chip
                                            label="New"
                                            icon={<StarIcon sx={{ fontSize: 16 }} />}
                                            sx={{ 
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '12px',
                                                height: '28px',
                                                boxShadow: '0 2px 8px rgba(56, 239, 125, 0.3)',
                                            }}
                                        />
                                    )}
                                    {productType === "Sales" && (
                                        <Chip
                                            label="Sale"
                                            icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                                            sx={{ 
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '12px',
                                                height: '28px',
                                                boxShadow: '0 2px 8px rgba(245, 87, 108, 0.3)',
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Product Details */}
                                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                    <Typography 
                                        variant="h6" 
                                        component="div"
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: '16px',
                                            color: '#2c3e50',
                                            mb: 1,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            minHeight: '48px',
                                        }}
                                    >
                                        {title}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{
                                            color: '#7f8c8d',
                                            fontSize: '13px',
                                            mb: 1.5,
                                        }}
                                    >
                                        E-ctb
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography 
                                            variant="h5" 
                                            sx={{
                                                color: '#667eea',
                                                fontWeight: 700,
                                                fontSize: '22px',
                                            }}
                                        >
                                            €{price}
                                        </Typography>
                                        {stock <= 5 && stock > 0 && (
                                            <Chip 
                                                label={`Only ${stock} left`}
                                                size="small"
                                                sx={{
                                                    backgroundColor: '#fff3cd',
                                                    color: '#856404',
                                                    fontSize: '11px',
                                                    height: '22px',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </CardContent>

                                <Box sx={{ p: 2 }}>
                                    {cartItem ? (
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={1}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <IconButton
                                                    onClick={(e) => { e.stopPropagation(); decreaseQuantity(id); }}
                                                    size="small"
                                                    disabled={cartItem.quantity <= 1}
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                                <Typography variant="body1" sx={{ mx: 2 }}>
                                                    {cartItem.quantity}
                                                </Typography>
                                                <IconButton
                                                    onClick={(e) => { e.stopPropagation(); increaseQuantity(id); }}
                                                    size="small"
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                            <Button
                                            onClick={(e) => { e.stopPropagation(); deleteCart(item); }} // Pass the item object
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            fullWidth
                                        >
                                            Delete From Cart
                                        </Button>

                                        </Box>
                                    ) : (
                                        <Button
                                            onClick={(e) => { e.stopPropagation(); addCart(item); }}
                                            variant="outlined" // Outlined button like the delete button
                                            color="primary"   // Blue color for the Add to Cart button
                                            startIcon={<ShoppingCartIcon />} // Add a cart icon
                                            fullWidth
                                        >
                                            Add To Cart
                                        </Button>
                                    )}
                                </Box>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
            
            {/* Add Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                <Pagination 
                    count={totalPages} 
                    page={currentPage} 
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                />
            </Box>
        </Container>
        </Layout>
    );
};

export default HomePageProductCard;
