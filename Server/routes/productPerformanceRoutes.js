import express from "express";
import addproductmodel from "../model/addproduct.js";
import orderModel from "../model/order.js";
import authseller from "../middleware/authseller.js";

const router = express.Router();

router.get("/", authseller, async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const products = await addproductmodel.find({ sellerId }).lean();
    
    // Find orders that contain items from this seller
    const orders = await orderModel.find({ "items.sellerId": sellerId }).lean();

    const productStats = products.map(product => {
      let totalSales = 0;
      let revenue = 0;
      let orderCount = 0;

      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId.toString() === product._id.toString()) {
            totalSales += item.quantity;
            revenue += item.price * item.quantity;
            orderCount += 1;
          }
        });
      });

      const conversionRate =
        orders.length > 0
          ? ((orderCount / orders.length) * 100).toFixed(2)
          : 0;

      return {
        productId: product._id,
        title: product.title,
        totalSales,
        revenue,
        conversionRate,
        price: product.price,
        approved: product.approved,
        images: product.images,
      };
    });

    productStats.sort((a, b) => b.totalSales - a.totalSales);

    res.json({ success: true, data: productStats });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default router;
