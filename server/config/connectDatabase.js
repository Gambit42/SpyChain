const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_ACCESS);
    console.log("Successfully connected to the MongoDB database");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDatabase;
