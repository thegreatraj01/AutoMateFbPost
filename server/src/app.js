import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import freepikRoutes from './routes/FreePik.router.js'; // Import the FreePik router
import authRoutes from './routes/auth.routes.js'; // Import the auth router
import globalErrorHandler from "./utils/globleErrorHandler.js";

dotenv.config();

const app = express();

// CORS setup
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Mount FreePik routes
app.use("/api/v1/freepik", freepikRoutes); // Prefix all FreePik routes with "/api"
app.use("/api/v1/auth", authRoutes);

// Other routes can be added here, for example:
// app.use("/api/posts", postRoutes);
app.use(globalErrorHandler);

export default app;
