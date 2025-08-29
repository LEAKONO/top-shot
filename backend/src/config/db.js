import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env in root directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('🔍 Environment Check:');
console.log('  Current directory:', __dirname);
console.log('  Loading .env from:', envPath);
console.log('  MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found!');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI is not defined in environment variables');
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully');
    console.log('   Host:', conn.connection.host);
    console.log('   Port:', conn.connection.port);
    console.log('   DB Name:', conn.connection.name);
    
    // Connection events
    mongoose.connection.on('connected', () => {
      console.log('📊 Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose disconnected');
    });

    return conn;
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Verify MongoDB is running: sudo systemctl status mongod');
    console.log('2. Test connection: mongosh "' + process.env.MONGO_URI + '"');
    console.log('3. Check .env file exists at:', envPath);
    console.log('4. Ensure MONGO_URI is properly formatted');
    process.exit(1);
  }
};

export default connectDB;