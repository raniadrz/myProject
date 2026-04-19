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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const { loading, setLoading, getAllOrder, orderDelete, updateOrderStatus, updatePaymentStatus } = context;

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editStatusId, setEditStatusId] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);

  // Always derive from live getAllOrder so the dialog shows current data
  const selectedOrder = getAllOrder.find((o) => o.id === selectedOrderId) || null;

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

  const usersPerPage = 15;

  // Open the dialog to show order details
  const handleClickOpenDetailDialog = (order) => {
    setSelectedOrderId(order.id);
    setOpenDetailDialog(true);
  };

  // Close the dialog
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedOrderId(null);
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
    if (!selectedOrder) return;

    const addr = selectedOrder.addressInfo || {};
    const grandTotal = selectedOrder.cartItems
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
      .toFixed(2);

    const paw = (size, rotate = 0, opacity = 1) => `
      <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"
           style="transform:rotate(${rotate}deg);opacity:${opacity};display:inline-block;vertical-align:middle">
        <ellipse cx="20" cy="27" rx="10" ry="8" fill="#f0aaaa"/>
        <circle cx="7"  cy="17" r="5" fill="#f0aaaa"/>
        <circle cx="15" cy="10" r="5" fill="#f0aaaa"/>
        <circle cx="25" cy="10" r="5" fill="#f0aaaa"/>
        <circle cx="33" cy="17" r="5" fill="#f0aaaa"/>
      </svg>`;

    const heart = (size) => `
      <svg width="${size}" height="${size}" viewBox="0 0 20 18" xmlns="http://www.w3.org/2000/svg"
           style="display:inline-block;vertical-align:middle">
        <path d="M10 16 C10 16 1 10 1 5 A4.5 4.5 0 0 1 10 3.8 A4.5 4.5 0 0 1 19 5 C19 10 10 16 10 16Z"
              fill="#f0aaaa"/>
      </svg>`;

    const dogSVG = `<img src="https://static.vecteezy.com/system/resources/previews/061/898/678/non_2x/puppy-eating-ice-cream-on-transparent-background-png.png"
      alt="puppy" width="150" height="155" style="object-fit:contain;display:block"/>`;

    const itemRows = selectedOrder.cartItems.map((item, idx) => `
      <tr>
        <td class="num">${idx + 1}</td>
        <td>${item.title || "N/A"}</td>
        <td>${item.category || "N/A"}</td>
        <td class="center">${item.quantity}</td>
        <td class="right">${Number(item.price).toFixed(2)} €</td>
        <td class="right">${(item.price * item.quantity).toFixed(2)} €</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${selectedOrder.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Nunito',sans-serif;background:#fff;color:#333;padding:36px 44px;max-width:860px;margin:0 auto}

    /* ── Top hero ── */
    .hero{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
    .hero-left{flex:0 0 auto}
    .thank-you{font-family:'Dancing Script',cursive;font-size:86px;color:#111;line-height:1;display:block}
    .invoice-label{font-size:34px;font-weight:800;letter-spacing:7px;color:#111;margin-top:-6px;display:block}

    .hero-center{flex:1;display:flex;flex-direction:column;align-items:center;padding:0 10px}
    .paws-top{display:flex;gap:2px;margin-bottom:-6px;margin-left:50px}
    .paws-bot{display:flex;gap:2px;margin-top:-4px;margin-right:50px}

    .hero-right{flex:0 0 190px;padding-top:52px;font-size:12.5px;line-height:1.9;color:#444}
    .issued-label{font-weight:800;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:2px}

    /* ── Divider ── */
    hr{border:none;border-top:1.5px solid #f0f0f0;margin:14px 0}

    /* ── Meta row ── */
    .meta{font-size:12px;color:#888;margin-bottom:22px;display:flex;flex-wrap:wrap;gap:8px 20px}
    .meta span{display:flex;align-items:center;gap:4px}

    /* ── Payment strip ── */
    .pay-strip{display:flex;gap:16px;margin-bottom:22px;flex-wrap:wrap}
    .pay-chip{background:#fdf0f0;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:700;color:#c06060}
    .pay-chip span{font-weight:400;color:#888}

    /* ── Table ── */
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead th{background:#f5c6c6;padding:10px 14px;font-size:10.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#777;text-align:left}
    thead th.right{text-align:right}
    thead th.center{text-align:center}
    tbody tr{border-bottom:1px solid #f8f8f8}
    tbody tr:nth-child(odd){background:#fffafa}
    tbody td{padding:11px 14px}
    .num{color:#ccc;font-size:12px;width:36px}
    .right{text-align:right}
    .center{text-align:center}

    /* ── Total ── */
    .total-wrap{display:flex;justify-content:flex-end;margin-top:18px}
    .total-box{background:#f5c6c6;border-radius:10px;padding:11px 28px;font-weight:800;font-size:15px;color:#333;display:flex;align-items:center;gap:8px}

    /* ── Footer ── */
    .footer{margin-top:30px;text-align:center;font-size:12px;color:#bbb;border-top:1px solid #f5f5f5;padding-top:18px;display:flex;align-items:center;justify-content:center;gap:10px}

    @media print{
      body{padding:0;max-width:none}
      @page{margin:12mm;size:A4}
    }
  </style>
</head>
<body>

  <div class="hero">
    <div class="hero-left">
      <span class="thank-you">Thank You</span>
      <span class="invoice-label">INVOICE</span>
    </div>

    <div class="hero-center">
      <div class="paws-top">${paw(36, 25)} ${paw(44, 10)} ${paw(30, -5, 0.6)}</div>
      ${dogSVG}
      <div class="paws-bot">${paw(30, 15, 0.6)} ${paw(38, -20)}</div>
    </div>

    <div class="hero-right">
      <div class="issued-label">Issued To</div>
      <div><strong>${addr.name || "N/A"}</strong></div>
      <div>${selectedOrder.email || "N/A"}</div>
      <div>${addr.mobileNumber || "N/A"}</div>
      <div>${addr.address || "N/A"}</div>
      <div>${addr.pincode || "N/A"}</div>
    </div>
  </div>

  <hr/>

  <div class="meta">
    <span>${heart(13)} Invoice No &nbsp;<strong>#${selectedOrder.id}</strong></span>
    <span>|</span>
    <span>Date: <strong>${formatDate(selectedOrder.date)}</strong></span>
  </div>

  <div class="pay-strip">
    <div class="pay-chip">Status <span>/ ${selectedOrder.status || "N/A"}</span></div>
    <div class="pay-chip">Payment <span>/ ${selectedOrder.paymentMethod || "N/A"}</span></div>
    <div class="pay-chip">Payment Status <span>/ ${selectedOrder.paymentStatus || "N/A"}</span></div>
    ${selectedOrder.transactionId ? `<div class="pay-chip">Transaction <span>/ ${selectedOrder.transactionId}</span></div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th class="num">#</th>
        <th>Description</th>
        <th>Category</th>
        <th class="center">QTY</th>
        <th class="right">Price</th>
        <th class="right">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="total-wrap">
    <div class="total-box">${heart(16)} Total &nbsp; ${grandTotal} €</div>
  </div>

  <div class="footer">
    ${paw(22, -10)} ${paw(18, 15)} &nbsp; Thank you for choosing us! &nbsp; ${paw(18, -15)} ${paw(22, 10)}
  </div>

  <script>window.onload=()=>{ window.print(); }<\/script>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
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

      </Paper>

      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
            overflow: 'hidden',
          }
        }}
      >
        {/* ── Dialog Header ── */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '18px', fontFamily: "'Poppins', sans-serif" }}>
              Order Details
            </Typography>
            {selectedOrder && (
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', mt: 0.3, fontFamily: 'monospace' }}>
                #{selectedOrder.id}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {selectedOrder && (
              <Chip
                label={selectedOrder.status || 'N/A'}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '11px',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}
              />
            )}
            <IconButton onClick={handleCloseDetailDialog} size="small" sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: '#f8f9fe' }}>
          {selectedOrder && (() => {
            const grandTotal = selectedOrder.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
            return (
              <Box>
                {/* ── Info Row ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0, borderBottom: '1px solid #eee' }}>

                  {/* Customer */}
                  <Box sx={{ p: 3, borderRight: { md: '1px solid #eee' } }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#667eea', mb: 1.5 }}>
                      Customer
                    </Typography>
                    {[
                      { label: 'Name',        value: selectedOrder.addressInfo?.name },
                      { label: 'Email',       value: selectedOrder.email },
                      { label: 'Mobile',      value: selectedOrder.addressInfo?.mobileNumber },
                      { label: 'Address',     value: selectedOrder.addressInfo?.address },
                      { label: 'Postal Code', value: selectedOrder.addressInfo?.pincode },
                      { label: 'Date',        value: formatDate(selectedOrder.date) },
                    ].map(({ label, value }) => (
                      <Box key={label} sx={{ display: 'flex', gap: 1, mb: 0.8, alignItems: 'flex-start' }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, minWidth: 80, pt: '1px' }}>{label}</Typography>
                        <Typography variant="caption" sx={{ color: '#333', fontWeight: 500, wordBreak: 'break-all' }}>{value || 'N/A'}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Payment */}
                  <Box sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#764ba2', mb: 1.5 }}>
                      Payment
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, minWidth: 80 }}>Method</Typography>
                        <Chip label={selectedOrder.paymentMethod || 'N/A'} size="small"
                          sx={{ bgcolor: 'rgba(102,126,234,0.1)', color: '#667eea', fontWeight: 700, fontSize: '11px', height: 22 }} />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, minWidth: 80 }}>Status</Typography>
                        <Select
                          value={selectedOrder.paymentStatus || 'pending'}
                          onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                          size="small"
                          sx={{
                            fontSize: '11px', fontWeight: 700, height: 26, borderRadius: '20px',
                            color: selectedOrder.paymentStatus === 'paid' ? '#16a34a' : '#b45309',
                            bgcolor: selectedOrder.paymentStatus === 'paid' ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSelect-icon': { fontSize: '16px' },
                          }}
                        >
                          <MenuItem value="pending" sx={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>pending</MenuItem>
                          <MenuItem value="paid"    sx={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>paid</MenuItem>
                        </Select>
                      </Box>
                      {selectedOrder.transactionId && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 700, minWidth: 80, pt: '1px' }}>Transaction</Typography>
                          <Typography variant="caption" sx={{ color: '#333', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                            {selectedOrder.transactionId}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* ── Items ── */}
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#667eea', mb: 2 }}>
                    Order Items
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedOrder.cartItems.map((item, index) => (
                      <Box key={index} sx={{
                        display: 'flex', gap: 2, alignItems: 'center',
                        p: 1.5, bgcolor: 'white', borderRadius: '12px',
                        border: '1px solid #eef0fb',
                        boxShadow: '0 1px 4px rgba(102,126,234,0.06)',
                      }}>
                        <img
                          src={item.productImageUrl}
                          alt={item.title}
                          style={{ width: 56, height: 56, borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '13px', mb: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.title}
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#999' }}>{item.category}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#667eea' }}>
                            {(item.price * item.quantity).toFixed(2)} €
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: '#bbb' }}>
                            {item.quantity} × {Number(item.price).toFixed(2)} €
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Total */}
                  <Box sx={{
                    mt: 2.5, p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)',
                    borderRadius: '12px', border: '1px solid rgba(102,126,234,0.15)',
                  }}>
                    <Typography sx={{ fontSize: '13px', color: '#888', mr: 2 }}>
                      {selectedOrder.cartItems.length} item{selectedOrder.cartItems.length !== 1 ? 's' : ''}
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 800, color: '#667eea' }}>
                      {grandTotal.toFixed(2)} €
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })()}
        </DialogContent>

        {/* ── Actions ── */}
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'flex-end', gap: 1.5, borderTop: '1px solid #eee', bgcolor: 'white' }}>
          <Button
            onClick={handleCloseDetailDialog}
            sx={{
              textTransform: 'none', borderRadius: '10px', fontWeight: 600, color: '#888',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            variant="contained"
            sx={{
              textTransform: 'none', borderRadius: '10px', fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 4px 14px rgba(102,126,234,0.4)',
              '&:hover': { boxShadow: '0 6px 20px rgba(102,126,234,0.5)' },
            }}
          >
            Save Invoice
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;
