import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb://${process.env.DB_HOST_URL}/${process.env.DB_NAME}`
    );
    console.log(`MongoDB connected !!`);
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
  }
};

export default connectDB;
