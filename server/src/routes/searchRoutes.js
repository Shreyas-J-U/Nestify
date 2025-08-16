import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { searchFilesAndFolders } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", isAuthenticated, searchFilesAndFolders);

export default router;
