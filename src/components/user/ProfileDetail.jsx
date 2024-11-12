import {
    Avatar,
    Button,
    Card,
    CardContent,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useContext, useState } from "react";
import Layout from "../../components/layout/Layout";
import Loader from "../../components/loader/Loader";
import myContext from "../../context/myContext";
import './ProfileDetail.css';
// Format price function (Define here if not imported)
const formatPrice = (price) => {
    return (Math.round(parseFloat(price) * 100) / 100).toFixed(2);
};

// Styling components
const AvatarSection = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    fontSize: '1.5rem',
    textAlign: 'center',
}));

const UserCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    boxShadow: theme.shadows[2],
}));

const OrderCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    boxShadow: theme.shadows[1],
}));

const ProfileDetail = () => {
    const user = JSON.parse(localStorage.getItem('users'));
    const context = useContext(myContext);
    const { loading, getAllOrder } = context;
    const [expandedOrders, setExpandedOrders] = useState({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const handleToggleOrder = (orderId) => {
        setExpandedOrders((prevState) => ({
            ...prevState,
            [orderId]: !prevState[orderId],
        }));
    };

    const handleOpenModal = (product) => {
        setSelectedProduct(product);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedProduct(null);
    };

    const groupedOrders = getAllOrder
        .filter((order) => order.userid === user?.uid)
        .reduce((acc, order) => {
            if (!acc[order.id]) {
                acc[order.id] = { ...order, items: [] };
            }
            acc[order.id].items.push(...order.cartItems);
            return acc;
        }, {});

    return (
        <Layout>
            <div className="container mx-auto lg:py-10 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Profile Info */}
                <Grid item xs={12} md={4}>
                    <UserCard>
                        <AvatarSection>
                            <Avatar src={user?.avatarUrl} sx={{ width: 80, height: 80 }} />
                            <Typography variant="h5" className="mt-4 font-semibold">
                                {user?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {user?.email}
                            </Typography>
                        </AvatarSection>

                        <Divider variant="middle" sx={{ marginY: 2 }} />

                        <CardContent>
                            <Typography variant="body2">
                                <strong>Profession:</strong> {user?.profession}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Country:</strong> {user?.country}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Member since:</strong> {user?.date}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Role:</strong> {user?.role}
                            </Typography>
                        </CardContent>
                    </UserCard>
                </Grid>

                {/* Right: Order History */}
                <Grid item xs={12} md={8}>
                    <SectionTitle>Order History</SectionTitle>
                    <div className="flex justify-center relative">
                        {loading && <Loader />}
                    </div>

                    {Object.values(groupedOrders).map((order, index) => (
                        <OrderCard key={index}>
                            <div
                                className="w-full bg-blue-50 cursor-pointer p-4"
                                onClick={() => handleToggleOrder(order.id)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Typography variant="subtitle1"><strong>Order Id:</strong> #{order.id}</Typography>
                                    <Typography variant="subtitle1"><strong>Date:</strong> {order.date}</Typography>
                                    <Typography variant="subtitle1"><strong>Total:</strong> {formatPrice(order.items.reduce((total, item) => total + item.price * item.quantity, 0))}€</Typography>
                                    <Typography variant="subtitle1" color={order.status === 'pending' ? 'error' : 'primary'}><strong>Status:</strong> {order.status}</Typography>
                                </div>
                            </div>

                            {/* Collapsible Order Items */}
                            <Collapse in={expandedOrders[order.id]} timeout="auto" unmountOnExit>
                                <div className="bg-white p-4">
                                    <ul className="-my-2 divide-y divide-gray-200">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex py-4 cursor-pointer" onClick={() => handleOpenModal(item)}>
                                                <img
                                                    src={item.productImageUrl}
                                                    alt={item.title}
                                                    className="w-20 h-20 rounded border border-gray-200"
                                                />
                                                <div className="ml-4 flex flex-col justify-between">
                                                    <Typography variant="subtitle2" className="font-bold">
                                                        {item.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {item.category} x {item.quantity}
                                                    </Typography>
                                                </div>
                                                <div className="ml-auto text-right font-bold">
                                                    {formatPrice(item.price)}€
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Collapse>
                        </OrderCard>
                    ))}

                    {/* Product Details Modal */}
                    <Dialog open={openModal} onClose={handleCloseModal}>
                        <DialogTitle>Product Details</DialogTitle>
                        <DialogContent>
                            {selectedProduct && (
                                <div>
                                    <img
                                        src={selectedProduct.productImageUrl}
                                        alt={selectedProduct.title}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                    <Typography variant="h6">{selectedProduct.title}</Typography>
                                    <Typography variant="body1"><strong>Price:</strong> {formatPrice(selectedProduct.price)}€</Typography>
                                    <Typography variant="body2"><strong>Category:</strong> {selectedProduct.category}</Typography>
                                    <Typography variant="body2"><strong>Description:</strong> {selectedProduct.description}</Typography>
                                </div>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseModal} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </div>
        </Layout>
    );
};

export default ProfileDetail;
