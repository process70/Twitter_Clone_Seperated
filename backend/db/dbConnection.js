import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Successfully connected to the database");
  } catch (err) {
    console.error("Error connecting to database:", err);
    throw err; // Rethrow to allow handling in the main application
  }
};