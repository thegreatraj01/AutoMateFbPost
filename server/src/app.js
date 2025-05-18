import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import globalErrorHandler from "./utils/globleErrorHandler.js";
import router from "./routes/index.js";

dotenv.config();

const app = express();
app.use(cookieParser());

// CORS setup
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.static("public"));


// Mount  routes
app.use("/api/v1", router);



app.use(globalErrorHandler);

export default app;
