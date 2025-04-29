import React, { useContext, useState, useEffect } from "react";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import { Box } from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { categoryImages } from "./categoryImages";
import { categoryList, category2List, subcategoryList } from './categoryLists';

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

  useEffect(() => {
    if (product.category) {
      const defaultImage = "https://placehold.co/400x300?text=No+Image";
      setProduct((prevProduct) => ({
        ...prevProduct,
        productImageUrl: categoryImages[product.category] || defaultImage,
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
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    return false;
  };

  const handleInputChange = (e, { name, value }) => {
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "15px" }}>
      <Header as="h1" textAlign="center" color="black">
        Add Products
      </Header>
      {loading && <Loader />}
      {!loading && (
        <>
          <div style={{ flex: 1, marginTop: "40px", marginLeft: "-80px"}}>
            {product.category ? (
              product.productImageUrl && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  <img
                    src={product.productImageUrl}
                    alt={product.category}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/400x300?text=Image+Error";
                    }}
                  />
                </Box>
              )
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '400px',
                  margin: '0 auto',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <img
                  src="https://placehold.co/400x300?text=Select+Category"
                  alt="Select Category"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            )}
          </div>
          <Segment style={{ flex: 2, width: "100%", boxShadow: "none", border: "none" }}>
            <Form onSubmit={handleSubmit}>
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
                  onChange={(e, { value }) => {
                    setProduct({
                      ...product,
                      category: value,
                      category2: "",
                      subcategory: "",
                    });
                  }}
                />
                <Form.Select
                  fluid
                  label="Subcategory"
                  options={
                    product.category
                      ? (category2List[product.category] || []).map((subcategory) => ({
                          key: subcategory,
                          text: subcategory,
                          value: subcategory,
                        }))
                      : []
                  }
                  placeholder="Select Subcategory"
                  value={product.category2}
                  onChange={(e, { value }) => {
                    setProduct({
                      ...product,
                      category2: value,
                      subcategory: "",
                    });
                  }}
                  disabled={!product.category}
                />
              </Form.Group>
              <Form.Select
                fluid
                label="Sub-subcategory"
                options={
                  product.category2
                    ? (subcategoryList[product.category2] || []).map((subsub) => ({
                        key: subsub,
                        text: subsub,
                        value: subsub,
                      }))
                    : []
                }
                placeholder="Select Sub-subcategory"
                value={product.subcategory}
                onChange={(e, { value }) => {
                  setProduct({ ...product, subcategory: value });
                }}
                disabled={!product.category2}
              />
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
                <Button type="button" onClick={addProductFunction} positive>
                  Submit
                </Button>
              </Button.Group>
            </Form>
          </Segment>
        </>
      )}
    </div>
  );
};

export default AddProductPage;
