import supabase from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

// Share entire drive (read-only)
export const shareDrive = async (req, res) => {
  try {
    const shared_by = req.user.id;
    const share_token = uuidv4();

    // Expiry 7 days
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 7);

    const { data, error } = await supabase
      .from("drive_shares")
      .insert([
        {
          id: uuidv4(),
          shared_by,
          share_token,
          permission: "view",
          expires_at,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Drive shared successfully",
      shareLink: `${process.env.FRONTEND_URL}/share/drive/${share_token}`,
      share: data,
    });
  } catch (err) {
    console.error("Error sharing drive:", err);
    res.status(500).json({ error: err.message });
  }
};

// Access shared drive (read-only)
export const accessSharedDrive = async (req, res) => {
  try {
    const { token } = req.params;

    // Fetch share info
    const { data: shareData, error: shareError } = await supabase
      .from("drive_shares")
      .select("*")
      .eq("share_token", token)
      .single();

    if (shareError) return res.status(404).json({ message: "Drive share not found" });

    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return res.status(410).json({ message: "Drive share link expired" });
    }

    // Fetch all files of the owner
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("*")
      .eq("owner_id", shareData.shared_by)
      .order("created_at", { ascending: true });

    if (filesError) throw filesError;

    // Fetch owner info from public.users
    const { data: ownerData, error: ownerError } = await supabase
      .from("users")
      .select("id, name, email, avatar_url")
      .eq("id", shareData.shared_by)
      .single();

    if (ownerError) throw ownerError;

    const filesWithPreview = files.map((f) => {
      let preview_url = null;
      if (f.mime_type.startsWith("image/") || f.mime_type === "application/pdf") {
        const { data: urlData } = supabase.storage
          .from("nestify-storage")
          .getPublicUrl(f.file_path);
        preview_url = urlData.publicUrl;
      }
      return { ...f, preview_url };
    });

    res.json({
      type: "drive",
      files: filesWithPreview,
      permission: shareData.permission,
      owner: ownerData, // send owner info to frontend
    });
  } catch (err) {
    console.error("Error accessing shared drive:", err);
    res.status(500).json({ error: err.message });
  }
};

// Download a file from shared drive
export const downloadSharedFile = async (req, res) => {
  try {
    const { token, fileId } = req.params;

    // Validate share
    const { data: shareData, error: shareError } = await supabase
      .from("drive_shares")
      .select("*")
      .eq("share_token", token)
      .single();

    if (shareError) return res.status(404).json({ message: "Drive share not found" });

    if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
      return res.status(410).json({ message: "Drive share link expired" });
    }

    // Fetch file
    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("owner_id", shareData.shared_by)
      .single();

    if (fileError || !fileData) return res.status(404).json({ message: "File not found" });

    // Download from Supabase storage
    const { data, error: downloadError } = await supabase.storage
      .from("nestify-storage")
      .download(fileData.file_path);

    if (downloadError) throw downloadError;

    // In Node.js, `data` is a Blob-like object; convert to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Stream the buffer to the client
    res.setHeader("Content-Disposition", `attachment; filename="${fileData.name}"`);
    res.setHeader("Content-Type", fileData.mime_type);
    res.send(buffer);

  } catch (err) {
    console.error("Error downloading file:", err);
    res.status(500).json({ error: err.message });
  }
};
