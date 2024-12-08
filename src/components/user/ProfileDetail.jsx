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
    IconButton,
    TextField,
    Typography,
    Select,
    MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Layout from "../layout/Layout";
import myContext from "../../context/myContext";
import './ProfileDetail.css';
import { doc, updateDoc } from 'firebase/firestore';
import { profileImages } from './profileImages/profileImages';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';



const ProfileDetail = () => {
    const user = JSON.parse(localStorage.getItem('users'));
    const context = useContext(myContext);
    const { loading, getAllOrder, updateUserDetails, updateUserPassword } = context;
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: user?.name || '',
        profession: user?.profession || '',
        country: user?.country || '',
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [refresh, setRefresh] = useState(0);
    const [openAvatarDialog, setOpenAvatarDialog] = useState(false);

    // Handle user data updates
    const handleSaveChanges = async () => {
        await updateUserDetails(
            user.photoURL || null,
        );
        setIsEditing(false);
        setRefresh(prev => prev + 1); // Force re-render
    };

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

    const handleAvatarChange = async (newAvatarSrc) => {
        try {
            await updateUserDetails(
                user.uid,
                user.name,
                user.email,
                newAvatarSrc,
                user.profession,
                user.country
            );
            
            // Update local storage
            const updatedUser = {
                ...user,
                photoURL: newAvatarSrc
            };
            localStorage.setItem('users', JSON.stringify(updatedUser));
            
            setOpenAvatarDialog(false);
        } catch (error) {
            toast.error('Failed to update avatar');
        }
    };

    return (
        <Layout>
            <div className="profile-container">
                {/* User Info Card */}
                <Card className="user-info-card">
                    <Box className="user-header">
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={user?.photoURL}
                                alt={user?.name}
                                sx={{ width: 80, height: 80 }}
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    bottom: -10,
                                    right: -10,
                                    backgroundColor: 'white',
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                }}
                                onClick={() => setOpenAvatarDialog(true)}
                            >
                                <PhotoCameraIcon fontSize="small" />
                            </IconButton>
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

                {/* Add Avatar Selection Dialog */}
                <Dialog 
                    open={openAvatarDialog} 
                    onClose={() => setOpenAvatarDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Choose Avatar</DialogTitle>
                    <DialogContent>
                        <Box 
                            sx={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 2,
                                p: 2 
                            }}
                        >
                            {profileImages.map((avatar) => (
                                <Avatar
                                    key={avatar.id}
                                    src={avatar.src}
                                    alt={avatar.alt}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        cursor: 'pointer',
                                        border: user?.photoURL === avatar.src ? '2px solid #1976d2' : 'none',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            transition: 'transform 0.2s'
                                        }
                                    }}
                                    onClick={() => handleAvatarChange(avatar.src)}
                                />
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAvatarDialog(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
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
