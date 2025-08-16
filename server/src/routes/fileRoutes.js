import express from "express";
import multer from "multer";
import {
  uploadFile,
  renameFile,
  deleteFile,
  listFiles,
  moveFileToFolder, // NEW
} from "../controllers/fileController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/checkPermission.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload a file (requires "edit" or "owner")
router.post(
  "/",
  isAuthenticated,
  checkPermission(["edit", "owner"]),
  upload.single("file"),
  uploadFile
);

// Rename a file (requires "edit" or "owner")
router.put(
  "/:fileId",
  isAuthenticated,
  checkPermission(["edit", "owner"]),
  renameFile
);

// Move a file to a folder (requires "edit" or "owner")
router.put(
  "/:fileId/move",
  isAuthenticated,
  checkPermission(["edit", "owner"]),
  moveFileToFolder
);

// Delete a file (requires "owner")
router.delete(
  "/:fileId",
  isAuthenticated,
  checkPermission(["owner"]),
  deleteFile
);

// List root files (requires at least "view")
router.get(
  "/",
  isAuthenticated,
  checkPermission(["view", "edit", "owner"]),
  listFiles
);

// List files in a folder (requires at least "view")
router.get(
  "/folder/:folderId",
  isAuthenticated,
  checkPermission(["view", "edit", "owner"]),
  listFiles
);

export default router;
