import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  shareFile,
  shareFolder,
  accessSharedResource,
  downloadSharedFile,
  serveSharedFileInline,
  getSharedFolderContents,
  downloadFileFromSharedFolder,
  previewFileFromSharedFolder
} from "../controllers/shareController.js";

const router = express.Router();

// Create share links (require authentication)
router.post("/file/:fileId", isAuthenticated, shareFile);
router.post("/folder/:folderId", isAuthenticated, shareFolder);

// Public access endpoints (no authentication required)
router.get("/:token", accessSharedResource);

// File sharing endpoints
router.get("/file/:token/download", downloadSharedFile);
router.get("/file/:token/inline", serveSharedFileInline);

// Folder sharing endpoints
router.get("/folder/:token/contents", getSharedFolderContents);
router.get("/folder/:token/file/:fileId/download", downloadFileFromSharedFolder);
router.get("/folder/:token/file/:fileId/preview", previewFileFromSharedFolder);

export default router;
