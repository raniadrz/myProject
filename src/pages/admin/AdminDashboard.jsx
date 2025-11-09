// AdminDashboard.jsx
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Layout from "../../components/layout/Layout";
import myContext from '../../context/myContext';
import { 
    Inventory2, 
    ShoppingCart, 
    People, 
    Comment, 
    QuestionAnswer,
    TrendingUp,
    LocalAtm
} from '@mui/icons-material';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    ButtonGroup,
    Button,
    Chip
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    LabelList,
    AreaChart,
    Area
} from 'recharts';
import ProductDetail from '../../components/admin/Dashboard/ProductDetail';
import OrderDetail from '../../components/admin/Dashboard/OrderDetail';
import UserDetail from '../../components/admin/Dashboard/UserDetail';
import TestimonialDetail from '../../components/admin/Dashboard/TestimonialDetail';
import FAQDetail from '../../components/admin/Dashboard/FAQDetail';

const AdminDashboard = () => {
    const context = useContext(myContext);
    const { getAllProduct, getAllOrder, getAllUser, getAllTestimonials, faqs } = context;
    const [dailyStats, setDailyStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('30'); // Default to 30 days

    // Add this to calculate pending questions
    const pendingQuestions = faqs.filter(faq => !faq.answer || faq.answer.trim() === '').length;

    // Helper function to parse Firestore timestamps
    const parseDate = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return null;
        return timestamp.toDate();
    };

    useEffect(() => {
        if (!getAllOrder || !getAllProduct) return;

        try {
            const allData = {};
            const today = new Date();
            
            // Process all orders
            getAllOrder.forEach(order => {
                const orderDate = parseDate(order.time);
                if (!orderDate) return;

                const dateStr = orderDate.toISOString().split('T')[0];
                if (!allData[dateStr]) {
                    allData[dateStr] = {
                        date: dateStr,
                        newProducts: 0,
                        orders: 0,
                        dailyProfits: 0
                    };
                }
                
                allData[dateStr].orders++;
                if (order.cartItems && Array.isArray(order.cartItems)) {
                    const orderTotal = order.cartItems.reduce((sum, item) => {
                        return sum + (Number(item.price) * item.quantity);
                    }, 0);
                    allData[dateStr].dailyProfits += orderTotal;
                }
            });

            // Process all products
            getAllProduct.forEach(product => {
                if (product.productType === "New Product" && product.date) {
                    const productDate = parseDate(product.date);
                    if (!productDate) return;

                    const dateStr = productDate.toISOString().split('T')[0];
                    if (!allData[dateStr]) {
                        allData[dateStr] = {
                            date: dateStr,
                            newProducts: 0,
                            orders: 0,
                            dailyProfits: 0
                        };
                    }
                    allData[dateStr].newProducts++;
                }
            });

            // Convert to array, sort by date (oldest first for chart), and format
            const statsArray = Object.entries(allData)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                .map(([dateStr, stat]) => ({
                    date: new Date(dateStr).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    }),
                    fullDate: dateStr, // Keep full date for filtering
                    newProducts: stat.newProducts,
                    orders: stat.orders,
                    dailyProfits: Number(stat.dailyProfits.toFixed(2))
                }));

            console.log('Daily Stats:', statsArray); // Debug log
            setDailyStats(statsArray);
            setIsLoading(false);
        } catch (error) {
            console.error('Error processing data:', error);
            setIsLoading(false);
        }
    }, [getAllOrder, getAllProduct]);

    // Memoize the filtered data
    const filteredData = useMemo(() => {
        console.log('Filtering data, timeFilter:', timeFilter, 'dailyStats length:', dailyStats.length);
        
        if (!dailyStats || dailyStats.length === 0) return [];
        if (timeFilter === 'all') return dailyStats;

        const today = new Date();
        let daysToFilter;

        switch(timeFilter) {
            case '7': daysToFilter = 7; break;
            case '14': daysToFilter = 14; break;
            case '30': daysToFilter = 30; break;
            case '60': daysToFilter = 60; break;
            case '90': daysToFilter = 90; break;
            default: daysToFilter = 30;
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToFilter);
        cutoffDate.setHours(0, 0, 0, 0); // Set to start of day

        const filtered = dailyStats.filter(item => {
            const itemDate = new Date(item.fullDate);
            return itemDate >= cutoffDate;
        });
        
        console.log('Filtered data length:', filtered.length);
        return filtered;
    }, [timeFilter, dailyStats]);

    return (
        <Layout>
            <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
                {/* Hero Header with Gradient */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        px: 4,
                        py: 6,
                        mb: 4,
                        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                    }}
                >
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 800, 
                            mb: 1,
                            fontFamily: "'Poppins', sans-serif",
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                    >
                        Admin Dashboard
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            opacity: 0.95,
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: 300
                        }}
                    >
                        Manage your e-commerce platform efficiently
                    </Typography>
                </Box>
                
                {/* Stats Cards with Modern Design */}
                <Box sx={{ px: 4, mb: 4 }}>
                    <Box 
                        sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { 
                                xs: '1fr', 
                                sm: 'repeat(2, 1fr)', 
                                md: 'repeat(3, 1fr)',
                                lg: 'repeat(5, 1fr)' 
                            }, 
                            gap: 3 
                        }}
                    >
                        {/* Products Card */}
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)',
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                                            Total Products
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                            {getAllProduct?.length || 0}
                                        </Typography>
                                        <Chip 
                                            icon={<TrendingUp sx={{ fontSize: 16, color: 'white !important' }} />}
                                            label="Active" 
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>
                                    <Inventory2 sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Orders Card */}
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(240, 147, 251, 0.4)',
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                                            Total Orders
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                            {getAllOrder.length}
                                        </Typography>
                                        <Chip 
                                            icon={<LocalAtm sx={{ fontSize: 16, color: 'white !important' }} />}
                                            label="Revenue" 
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>
                                    <ShoppingCart sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Users Card */}
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(79, 172, 254, 0.4)',
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                                            Total Users
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                            {getAllUser.length}
                                        </Typography>
                                        <Chip 
                                            label="Registered" 
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>
                                    <People sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Testimonials Card */}
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                color: 'white',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(250, 112, 154, 0.4)',
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
                                            Testimonials
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                            {getAllTestimonials.length}
                                        </Typography>
                                        <Chip 
                                            label="Reviews" 
                                            size="small"
                                            sx={{ 
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Box>
                                    <Comment sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* FAQs Card */}
                        <Card 
                            sx={{ 
                                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                                color: '#333',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 12px 24px rgba(168, 237, 234, 0.4)',
                                }
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 500 }}>
                                            Total FAQs
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                                            {faqs.length}
                                        </Typography>
                                        {pendingQuestions > 0 && (
                                            <Chip 
                                                label={`${pendingQuestions} pending`}
                                                size="small"
                                                sx={{ 
                                                    bgcolor: '#ff5252',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <QuestionAnswer sx={{ fontSize: 48, opacity: 0.3 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>

                {/* Chart Section */}
                <Box sx={{ px: 4, mb: 4 }}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 3, 
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 0.5
                                    }}
                                >
                                    Daily Activity Overview
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Track your sales and order trends
                                </Typography>
                            </Box>
                            <ButtonGroup 
                                variant="outlined" 
                                sx={{
                                    '& .MuiButton-root': {
                                        borderColor: 'rgba(102, 126, 234, 0.3)',
                                        color: '#667eea',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: '#667eea',
                                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                                        }
                                    },
                                    '& .MuiButton-root.active': {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderColor: '#667eea',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        }
                                    }
                                }}
                            >
                                <Button 
                                    className={timeFilter === '7' ? 'active' : ''}
                                    onClick={() => setTimeFilter('7')}
                                >
                                    7D
                                </Button>
                                <Button 
                                    className={timeFilter === '14' ? 'active' : ''}
                                    onClick={() => setTimeFilter('14')}
                                >
                                    14D
                                </Button>
                                <Button 
                                    className={timeFilter === '30' ? 'active' : ''}
                                    onClick={() => setTimeFilter('30')}
                                >
                                    1M
                                </Button>
                                <Button 
                                    className={timeFilter === '60' ? 'active' : ''}
                                    onClick={() => setTimeFilter('60')}
                                >
                                    2M
                                </Button>
                                <Button 
                                    className={timeFilter === '90' ? 'active' : ''}
                                    onClick={() => setTimeFilter('90')}
                                >
                                    3M
                                </Button>
                                <Button 
                                    className={timeFilter === 'all' ? 'active' : ''}
                                    onClick={() => setTimeFilter('all')}
                                >
                                    All
                                </Button>
                            </ButtonGroup>
                        </Box>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                            <Typography color="text.secondary">Loading chart data...</Typography>
                        </Box>
                    ) : filteredData.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No data available
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Orders and profits will appear here once you have sales
                            </Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart 
                                data={filteredData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorProfits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f093fb" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#f5576c" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    vertical={false}
                                    stroke="#e0e0e0"
                                />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        padding: '12px 16px'
                                    }}
                                    formatter={(value, name) => {
                                        if (name === "Profits") return [`€${value}`, name];
                                        return [value, name];
                                    }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="dailyProfits"
                                    name="Profits"
                                    stroke="#667eea"
                                    strokeWidth={3}
                                    fill="url(#colorProfits)"
                                    dot={{ fill: '#667eea', r: 5, strokeWidth: 2, stroke: 'white' }}
                                    activeDot={{ r: 7, fill: '#667eea', strokeWidth: 3, stroke: 'white' }}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    name="Orders"
                                    stroke="#f093fb"
                                    strokeWidth={3}
                                    fill="url(#colorOrders)"
                                    dot={{ fill: '#f093fb', r: 5, strokeWidth: 2, stroke: 'white' }}
                                    activeDot={{ r: 7, fill: '#f093fb', strokeWidth: 3, stroke: 'white' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                    </Paper>
                </Box>

                {/* Tabs Section */}
                <Box sx={{ px: 4, pb: 4 }}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    >
                        <Tabs
                            selectedTabClassName="selected-tab"
                        >
                            <TabList 
                                style={{
                                    display: 'flex',
                                    background: 'white',
                                    margin: 0,
                                    padding: '16px 24px 0',
                                    borderBottom: '2px solid #f0f0f0',
                                    listStyle: 'none',
                                    gap: '8px'
                                }}
                            >
                                <Tab
                                    style={{
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'transparent',
                                        borderRadius: '8px 8px 0 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#666',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        outline: 'none',
                                        marginBottom: '-2px'
                                    }}
                                    selectedClassName="selected-tab"
                                >
                                    <Inventory2 sx={{ fontSize: 20 }} />
                                    <span>Products ({getAllProduct.length})</span>
                                </Tab>

                                <Tab
                                    style={{
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'transparent',
                                        borderRadius: '8px 8px 0 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#666',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        outline: 'none',
                                        marginBottom: '-2px'
                                    }}
                                >
                                    <ShoppingCart sx={{ fontSize: 20 }} />
                                    <span>Orders ({getAllOrder.length})</span>
                                </Tab>

                                <Tab
                                    style={{
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'transparent',
                                        borderRadius: '8px 8px 0 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#666',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        outline: 'none',
                                        marginBottom: '-2px'
                                    }}
                                >
                                    <People sx={{ fontSize: 20 }} />
                                    <span>Users ({getAllUser.length})</span>
                                </Tab>

                                <Tab
                                    style={{
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'transparent',
                                        borderRadius: '8px 8px 0 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#666',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        outline: 'none',
                                        marginBottom: '-2px'
                                    }}
                                >
                                    <Comment sx={{ fontSize: 20 }} />
                                    <span>Testimonials ({getAllTestimonials.length})</span>
                                </Tab>

                                <Tab
                                    style={{
                                        padding: '12px 24px',
                                        cursor: 'pointer',
                                        border: 'none',
                                        background: 'transparent',
                                        borderRadius: '8px 8px 0 0',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#666',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        outline: 'none',
                                        marginBottom: '-2px',
                                        position: 'relative'
                                    }}
                                >
                                    <QuestionAnswer sx={{ fontSize: 20 }} />
                                    <span>FAQs ({faqs.length})</span>
                                    {pendingQuestions > 0 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                bgcolor: '#ff5252',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '11px',
                                                fontWeight: 700
                                            }}
                                        >
                                            {pendingQuestions}
                                        </Box>
                                    )}
                                </Tab>
                            </TabList>

                            <TabPanel>
                                <Box sx={{ p: 2 }}>
                                    <ProductDetail />
                                </Box>
                            </TabPanel>

                            <TabPanel>
                                <Box sx={{ p: 2 }}>
                                    <OrderDetail />
                                </Box>
                            </TabPanel>

                            <TabPanel>
                                <Box sx={{ p: 2 }}>
                                    <UserDetail />
                                </Box>
                            </TabPanel>

                            <TabPanel>
                                <Box sx={{ p: 2 }}>
                                    <TestimonialDetail />
                                </Box>
                            </TabPanel>

                            <TabPanel>
                                <Box sx={{ p: 2 }}>
                                    <FAQDetail />
                                </Box>
                            </TabPanel>
                        </Tabs>
                    </Paper>
                </Box>
            </Box>
        </Layout>
    );
};

export default AdminDashboard;