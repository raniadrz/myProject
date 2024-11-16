import React, { useContext, useState, useEffect } from "react";
import { Button, Form, Grid, Header, Image, Segment, Step } from "semantic-ui-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

// Updated categoryImages with specific URLs for each category
const categoryImages = {
  Bird: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/af6bb496352685.5eac4787a4da7.jpg",
  Cat: "https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/775c1b96352685.5eac4787ab295.jpg",
  Dog: "https://cdn.myportfolio.com/c728a553-9706-473c-adca-fa2ea3652db5/a124d74e-ff6c-4949-aa4f-ea4d43b71224_rw_1200.jpg?h=2a9066a9cacc857be72862cc4e3beb64",
  Reptile: "https://mir-s3-cdn-cf.behance.net/project_modules/disp/57d31a96352685.5eac4787a3125.jpg",
  "Little Pet": "https://mir-s3-cdn-cf.behance.net/project_modules/disp/2760ab96352685.5eac47879b914.jpg",
  Fish: "https://mir-s3-cdn-cf.behance.net/project_modules/hd/abeb4096352685.5eac4787a2292.jpg",
  Default: "https://via.placeholder.com/150", // Optional default fallback image
};

const AddProductPage = () => {
  const context = useContext(myContext);
  const { loading, setLoading } = context;
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    title: "",
    code: "",
    price: "",
    category: "",
    category2: "",
    subcategory: "",
    description: "",
    quantity: 1,
    stock: 0,
    time: Timestamp.now(),
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    productImageUrl: "",
    productType: "New Product",
  });

  const [step, setStep] = useState(1); // Track current step

  useEffect(() => {
    if (product.category) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        productImageUrl:
          prevProduct.productImageUrl ||
          categoryImages[product.category] || // Use category-specific URL
          categoryImages.Default, // Fallback to default if not found
      }));
    }
  }, [product.category]);

  const handleImageUrlChange = (e) => {
    setProduct({ 
      ...product, 
      productImageUrl: e.target.value 
    });
  };

  const isValidProduct = (product) => {
    return (
      product.title &&
      product.code &&
      product.price &&
      product.category &&
      product.category2 &&
      product.subcategory &&
      product.description
    );
  };

  const addProductFunction = async () => {
    if (!isValidProduct(product)) {
      return toast.error("All fields are required");
    }

    setLoading(true);
    try {
      const productData = {
        title: product.title.trim(),
        code: product.code.trim(),
        price: product.price,
        category: product.category.trim(),
        category2: product.category2.trim(),
        subcategory: product.subcategory.trim(),
        description: product.description.trim(),
        quantity: product.quantity,
        stock: parseInt(product.stock),
        time: Timestamp.now(),
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        productImageUrl: product.productImageUrl.trim(),
        productType: product.productType
      };

      const productRef = collection(fireDB, "products");
      await addDoc(productRef, productData);
      toast.success("Product added successfully");
      navigate("/admin-dashboard");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleInputChange = (e, { name, value }) => {
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      style={{
        backgroundImage: `url(https://t3.ftcdn.net/jpg/04/81/85/46/360_F_481854656_gHGTnBscKXpFEgVTwAT4DL4NXXNhDKU9.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {loading && <Loader />}
      {!loading && (
        <Segment style={{ maxWidth: "600px", width: "100%" }}>
          <Header as="h2" textAlign="center" color="blue">
            Add Product
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
            <Form>
              <Form.Input
                fluid
                label="Product Title"
                placeholder="Product Title"
                name="title"
                value={product.title}
                onChange={handleInputChange}
              />
              <Form.Input
                fluid
                label="Product Code"
                placeholder="Product Code"
                name="code"
                value={product.code}
                onChange={handleInputChange}
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
                placeholder="Initial Stock"
                type="number"
                min="0"
                value={product.stock}
                onChange={(e) =>
                  setProduct({ ...product, stock: parseInt(e.target.value) || 0 })
                }
              />
              <Button.Group fluid>
                <Button type="button" onClick={nextStep} primary>
                  Next
                </Button>
              </Button.Group>
            </Form>
          )}

          {step === 2 && (
            <Form>
              <Form.Select
                fluid
                label="Category"
                options={Object.keys(categoryImages).map((category) => ({
                  key: category,
                  text: category,
                  value: category,
                }))}
                placeholder="Select Category"
                value={product.category}
                onChange={(e, { value }) => {
                  setProduct({
                    ...product,
                    category: value,
                    category2: "",
                    subcategory: "",
                  });
                }}
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
            <Form>
              <Form.TextArea
                label="Product Description"
                placeholder="Product Description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
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
              <Header as="h3">Review Details</Header>
              <p><strong>Title:</strong> {product.title}</p>
              <p><strong>Code:</strong> {product.code}</p>
              <p><strong>Price:</strong> {product.price}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Description:</strong> {product.description}</p>
              {product.productImageUrl && (
                <Image src={product.productImageUrl} size="medium" rounded />
              )}
              <Button.Group fluid>
                <Button type="button" onClick={prevStep} secondary>
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={addProductFunction}
                  primary
                >
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

export default AddProductPage;
