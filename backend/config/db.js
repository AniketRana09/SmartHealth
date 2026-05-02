const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        const uri = process.env.MONGO_URI;

        if (!uri || uri.trim() === '') {
            console.warn("\n=======================================================");
            console.warn("⚠️  MongoDB URI not found in .env file.");
            console.warn("⚠️  Please add MONGO_URI to your .env to connect to DB.");
            console.warn("=======================================================\n");
            return;
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
