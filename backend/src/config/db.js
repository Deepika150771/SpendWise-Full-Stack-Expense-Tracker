const mongoose = require('mongoose');
const { setMemoryDbActive } = require('./memoryDb');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spendwise';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    setMemoryDbActive(false);
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${uri} not active (${err.message}).`);
    console.log('[MongoDB] Activating zero-config embedded In-Memory database store...');
    setMemoryDbActive(true);
  }
};

module.exports = connectDB;
