import express from "express";
import {
  createFolder,
  renameFolder,
  deleteFolder,
  listFolders,
} from "../controllers/folderController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new folder
router.post("/", isAuthenticated, createFolder);

// Rename a folder
router.put("/:folderId", isAuthenticated, renameFolder);

// Delete a folder
router.delete("/:folderId", isAuthenticated, deleteFolder);

// List folders under a specific parent (must be before the "/" route)
router.get("/:parentId", isAuthenticated, listFolders);

// List root-level folders
router.get("/", isAuthenticated, listFolders);

export default router;
