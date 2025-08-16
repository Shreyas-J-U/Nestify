// controllers/searchController.js
import supabase from "../config/supabaseClient.js";

export const searchFilesAndFolders = async (req, res) => {
  const { q, limit = 10, page = 1 } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: "Search query (q) is required" });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const from = (parsedPage - 1) * parsedLimit;
  const to = from + parsedLimit - 1;

  try {
    // Files
    const { data: files, error: fileError, count: filesCount } = await supabase
      .from("files")
      .select("*", { count: "exact" })
      .eq("owner_id", userId)
      .ilike("name", `%${q}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (fileError) throw fileError;

    // Folders
    const { data: folders, error: folderError, count: foldersCount } = await supabase
      .from("folders")
      .select("*", { count: "exact" })
      .eq("owner_id", userId)
      .ilike("name", `%${q}%`)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (folderError) throw folderError;

    res.json({
      query: q,
      pagination: { page: parsedPage, limit: parsedLimit },
      files: {
        results: files || [],
        total: filesCount ?? 0,
      },
      folders: {
        results: folders || [],
        total: foldersCount ?? 0,
      },
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};
