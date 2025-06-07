import mongoose from 'mongoose';


//Connect to MongoDB database
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('MongoDB Connected Successfully'));
        mongoose.connection.on('error', (err) => console.error('MongoDB Connection Error:', err));
        mongoose.connection.on('disconnected', () => console.log('MongoDB Disconnected'));

        // Connect to MongoDB Atlas
        await mongoose.connect(`${process.env.MONGODB_URI}/mns`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit with failure
    }
}

export default connectDB;