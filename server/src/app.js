import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import shareRoutes from "./routes/shareRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import shareDriveRoutes from './routes/driveShareRoutes.js'
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/folders", folderRoutes);
app.use("/files", fileRoutes);
app.use("/share", shareRoutes);
app.use("/search", searchRoutes);
app.use("/share", shareDriveRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 Welcome to Nestify API" });
});

export default app;
