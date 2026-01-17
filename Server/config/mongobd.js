import mongoose from "mongoose";

/**
 * MongoDB Connection Configuration
 * SECURITY: Never log connection strings as they contain credentials
 */
const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("✅ Database Connected Successfully");
    });

    mongoose.connection.on('error', (err) => {
        console.error("❌ Database Connection Error:", err.message);
    });

    try {
        await mongoose.connect(process.env.mongodb_url);
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);
        process.exit(1);
    }
};

export default connectDB;