import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { addToCart, deleteFromCart, incrementQuantity, decrementQuantity } from "../../redux/cartSlice";
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Comments from "../../components/comments/Comments";
import './productInfo.css';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Box, IconButton, Typography, Button } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductInfo = () => {
    const { loading, setLoading } = useContext(myContext);
    const [product, setProduct] = useState(null);
    const { id } = useParams();
    const cartItems = useSelector((state) => state.cart);
    const dispatch = useDispatch();

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
            <section className="product-info-section">
                {loading ? (
                    <div className="loading-container">
                        <Loader />
                    </div>
                ) : (
                    product && (
                        <div className="product-info-container">
                            <div className="product-info-flex">
                                <div className="product-image-container">
                                    <img
                                        className="product-image"
                                        src={product?.productImageUrl}
                                        alt={product?.title}
                                    />
                                    {product?.productType === "New Product" && (
                                        <div className="badge new-product">
                                            <NewReleasesIcon className="badge-icon" />
                                            New Product!
                                        </div>
                                    )}
                                    {product?.productType === "Sales" && (
                                        <div className="badge sales">
                                            <LocalOfferIcon className="badge-icon" />
                                            Sales!
                                        </div>
                                    )}
                                </div>
                                <div className="product-details">
                                    <div className="comments">
                                        {product && <Comments productId={product.id} />}
                                    </div>
                                    <h2 className="product-title">{product?.title}</h2>
                                    <span className="product-code">Code: {product?.code}</span>
                                    <p className="product-description">{product?.description}</p>
                                    <p className="product-category">
                                        <span className="category-admin">Race: {product?.category}</span>
                                        <span className="separator">|</span>
                                        <span className="category-products">Category: {product?.category2}</span>
                                        <span className="separator">|</span>
                                        <span className="category-orders">Subcategory: {product?.subcategory}</span>
                                    </p>
                                    <p className="product-price">Price: {product?.price}€</p>
                                    
                                    {product?.stock < 10 && (
                                        <p className="product-stock-warning">
                                            Only {product.stock} left in stock!
                                        </p>
                                    )}

                                    <div className="cart-actions">
                                        {cartItems.some((p) => p.id === product.id) ? (
                                            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                                <Box display="flex" alignItems="center">
                                                    <IconButton onClick={() => decreaseQuantity(product.id)} size="small" disabled={cartItems.find(p => p.id === product.id).quantity <= 1}>
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Typography variant="body1" sx={{ mx: 2 }}>
                                                        {cartItems.find(p => p.id === product.id).quantity}
                                                    </Typography>
                                                    <IconButton onClick={() => increaseQuantity(product.id)} size="small">
                                                        <AddIcon />
                                                    </IconButton>
                                                </Box>
                                                <Button
                                                    onClick={() => handleDeleteFromCart(product)}
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
                                            onClick={() => handleAddToCart(product)}
                                            variant="outlined"
                                            className="cart-button add"
                                            startIcon={<ShoppingCartIcon />}
                                        >
                                            Add to cart
                                        </Button>
                                        
                                        )}
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    )
                )}
              
            </section>
        </Layout>
    );
};

export default ProductInfo;
