import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  shareDrive,
  accessSharedDrive,
  downloadSharedFile,
} from "../controllers/driveShareController.js";

const router = express.Router();

// Share entire drive (auth required)
router.post("/drive", isAuthenticated, shareDrive);

// Access shared drive (no auth)
router.get("/drive/:token", accessSharedDrive);

// Download file from shared drive (no auth)
router.get("/drive/:token/download/:fileId", downloadSharedFile);

export default router;
