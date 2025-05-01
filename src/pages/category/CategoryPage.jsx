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
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {priceRange[0] !== 0 || priceRange[1] !== 1000 ? (
                    <Chip
                        label={`Price: ${priceRange[0]}€ - ${priceRange[1]}€`}
                        onDelete={() => handleRemoveFilter('price')}
                        sx={{
                            bgcolor: '#f5f5f5',
                            '& .MuiChip-deleteIcon': {
                                color: '#666',
                                '&:hover': { color: '#000' }
                            }
                        }}
                    />
                ) : null}
                
                {selectedCategory2 && (
                    <Chip
                        label={`Category: ${selectedCategory2}`}
                        onDelete={() => handleRemoveFilter('category2')}
                        sx={{
                            bgcolor: '#f5f5f5',
                            '& .MuiChip-deleteIcon': {
                                color: '#666',
                                '&:hover': { color: '#000' }
                            }
                        }}
                    />
                )}
                
                {selectedSubcategory && (
                    <Chip
                        label={`Subcategory: ${selectedSubcategory}`}
                        onDelete={() => handleRemoveFilter('subcategory')}
                        sx={{
                            bgcolor: '#f5f5f5',
                            '& .MuiChip-deleteIcon': {
                                color: '#666',
                                '&:hover': { color: '#000' }
                            }
                        }}
                    />
                )}
            </Box>
        );
    };

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ textAlign: "center", mt: 4 }}>
               {/* Updated Typography with new style for the title */}
               <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                        color: '#2b58a6',  
                        fontWeight: '600',  // Semi-bold font weight
                        fontFamily: 'Verdana, sans-serif',  // Changed font to Verdana
                        mb: 3,  // Adjusted margin-bottom for a smaller gap
                        textTransform: 'uppercase',  // Uppercase text
                        textAlign: 'left',  // Align text to the left
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)',  // Shadow effect
                    }}
                >
                    {categoryname} Products
                </Typography>
                {/* Categories Section */}
                <Category />
                {/* Cloud-style Filter Button */}
                <Button
                    onClick={handleFilterOpen}
                    sx={{
                        backgroundColor: '#f0f8ff',
                        borderRadius: '30px',
                        padding: '6px 12px',
                        boxShadow: '0 10px 9px rgba(0, 0, 0, 0.4)',
                        '&:hover': {
                            backgroundColor: '#e6f0ff',
                        },
                        display: 'flex',
                        alignItems: 'center',
                        mb: 4
                    }}
                >
                    <FilterListIcon sx={{ mr: 1 }} />
                    <Typography variant="button" sx={{ fontWeight: 'bold' }}>
                        Filter
                    </Typography>
                </Button>

                {/* Filter Dialog (Popup) */}
                <Dialog 
                    open={isFilterOpen} 
                    onClose={handleFilterClose}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            maxWidth: '400px',
                            width: '100%'
                        }
                    }}
                >
                    {/* Use div instead of DialogTitle to avoid heading nesting */}
                    <div
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: '1px solid #eee',
                            padding: '16px 24px'
                        }}
                    >
                        <Typography 
                            component="div" 
                            sx={{ 
                                fontSize: '1.25rem', 
                                fontWeight: 'bold' 
                            }}
                        >
                            Add Filter
                        </Typography>
                        <IconButton onClick={handleFilterClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </div>

                    <DialogContent sx={{ mt: 2 }}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Price Range */}
                            <Box>
                                <Typography 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 500,
                                        mb: 1 
                                    }}
                                >
                                    Price Range
                                </Typography>
                                <Box sx={{ px: 2 }}>
                                    <Slider
                                        value={priceRange}
                                        onChange={handlePriceChange}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={1000}
                                        valueLabelFormat={(value) => `${value}€`}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography component="div" color="text.secondary">
                                            {priceRange[0]}€
                                        </Typography>
                                        <Typography component="div" color="text.secondary">
                                            {priceRange[1]}€
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Category */}
                            <Box>
                                <Typography 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 500,
                                        mb: 1 
                                    }}
                                >
                                    Category
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={selectedCategory2}
                                    onChange={(e) => setSelectedCategory2(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {availableCategory2.map((category2) => (
                                        <MenuItem key={category2} value={category2}>
                                            {category2}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Subcategory */}
                            <Box>
                                <Typography 
                                    component="div" 
                                    sx={{ 
                                        fontWeight: 500,
                                        mb: 1 
                                    }}
                                >
                                    Subcategory
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    value={selectedSubcategory}
                                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    disabled={!selectedCategory2}
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

                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            gap: 1, 
                            mt: 4,
                            borderTop: '1px solid #eee',
                            pt: 2
                        }}>
                            <Button onClick={handleFilterClose} variant="outlined">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleFilterClose} 
                                variant="contained" 
                                sx={{ 
                                    bgcolor: '#6366f1',
                                    '&:hover': { bgcolor: '#4f46e5' }
                                }}
                            >
                                Apply Filter
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {loading && <CircularProgress />}

                <Container maxWidth="lg">
                    <FilterChipsSection />
                    {currentProducts.length > 0 ? (
                        <Grid 
                            container 
                            spacing={4} 
                            justifyContent="center"
                            sx={{ 
                                padding: '20px',
                                borderRadius: '10px',
                                mt: 4
                            }}
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
                                                        top:-20,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '100px',
                                                        height: 'auto',
                                                    }}
                                                />
                                            )}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    height: 200,
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
                                                    }}
                                                />
                                            </Box>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h6" component="div">
                                                    {title}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {category}, {category2}, {subcategory}
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
                                                    <Box
                                                        display="flex"
                                                        flexDirection="column"
                                                        justifyContent="center"
                                                        alignItems="center"
                                                        gap={1}
                                                    >
                                                        <Box
                                                            display="flex"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                        >
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    decreaseQuantity(id);
                                                                }}
                                                                size="small"
                                                                disabled={cartItem.quantity <= 1}
                                                            >
                                                                <RemoveIcon />
                                                            </IconButton>
                                                            <Typography
                                                                variant="body1"
                                                                sx={{ mx: 2 }}
                                                            >
                                                                {cartItem.quantity}
                                                            </Typography>
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    increaseQuantity(id);
                                                                }}
                                                                size="small"
                                                            >
                                                                <AddIcon />
                                                            </IconButton>
                                                        </Box>
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteCart(cartItem);
                                                            }}
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            addCart(item);
                                                        }}
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<ShoppingCartIcon />}
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
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '200px',
                                             
                            }}
                        >
                            <img 
                                src={noProductsFound} 
                                alt="No products found"
                                style={{
                                    maxWidth: '300px',
                                    width: '100%',
                                    height: 'auto',
                                    
                                }}
                            />
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    color: '#666',
                                    fontWeight: 'medium',
                                    mb: 2
                                }}
                            >
                                No products found
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#888',
                                    textAlign: 'center',
                                    maxWidth: '400px'
                                }}
                            >
                                We couldn't find any products matching your criteria. Try adjusting your filters or check back later.
                            </Typography>

                            {(selectedCategory2 || selectedSubcategory || priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                                <Button
                                    onClick={() => {
                                        setPriceRange([0, 1000]);
                                        setSelectedCategory2('');
                                        setSelectedSubcategory('');
                                    }}
                                    variant="outlined"
                                    sx={{ mt: 3 }}
                                >
                                    Clear All Filters
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Pagination - Only show if there are products */}
                    {currentProducts.length > 0 && (
                        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handlePageChange}
                                siblingCount={1}
                                boundaryCount={1}
                                sx={{ ml: 2 }}
                            />
                        </Box>
                    )}
                </Container>
            </Container>
        </Layout>
    );
};

export default CategoryPage;
