import React, { useContext, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Grid, 
  MenuItem, 
  Select, 
  Button,
  Paper,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import myContext from "../../../context/myContext";
import Loader from "../../loader/Loader";
import { styled } from '@mui/material/styles';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '10px',
    padding: theme.spacing(2),
    backgroundColor: '#f9f9f9',
  },
}));

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

const OrderDetail = () => {
  const context = useContext(myContext);
  const { loading, setLoading, getAllOrder, orderDelete, updateOrderStatus } = context;

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatusId, setEditStatusId] = useState(null); // Track which row's status is being edited
  const [tempStatus, setTempStatus] = useState(null); // Store temporary status during editing
  const [page, setPage] = useState(1); // State for pagination

  // Possible order statuses
  const orderStatuses = [
    "Confirmed",
    "Waiting",
    "Bank Payment OK",
    "Shipped",
    "Delivered",
    "Cancelled"
  ];

  // Format the date
  const formatDate = (date) => {
    if (!date) return "N/A";
    if (date.toDate) return date.toDate().toLocaleDateString('en-GB');
    return new Date(date).toLocaleDateString('en-GB');
  };

  // Render rows for DataGrid
  const rows = getAllOrder.map((order, index) => ({
    id: order.id,
    status: order.status,
    serial: index + 1,
    name: order.addressInfo?.name || "N/A",
    mobileNumber: order.addressInfo?.mobileNumber || "N/A",
    email: order.email || "N/A",
    date: formatDate(order.date),
    totalItems: order.cartItems.length,
    totalPrice: order.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    paymentMethod: order.paymentMethod || "N/A",
    order, // Pass full order object for dialog
  }));

  const usersPerPage = 15; // Define how many orders to show per page
  const totalPages = Math.ceil(rows.length / usersPerPage); // Calculate total pages
  const startIndex = (page - 1) * usersPerPage; // Calculate start index
  const endIndex = startIndex + usersPerPage; // Calculate end index

  // Open the dialog to show order details
  const handleClickOpenDetailDialog = (order) => {
    setSelectedOrder(order);
    setOpenDetailDialog(true);
  };

  // Close the dialog
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedOrder(null);
  };

  // Handle order deletion
  const handleDelete = async (orderId) => {
    setLoading(true);
    try {
      await orderDelete(orderId);
      handleCloseDetailDialog();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Handle status change and update in Firebase
  const handleStatusChange = async (newStatus, orderId) => {
    setLoading(true);
    try {
      await updateOrderStatus(orderId, newStatus); // Save the new status to Firebase
      setEditStatusId(null); // Close the dropdown (back to text)
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'Order ID', flex: 2, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Customer Name', flex: 3, headerAlign: 'center', align: 'center' },
    { field: 'email', headerName: 'Email Address', flex: 3, headerAlign: 'center', align: 'center' },
    { field: 'date', headerName: 'Order Date', flex: 2, headerAlign: 'center', align: 'center' },
    { field: 'totalPrice', headerName: 'Total Price (EUR)', flex: 2, headerAlign: 'center', align: 'center' },
    { field: 'paymentMethod', headerName: 'Payment Method', flex: 2, headerAlign: 'center', align: 'center' },
    {
      field: 'status',
      headerName: 'Order Status',
      flex: 3,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Select
          value={params.row.status}
          onChange={(event) => handleStatusChange(event.target.value, params.row.id)}
          displayEmpty
          size="small"
          inputProps={{ 'aria-label': 'Without label' }}
          sx={{ 
            width: '100%', 
            borderRadius: '8px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(102, 126, 234, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#667eea',
            }
          }}
        >
          {orderStatuses.map((status) => (
            <MenuItem key={status} value={status} sx={{ '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' } }}>
              {status}
            </MenuItem>
          ))}
        </Select>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <IconButton 
            onClick={() => handleClickOpenDetailDialog(params.row.order)}
            sx={{
              color: '#667eea',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.1)',
              }
            }}
            size="small"
          >
            <PrintIcon />
          </IconButton>
          <IconButton 
            onClick={() => handleDelete(params.row.id)}
            sx={{
              color: '#ef4444',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.1)',
              }
            }}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
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
          All Orders
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            opacity: 0.95,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Manage and view all customer orders
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
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
                  Total Orders
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {rows.length}
                </Typography>
              </Box>
              <ShoppingCartIcon sx={{ fontSize: 48, opacity: 0.3 }} />
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
                  Revenue
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {rows.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}€
                </Typography>
              </Box>
              <LocalShippingIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

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
        <Box sx={{ width: '100%', minHeight: '400px' }}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pageSize={usersPerPage}
            rowsPerPageOptions={[usersPerPage]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>

        {rows.length > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 3, 
              borderTop: '1px solid #f0f0f0',
              background: 'rgba(102, 126, 234, 0.02)'
            }}
          >
            <Typography variant="body2" sx={{ color: '#666' }}>
              Showing {startIndex + 1} to {Math.min(endIndex, rows.length)} of {rows.length} orders
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: page === 1 ? '#ccc' : '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  },
                  '&:disabled': {
                    borderColor: '#e0e0e0',
                    color: '#ccc',
                  }
                }}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <Button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    variant={page === pageNumber ? 'contained' : 'outlined'}
                    size="small"
                    sx={{
                      minWidth: '40px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      ...(page === pageNumber ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                        }
                      } : {
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        color: '#667eea',
                        '&:hover': {
                          borderColor: '#667eea',
                          bgcolor: 'rgba(102, 126, 234, 0.05)',
                        }
                      })
                    }}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: page === totalPages ? '#ccc' : '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    bgcolor: 'rgba(102, 126, 234, 0.05)',
                  },
                  '&:disabled': {
                    borderColor: '#e0e0e0',
                    color: '#ccc',
                  }
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '20px',
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Order Details
        </DialogTitle>
        <DialogContent id="printable-content" sx={{ p: 3, mt: 2 }}>
          {selectedOrder && (
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  pb: 2, 
                  borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  fontWeight: 600
                }}
              >
                Order ID: {selectedOrder.id}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(102, 126, 234, 0.05)', 
                    borderRadius: '12px',
                    mb: 2
                  }}>
                    <Typography variant="subtitle2" sx={{ color: '#667eea', fontWeight: 700, mb: 2 }}>
                      Customer Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Date:</strong> {formatDate(selectedOrder.date)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedOrder.addressInfo?.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedOrder.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Mobile:</strong> {selectedOrder.addressInfo?.mobileNumber}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong> {selectedOrder.addressInfo?.address}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Postal Code:</strong> {selectedOrder.addressInfo?.pincode}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(240, 147, 251, 0.05)', 
                    borderRadius: '12px'
                  }}>
                    <Typography variant="subtitle2" sx={{ color: '#f093fb', fontWeight: 700, mb: 2 }}>
                      Payment Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <strong>Method:</strong>
                        <Chip 
                          label={selectedOrder.paymentMethod || "N/A"}
                          size="small"
                          sx={{ 
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <strong>Status:</strong>
                        <Chip 
                          label={selectedOrder.paymentStatus || "N/A"}
                          size="small"
                          sx={{ 
                            background: selectedOrder.paymentStatus === 'paid' 
                              ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      {selectedOrder.transactionId && (
                        <Typography variant="body2">
                          <strong>Transaction ID:</strong> {selectedOrder.transactionId}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ color: '#667eea', fontWeight: 700, mb: 2 }}>
                    Order Items
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedOrder.cartItems.map((item, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          gap: 2,
                          p: 2,
                          bgcolor: '#fafafa',
                          borderRadius: '12px',
                          border: '1px solid #f0f0f0'
                        }}
                      >
                        <img 
                          src={item.productImageUrl} 
                          alt="product" 
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            borderRadius: '8px',
                            objectFit: 'cover'
                          }} 
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                            {item.category}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Typography variant="caption">
                              <strong>Price:</strong> {item.price}€
                            </Typography>
                            <Typography variant="caption">
                              <strong>Qty:</strong> {item.quantity}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#667eea', fontWeight: 700 }}>
                              <strong>Total:</strong> {(item.price * item.quantity).toFixed(2)}€
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, borderTop: '1px solid #f0f0f0' }}>
          <Button
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            sx={{
              textTransform: 'none',
              color: '#667eea',
              borderRadius: '12px',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.1)',
              }
            }}
          >
            Print
          </Button>
          <Button
            onClick={handleCloseDetailDialog}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: '12px',
              borderColor: 'rgba(102, 126, 234, 0.3)',
              color: '#667eea',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#667eea',
                bgcolor: 'rgba(102, 126, 234, 0.05)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;
