import supabase from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

// Share a file
export const shareFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { shared_with, permission, expires_at } = req.body;
    const shared_by = req.user.id;

    const share_token = uuidv4();

    const { data, error } = await supabase
      .from("file_shares")
      .insert([
        {
          id: uuidv4(),
          file_id: fileId,
          shared_by,
          shared_with: shared_with || null,
          permission,
          share_token,
          expires_at: expires_at || null,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    res.json({
      message: "File shared successfully",
      shareLink: `${process.env.FRONTEND_URL}/share/file/${share_token}`,
      share: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Share a folder
export const shareFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { shared_with, permission, expires_at } = req.body;
    const shared_by = req.user.id;

    const share_token = uuidv4();

    const { data, error } = await supabase
      .from("folder_shares")
      .insert([
        {
          id: uuidv4(),
          folder_id: folderId,
          shared_by,
          shared_with: shared_with || null,
          permission,
          share_token,
          expires_at: expires_at || null,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    res.json({
      message: "Folder shared successfully",
      shareLink: `${process.env.FRONTEND_URL}/share/folder/${share_token}`,
      share: data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update accessSharedResource to handle both files and folders
export const accessSharedResource = async (req, res) => {
  try {
    const { token } = req.params;

    // Try file share first
    const { data: fileShare, error: fileError } = await supabase
      .from("file_shares")
      .select("*, files(*)")
      .eq("share_token", token)
      .single();

    if (fileShare && !fileError) {
      if (fileShare.expires_at && new Date(fileShare.expires_at) < new Date()) {
        return res.status(410).json({ message: "Share link expired" });
      }
      return res.json({ type: "file", resource: fileShare.files, permission: fileShare.permission });
    }

    // Try folder share
    const { data: folderShare, error: folderError } = await supabase
      .from("folder_shares")
      .select("*, folders(*)")
      .eq("share_token", token)
      .single();

    if (folderShare && !folderError) {
      if (folderShare.expires_at && new Date(folderShare.expires_at) < new Date()) {
        return res.status(410).json({ message: "Share link expired" });
      }
      return res.json({ type: "folder", resource: folderShare.folders, permission: folderShare.permission });
    }

    return res.status(404).json({ message: "Share link not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Download shared file (forces download)
export const downloadSharedFile = async (req, res) => {
  try {
    const { token } = req.params;

    const { data: shareData } = await supabase
      .from("file_shares")
      .select("*, files(*)")
      .eq("share_token", token)
      .single();

    if (!shareData) return res.status(404).json({ message: "Shared file not found" });

    const file = shareData.files;

    const { data: fileData, error } = await supabase.storage
      .from("nestify-storage")
      .download(file.file_path);

    if (error || !fileData) return res.status(500).json({ message: "Failed to download file" });

    const buffer = Buffer.from(await fileData.arrayBuffer());

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${file.original_name}"`);
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Serve shared file inline (for preview in browser)
export const serveSharedFileInline = async (req, res) => {
  try {
    const { token } = req.params;

    const { data: shareData } = await supabase
      .from("file_shares")
      .select("*, files(*)")
      .eq("share_token", token)
      .single();

    if (!shareData) return res.status(404).json({ message: "Shared file not found" });

    const file = shareData.files;

    const { data: fileData, error } = await supabase.storage
      .from("nestify-storage")
      .download(file.file_path);

    if (error || !fileData) return res.status(500).json({ message: "Failed to fetch file" });

    const buffer = Buffer.from(await fileData.arrayBuffer());

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${file.original_name}"`);
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get files and subfolders in shared folder
export const getSharedFolderContents = async (req, res) => {
  try {
    const { token } = req.params;
    const { folderId } = req.query; // Optional subfolder navigation

    // First verify the share token
    const { data: shareData, error: shareError } = await supabase
      .from("folder_shares")
      .select("*, folders(*)")
      .eq("share_token", token)
      .single();

    if (!shareData || shareError) {
      return res.status(404).json({ message: "Share link not found" });
    }

    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return res.status(410).json({ message: "Share link expired" });
    }

    const targetFolderId = folderId || shareData.folder_id;

    // Get files in the folder
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("*")
      .eq("folder_id", targetFolderId);

    // Get subfolders
    const { data: subfolders, error: foldersError } = await supabase
      .from("folders")
      .select("*")
      .eq("parent_id", targetFolderId);

    if (filesError || foldersError) {
      return res.status(500).json({ message: "Failed to fetch folder contents" });
    }

    res.json({
      folder: shareData.folders,
      files: files || [],
      subfolders: subfolders || [],
      permission: shareData.permission,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Download file from shared folder
export const downloadFileFromSharedFolder = async (req, res) => {
  try {
    const { token, fileId } = req.params;

    // Verify the folder share token first
    const { data: shareData, error: shareError } = await supabase
      .from("folder_shares")
      .select("*, folders(*)")
      .eq("share_token", token)
      .single();

    if (!shareData || shareError) {
      return res.status(404).json({ message: "Share link not found" });
    }

    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return res.status(410).json({ message: "Share link expired" });
    }

    // Get the specific file
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (!file || fileError) {
      return res.status(404).json({ message: "File not found" });
    }

    // Verify file belongs to shared folder or its subfolders
    // (You can add additional security checks here if needed)

    // Download from storage
    const { data: fileData, error } = await supabase.storage
      .from("nestify-storage")
      .download(file.file_path);

    if (error || !fileData) {
      return res.status(500).json({ message: "Failed to download file" });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `attachment; filename="${file.original_name}"`);
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// NEW: Preview file from shared folder
export const previewFileFromSharedFolder = async (req, res) => {
  try {
    const { token, fileId } = req.params;

    // Verify the folder share token first
    const { data: shareData, error: shareError } = await supabase
      .from("folder_shares")
      .select("*, folders(*)")
      .eq("share_token", token)
      .single();

    if (!shareData || shareError) {
      return res.status(404).json({ message: "Share link not found" });
    }

    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return res.status(410).json({ message: "Share link expired" });
    }

    // Get the specific file
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (!file || fileError) {
      return res.status(404).json({ message: "File not found" });
    }

    // Download from storage
    const { data: fileData, error } = await supabase.storage
      .from("nestify-storage")
      .download(file.file_path);

    if (error || !fileData) {
      return res.status(500).json({ message: "Failed to fetch file" });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    res.setHeader("Content-Type", file.mime_type);
    res.setHeader("Content-Disposition", `inline; filename="${file.original_name}"`);
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
