import React, { useContext, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Paper,
    Chip,
    Divider,
    Grid,
} from '@mui/material';
import Layout from "../layout/Layout";
import myContext from "../../context/myContext";
import './ProfileDetail.css';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import PublicIcon from '@mui/icons-material/Public';
import EmailIcon from '@mui/icons-material/Email';


const ProfileDetail = () => {
    const user = JSON.parse(localStorage.getItem('users'));
    const context = useContext(myContext);
    const { loading, getAllOrder, updateUserPassword } = context;
    
    const [isEditing, setIsEditing] = useState(false);
  
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [refresh, setRefresh] = useState(0);

    // Filter orders for current user
    const userOrders = getAllOrder.filter(order => order.userid === user?.uid);

    // Add password change handler
    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password should be at least 6 characters");
            return;
        }
        
        await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setOpenPasswordDialog(false);
    };

    return (
        <Layout>
            <Box sx={{ 
                minHeight: '100vh',
                background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
                py: 4,
            }}>
                <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
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
                        }}
                    >
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontWeight: 700,
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            My Profile
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                opacity: 0.95,
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            Manage your account information and orders
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* User Info Card */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 3,
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    background: 'white',
                                }}
                            >
                                <Box sx={{ textAlign: 'center', mb: 3 }}>
                                    <Box 
                                        sx={{ 
                                            display: 'inline-block',
                                            position: 'relative',
                                            p: 0.5,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '50%',
                                            mb: 2,
                                        }}
                                    >
                                        <Avatar
                                            sx={{ 
                                                width: 100, 
                                                height: 100,
                                                bgcolor: 'white',
                                                color: '#667eea',
                                                fontSize: '40px',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Box>
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            mb: 0.5,
                                            color: '#333',
                                        }}
                                    >
                                        {user?.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <EmailIcon sx={{ fontSize: 16, color: '#999' }} />
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            {user?.email}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={user?.role || 'Member'}
                                        size="small"
                                        sx={{ 
                                            mt: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <WorkIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                Profession
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {user?.profession || 'Not set'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CalendarTodayIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                Date of Birth
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : 'Not set'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <PublicIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                Country
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {user?.country || 'Not set'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<LockIcon />}
                                    onClick={() => setOpenPasswordDialog(true)}
                                    sx={{
                                        mt: 3,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        borderColor: 'rgba(102, 126, 234, 0.3)',
                                        color: '#667eea',
                                        fontWeight: 600,
                                        py: 1.2,
                                        '&:hover': {
                                            borderColor: '#667eea',
                                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                                        }
                                    }}
                                >
                                    Change Password
                                </Button>
                            </Paper>
                        </Grid>

                        {/* Orders Section */}
                        <Grid item xs={12} md={8}>
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    p: 3,
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    background: 'white',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <ShoppingBagIcon sx={{ color: '#667eea', fontSize: 28 }} />
                                    <Typography 
                                        variant="h5" 
                                        sx={{ 
                                            fontWeight: 700,
                                            color: '#333',
                                        }}
                                    >
                                        Order History
                                    </Typography>
                                    <Chip 
                                        label={userOrders.length}
                                        size="small"
                                        sx={{ 
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            fontWeight: 600,
                                        }}
                                    />
                                </Box>

                                {userOrders.length === 0 ? (
                                    <Box 
                                        sx={{ 
                                            textAlign: 'center', 
                                            py: 8,
                                            color: '#999'
                                        }}
                                    >
                                        <ShoppingBagIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
                                        <Typography variant="h6" sx={{ color: '#999' }}>
                                            No orders yet
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#ccc', mt: 1 }}>
                                            Start shopping to see your orders here
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {userOrders.map((order) => (
                                            <Card 
                                                key={order.id}
                                                elevation={0}
                                                sx={{
                                                    p: 2.5,
                                                    cursor: 'pointer',
                                                    borderRadius: '12px',
                                                    border: '1px solid #f0f0f0',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-4px)',
                                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                                                        borderColor: 'rgba(102, 126, 234, 0.3)',
                                                    }
                                                }}
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setOpenOrderDialog(true);
                                                }}
                                            >
                                                <Grid container spacing={2} alignItems="center">
                                                    <Grid item xs={12} sm={3}>
                                                        <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                                                            Order ID
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                                                            #{order.id.slice(0, 8)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                                                            Date
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {order.date}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                                                            Status
                                                        </Typography>
                                                        <Chip 
                                                            label={order.status}
                                                            size="small"
                                                            sx={{ 
                                                                background: order.status === 'Delivered' 
                                                                    ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                                                    : order.status === 'Shipped'
                                                                    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                                                                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                                color: 'white',
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                                                            Total
                                                        </Typography>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{ 
                                                                fontWeight: 700,
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                backgroundClip: 'text',
                                                                WebkitBackgroundClip: 'text',
                                                                WebkitTextFillColor: 'transparent',
                                                            }}
                                                        >
                                                            €{order.cartItems?.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2) || '0.00'}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Card>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

            {/* Order Details Dialog */}
            <Dialog 
                open={openOrderDialog} 
                onClose={() => setOpenOrderDialog(false)}
                maxWidth="md"
                fullWidth
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
                <DialogContent sx={{ mt: 2 }}>
                    {selectedOrder && (
                        <Box>
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: 'rgba(102, 126, 234, 0.05)', 
                                borderRadius: '12px',
                                mb: 3
                            }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                            Order ID
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#667eea' }}>
                                            #{selectedOrder.id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                            Date
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {selectedOrder.date}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" sx={{ color: '#999' }}>
                                            Status
                                        </Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip 
                                                label={selectedOrder.status}
                                                size="small"
                                                sx={{ 
                                                    background: selectedOrder.status === 'Delivered' 
                                                        ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)'
                                                        : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
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
                                            alt={item.category}
                                            style={{ 
                                                width: 60, 
                                                height: 60,
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                                Quantity: {item.quantity} × €{item.price}
                                            </Typography>
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontWeight: 700,
                                                    color: '#667eea'
                                                }}
                                            >
                                                Total: €{(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
                    <Button 
                        onClick={() => setOpenOrderDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
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

            {/* Add Password Change Dialog */}
            <Dialog 
                open={openPasswordDialog} 
                onClose={() => setOpenPasswordDialog(false)}
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
                    Change Password
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        type="password"
                        label="Current Password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value
                        })}
                        fullWidth
                        margin="normal"
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
                    <TextField
                        type="password"
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value
                        })}
                        fullWidth
                        margin="normal"
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
                    <TextField
                        type="password"
                        label="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value
                        })}
                        fullWidth
                        margin="normal"
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
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 1, borderTop: '1px solid #f0f0f0' }}>
                    <Button 
                        onClick={() => setOpenPasswordDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            borderColor: 'rgba(102, 126, 234, 0.3)',
                            color: '#667eea',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: '#667eea',
                                bgcolor: 'rgba(102, 126, 234, 0.05)',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handlePasswordChange}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                            }
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>
            </Box>
        </Layout>
    );
};

export default ProfileDetail;
