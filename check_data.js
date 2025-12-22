
import mongoose from 'mongoose';
import sellermodel from './Server/model/sellermodel.js';
import addproductmodel from './Server/model/addproduct.js';
import Category from './Server/model/Category.js';
import dotenv from 'dotenv';

dotenv.config({ path: './Server/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://gng:gng@cluster0.8p906.mongodb.net/gng?retryWrites=true&w=majority&appName=Cluster0");
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const checkData = async () => {
  await connectDB();

  try {
    console.log('\n--- SELLERS ---');
    const sellers = await sellermodel.find({});
    console.log(`Total Sellers: ${sellers.length}`);
    sellers.forEach(s => {
        console.log(`ID: ${s._id}, Name: ${s.name}, Status: ${s.status}, Holiday: ${s.holidayMode}, Blocked: ${s.isBlocked}`);
    });

    console.log('\n--- CATEGORIES ---');
    const categories = await Category.find({});
    console.log(`Total Categories: ${categories.length}`);
    categories.forEach(c => {
        console.log(`ID: ${c._id}, Name: ${c.categoryname}`);
    });

    console.log('\n--- PRODUCTS ---');
    const products = await addproductmodel.find({});
    console.log(`Total Products: ${products.length}`);
    products.forEach(p => {
        console.log(`ID: ${p._id}, Title: ${p.title}, SellerID: ${p.sellerId}, CategoryID: ${p.categoryname}`);
    });

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkData();
