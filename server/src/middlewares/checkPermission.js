import supabase from "../config/supabaseClient.js";

/**
 * Checks if the authenticated user has required permissions for a file or folder.
 * @param {string[]} allowedPermissions - Array of permissions e.g. ["view"], ["edit", "owner"]
 */
export const checkPermission = (allowedPermissions) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const { fileId, folderId } = req.params;

      // Skip permission check if no specific resource (for listing root files)
      if (!fileId && !folderId) {
        return next();
      }

      const resourceType = fileId ? "file" : "folder";
      const resourceId = fileId || folderId;

      // Check ownership first
      const { data: owned } = await supabase
        .from(resourceType === "file" ? "files" : "folders")
        .select("owner_id")
        .eq("id", resourceId)
        .single();

      if (owned && owned.owner_id === userId) {
        req.permission = "owner";
        return next();
      }

      // Check shares
      const shareTable =
        resourceType === "file" ? "file_shares" : "folder_shares";

      const { data: share, error } = await supabase
        .from(shareTable)
        .select("permission, expires_at")
        .eq(`${resourceType}_id`, resourceId)
        .eq("shared_with", userId)
        .single();

      if (error || !share) {
        return res
          .status(403)
          .json({ error: "You do not have access to this resource" });
      }

      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return res.status(410).json({ error: "Share link expired" });
      }

      if (!allowedPermissions.includes(share.permission)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      req.permission = share.permission;
      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};
