import supabase from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Ensure user exists in the `users` table.
 * If not, create the user using data from Supabase auth.
 */
export const ensureUserExists = async (supabaseUser) => {
  // Check if the user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("id", supabaseUser.id)
    .single();

  if (!fetchError && existingUser) {
    return true;
  }

  // Extract Google provider ID if available
  let googleId = null;
  if (supabaseUser.identities?.length > 0) {
    const googleIdentity = supabaseUser.identities.find(
      (i) => i.provider === "google"
    );
    if (googleIdentity) googleId = googleIdentity.id;
  }

  // Insert new user record
  const { error: insertError } = await supabase.from("users").insert([
    {
      id: supabaseUser.id,
      email: supabaseUser.email,
      google_id: googleId || null,
      name: supabaseUser.user_metadata?.full_name || "",
      avatar_url: supabaseUser.user_metadata?.avatar_url || null,
    },
  ]);

  if (insertError) {
    return false;
  }

  return true;
};

/**
 * Upload a file to Supabase Storage and record it in the database.
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const supabaseUser = req.user;
    if (!supabaseUser?.id)
      return res.status(401).json({ error: "Unauthorized" });

    const userExists = await ensureUserExists(supabaseUser);
    if (!userExists)
      return res.status(400).json({ error: "User not found or created" });

    const { name, original_name, mime_type } = req.body;
    const size = Number(req.body.size);
    const folder_id = req.body.folder_id || null;
    const owner_id = supabaseUser.id;

    const file_path = `files/${owner_id}/${uuidv4()}-${original_name}`;

    // Upload file to storage
    const { error: storageError } = await supabase.storage
      .from("nestify-storage")
      .upload(file_path, req.file.buffer, {
        contentType: mime_type,
        upsert: false,
      });

    if (storageError) throw storageError;

    // Insert file record into database
    const { data, error } = await supabase
      .from("files")
      .insert([
        {
          id: uuidv4(),
          name,
          original_name,
          size,
          mime_type,
          file_path,
          folder_id,
          owner_id,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    // Generate preview URL if image or PDF
    let preview_url = null;
    if (mime_type.startsWith("image/") || mime_type === "application/pdf") {
      const { data: urlData } = supabase.storage
        .from("nestify-storage")
        .getPublicUrl(file_path);
      preview_url = urlData?.publicUrl || null;
    }

    res.json({ message: "File uploaded", file: { ...data, preview_url } });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/**
 * Rename an existing file.
 */
export const renameFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    const { data, error } = await supabase
      .from("files")
      .update({ name })
      .eq("id", fileId)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ message: "File renamed", file: data });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/**
 * Delete a file from storage and the database.
 */
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Get file path from database
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("file_path")
      .eq("id", fileId)
      .single();

    if (fetchError) throw fetchError;

    // Remove from storage
    const { error: storageError } = await supabase.storage
      .from("nestify-storage")
      .remove([file.file_path]);

    if (storageError) throw storageError;

    // Remove from database
    const { error } = await supabase.from("files").delete().eq("id", fileId);
    if (error) throw error;

    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/**
 * List files for the authenticated user, optionally filtered by folder.
 */
export const listFiles = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const { folderId } = req.params;

    let query = supabase
      .from("files")
      .select("*")
      .eq("owner_id", owner_id)
      .order("created_at", { ascending: true });

    query = folderId
      ? query.eq("folder_id", folderId)
      : query.is("folder_id", null);

    const { data, error } = await query;
    if (error) throw error;

    // Add preview URLs for images or PDFs
    const filesWithPreview = data.map((f) => {
      let preview_url = null;
      if (
        f.mime_type.startsWith("image/") ||
        f.mime_type === "application/pdf"
      ) {
        preview_url =
          supabase.storage.from("nestify-storage").getPublicUrl(f.file_path)
            ?.data.publicUrl || null;
      }
      return { ...f, preview_url };
    });

    res.json(filesWithPreview);
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/**
 * Move a file to a different folder or back to the root.
 */
export const moveFileToFolder = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { folderId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: "File ID is required" });
    }

    const { data, error } = await supabase
      .from("files")
      .update({ folder_id: folderId || null })
      .eq("id", fileId)
      .select("*")
      .single();

    if (error) throw error;

    res.json({ message: "File moved successfully", file: data });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
};
