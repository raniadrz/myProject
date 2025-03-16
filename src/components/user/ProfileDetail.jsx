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
} from '@mui/material';
import Layout from "../layout/Layout";
import myContext from "../../context/myContext";
import './ProfileDetail.css';


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
            <div className="profile-container">
                {/* User Info Card */}
                <Card className="user-info-card">
                    <Box className="user-header">
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                               
                                sx={{ 
                                    width: 80, 
                                    height: 80,
                                }}
                            >
                   
                            </Avatar>
                            
                        </Box>
                        <Typography variant="h5">{user?.name}</Typography>
                        <Typography variant="body1">{user?.email}</Typography>
                    </Box>

                    <Box className="user-details">
                        <Box className="detail-row">
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', width: '40%' }}>
                                Role
                            </Typography>
                            <Typography sx={{ fontWeight: 500, width: '60%', textAlign: 'right' }}>
                                {user?.role || 'Member'}
                            </Typography>
                        </Box>
                        <Box className="detail-row">
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', width: '40%' }}>
                                Profession
                            </Typography>
                            <Typography sx={{ fontWeight: 500, width: '60%', textAlign: 'right' }}>
                                {user?.profession || 'Not set'}
                            </Typography>
                        </Box>
                        <Box className="detail-row">
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', width: '40%' }}>
                                Date of Birth
                            </Typography>
                            <Typography sx={{ fontWeight: 500, width: '60%', textAlign: 'right' }}>
                                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-GB') : 'Not set'}
                            </Typography>
                        </Box>
                        <Box className="detail-row">
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', width: '40%' }}>
                                Country
                            </Typography>
                            <Typography sx={{ fontWeight: 500, width: '60%', textAlign: 'right' }}>
                                {user?.country || 'Not set'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Add Change Password button */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => setOpenPasswordDialog(true)}
                        >
                            Change Password
                        </Button>
                    </Box>
                </Card>
{/* ////////////////////////////////////////////////////////////////////////////////////////////////// */}

                {/* Orders Section */}
                <Card className="orders-section">
                    <Typography variant="h6" className="section-title">
                        Order History
                    </Typography>
                    <Box className="orders-list">
                        {userOrders.map((order) => (
                            <Card 
                                key={order.id}
                                className="order-item"
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setOpenOrderDialog(true);
                                }}
                            >
                                <Box className="order-summary">
                                    <Typography>Order #{order.id}</Typography>
                                    <Typography>Date: {order.date}</Typography>
                                    <Typography>Status: {order.status}</Typography>
                                    <Typography>Total: €{order.cartItems?.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2) || '0.00'}</Typography>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Card>

            </div>

            {/* Order Details Dialog */}
            <Dialog 
                open={openOrderDialog} 
                onClose={() => setOpenOrderDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Order Details</DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <>
                            <Typography variant="h6">Order #{selectedOrder.id}</Typography>
                            <Typography>Date: {selectedOrder.date}</Typography>
                            <Typography>Status: {selectedOrder.status}</Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6">Items:</Typography>
                                {selectedOrder.cartItems.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', my: 1, alignItems: 'center' }}>
                                        <img 
                                            src={item.productImageUrl} 
                                            alt={item.category}
                                            style={{ width: 50, height: 50, marginRight: 10 }}
                                        />
                                        <Box>
                                            <Typography variant="body2">{item.title}</Typography>
                                            <Typography variant="body2">
                                                Quantity: {item.quantity} x €{item.price}
                                            </Typography>
                                            <Typography>Total: €{item.price * item.quantity}</Typography>
                                        </Box>                           
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenOrderDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Add Password Change Dialog */}
            <Dialog 
                open={openPasswordDialog} 
                onClose={() => setOpenPasswordDialog(false)}
            >
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
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
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handlePasswordChange}
                        variant="contained" 
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
};

export default ProfileDetail;
