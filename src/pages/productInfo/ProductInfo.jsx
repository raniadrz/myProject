import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { addToCart, deleteFromCart, incrementQuantity, decrementQuantity } from "../../redux/cartSlice";
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Comments from "../../components/comments/Comments";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { 
    Box, 
    IconButton, 
    Typography, 
    Button, 
    Container, 
    Grid, 
    Chip, 
    Paper,
    Divider,
    Card,
    CardMedia,
    Breadcrumbs,
    Link
} from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StarIcon from '@mui/icons-material/Star';

const ProductInfo = () => {
    const { loading, setLoading } = useContext(myContext);
    const [product, setProduct] = useState(null);
    const { id } = useParams();
    const cartItems = useSelector((state) => state.cart);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const productDoc = await getDoc(doc(fireDB, "products", id));
                if (productDoc.exists()) {
                    const productData = productDoc.data();
                    const serializedProduct = {
                        ...productData,
                        id: productDoc.id,
                        time: productData.time ? productData.time.toMillis() : Date.now(),
                        category: productData.category,
                        category2: productData.category2,
                        subcategory: productData.subcategory,
                        description: productData.description,
                        title: productData.title,
                    };
                    setProduct(serializedProduct);
                } else {
                    toast.error("Product not found");
                }
            } catch (error) {
                toast.error("Failed to load product");
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id, setLoading]);

    const handleAddToCart = (item) => {
        if (item.stock === 0) { // Check if the item is out of stock
            toast.error("Cannot add to cart. Item is out of stock."); // Show alert
            return; // Exit the function
        }
        const serializableItem = {
            ...item,
            time: Date.now(),
            category: item.category,
            category2: item.category2,
            subcategory: item.subcategory,
            description: item.description,
            title: item.title,
        };
        dispatch(addToCart(serializableItem));
        toast.success("Added to cart");
    };

    const handleDeleteFromCart = (item) => {
        dispatch(deleteFromCart(item.id));
        toast.success("Deleted from cart");
    };

    const increaseQuantity = (id) => {
        dispatch(incrementQuantity(id));
    };

    const decreaseQuantity = (id) => {
        dispatch(decrementQuantity(id));
    };

    return (
        <Layout>
            <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', py: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <Loader />
                    </Box>
                ) : (
                    product && (
                        <Container maxWidth="lg">
                            {/* Back Button and Breadcrumbs */}
                            <Box sx={{ mb: 3 }}>
                                <Button
                                    onClick={() => navigate(-1)}
                                    startIcon={<ArrowBackIcon />}
                                    sx={{
                                        mb: 2,
                                        color: '#667eea',
                                        fontWeight: 600,
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        }
                                    }}
                                >
                                    Back
                                </Button>
                                
                                <Breadcrumbs 
                                    aria-label="breadcrumb"
                                    sx={{
                                        '& .MuiBreadcrumbs-separator': {
                                            color: '#667eea',
                                        }
                                    }}
                                >
                                    <Link 
                                        underline="hover" 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                color: '#764ba2',
                                            }
                                        }} 
                                        onClick={() => navigate('/')}
                                    >
                                        <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
                                        Home
                                    </Link>
                                    <Link
                                        underline="hover"
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            color: '#667eea',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                color: '#764ba2',
                                            }
                                        }}
                                        onClick={() => navigate(`/category/${product.category}`)}
                                    >
                                        <CategoryIcon sx={{ mr: 0.5, fontSize: 20 }} />
                                        {product.category}
                                    </Link>
                                    <Typography 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            color: '#495057',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {product.title}
                                    </Typography>
                                </Breadcrumbs>
                            </Box>

                            {/* Main Product Section */}
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                }}
                            >
                                <Grid container>
                                    {/* Product Image Section */}
                                    <Grid item xs={12} md={6}>
                                        <Box 
                                            sx={{ 
                                                position: 'relative',
                                                height: '100%',
                                                minHeight: { xs: '400px', md: '600px' },
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 4,
                                            }}
                                        >
                                            {/* Product Type Badge */}
                                            {product.productType === "New Product" && (
                                                <Chip
                                                    icon={<NewReleasesIcon sx={{ fontSize: 20 }} />}
                                                    label="New Product"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 20,
                                                        left: 20,
                                                        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '14px',
                                                        height: '36px',
                                                        px: 2,
                                                        boxShadow: '0 4px 12px rgba(56, 239, 125, 0.4)',
                                                        zIndex: 2,
                                                    }}
                                                />
                                            )}
                                            {product.productType === "Sales" && (
                                                <Chip
                                                    icon={<LocalOfferIcon sx={{ fontSize: 20 }} />}
                                                    label="On Sale"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 20,
                                                        left: 20,
                                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                        color: 'white',
                                                        fontWeight: 700,
                                                        fontSize: '14px',
                                                        height: '36px',
                                                        px: 2,
                                                        boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)',
                                                        zIndex: 2,
                                                    }}
                                                />
                                            )}

                                            {/* Product Image */}
                                            <Card
                                                elevation={8}
                                                sx={{
                                                    maxWidth: '100%',
                                                    maxHeight: '90%',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    backgroundColor: 'white',
                                                }}
                                            >
                                                <CardMedia
                                                    component="img"
                                                    image={product.productImageUrl}
                                                    alt={product.title}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        p: 2,
                                                    }}
                                                />
                                            </Card>
                                        </Box>
                                    </Grid>

                                    {/* Product Details Section */}
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: { xs: 3, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            {/* Comments Section at Top Right */}
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                                <Comments productId={product.id} />
                                            </Box>

                                            {/* Product Title */}
                                            <Typography 
                                                variant="h3" 
                                                sx={{ 
                                                    fontWeight: 700,
                                                    color: '#2c3e50',
                                                    mb: 2,
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontSize: { xs: '28px', md: '36px' },
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {product.title}
                                            </Typography>

                                            {/* Product Code */}
                                            <Chip
                                                label={`Code: ${product.code}`}
                                                sx={{
                                                    mb: 3,
                                                    backgroundColor: '#fff3e0',
                                                    color: '#e65100',
                                                    fontWeight: 600,
                                                    fontSize: '14px',
                                                    height: '32px',
                                                    alignSelf: 'flex-start',
                                                    borderRadius: '16px',
                                                }}
                                            />

                                            {/* Price */}
                                            <Box sx={{ mb: 3 }}>
                                                <Typography 
                                                    variant="h2" 
                                                    sx={{ 
                                                        color: '#667eea',
                                                        fontWeight: 800,
                                                        fontSize: { xs: '42px', md: '52px' },
                                                        fontFamily: "'Poppins', sans-serif",
                                                    }}
                                                >
                                                    €{product.price}
                                                </Typography>
                                            </Box>

                                            {/* Stock Warning */}
                                            {product.stock < 10 && product.stock > 0 && (
                                                <Box 
                                                    sx={{ 
                                                        mb: 3,
                                                        p: 2,
                                                        backgroundColor: '#fff3cd',
                                                        borderLeft: '4px solid #ffc107',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <Typography 
                                                        sx={{ 
                                                            color: '#856404',
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <InventoryIcon sx={{ fontSize: 20 }} />
                                                        Only {product.stock} left in stock - Order soon!
                                                    </Typography>
                                                </Box>
                                            )}

                                            {product.stock === 0 && (
                                                <Box 
                                                    sx={{ 
                                                        mb: 3,
                                                        p: 2,
                                                        backgroundColor: '#f8d7da',
                                                        borderLeft: '4px solid #dc3545',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <Typography 
                                                        sx={{ 
                                                            color: '#721c24',
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <InventoryIcon sx={{ fontSize: 20 }} />
                                                        Out of Stock
                                                    </Typography>
                                                </Box>
                                            )}

                                            <Divider sx={{ my: 3 }} />

                                            {/* Description */}
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    mb: 3,
                                                    color: '#495057',
                                                    fontSize: '16px',
                                                    lineHeight: 1.8,
                                                }}
                                            >
                                                {product.description}
                                            </Typography>

                                            {/* Categories */}
                                            <Box sx={{ mb: 3 }}>
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        color: '#6c757d',
                                                        mb: 1.5,
                                                        fontWeight: 600,
                                                        textTransform: 'uppercase',
                                                        fontSize: '12px',
                                                        letterSpacing: '1px',
                                                    }}
                                                >
                                                    Product Details
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    <Chip
                                                        label={`Race: ${product.category}`}
                                                        sx={{
                                                            backgroundColor: '#e7eaf6',
                                                            color: '#667eea',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`Category: ${product.category2}`}
                                                        sx={{
                                                            backgroundColor: '#e7eaf6',
                                                            color: '#667eea',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`Type: ${product.subcategory}`}
                                                        sx={{
                                                            backgroundColor: '#e7eaf6',
                                                            color: '#667eea',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>
                                            </Box>

                                            <Divider sx={{ my: 3 }} />
                                            <Divider sx={{ my: 3 }} />

                                            {/* Cart Actions */}
                                            <Box sx={{ mt: 'auto' }}>
                                                {cartItems.some((p) => p.id === product.id) ? (
                                                    <Box>
                                                        {/* Quantity Controls */}
                                                        <Box 
                                                            sx={{ 
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                mb: 2,
                                                                p: 2,
                                                                backgroundColor: '#f8f9fa',
                                                                borderRadius: '16px',
                                                            }}
                                                        >
                                                            <IconButton
                                                                onClick={() => decreaseQuantity(product.id)}
                                                                disabled={cartItems.find(p => p.id === product.id).quantity <= 1}
                                                                sx={{
                                                                    backgroundColor: 'white',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    width: 48,
                                                                    height: 48,
                                                                    '&:hover': {
                                                                        backgroundColor: '#667eea',
                                                                        color: 'white',
                                                                    },
                                                                    '&:disabled': {
                                                                        backgroundColor: '#e9ecef',
                                                                    }
                                                                }}
                                                            >
                                                                <RemoveIcon />
                                                            </IconButton>
                                                            
                                                            <Typography 
                                                                variant="h4" 
                                                                sx={{ 
                                                                    mx: 4,
                                                                    fontWeight: 700,
                                                                    color: '#2c3e50',
                                                                    minWidth: '50px',
                                                                    textAlign: 'center',
                                                                }}
                                                            >
                                                                {cartItems.find(p => p.id === product.id).quantity}
                                                            </Typography>
                                                            
                                                            <IconButton
                                                                onClick={() => increaseQuantity(product.id)}
                                                                sx={{
                                                                    backgroundColor: 'white',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                                    width: 48,
                                                                    height: 48,
                                                                    '&:hover': {
                                                                        backgroundColor: '#667eea',
                                                                        color: 'white',
                                                                    }
                                                                }}
                                                            >
                                                                <AddIcon />
                                                            </IconButton>
                                                        </Box>

                                                        {/* Remove from Cart Button */}
                                                        <Button
                                                            onClick={() => handleDeleteFromCart(product)}
                                                            variant="outlined"
                                                            startIcon={<DeleteIcon />}
                                                            fullWidth
                                                            size="large"
                                                            sx={{
                                                                borderRadius: '12px',
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                fontSize: '16px',
                                                                padding: '14px',
                                                                borderColor: '#e74c3c',
                                                                color: '#e74c3c',
                                                                borderWidth: '2px',
                                                                '&:hover': {
                                                                    borderColor: '#c0392b',
                                                                    backgroundColor: '#ffe6e6',
                                                                    borderWidth: '2px',
                                                                }
                                                            }}
                                                        >
                                                            Remove from Cart
                                                        </Button>
                                                    </Box>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleAddToCart(product)}
                                                        variant="contained"
                                                        startIcon={<ShoppingCartIcon />}
                                                        fullWidth
                                                        size="large"
                                                        disabled={product.stock === 0}
                                                        sx={{
                                                            background: product.stock === 0 ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: '12px',
                                                            textTransform: 'none',
                                                            fontWeight: 700,
                                                            fontSize: '18px',
                                                            padding: '16px',
                                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                                            '&:hover': {
                                                                background: product.stock === 0 ? '#ccc' : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
                                                                transform: 'translateY(-2px)',
                                                            },
                                                            transition: 'all 0.3s ease',
                                                        }}
                                                    >
                                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Product Features */}
                            <Grid container spacing={3} sx={{ mt: 4, mb: 4 }}>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            backgroundColor: 'white',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        <LocalShippingIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Fast Delivery
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Quick and reliable shipping to your doorstep
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            backgroundColor: 'white',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        <VerifiedUserIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Quality Guarantee
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            100% authentic and quality products
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            backgroundColor: 'white',
                                            border: '1px solid #e9ecef',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        <StarIcon sx={{ fontSize: 48, color: '#667eea', mb: 2 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Premium Quality
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Top-rated products for your beloved pets
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Container>
                    )
                )}
            </Box>
        </Layout>
    );
};

export default ProductInfo;