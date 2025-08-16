// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import app from "./src/app.js";

// Load .env variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

const server = express();

// Middleware for logging (dev only)
if (NODE_ENV === "development") {
  server.use(morgan("dev"));
}

// Mount main app
server.use(app);

// Start server
server.listen(PORT, () => {
  console.log(`✅ Nestify backend running in ${NODE_ENV} mode on port ${PORT}`);
});
