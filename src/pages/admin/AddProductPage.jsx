import React, { useContext, useState, useEffect } from "react";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  MenuItem, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Card,
  CardMedia,
} from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import { fireDB } from "../../firebase/FirebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { categoryImages } from "./categoryImages";
import { categoryList, category2List, subcategoryList } from './categoryLists';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 4,
            py: 3,
            mb: 4,
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                fontFamily: "'Poppins', sans-serif",
                mb: 0.5
              }}
            >
              Add New Product
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.95,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Create a new product for your catalog
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin-dashboard')}
            sx={{
              color: 'white',
              borderColor: 'white',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Loader />
          </Box>
        )}

        {!loading && (
          <Grid container spacing={3}>
            {/* Left Side - Image Preview */}
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  position: 'sticky',
                  top: 20,
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <AddPhotoAlternateIcon sx={{ color: '#667eea' }} />
                  Product Preview
                </Typography>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px dashed #e0e0e0',
                    bgcolor: '#fafafa',
                  }}
                >
                  {product.productImageUrl ? (
                    <CardMedia
                      component="img"
                      image={product.productImageUrl}
                      alt={product.category || 'Product'}
                      sx={{
                        width: '100%',
                        height: 400,
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300?text=Image+Error";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: 400,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <AddPhotoAlternateIcon sx={{ fontSize: 64, color: '#ccc' }} />
                      <Typography variant="body1" sx={{ color: '#999' }}>
                        {product.category ? 'Select category to see image' : 'No image available'}
                      </Typography>
                    </Box>
                  )}
                </Card>
                {product.title && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {product.title}
                    </Typography>
                    {product.price && (
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        €{product.price}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Right Side - Form */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Product Title */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Product Title"
                        placeholder="Enter product title"
                        name="title"
                        value={product.title}
                        onChange={(e) => handleInputChange(e, { name: 'title', value: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>

                    {/* Product Code and Price */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Code"
                        placeholder="Enter product code"
                        name="code"
                        value={product.code}
                        onChange={(e) => handleInputChange(e, { name: 'code', value: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Price (€)"
                        placeholder="Enter price"
                        type="number"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>

                    {/* Stock */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Initial Stock"
                        placeholder="Enter stock quantity"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: parseInt(e.target.value) || 0 })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>

                    {/* Category */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Category"
                        value={product.category}
                        onChange={(e) => {
                          setProduct({
                            ...product,
                            category: e.target.value,
                            category2: "",
                            subcategory: "",
                          });
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      >
                        {categoryList.map((category) => (
                          <MenuItem key={category.name} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Subcategory */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Subcategory"
                        value={product.category2}
                        onChange={(e) => {
                          setProduct({
                            ...product,
                            category2: e.target.value,
                            subcategory: "",
                          });
                        }}
                        disabled={!product.category}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      >
                        {product.category &&
                          (category2List[product.category] || []).map((subcategory) => (
                            <MenuItem key={subcategory} value={subcategory}>
                              {subcategory}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>

                    {/* Sub-subcategory */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Sub-subcategory"
                        value={product.subcategory}
                        onChange={(e) => {
                          setProduct({ ...product, subcategory: e.target.value });
                        }}
                        disabled={!product.category2}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      >
                        {product.category2 &&
                          (subcategoryList[product.category2] || []).map((subsub) => (
                            <MenuItem key={subsub} value={subsub}>
                              {subsub}
                            </MenuItem>
                          ))}
                      </TextField>
                    </Grid>

                    {/* Product Description */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Product Description"
                        placeholder="Enter detailed product description"
                        name="description"
                        value={product.description}
                        onChange={(e) => handleInputChange(e, { name: 'description', value: e.target.value })}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>

                    {/* Image URL */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Image URL"
                        placeholder="Enter image URL"
                        type="url"
                        value={product.productImageUrl}
                        onChange={handleImageUrlChange}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          }
                        }}
                      />
                    </Grid>

                    {/* Product Type */}
                    <Grid item xs={12}>
                      <FormControl>
                        <FormLabel 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#333',
                            '&.Mui-focused': {
                              color: '#667eea',
                            }
                          }}
                        >
                          Product Type
                        </FormLabel>
                        <RadioGroup
                          row
                          value={product.productType}
                          onChange={(e) => setProduct({ ...product, productType: e.target.value })}
                        >
                          <FormControlLabel 
                            value="New Product" 
                            control={
                              <Radio 
                                sx={{
                                  color: '#667eea',
                                  '&.Mui-checked': {
                                    color: '#667eea',
                                  }
                                }}
                              />
                            } 
                            label="New Product" 
                          />
                          <FormControlLabel 
                            value="Sales" 
                            control={
                              <Radio 
                                sx={{
                                  color: '#f093fb',
                                  '&.Mui-checked': {
                                    color: '#f093fb',
                                  }
                                }}
                              />
                            } 
                            label="Sales" 
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={addProductFunction}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '16px',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                          }
                        }}
                      >
                        Add Product
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default AddProductPage;
