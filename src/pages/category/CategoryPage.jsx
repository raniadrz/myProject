import React, { useContext, useEffect, useState } from "react";
import {
    Button, Card, CardContent, CardMedia, Grid, Typography, Container, Chip, CircularProgress, Box, IconButton, Dialog, DialogContent, DialogTitle, Slider, TextField, MenuItem, Pagination
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import toast from "react-hot-toast";
import Layout from "../../components/layout/Layout";
import myContext from "../../context/myContext";
import { addToCart, deleteFromCart, incrementQuantity, decrementQuantity } from "../../redux/cartSlice";
import Category from "../../components/category/Category";
import CloseIcon from '@mui/icons-material/Close';
import { category2List, subcategoryList } from '../../pages/admin/categoryLists';
import noProductsFound from './404.png';
import stockOutImage from './stockOut.png';
// Create Hero Section Component
const CategoryPage = () => {
    const { categoryname } = useParams();
    const context = useContext(myContext);
    const { getAllProduct, loading } = context;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart);

    // Filter state
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCategory2, setSelectedCategory2] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableCategory2, setAvailableCategory2] = useState([]);
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false); // State to manage filter popup visibility

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    useEffect(() => {
        // Debug: Log all products and their categories
        console.log('All Products:', getAllProduct);
        console.log('Current Category:', categoryname);
        
        // Debug: Log products that should match the current category
        const matchingProducts = getAllProduct.filter(product => 
            product.category && product.category.toLowerCase() === categoryname.toLowerCase()
        );
        console.log('Matching Products:', matchingProducts);
        
        // Populate filter options based on the available products
        const categories = Array.from(new Set(getAllProduct.map(product => product.category)));
        const categories2 = Array.from(new Set(getAllProduct.map(product => product.category2)));
        const subcategories = Array.from(new Set(getAllProduct.map(product => product.subcategory)));

        console.log('Available Categories:', categories);
        console.log('Available Category2:', categories2);
        console.log('Available Subcategories:', subcategories);

        setAvailableCategories(categories);
        setAvailableCategory2(categories2);
        setAvailableSubcategories(subcategories);
    }, [getAllProduct, categoryname]);

    // Add this effect to reset filters when category changes
    useEffect(() => {
        // Reset all filters when category changes
        setPriceRange([0, 1000]);
        setSelectedCategory2('');
        setSelectedSubcategory('');
        setCurrentPage(1);
        
        // Get category2 options based on the current category
        const category2Options = category2List[categoryname] || [];
        setAvailableCategory2(category2Options);
        
        // Reset subcategories
        setAvailableSubcategories([]);
    }, [categoryname]);

    // Add this effect to update subcategories when category2 changes
    useEffect(() => {
        if (selectedCategory2) {
            // Get subcategories for the selected category2 from the subcategoryList
            const subcategoryOptions = subcategoryList[selectedCategory2] || [];
            console.log('Selected Category2:', selectedCategory2);
            console.log('Available Subcategories:', subcategoryOptions);
            setAvailableSubcategories(subcategoryOptions);
        } else {
            setAvailableSubcategories([]);
        }
        // Reset subcategory selection when category2 changes
        setSelectedSubcategory('');
    }, [selectedCategory2]);

    // Filter products based on selected filters
    const filteredProducts = getAllProduct.filter((product) => {
        // First check if the product has a category and if it matches the current category
        const categoryMatch = product.category && product.category.toLowerCase() === categoryname.toLowerCase();
        
        // Then apply other filters
        return (
            categoryMatch &&
            product.price >= priceRange[0] &&
            product.price <= priceRange[1] &&
            (!selectedCategory2 || product.category2 === selectedCategory2) &&
            (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
            product.status !== false // Only exclude products where status is explicitly false
        );
    });

    const addCart = (item) => {
        if (item.stock === 0) {
            toast.error("Cannot add to cart. Item is out of stock.");
            return;
        }
        const itemWithTime = { ...item, time: new Date().toISOString() };
        dispatch(addToCart(itemWithTime));
        toast.success("Added to cart");
    };

    const deleteCart = (item) => {
        dispatch(deleteFromCart(item.id));
        toast.success("Deleted from cart");
    };

    const increaseQuantity = (id) => {
        dispatch(incrementQuantity(id));
    };

    const decreaseQuantity = (id) => {
        dispatch(decrementQuantity(id));
    };

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Helper function to find if an item is in the cart and return its quantity
    const findCartItem = (id) => {
        return cartItems.find((item) => item.id === id);
    };

    const handleFilterOpen = () => {
        setIsFilterOpen(true); // Open filter modal
    };

    const handleFilterClose = () => {
        setIsFilterOpen(false); // Close filter modal
    };

    // Handle changes in the price range slider
    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    // Calculate products to display for the current page
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Handle pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handleDirectPageInput = (event) => {
        const pageNumber = parseInt(event.target.value, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const [filterChips, setFilterChips] = useState([]);

    const handleRemoveFilter = (filterType) => {
        switch (filterType) {
            case 'price':
                setPriceRange([0, 1000]);
                break;
            case 'category2':
                setSelectedCategory2('');
                break;
            case 'subcategory':
                setSelectedSubcategory('');
                break;
        }
    };

    const FilterChipsSection = () => {
        return (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                {priceRange[0] !== 0 || priceRange[1] !== 1000 ? (
                    <Chip
                        label={`Price: €${priceRange[0]} - €${priceRange[1]}`}
                        onDelete={() => handleRemoveFilter('price')}
                        sx={{
                            bgcolor: '#e7eaf6',
                            color: '#667eea',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '& .MuiChip-deleteIcon': {
                                color: '#667eea',
                                '&:hover': { color: '#764ba2' }
                            }
                        }}
                    />
                ) : null}
                
                {selectedCategory2 && (
                    <Chip
                        label={`Category: ${selectedCategory2}`}
                        onDelete={() => handleRemoveFilter('category2')}
                        sx={{
                            bgcolor: '#e7eaf6',
                            color: '#667eea',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '& .MuiChip-deleteIcon': {
                                color: '#667eea',
                                '&:hover': { color: '#764ba2' }
                            }
                        }}
                    />
                )}
                
                {selectedSubcategory && (
                    <Chip
                        label={`Subcategory: ${selectedSubcategory}`}
                        onDelete={() => handleRemoveFilter('subcategory')}
                        sx={{
                            bgcolor: '#e7eaf6',
                            color: '#667eea',
                            fontWeight: 600,
                            borderRadius: '8px',
                            '& .MuiChip-deleteIcon': {
                                color: '#667eea',
                                '&:hover': { color: '#764ba2' }
                            }
                        }}
                    />
                )}
            </Box>
        );
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
                            textTransform: 'capitalize',
                            textAlign: 'center',
                            letterSpacing: '1px',
                            textShadow: '2px 4px 8px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        {categoryname}
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
                        Explore our collection of {categoryname.toLowerCase()} products
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* Categories Section */}
                <Box sx={{ mb: 4 }}>
                    <Category />
                </Box>

                {/* Modern Filter Button with Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Button
                        onClick={handleFilterOpen}
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '25px',
                            padding: '10px 24px',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            textTransform: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Filters
                    </Button>
                    
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: '#666',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
                    </Typography>
                </Box>

                {/* Modern Filter Dialog */}
                <Dialog 
                    open={isFilterOpen} 
                    onClose={handleFilterClose}
                    PaperProps={{
                        sx: {
                            borderRadius: '20px',
                            maxWidth: '450px',
                            width: '100%',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                        }
                    }}
                >
                    {/* Modern Dialog Header */}
                    <Box
                        sx={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '20px 24px',
                            color: 'white'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterListIcon />
                            <Typography 
                                component="div" 
                                sx={{ 
                                    fontSize: '1.35rem', 
                                    fontWeight: '600',
                                    fontFamily: "'Poppins', sans-serif"
                                }}
                            >
                                Filter Products
                            </Typography>
                        </Box>
                        <IconButton 
                            onClick={handleFilterClose} 
                            size="small"
                            sx={{ 
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.2)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <DialogContent sx={{ mt: 3, px: 3, pb: 3 }}>
                        <Box display="flex" flexDirection="column" gap={3.5}>
                            {/* Modern Price Range */}
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    borderRadius: '12px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <Typography 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 600,
                                        mb: 2,
                                        fontSize: '15px',
                                        color: '#495057'
                                    }}
                                >
                                    💰 Price Range
                                </Typography>
                                <Box sx={{ px: 1 }}>
                                    <Slider
                                        value={priceRange}
                                        onChange={handlePriceChange}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={1000}
                                        valueLabelFormat={(value) => `€${value}`}
                                        sx={{
                                            color: '#667eea',
                                            '& .MuiSlider-thumb': {
                                                width: 20,
                                                height: 20,
                                                '&:hover': {
                                                    boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)'
                                                }
                                            },
                                            '& .MuiSlider-track': {
                                                height: 4
                                            },
                                            '& .MuiSlider-rail': {
                                                height: 4,
                                                opacity: 0.3
                                            }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Chip 
                                            label={`€${priceRange[0]}`} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 600,
                                                backgroundColor: '#e7eaf6',
                                                color: '#667eea'
                                            }}
                                        />
                                        <Chip 
                                            label={`€${priceRange[1]}`} 
                                            size="small"
                                            sx={{ 
                                                fontWeight: 600,
                                                backgroundColor: '#e7eaf6',
                                                color: '#667eea'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Modern Category Selector */}
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    borderRadius: '12px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef'
                                }}
                            >
                                <Typography 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 600,
                                        mb: 2,
                                        fontSize: '15px',
                                        color: '#495057'
                                    }}
                                >
                                    🏷️ Category
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={selectedCategory2}
                                    onChange={(e) => setSelectedCategory2(e.target.value)}
                                    variant="outlined"
                                    size="medium"
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {availableCategory2.map((category2) => (
                                        <MenuItem key={category2} value={category2}>
                                            {category2}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Modern Subcategory Selector */}
                            <Box 
                                sx={{ 
                                    p: 2.5, 
                                    borderRadius: '12px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #e9ecef',
                                    opacity: selectedCategory2 ? 1 : 0.6
                                }}
                            >
                                <Typography 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 600,
                                        mb: 2,
                                        fontSize: '15px',
                                        color: '#495057'
                                    }}
                                >
                                    📂 Subcategory
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={selectedSubcategory}
                                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                                    variant="outlined"
                                    size="medium"
                                    disabled={!selectedCategory2}
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            '&:hover fieldset': {
                                                borderColor: '#667eea',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#667eea',
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">All Subcategories</MenuItem>
                                    {availableSubcategories.map((subcategory) => (
                                        <MenuItem key={subcategory} value={subcategory}>
                                            {subcategory}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>

                        {/* Modern Action Buttons */}
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            mt: 4,
                        }}>
                            <Button 
                                onClick={handleFilterClose} 
                                variant="outlined"
                                fullWidth
                                sx={{
                                    borderRadius: '10px',
                                    padding: '10px',
                                    textTransform: 'none',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    borderColor: '#dee2e6',
                                    color: '#495057',
                                    '&:hover': {
                                        borderColor: '#adb5bd',
                                        backgroundColor: '#f8f9fa'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleFilterClose} 
                                variant="contained" 
                                fullWidth
                                sx={{ 
                                    borderRadius: '10px',
                                    padding: '10px',
                                    textTransform: 'none',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    '&:hover': { 
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                    }
                                }}
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {loading && <CircularProgress />}

                {/* Active Filter Chips */}
                <FilterChipsSection />

                {currentProducts.length > 0 ? (
                    <Grid 
                        container 
                        spacing={3} 
                        justifyContent="flex-start"
                        sx={{ mt: 1 }}
                    >
                        {currentProducts.map((item, index) => {
                            const { id, title, price, productImageUrl, productType, category, category2, subcategory, stock } = item;
                            const cartItem = findCartItem(id);

                            return (
                                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                                    <Card
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
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
                                            {/* Stock Out Image */}
                                        {stock === 0 && (
                                            <img
                                                src={stockOutImage}
                                                alt="Out of Stock"
                                                style={{
                                                    position: 'absolute',
                                                    top: -20,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '100px',
                                                    height: 'auto',
                                                    zIndex: 10,
                                                }}
                                            />
                                        )}

                                        {/* Product Image Section */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                height: 220,
                                                p: 2,
                                                backgroundColor: '#fafafa',
                                                position: 'relative',
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={productImageUrl}
                                                alt="product"
                                                sx={{
                                                    width: "auto",
                                                    maxHeight: "100%",
                                                    maxWidth: "100%",
                                                    objectFit: "contain",
                                                    transition: 'transform 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                    }
                                                }}
                                            />
                                            
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
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {category2} • {subcategory}
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

                                        {/* Cart Actions */}
                                        <Box sx={{ p: 2.5, pt: 0 }}>
                                            {cartItem ? (
                                                <Box
                                                    display="flex"
                                                    flexDirection="column"
                                                    gap={1.5}
                                                >
                                                    <Box
                                                        display="flex"
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        sx={{
                                                            backgroundColor: '#f8f9fa',
                                                            borderRadius: '12px',
                                                            padding: '8px',
                                                        }}
                                                    >
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                decreaseQuantity(id);
                                                            }}
                                                            size="small"
                                                            disabled={cartItem.quantity <= 1}
                                                            sx={{
                                                                backgroundColor: 'white',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                '&:hover': {
                                                                    backgroundColor: '#667eea',
                                                                    color: 'white',
                                                                },
                                                                '&:disabled': {
                                                                    backgroundColor: '#e9ecef',
                                                                }
                                                            }}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{ 
                                                                mx: 3,
                                                                fontWeight: 600,
                                                                color: '#2c3e50',
                                                            }}
                                                        >
                                                            {cartItem.quantity}
                                                        </Typography>
                                                        <IconButton
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                increaseQuantity(id);
                                                            }}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'white',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                '&:hover': {
                                                                    backgroundColor: '#667eea',
                                                                    color: 'white',
                                                                }
                                                            }}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteCart(cartItem);
                                                        }}
                                                        variant="outlined"
                                                        startIcon={<DeleteIcon />}
                                                        fullWidth
                                                        sx={{
                                                            borderRadius: '10px',
                                                            textTransform: 'none',
                                                            fontWeight: 600,
                                                            borderColor: '#e74c3c',
                                                            color: '#e74c3c',
                                                            padding: '8px',
                                                            '&:hover': {
                                                                borderColor: '#c0392b',
                                                                backgroundColor: '#ffe6e6',
                                                            }
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </Box>
                                            ) : (
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addCart(item);
                                                    }}
                                                    variant="contained"
                                                    startIcon={<ShoppingCartIcon />}
                                                    fullWidth
                                                    sx={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '10px',
                                                        textTransform: 'none',
                                                        fontWeight: 600,
                                                        padding: '10px',
                                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                                        }
                                                    }}
                                                >
                                                    Add to Cart
                                                </Button>
                                            )}
                                        </Box>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            py: 6,
                        }}
                    >
                        <img 
                            src={noProductsFound} 
                            alt="No products found"
                            style={{
                                maxWidth: '280px',
                                width: '100%',
                                height: 'auto',
                                marginBottom: '24px',
                                opacity: 0.8,
                            }}
                        />
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                color: '#2c3e50',
                                fontWeight: '600',
                                mb: 1.5,
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            No Products Found
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: '#7f8c8d',
                                textAlign: 'center',
                                maxWidth: '450px',
                                mb: 3,
                                fontSize: '15px',
                                lineHeight: 1.6,
                            }}
                        >
                            We couldn't find any products matching your criteria. Try adjusting your filters or explore other categories.
                        </Typography>

                        {(selectedCategory2 || selectedSubcategory || priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                            <Button
                                onClick={() => {
                                    setPriceRange([0, 1000]);
                                    setSelectedCategory2('');
                                    setSelectedSubcategory('');
                                }}
                                variant="contained"
                                sx={{ 
                                    mt: 2,
                                    borderRadius: '10px',
                                    padding: '10px 24px',
                                    textTransform: 'none',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                    }
                                }}
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </Box>
                )}

                {/* Modern Pagination */}
                {currentProducts.length > 0 && (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        mt={6}
                        mb={4}
                    >
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            siblingCount={1}
                            boundaryCount={1}
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    '&:hover': {
                                        backgroundColor: '#e7eaf6',
                                    },
                                },
                                '& .Mui-selected': {
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                    }
                                },
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Layout>
    );
};

export default CategoryPage;
