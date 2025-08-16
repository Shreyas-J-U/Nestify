import supabase from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Ensure user exists in the `users` table.
 * If not, create the user using data from Supabase auth.
 */
export const ensureUserExists = async (supabaseUser) => {
  try {
    if (!supabaseUser?.id) return false;

    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("id", supabaseUser.id)
      .single();

    if (!fetchError && existingUser) {
      return true;
    }

    // Extract Google ID if available
    let googleId = null;
    const identities = Array.isArray(supabaseUser.identities)
      ? supabaseUser.identities
      : [];
    const googleIdentity = identities.find((i) => i.provider === "google");
    if (googleIdentity?.id) {
      googleId = googleIdentity.id;
    }

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
      console.error("Error inserting new user:", insertError);
      return false;
    }
    return true;
  } catch (e) {
    console.error("ensureUserExists error:", e);
    return false;
  }
};

// Create folder
export const createFolder = async (req, res) => {
  try {
    const supabaseUser = req.user;
    if (!supabaseUser?.id) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    // Ensure user exists
    const userExists = await ensureUserExists(supabaseUser);
    if (!userExists) {
      return res.status(400).json({ error: "User could not be created or found" });
    }

    const { name, parent_id } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const owner_id = supabaseUser.id;

    const { data, error } = await supabase
      .from("folders")
      .insert([
        {
          id: uuidv4(),
          name,
          parent_id: parent_id || null,
          owner_id,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    res.json({ message: "📁 Folder created", folder: data });
  } catch (err) {
    console.error("Folder creation error:", err);
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
};

// Rename folder
export const renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    if (!folderId) {
      return res.status(400).json({ error: "folderId is required" });
    }
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "New name is required" });
    }

    const { data, error } = await supabase
      .from("folders")
      .update({ name })
      .eq("id", folderId)
      .select("*")
      .single();

    if (error) throw error;
    res.json({ message: "✏️ Folder renamed", folder: data });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
};

// Delete folder (and its files in that folder only; not recursive to subfolders)
export const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    if (!folderId) {
      return res.status(400).json({ error: "folderId is required" });
    }

    // Fetch files in the folder
    const { data: files, error: fileFetchError } = await supabase
      .from("files")
      .select("id,file_path")
      .eq("folder_id", folderId);

    if (fileFetchError) throw fileFetchError;

    // Remove files from storage bucket if any file_path exists
    const paths = (files || [])
      .map((f) => f.file_path)
      .filter((p) => typeof p === "string" && p.length > 0);

    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from("nestify-storage")
        .remove(paths);
      if (storageError) throw storageError;
    }

    // Delete file rows from DB
    if ((files || []).length > 0) {
      const ids = files.map((f) => f.id);
      const { error: fileDeleteError } = await supabase
        .from("files")
        .delete()
        .in("id", ids);
      if (fileDeleteError) throw fileDeleteError;
    }

    // Delete the folder entry
    const { error } = await supabase.from("folders").delete().eq("id", folderId);
    if (error) throw error;

    res.json({ message: "🗑️ Folder deleted" });
  } catch (err) {
    console.error("Delete folder error:", err);
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
};

// List folders
export const listFolders = async (req, res) => {
  try {
    const owner_id = req.user?.id;
    if (!owner_id) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const { parentId } = req.params;

    let query = supabase
      .from("folders")
      .select("*")
      .eq("owner_id", owner_id)
      .order("created_at", { ascending: true });

    if (parentId) {
      query = query.eq("parent_id", parentId);
    } else {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    console.error("List folders error:", err);
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
};
