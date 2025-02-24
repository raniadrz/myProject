import React, { useContext, useState } from "react";
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Grid, MenuItem, Select, Button } from '@mui/material';
import myContext from "../../../context/myContext";
import Loader from "../../loader/Loader";
import { styled } from '@mui/material/styles';
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '10px',
    padding: theme.spacing(2),
    backgroundColor: '#f9f9f9',
  },
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-root': {
    backgroundColor: '#f0f8ff',
    border: '1px solid rgb(241, 208, 241)',
    overflowX: 'auto',
  },
  '& .MuiDataGrid-columnHeaders': {
    textAlign: 'center',
    fontSize: '1.1rem',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 'bold',
    color: '#010103',
  },
  '& .MuiDataGrid-row': {
   
    '&:hover': {
      backgroundColor: '#f1d1fd',
    },
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

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'Order ID', flex: 2, headerAlign: 'center', align: 'center' },
    { field: 'name', headerName: 'Customer Name', flex: 3, headerAlign: 'center', align: 'center' },
    { field: 'email', headerName: 'Email Address', flex: 3, headerAlign: 'center', align: 'center' },
    { field: 'date', headerName: 'Order Date', flex: 3, headerAlign: 'center', align: 'center' },
    { field: 'totalPrice', headerName: 'Total Price (EUR)', flex: 3, headerAlign: 'center', align: 'center' },
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
          inputProps={{ 'aria-label': 'Without label' }}
          sx={{ width: '100%', bgcolor: 'white', border: '1px solid #1976d2', borderRadius: '5px', '&:hover': { borderColor: '#1976d2' } }}
        >
          {orderStatuses.map((status) => (
            <MenuItem key={status} value={status} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
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
        <div>
          <IconButton onClick={() => handleClickOpenDetailDialog(params.row.order)}>
            <PrintIcon style={{ color: 'blue' }} />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon style={{ color: 'red' }} />
          </IconButton>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">All Orders</h1>
        <p className="text-gray-500">Manage and view all orders here.</p>
      </div>

      <div className="flex justify-center relative top-20">
        {loading && <Loader />}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="w-full mb-5" style={{ height: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pageSize={usersPerPage}
            rowsPerPageOptions={[usersPerPage]}
            disableSelectionOnClick
          />
        </div>

        {rows.length > 0 && (
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, rows.length)} of {rows.length} orders
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="outlined"
                className={`px-3 py-1 rounded ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-700'}`}
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
                    className={`px-3 py-1 rounded ${page === pageNumber ? 'bg-gray-100 text-gray-700 font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="outlined"
                className={`px-3 py-1 rounded ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <StyledDialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ backgroundColor: '#e3f2fd' }}>Order Details</DialogTitle>
        <DialogContent id="printable-content">
          {selectedOrder && (
            <Box sx={{ padding: 2 }}>
              <Typography variant="h6" sx={{ marginBottom: 2 }}>
                Order ID/CODE: {selectedOrder.id}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Date:</strong> {formatDate(selectedOrder.date)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Name:</strong> {selectedOrder.addressInfo?.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Address:</strong> {selectedOrder.addressInfo?.address}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Pincode:</strong> {selectedOrder.addressInfo?.pincode}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Mobile Number:</strong> {selectedOrder.addressInfo?.mobileNumber}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {selectedOrder.email}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Payment Method:</strong> {selectedOrder.addressInfo?.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Cart Items:</strong>
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedOrder.cartItems.map((item, index) => (
                      <Grid item xs={12} key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src={item.productImageUrl} alt="product" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                        <Box>
                          <Typography variant="body2" component="div"><strong>Title:</strong> {item.title}</Typography>
                          <Typography variant="body2" component="div"><strong>Category:</strong> {item.category}</Typography>
                          <Typography variant="body2" component="div"><strong>Price:</strong> {item.price}€</Typography>
                          <Typography variant="body2" component="div"><strong>Quantity:</strong> {item.quantity}</Typography>
                          <Typography variant="body2" component="div"><strong>Total:</strong> {item.price * item.quantity}€</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <IconButton onClick={handlePrint}>
            <PrintIcon color="primary" />
          </IconButton>
          <IconButton onClick={handleCloseDetailDialog}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

export default OrderDetail;
