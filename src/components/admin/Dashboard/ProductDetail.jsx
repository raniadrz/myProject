import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { 
  Button, 
  IconButton, 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  TextField,
  MenuItem,
  Select,
  FormControl,
  Chip
} from '@mui/material';
import Switch from '@mui/material/Switch';
import { DataGrid } from '@mui/x-data-grid';
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import CustomToast from '../../../components/CustomToast/CustomToast';
import myContext from "../../../context/myContext";
import { fireDB } from "../../../firebase/FirebaseConfig";
import Loader from "../../loader/Loader";
import { styled } from '@mui/material/styles';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    border: 'none',
    '& .MuiDataGrid-columnHeaders': {
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
        fontSize: '14px',
        fontWeight: 600,
        color: '#667eea',
    },
    '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 600,
        color: '#667eea',
    },
    '& .MuiDataGrid-row': {
        borderBottom: '1px solid #f0f0f0',
        '&:hover': {
            backgroundColor: 'rgba(102, 126, 234, 0.02)',
        },
    },
    '& .MuiDataGrid-cell': {
        borderBottom: 'none',
    },
}));

const ProductDetail = () => {
  const context = useContext(myContext);
  const { loading, setLoading, getAllProduct, getAllProductFunction } = context;

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productType, setProductType] = useState("All Products");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    let result = [...getAllProduct];

    if (searchTerm) {
      result = result.filter(
        product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase())
          
      );
    }

    if (productType !== "All Products") {
      result = result.filter(product => product.productType === productType);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "stock-asc":
        result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case "stock-desc":
        result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [getAllProduct, searchTerm, productType, sortBy]);

  const showCustomToast = (type, message) => {
    toast.custom(
      (t) => (
        <CustomToast
          type={type}
          message={message}
          onClose={() => {
            toast.dismiss(t.id);
          }}
        />
      ),
      {
        duration: 1500,
        position: 'bottom-center',
        id: `${type}-${Date.now()}`,
      }
    );
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await deleteDoc(doc(fireDB, 'products', id));
      getAllProductFunction();
      showCustomToast('success', 'Product deleted successfully');
    } catch (error) {
      showCustomToast('error', 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    setLoading(true);
    try {
      await updateDoc(doc(fireDB, 'products', id), {
        status: !currentStatus
      });
      showCustomToast('success', `Product status updated to ${!currentStatus ? 'active' : 'inactive'}`);
      getAllProductFunction();
    } catch (error) {
      showCustomToast('error', 'Failed to update product status');
    } finally {
      setLoading(false);
    }
  };

  const rows = filteredProducts.map((item, index) => ({
    id: item.id,
    serial: index + 1,
    image: item.productImageUrl,
    title: item.title,
    code: item.code,
    price: item.price,
    category: item.category || 'N/A',
    category2: item.category2 || 'N/A',
    subcategory: item.subcategory || 'N/A',
    date: item.time?.toDate() || new Date(),
    productType: item.productType || 'N/A',
    status: item.status ?? true,
    stock: item.stock || 0,
    description: item.description || '',
  }));

  const columns = [
    {
      field: 'image',
      headerName: 'Product info',
      flex: 2.5,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img 
            src={params.value} 
            alt="product" 
            style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '8px',
              objectFit: 'cover',
              border: '2px solid #f0f0f0'
            }} 
          />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>
              {params.row.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              ID: {params.row.code}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'price',
      headerName: 'Price',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
          {params.value}€
        </Typography>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          sx={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            color: '#667eea',
            fontWeight: 600,
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}
        />
      )
    },
    {
      field: 'category2',
      headerName: 'Category 2',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#666' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'subcategory',
      headerName: 'Subcategory',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#666' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'productType',
      headerName: 'Type',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          sx={{ 
            background: params.value === 'New Product' 
              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
              : params.value === 'Sales'
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            fontWeight: 600
          }}
        />
      )
    },
    {
      field: 'date',
      headerName: 'Date Added',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: '#666' }}>
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'stock',
      headerName: 'Stock',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => {
        const context = useContext(myContext);
        const { updateProductStock } = context;

        const handleStockChange = async (e) => {
          const newStock = parseInt(e.target.value) || 0;
          if (newStock >= 0) {
            await updateProductStock(params.row.id, newStock);
          }
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              type="number"
              size="small"
              inputProps={{ min: 0 }}
              value={params.value}
              onChange={handleStockChange}
              sx={{ 
                width: '80px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  }
                }
              }}
            />
            <Typography variant="caption" sx={{ color: '#999' }}>
              units
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Switch
            checked={params.row.status}
            onChange={() => toggleProductStatus(params.row.id, params.row.status)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#4ade80',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#22c55e',
              }
            }}
          />
          <Typography variant="caption" sx={{ color: params.row.status ? '#22c55e' : '#999' }}>
            {params.row.status ? 'Active' : 'Inactive'}
          </Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Link to={`/updateproduct/${params.row.id}`}>
            <IconButton 
              size="small"
              sx={{
                color: '#667eea',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton 
            size="small"
            onClick={() => deleteProduct(params.row.id)}
            sx={{
              color: '#ef4444',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductTypeChange = (e) => {
    setProductType(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 1500,
        }}
      />
      
      {/* Header with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          px: 4,
          py: 4,
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            mb: 0.5,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Product Management
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            opacity: 0.95,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Manage your product inventory and catalog
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Products
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {filteredProducts.length}
                </Typography>
              </Box>
              <InventoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: 'white',
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Active Products
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {filteredProducts.filter(p => p.status !== false).length}
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>

        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '16px',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Categories
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {new Set(filteredProducts.map(p => p.category)).size}
                </Typography>
              </Box>
              <CategoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Actions */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#999', mr: 1 }} />,
            }}
            sx={{
              minWidth: '250px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#f8f9fa',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#667eea',
                }
              }
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={productType}
                onChange={handleProductTypeChange}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  }
                }}
              >
                <MenuItem value="All Products">All Products</MenuItem>
                <MenuItem value="New Product">New Products</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#667eea',
                  }
                }}
              >
                <MenuItem value="default">Sort by: Default</MenuItem>
                <MenuItem value="price-asc">Price: Low to High</MenuItem>
                <MenuItem value="price-desc">Price: High to Low</MenuItem>
                <MenuItem value="name-asc">Name: A to Z</MenuItem>
                <MenuItem value="name-desc">Name: Z to A</MenuItem>
                <MenuItem value="stock-asc">Stock: Low to High</MenuItem>
                <MenuItem value="stock-desc">Stock: High to Low</MenuItem>
              </Select>
            </FormControl>

            <Link to="/addproduct" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                startIcon={<AddToPhotosIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  }
                }}
              >
                Add New Product
              </Button>
            </Link>
          </Box>
        </Box>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <Loader />
        </Box>
      )}

      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <StyledDataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          disableSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-checkboxInput.Mui-checked': {
              color: '#667eea',
            }
          }}
        />
      </Paper>
    </Box>
  );
}

export default ProductDetail;