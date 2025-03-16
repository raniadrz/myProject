// AdminDashboard.jsx
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import Layout from "../../components/layout/Layout";
import myContext from '../../context/myContext';
import { Inventory2, ShoppingCart, People, Comment, QuestionAnswer } from '@mui/icons-material';
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
import './AdminDashboard.css';

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

            // Convert to array, sort by date, and format
            const statsArray = Object.entries(allData)
                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                .map(([dateStr, stat]) => ({
                    date: new Date(dateStr).toLocaleDateString('default', {
                        month: 'short',
                        day: 'numeric'
                    }),
                    fullDate: dateStr, // Keep full date for filtering
                    newProducts: stat.newProducts,
                    orders: stat.orders,
                    dailyProfits: Number(stat.dailyProfits.toFixed(2))
                }));

            setDailyStats(statsArray);
            setIsLoading(false);
        } catch (error) {
            console.error('Error processing data:', error);
            setIsLoading(false);
        }
    }, [getAllOrder, getAllProduct]);

    // Memoize the filtered data
    const filteredData = useMemo(() => {
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

        return dailyStats.filter(item => {
            const itemDate = new Date(item.fullDate);
            return itemDate >= cutoffDate;
        });
    }, [timeFilter, dailyStats]);

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Dashboard Title */}
                <div className="px-6 py-4 bg-white shadow-lg border-b">
                    <h1 className="text-4xl font-bold text-pink-300">Dashboard</h1>
                    <p className="text-blue-600">Welcome to your admin control panel</p>
                </div>
                
                
                
                
                {/* Stats Cards */}
                <div className="dashboard-stats">
                    <div className="stat-card bg-blue-50">
                        <Inventory2 className="text-3xl mb-2 text-blue-500" />
                        <div className="stat-value text-blue-900">{getAllProduct?.length || 0}</div>
                        <div className="stat-label text-blue-700">Total Products</div>
                    </div>
                    <div className="stat-card bg-green-50">
                        <ShoppingCart className="text-3xl mb-2 text-green-500" />
                        <div className="stat-value text-green-900">{getAllOrder.length}</div>
                        <div className="stat-label text-green-700">Total Orders</div>
                    </div>
                    <div className="stat-card bg-purple-50">
                        <People className="text-3xl mb-2 text-purple-500" />
                        <div className="stat-value text-purple-900">{getAllUser.length}</div>
                        <div className="stat-label text-purple-700">Total Users</div>
                    </div>
                    <div className="stat-card bg-orange-50">
                        <Comment className="text-3xl mb-2 text-orange-500" />
                        <div className="stat-value text-orange-900">{getAllTestimonials.length}</div>
                        <div className="stat-label text-orange-700">Total Testimonials</div>
                    </div>
                    <div className="stat-card bg-yellow-50">
                        <QuestionAnswer className="text-3xl mb-2 text-yellow-500" />
                        <div className="stat-value text-yellow-900">{faqs.length}</div>
                        <div className="stat-label text-yellow-700">Total FAQs</div>
                    </div>
                </div>

                {/* Chart */}
                <div className="chart-container p-6 bg-white rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">Daily Activity</h3>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setTimeFilter('7')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    timeFilter === '7' 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                7 days
                            </button>
                            <button
                                onClick={() => setTimeFilter('14')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    timeFilter === '14' 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                14 days
                            </button>
                            <button
                                onClick={() => setTimeFilter('30')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    timeFilter === '30' 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                1 Month
                            </button>
                            <button
                                onClick={() => setTimeFilter('60')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    timeFilter === '60' 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                2 Months
                            </button>
                            <button
                                onClick={() => setTimeFilter('90')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    timeFilter === '90' 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                3 Months
                            </button>
                            <button
                                onClick={() => setTimeFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    timeFilter === 'all' 
                                    ? 'bg-indigo-100 text-indigo-600' 
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                All Time
                            </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart 
                                data={filteredData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorProfits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    vertical={false}
                                    stroke="#f0f0f0"
                                />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <YAxis 
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#666', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        padding: '10px'
                                    }}
                                    formatter={(value, name) => {
                                        if (name === "Profits") return [`€${value}`, name];
                                        return [value, name];
                                    }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="dailyProfits"
                                    name="Profits"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    fill="url(#colorProfits)"
                                    dot={{ fill: '#8884d8', r: 4 }}
                                    activeDot={{ r: 6, fill: '#8884d8' }}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    name="Orders"
                                    stroke="#82ca9d"
                                    strokeWidth={2}
                                    fill="url(#colorOrders)"
                                    dot={{ fill: '#82ca9d', r: 4 }}
                                    activeDot={{ r: 6, fill: '#82ca9d' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Tabs */}
                <div className="px-6">
                    <Tabs>
                        <TabList>
                            <Tab>
                                <div className="flex items-center space-x-2">
                                    <Inventory2 className="text-black" />
                                    <span>Products ({getAllProduct.length})</span>
                                </div>
                            </Tab>

                            <Tab>
                                <div className="flex items-center space-x-2">
                                    <ShoppingCart className="text-black" />
                                    <span>Orders ({getAllOrder.length})</span>
                                </div>
                            </Tab>

                            <Tab>
                                <div className="flex items-center space-x-2">
                                    <People className="text-black" />
                                    <span>Users ({getAllUser.length})</span>
                                </div>
                            </Tab>

                            <Tab>
                                <div className="flex items-center space-x-2">
                                    <Comment className="text-black" />
                                    <span>Testimonials ({getAllTestimonials.length})</span>
                                </div>
                            </Tab>

                            <Tab>
                                <div className="flex items-center space-x-2">
                                    <QuestionAnswer className="text-black" />
                                    <span>FAQs ({faqs.length})</span>
                                    {pendingQuestions > 0 && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {pendingQuestions}
                                        </span>
                                    )}
                                </div>
                            </Tab>

                        </TabList>

                        <TabPanel>
                            <ProductDetail />
                        </TabPanel>

                        <TabPanel>
                            <OrderDetail />
                        </TabPanel>

                        <TabPanel>
                            <UserDetail />
                        </TabPanel>

                        <TabPanel>
                            <TestimonialDetail />
                        </TabPanel>

                        <TabPanel>
                            <FAQDetail />
                        </TabPanel>
                    </Tabs>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboard;