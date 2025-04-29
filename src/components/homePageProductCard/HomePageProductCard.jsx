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
        <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
            <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                    color: '#2b58a6',  
                    fontWeight: '600',
                    fontFamily: 'Verdana, sans-serif',
                    mb: 3,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',
                }}
            >
                Bestselling Products
            </Typography>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress size={40} />
                </Box>
            )}
            <Grid 
                container 
                spacing={4} 
                justifyContent="center"
                sx={{ 
                    padding: '20px',
                    borderRadius: '10px',
                    mt: 4,
                    backgroundColor: '#f8f9fa'
                }}
            >
                <Category />
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
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                    }
                                }} 
                                onClick={() => navigate(`/productinfo/${id}`)}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    height: 200,
                                    backgroundColor: '#fff',
                                    p: 2
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
                                            }}
                                        />
                                    )}
                                </Box>
                                <CardContent sx={{ flexGrow: 1, backgroundColor: '#fff' }}>
                                    <Typography variant="h6" component="div" sx={{ 
                                        fontWeight: 'bold',
                                        color: '#2b58a6',
                                        mb: 1
                                    }}>
                                        {title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        E-ctb
                                    </Typography>
                                    <Typography variant="h6" color="textPrimary">
                                        {price}€
                                    </Typography>
                                    {productType === "New Product" && (
                                        <Chip
                                            label="New"
                                            color="success"
                                            icon={<StarIcon />}
                                            sx={{ mt: 1 }}
                                        />
                                    )}
                                    {productType === "Sales" && (
                                        <Chip
                                            label="Sale"
                                            color="error"
                                            icon={<LocalOfferIcon />}
                                            sx={{ mt: 1 }}
                                        />
                                    )}
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
