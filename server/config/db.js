const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


console.log('MONGODB_URI:', process.env.MONGODB_URI);



const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
