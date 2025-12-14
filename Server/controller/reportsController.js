import {
    RevenueAnalytics,
    VendorPerformance,
    ProductAnalytics,
    CustomerInsights,
    TrafficReports,
    CustomReport,
    ExportLogs
} from "../model/reportsModel.js";
import orderModel from "../model/order.js";
import seller from "../model/sellermodel.js";
import userModel from "../model/mongobd_usermodel.js";
import product from "../model/addproduct.js";

// ============ REVENUE ANALYTICS ============
export const getRevenueAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, period = 'daily' } = req.query;

        // Get real order data for revenue calculation
        const matchQuery = {};
        if (startDate && endDate) {
            matchQuery.placedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Aggregate orders for revenue data
        const orderStats = await orderModel.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$placedAt" } },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
        ]);

        // Summary stats
        const summary = await orderModel.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: orderStats,
            summary: summary[0] || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }
        });
    } catch (error) {
        console.error("Get Revenue Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ VENDOR PERFORMANCE ============
export const getVendorPerformance = async (req, res) => {
    try {
        const { limit = 20, sortBy = 'revenue' } = req.query;

        // Get all sellers (no isActive filter - use approved or status)
        const vendors = await seller.find().select('name email nickName businessInfo.businessName approved status commissionRate image');

        // Get order stats per vendor (sellerId is inside items array)
        const vendorStats = await orderModel.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.sellerId",
                    totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    totalOrders: { $sum: 1 }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: parseInt(limit) }
        ]);

        // Count products per seller
        const productCounts = await product.aggregate([
            { $group: { _id: "$sellerId", count: { $sum: 1 } } }
        ]);

        // Merge vendor info with stats
        const performanceData = vendors.map(v => {
            const stats = vendorStats.find(s => s._id?.toString() === v._id.toString()) || { totalSales: 0, totalOrders: 0 };
            const prodCount = productCounts.find(p => p._id?.toString() === v._id.toString());
            return {
                _id: v._id,
                name: v.businessInfo?.businessName || v.name || v.nickName || 'Unknown',
                email: v.email,
                image: v.image,
                totalProducts: prodCount?.count || 0,
                totalOrders: stats.totalOrders,
                revenue: stats.totalSales,
                rating: 4 + Math.random(), // Placeholder - implement rating system later
                fulfillmentRate: 90 + Math.random() * 10,
                returnRate: Math.random() * 3,
                status: v.status,
                approved: v.approved
            };
        }).sort((a, b) => b.revenue - a.revenue).slice(0, parseInt(limit));

        res.status(200).json({ success: true, vendors: performanceData });
    } catch (error) {
        console.error("Get Vendor Performance Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ INDIVIDUAL SELLER SALES REPORT ============
export const getSellerSalesReport = async (req, res) => {
    try {
        const { sellerId, period, startDate, endDate } = req.query;

        if (!sellerId) {
            return res.status(400).json({ success: false, message: "Seller ID is required" });
        }

        // Calculate date range based on period
        let dateFrom, dateTo = new Date();
        const now = new Date();

        switch (period) {
            case 'today':
                dateFrom = new Date(now.setHours(0, 0, 0, 0));
                dateTo = new Date();
                break;
            case 'week':
                dateFrom = new Date(now.setDate(now.getDate() - 7));
                dateTo = new Date();
                break;
            case 'month':
                dateFrom = new Date(now.setMonth(now.getMonth() - 1));
                dateTo = new Date();
                break;
            case 'custom':
                if (!startDate || !endDate) {
                    return res.status(400).json({ success: false, message: "Start and end dates are required for custom period" });
                }
                dateFrom = new Date(startDate);
                dateTo = new Date(endDate);
                dateTo.setHours(23, 59, 59, 999); // Include full end day
                break;
            default:
                // All time - no date filter
                dateFrom = null;
                dateTo = null;
        }

        // Build match query
        const matchQuery = {
            "items.sellerId": sellerId
        };
        if (dateFrom && dateTo) {
            matchQuery.placedAt = { $gte: dateFrom, $lte: dateTo };
        }

        // Get seller info
        const sellerInfo = await seller.findById(sellerId).select('name nickName email uniqueId image');
        if (!sellerInfo) {
            return res.status(404).json({ success: false, message: "Seller not found" });
        }

        // Get orders for this seller within date range
        const orders = await orderModel.find(matchQuery)
            .populate("items.productId", "title images price")
            .sort({ placedAt: -1 });

        // Calculate stats
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalItems = 0;
        const dailySales = {};
        const productSales = {};

        orders.forEach(order => {
            const sellerItems = order.items.filter(item =>
                item.sellerId?.toString() === sellerId.toString()
            );

            if (sellerItems.length > 0) {
                totalOrders++;
                sellerItems.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    totalRevenue += itemTotal;
                    totalItems += item.quantity;

                    // Daily breakdown
                    const dateKey = order.placedAt.toISOString().split('T')[0];
                    if (!dailySales[dateKey]) {
                        dailySales[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
                    }
                    dailySales[dateKey].revenue += itemTotal;
                    dailySales[dateKey].orders++;

                    // Product breakdown
                    const prodId = item.productId?._id?.toString() || item.productId?.toString();
                    if (prodId) {
                        if (!productSales[prodId]) {
                            productSales[prodId] = {
                                productId: prodId,
                                title: item.productId?.title || 'Unknown Product',
                                image: item.productId?.images?.[0]?.url || null,
                                quantity: 0,
                                revenue: 0
                            };
                        }
                        productSales[prodId].quantity += item.quantity;
                        productSales[prodId].revenue += itemTotal;
                    }
                });
            }
        });

        // Convert to arrays and sort
        const dailySalesArray = Object.values(dailySales).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        res.status(200).json({
            success: true,
            seller: {
                _id: sellerInfo._id,
                name: sellerInfo.name,
                nickName: sellerInfo.nickName,
                email: sellerInfo.email,
                uniqueId: sellerInfo.uniqueId,
                image: sellerInfo.image
            },
            period: period || 'all',
            dateRange: {
                from: dateFrom,
                to: dateTo
            },
            summary: {
                totalRevenue,
                totalOrders,
                totalItems,
                avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            },
            dailySales: dailySalesArray,
            topProducts
        });

    } catch (error) {
        console.error("Get Seller Sales Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ PRODUCT ANALYTICS ============
export const getProductAnalytics = async (req, res) => {
    try {
        const { limit = 30, sortBy = 'revenue' } = req.query;

        // Get products with their stats - use correct field names from model
        const products = await product.find()
            .select('title price stock images brand availability isAvailable isFeatured approved categoryname sellerId')
            .populate('categoryname', 'name')
            .populate('sellerId', 'name nickName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Get order stats per product
        const productStats = await orderModel.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    purchases: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: parseInt(limit) }
        ]);

        const analyticsData = products.map(p => {
            const stats = productStats.find(s => s._id?.toString() === p._id.toString()) || { purchases: 0, revenue: 0 };
            // Mock views for now (can implement view tracking later)
            const views = Math.floor(stats.purchases * (10 + Math.random() * 20)) || Math.floor(Math.random() * 100);
            return {
                _id: p._id,
                name: p.title,
                price: p.price,
                stock: p.stock,
                image: p.images?.[0]?.url || p.images?.[0] || null,
                views: views,
                purchases: stats.purchases,
                revenue: stats.revenue,
                conversionRate: views > 0 ? ((stats.purchases / views) * 100).toFixed(2) : 0,
                category: p.categoryname?.name || 'Uncategorized',
                seller: p.sellerId?.name || p.sellerId?.nickName || 'Unknown',
                availability: p.availability,
                isApproved: p.approved,
                isFeatured: p.isFeatured
            };
        }).sort((a, b) => b.revenue - a.revenue);

        // Calculate summary stats
        const totalProducts = products.length;
        const totalRevenue = analyticsData.reduce((sum, p) => sum + p.revenue, 0);
        const totalPurchases = analyticsData.reduce((sum, p) => sum + p.purchases, 0);
        const avgConversion = analyticsData.length > 0
            ? (analyticsData.reduce((sum, p) => sum + parseFloat(p.conversionRate), 0) / analyticsData.length).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            products: analyticsData,
            summary: {
                totalProducts,
                totalRevenue,
                totalPurchases,
                avgConversion
            }
        });
    } catch (error) {
        console.error("Get Product Analytics Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ CUSTOMER INSIGHTS ============
export const getCustomerInsights = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchQuery = {};
        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get customer stats
        const totalCustomers = await userModel.countDocuments();
        const newCustomers = await userModel.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        // Get customer order patterns (userId is stored as 'user' field)
        const customerOrderStats = await orderModel.aggregate([
            {
                $group: {
                    _id: "$user",
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" }
                }
            }
        ]);

        const oneTimeCustomers = customerOrderStats.filter(c => c.orderCount === 1).length;
        const repeatCustomers = customerOrderStats.filter(c => c.orderCount >= 2 && c.orderCount < 5).length;
        const frequentCustomers = customerOrderStats.filter(c => c.orderCount >= 5).length;

        const avgLTV = customerOrderStats.length > 0
            ? customerOrderStats.reduce((sum, c) => sum + c.totalSpent, 0) / customerOrderStats.length
            : 0;

        // Get location data
        const locationStats = await userModel.aggregate([
            { $match: { city: { $exists: true, $ne: null } } },
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            insights: {
                totalCustomers,
                newCustomers,
                returningCustomers: totalCustomers - newCustomers,
                averageLifetimeValue: avgLTV,
                purchaseFrequency: {
                    oneTime: oneTimeCustomers,
                    repeat: repeatCustomers,
                    frequent: frequentCustomers
                },
                topLocations: locationStats.map(l => ({ city: l._id, count: l.count }))
            }
        });
    } catch (error) {
        console.error("Get Customer Insights Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ TRAFFIC REPORTS ============
export const getTrafficReports = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Get stored traffic data or generate mock data
        let trafficData = await TrafficReports.find().sort({ date: -1 }).limit(30);

        if (trafficData.length === 0) {
            // Generate sample data for demonstration
            const sampleData = [];
            for (let i = 0; i < 30; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                sampleData.push({
                    date,
                    pageViews: Math.floor(1000 + Math.random() * 5000),
                    uniqueVisitors: Math.floor(500 + Math.random() * 2000),
                    bounceRate: 30 + Math.random() * 30,
                    averageSessionDuration: 60 + Math.random() * 180,
                    sources: {
                        direct: Math.floor(200 + Math.random() * 500),
                        organic: Math.floor(300 + Math.random() * 800),
                        social: Math.floor(100 + Math.random() * 300),
                        referral: Math.floor(50 + Math.random() * 150),
                        paid: Math.floor(100 + Math.random() * 200)
                    },
                    devices: {
                        desktop: Math.floor(300 + Math.random() * 600),
                        mobile: Math.floor(400 + Math.random() * 800),
                        tablet: Math.floor(50 + Math.random() * 150)
                    }
                });
            }
            trafficData = sampleData;
        }

        // Calculate summary
        const summary = {
            totalPageViews: trafficData.reduce((sum, d) => sum + (d.pageViews || 0), 0),
            totalVisitors: trafficData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0),
            avgBounceRate: trafficData.reduce((sum, d) => sum + (d.bounceRate || 0), 0) / trafficData.length,
            avgSessionDuration: trafficData.reduce((sum, d) => sum + (d.averageSessionDuration || 0), 0) / trafficData.length
        };

        res.status(200).json({ success: true, traffic: trafficData, summary });
    } catch (error) {
        console.error("Get Traffic Reports Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ CUSTOM REPORTS ============
export const getCustomReports = async (req, res) => {
    try {
        const reports = await CustomReport.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, reports });
    } catch (error) {
        console.error("Get Custom Reports Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const createCustomReport = async (req, res) => {
    try {
        const report = new CustomReport(req.body);
        await report.save();
        res.status(201).json({ success: true, message: "Report created", report });
    } catch (error) {
        console.error("Create Custom Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const updateCustomReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await CustomReport.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Report updated", report });
    } catch (error) {
        console.error("Update Custom Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteCustomReport = async (req, res) => {
    try {
        const { id } = req.params;
        await CustomReport.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Report deleted" });
    } catch (error) {
        console.error("Delete Custom Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const runCustomReport = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await CustomReport.findById(id);
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        // Update last run time
        report.lastRun = new Date();
        await report.save();

        // Generate report data based on type
        let data = [];
        switch (report.reportType) {
            case 'sales':
                data = await orderModel.find().sort({ createdAt: -1 }).limit(100);
                break;
            case 'customers':
                data = await userModel.find().sort({ createdAt: -1 }).limit(100);
                break;
            case 'vendors':
                data = await seller.find().sort({ createdAt: -1 }).limit(100);
                break;
            case 'products':
                data = await product.find().sort({ createdAt: -1 }).limit(100);
                break;
            default:
                data = [];
        }

        res.status(200).json({ success: true, report, data });
    } catch (error) {
        console.error("Run Custom Report Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ EXPORT DATA ============
export const getExportLogs = async (req, res) => {
    try {
        const logs = await ExportLogs.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error("Get Export Logs Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const createExport = async (req, res) => {
    try {
        const { exportType, format, filters } = req.body;

        const exportLog = new ExportLogs({
            exportType,
            format: format || 'csv',
            filters,
            status: 'processing'
        });
        await exportLog.save();

        // Get data based on export type
        let data = [];
        let count = 0;

        switch (exportType) {
            case 'orders':
                data = await orderModel.find(filters || {});
                count = data.length;
                break;
            case 'products':
                data = await product.find(filters || {});
                count = data.length;
                break;
            case 'customers':
                data = await userModel.find(filters || {});
                count = data.length;
                break;
            case 'vendors':
                data = await seller.find(filters || {});
                count = data.length;
                break;
        }

        // Update export log
        exportLog.recordCount = count;
        exportLog.status = 'completed';
        await exportLog.save();

        res.status(200).json({ success: true, message: "Export created", export: exportLog, data });
    } catch (error) {
        console.error("Create Export Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const deleteExportLog = async (req, res) => {
    try {
        const { id } = req.params;
        await ExportLogs.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Export log deleted" });
    } catch (error) {
        console.error("Delete Export Log Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============ DASHBOARD SUMMARY ============
export const getReportsSummary = async (req, res) => {
    try {
        // Get today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [orderStats, customerCount, vendorCount, productCount] = await Promise.all([
            orderModel.aggregate([
                { $match: { placedAt: { $gte: today } } },
                { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
            ]),
            userModel.countDocuments(),
            seller.countDocuments({ isActive: true }),
            product.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            summary: {
                todayRevenue: orderStats[0]?.revenue || 0,
                todayOrders: orderStats[0]?.count || 0,
                totalCustomers: customerCount,
                totalVendors: vendorCount,
                totalProducts: productCount
            }
        });
    } catch (error) {
        console.error("Get Reports Summary Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
