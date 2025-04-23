import mongoose from "mongoose";
import { DBNAME } from "../constant.js";

const dbUri =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_DATABASE_URL
    : process.env.DEV_DATABASE_URL;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${dbUri}/${DBNAME}?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log(
      `\n mongodb Connected  !! DB host  ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MongoDb connection error: ${error}`);
    throw error;
  }
};

export default connectDB;
