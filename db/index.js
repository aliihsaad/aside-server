import mongoose from "mongoose";

export default async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI is not set. Check your .env file.");
        process.exit(1); // exit non-zero so Render fails the deploy. otherwise it starts fine, looks healthy, and nothing works
    }
    try {
        const conn = await mongoose.connect(uri);
        console.log(`Connected to Mongo! Database name: "${conn.connections[0].name}"`);
    } catch (err) {
        console.error("Error connecting to Mongo:", err.message);
        process.exit(1) //same like above 
    }
}