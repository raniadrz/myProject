import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { addToCart, deleteFromCart } from "../../redux/cartSlice";
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Comments from "../../components/comments/Comments";
import './productInfo.css';

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
                    console.log('Fetched product data:', serializedProduct);
                    setProduct(serializedProduct);
                } else {
                    toast.error("Product not found");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
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
        dispatch(deleteFromCart(item));
        toast.success("Deleted from cart");
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
                                    <h2 className="product-title">{product?.title}</h2>
                                    <spam className="product-code">Code: {product?.code}</spam>
                                    <p className="product-description">{product?.description}</p>
                                    <p className="product-category">
                                        <span className="category-admin">Race: {product?.category}</span>
                                        <span className="separator">|</span>
                                        <span className="category-products">Category: {product?.category2}</span>
                                        <span className="separator">|</span>
                                        <span className="category-orders">Subcategory: {product?.subcategory}</span>
                                    </p>
                                    <p className="product-price">Price: {product?.price}€</p>

                                    <div className="cart-actions">
                                        {cartItems.some((p) => p.id === product.id) ? (
                                            <button
                                                onClick={() => handleDeleteFromCart(product)}
                                                className="cart-button delete"
                                            >
                                                Delete from cart
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="cart-button add"
                                            >
                                                Add to cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                )}
                {product && <Comments productId={product.id} />}
            </section>
        </Layout>
    );
};

export default ProductInfo;
