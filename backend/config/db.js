const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || '';
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.error('❌ MONGO_URI is not set or invalid in .env.');
    console.warn('⚠️  Server running WITHOUT database. Auth & trip endpoints will fail until MONGO_URI is set.');
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Server is running but database is unavailable. Check your MONGO_URI.');
  }
};

// Reconnect on unexpected disconnect
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

module.exports = connectDB;
