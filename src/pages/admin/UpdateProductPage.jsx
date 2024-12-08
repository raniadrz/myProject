import React, { useContext, useEffect, useState, useRef } from "react";
import { Button, Form, Header, Segment, Step, Image } from "semantic-ui-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { categoryList, category2List, subcategoryList } from './categoryLists';




const UpdateProductPage = () => {
    const context = useContext(myContext);
    const { loading, setLoading, getAllProductFunction } = context;
    const navigate = useNavigate();
    const { id } = useParams();

    const [product, setProduct] = useState({
        title: "",
        code: "",
        price: "",
        productImageUrl: "",
        category: "",
        category2: "",
        subcategory: "",
        description: "",
        stock: 0,
        time: Timestamp.now(),
        date: new Date().toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        }),
        productType: "New Product",
    });

    const [step, setStep] = useState(1); // Track the current step

    // Add refs for forms
    const form1Ref = useRef(null);
    const form2Ref = useRef(null);
    const form3Ref = useRef(null);

    // Add error state
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (!id) {
                    throw new Error("No product ID provided");
                }
                await getSingleProductFunction();
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            }
        };

        fetchProduct();
    }, [id]);

    if (error) {
        return (
            <Segment>
                <Header as="h3" color="red">Error: {error}</Header>
                <Button onClick={() => navigate('/admin-dashboard')}>
                    Return to Dashboard
                </Button>
            </Segment>
        );
    }

    const getSingleProductFunction = async () => {
        setLoading(true);
        try {
            const productRef = doc(fireDB, "products", id);
            const productDoc = await getDoc(productRef);
            
            if (productDoc.exists()) {
                const productData = productDoc.data();
                setProduct({
                    title: productData.title || "",
                    code: productData.code || "",
                    price: productData.price || "",
                    productImageUrl: productData.productImageUrl || "",
                    category: productData.category || "",
                    category2: productData.category2 || "",
                    subcategory: productData.subcategory || "",
                    description: productData.description || "",
                    stock: productData.stock || 0,
                    time: productData.time || Timestamp.now(),
                    date: productData.date || new Date().toLocaleString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                    }),
                    productType: productData.productType || "New Product",
                });
            } else {
                toast.error("Product not found");
                navigate('/admin-dashboard');
            }
        } catch (error) {
            toast.error("Failed to fetch product data");
            navigate('/admin-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const updateProduct = async () => {
        setLoading(true);
        try {
            await setDoc(doc(fireDB, 'products', id), {
                ...product,
                time: Timestamp.now(),
                date: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                })
            });
            toast.success("Product updated successfully");
            getAllProductFunction();
            navigate('/admin-dashboard');
        } catch (error) {
            toast.error("Failed to update product.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep((prev) => prev + 1);
    const prevStep = () => setStep((prev) => prev - 1);

    const handleImageUrlChange = (e) => {
        setProduct({ 
            ...product, 
            productImageUrl: e.target.value 
        });
    };

    return (
        <div
            style={{
                backgroundImage: `url(https://t3.ftcdn.net/jpg/04/81/85/46/360_F_481854656_gHGTnBscKXpFEgVTwAT4DL4NXXNhDKU9.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
            }}
        >
            {loading ? (
                <Loader />
            ) : !product.title ? (
                <Segment>
                    <Header as="h3">Loading product data...</Header>
                </Segment>
            ) : (
                <Segment style={{ maxWidth: '600px', width: '100%' }}>
                    <Header as="h2" textAlign="center" color="pink">
                        Update Product
                    </Header>
                    <Step.Group fluid>
                        <Step active={step === 1}>
                            <Step.Content>
                                <Step.Title>Basic Info</Step.Title>
                            </Step.Content>
                        </Step>
                        <Step active={step === 2}>
                            <Step.Content>
                                <Step.Title>Category</Step.Title>
                            </Step.Content>
                        </Step>
                        <Step active={step === 3}>
                            <Step.Content>
                                <Step.Title>Details</Step.Title>
                            </Step.Content>
                        </Step>
                        <Step active={step === 4}>
                            <Step.Content>
                                <Step.Title>Review</Step.Title>
                            </Step.Content>
                        </Step>
                    </Step.Group>

                    {step === 1 && (
                        <Form ref={form1Ref} onSubmit={(e) => e.preventDefault()}>
                            <Form.Input
                                fluid
                                label="Product Title"
                                placeholder="Product Title"
                                value={product.title}
                                onChange={(e) =>
                                    setProduct({ ...product, title: e.target.value })
                                }
                            />
                            <Form.Input
                                fluid
                                label="Product Code"
                                placeholder="Product Code"
                                value={product.code}
                                onChange={(e) =>
                                    setProduct({ ...product, code: e.target.value })
                                }
                            />
                            <Form.Input
                                fluid
                                label="Product Price"
                                placeholder="Product Price"
                                type="number"
                                value={product.price}
                                onChange={(e) =>
                                    setProduct({ ...product, price: e.target.value })
                                }
                            />
                            <Form.Input
                                fluid
                                label="Stock"
                                placeholder="Stock quantity"
                                type="number"
                                min="0"
                                value={product.stock}
                                onChange={(e) =>
                                    setProduct({ ...product, stock: parseInt(e.target.value) || 0 })
                                }
                            />
                            <Button.Group fluid>
                                <Button type="button" onClick={prevStep} secondary>
                                    Back
                                </Button>
                                <Button type="button" onClick={nextStep} primary>
                                    Next
                                </Button>
                            </Button.Group>
                        </Form>
                    )}

                    {step === 2 && (
                        <Form ref={form2Ref} onSubmit={(e) => e.preventDefault()}>
                            <Form.Group widths="equal">
                                <Form.Select
                                    fluid
                                    label="Category"
                                    options={categoryList.map((category) => ({
                                        key: category.name,
                                        text: category.name,
                                        value: category.name,
                                    }))}
                                    placeholder="Select Category"
                                    value={product.category}
                                    onChange={(e, { value }) =>
                                        setProduct({
                                            ...product,
                                            category: value,
                                            category2: "",
                                            subcategory: "",
                                        })
                                    }
                                />
                                <Form.Select
                                    fluid
                                    label="Subcategory"
                                    options={
                                        product.category
                                            ? category2List[product.category]?.map((subcategory) => ({
                                                key: subcategory,
                                                text: subcategory,
                                                value: subcategory,
                                            }))
                                            : []
                                    }
                                    placeholder="Select Subcategory"
                                    value={product.category2}
                                    onChange={(e, { value }) =>
                                        setProduct({
                                            ...product,
                                            category2: value,
                                            subcategory: "",
                                        })
                                    }
                                    disabled={!product.category}
                                />
                            </Form.Group>
                            <Form.Select
                                fluid
                                label="Sub-subcategory"
                                options={
                                    product.category2
                                        ? subcategoryList[product.category2]?.map((subsub) => ({
                                            key: subsub,
                                            text: subsub,
                                            value: subsub,
                                        }))
                                        : []
                                }
                                placeholder="Select Sub-subcategory"
                                value={product.subcategory}
                                onChange={(e, { value }) =>
                                    setProduct({ ...product, subcategory: value })
                                }
                                disabled={!product.category2}
                            />
                            <Button.Group fluid>
                                <Button type="button" onClick={prevStep} secondary>
                                    Back
                                </Button>
                                <Button type="button" onClick={nextStep} primary>
                                    Next
                                </Button>
                            </Button.Group>
                        </Form>
                    )}

                    {step === 3 && (
                        <Form ref={form3Ref} onSubmit={(e) => e.preventDefault()}>
                            <Form.TextArea
                                label="Product Description"
                                placeholder="Product Description"
                                value={product.description}
                                onChange={(e) =>
                                    setProduct({ ...product, description: e.target.value })
                                }
                            />
                            <Form.Input
                                fluid
                                label="Image URL"
                                placeholder="Enter image URL"
                                type="url"
                                value={product.productImageUrl}
                                onChange={handleImageUrlChange}
                            />
                            {product.productImageUrl && (
                                <Segment>
                                    <Image 
                                        src={product.productImageUrl} 
                                        size="small" 
                                        rounded 
                                        centered 
                                    />
                                </Segment>
                            )}
                            <Form.Group inline>
                                <label>Product Type:</label>
                                <Form.Radio
                                    label="New Product"
                                    value="New Product"
                                    checked={product.productType === "New Product"}
                                    onChange={(e, { value }) =>
                                        setProduct({ ...product, productType: value })
                                    }
                                />
                                <Form.Radio
                                    label="Sales"
                                    value="Sales"
                                    checked={product.productType === "Sales"}
                                    onChange={(e, { value }) =>
                                        setProduct({ ...product, productType: value })
                                    }
                                />
                            </Form.Group>
                            <Button.Group fluid>
                                <Button type="button" onClick={prevStep} secondary>
                                    Back
                                </Button>
                                <Button type="button" onClick={nextStep} primary>
                                    Next
                                </Button>
                            </Button.Group>
                        </Form>
                    )}

                    {step === 4 && (
                        <Segment>
                            <Header as="h3">Review Your Product</Header>
                            <p><strong>Title:</strong> {product.title}</p>
                            <p><strong>Code:</strong> {product.code}</p>
                            <p><strong>Price:</strong> {product.price}</p>
                            <p><strong>Category:</strong> {product.category}</p>
                            <p><strong>Subcategory:</strong> {product.category2}</p>
                            <p><strong>Sub-subcategory:</strong> {product.subcategory}</p>
                            <p><strong>Description:</strong> {product.description}</p>
                            <p><strong>Stock:</strong> {product.stock}</p>
                            <Button.Group fluid>
                                <Button type="button" onClick={prevStep} secondary>
                                    Back
                                </Button>
                                <Button type="button" onClick={updateProduct} positive>
                                    Submit
                                </Button>
                            </Button.Group>
                        </Segment>
                    )}
                </Segment>
            )}
        </div>
    );
};

export default UpdateProductPage;
