import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Share2, Cloud } from "lucide-react";

export default function useDashboard() {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();

  // Core State
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openFolderMenuId, setOpenFolderMenuId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);

  // Folder Modal state
  const [folderModal, setFolderModal] = useState({
    open: false,
    mode: null,
    initial: "",
    folderId: null,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Folder navigation
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderStack, setFolderStack] = useState([]);
  const [currentFolderName, setCurrentFolderName] = useState("My Drive");

  // Redirect check
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Formatters
  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Debounce helper
  const debounceRef = useRef(null);
  const debounce = (fn, delay = 300) => {
    return (...args) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fn(...args), delay);
    };
  };

  // API Calls
  const fetchFiles = async (folderId = currentFolderId) => {
    if (!token) return;
    setLoading(true);
    try {
      const url =
        folderId && folderId !== "root"
          ? `${import.meta.env.VITE_API_URL}/files/folder/${folderId}`
          : `${import.meta.env.VITE_API_URL}/files`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fileList = Array.isArray(res.data) ? res.data : [];
      setFiles(fileList);
      const totalSize = fileList.reduce((acc, f) => acc + (f.size || 0), 0);
      setStorageUsed(totalSize);
    } catch (err) {
      if (err.response?.status === 401) {
        await signOut();
        navigate("/login");
      }
      toast.error("Error fetching files.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async (folderId = currentFolderId) => {
    if (!token) return;
    try {
      const url =
        folderId && folderId !== "root"
          ? `${import.meta.env.VITE_API_URL}/folders/${folderId}`
          : `${import.meta.env.VITE_API_URL}/folders`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Error fetching folders.");
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchFolders(), fetchFiles()]);
  };

  const performSearch = async (query) => {
    if (!token) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setIsSearchMode(false);
      setSearchQuery("");
      await refreshAll();
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(
          trimmed
        )}&limit=50&page=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fileResults = res.data?.files?.results || [];
      const folderResults = res.data?.folders?.results || [];
      setFiles(fileResults);
      setFolders(folderResults);
      const totalSize = fileResults.reduce((acc, f) => acc + (f.size || 0), 0);
      setStorageUsed(totalSize);
      setIsSearchMode(true);
    } catch (err) {
      toast.error("Error searching files/folders.");
    } finally {
      setSearching(false);
    }
  };

  const searchFilesAndFolders = debounce(performSearch, 350);

  useEffect(() => {
    if (token) {
      refreshAll();
    }
  }, [token, currentFolderId]);

  const handleUpload = async (e, fileToUpload) => {
    if (e?.preventDefault) e.preventDefault();
    const uploadFile = fileToUpload || file;
    if (!uploadFile || !token) return;

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("name", uploadFile.name);
    formData.append("original_name", uploadFile.name);
    formData.append("size", uploadFile.size.toString());
    formData.append("mime_type", uploadFile.type || "application/octet-stream");
    if (currentFolderId) {
      formData.append("folder_id", currentFolderId);
    }
    setUploading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/files`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFile(null);
      setShowUploadModal(false);
      toast.success("File uploaded!");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchFiles();
      }
    } catch (err) {
      toast.error("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!token) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("File deleted.");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchFiles();
      }
    } catch (err) {
      toast.error("Error deleting file.");
    }
  };

  const renameFile = async (fileId, newName) => {
    if (!token) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/files/${fileId}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("File renamed.");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchFiles();
      }
    } catch (err) {
      toast.error("Error renaming file.");
    }
  };

  const shareFile = async (file) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/share/file/${file.id}`,
        { permission: "read" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const publicLink = res.data.shareLink;
      await navigator.clipboard.writeText(publicLink);
      toast.success("File share link copied to clipboard!", {
        icon: <Share2 />,
      });
    } catch (err) {
      toast.error("Failed to create share link");
    }
  };

  const shareFolder = async (folder) => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/share/folder/${folder.id}`,
        { permission: "read" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const publicLink = res.data.shareLink;
      await navigator.clipboard.writeText(publicLink);
      toast.success("Folder share link copied!", { icon: <Share2 /> });
    } catch (err) {
      toast.error("Failed to create folder share link");
    }
  };

  const shareDrive = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/share/drive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const publicLink = res.data.shareLink;
      await navigator.clipboard.writeText(publicLink);
      toast.success("Drive share link copied!", { icon: <Cloud /> });
    } catch (err) {
      toast.error("Failed to create drive share link");
    }
  };

  // Folder modals
  const openCreateFolderModal = () =>
    setFolderModal({ open: true, mode: "create", initial: "", folderId: null });
  const openRenameFolderModal = (folder) =>
    setFolderModal({
      open: true,
      mode: "rename",
      initial: folder.name,
      folderId: folder.id,
    });

  const handleFolderModalSubmit = async (name) => {
    if (folderModal.mode === "create") {
      await createNewFolder(name);
    } else if (folderModal.mode === "rename") {
      await renameFolder(folderModal.folderId, name);
    }
    setFolderModal({ open: false, mode: null, initial: "", folderId: null });
  };

  const createNewFolder = async (name) => {
    if (!token) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/folders`,
        { name, parent_id: currentFolderId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Folder created!");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchFolders();
      }
    } catch (err) {
      toast.error("Error creating folder.");
    }
  };

  const renameFolder = async (folderId, name) => {
    if (!token) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/folders/${folderId}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Folder renamed.");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchFolders();
      }
    } catch (err) {
      toast.error("Error renaming folder.");
    }
  };

  const deleteFolder = async (folderId) => {
    if (!token) return;
    if (!window.confirm("Delete this folder and its files?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Folder deleted.");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        await Promise.all([fetchFolders(), fetchFiles()]);
      }
    } catch (err) {
      toast.error("Error deleting folder.");
    }
  };

  const moveFileToFolder = async (fileId, folderId) => {
    if (!token) return;
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/files/${fileId}/move`,
        { folderId: folderId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("File moved.");
      if (isSearchMode && searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        fetchFiles();
      }
    } catch (err) {
      toast.error("Error moving file.");
    }
  };

  // Navigation
  const openFolder = async (folder) => {
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery("");
    }
    if (currentFolderId) {
      setFolderStack((prev) => [
        ...prev,
        { id: currentFolderId, name: currentFolderName },
      ]);
    } else {
      setFolderStack((prev) => [...prev, { id: null, name: "My Drive" }]);
    }
    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.name || "Folder");
    setOpenFolderMenuId(null);
  };

  const goBack = () => {
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery("");
      refreshAll();
      return;
    }
    const stack = [...folderStack];
    const prev = stack.pop();
    setFolderStack(stack);
    setCurrentFolderId(prev ? prev.id : null);
    setCurrentFolderName(prev ? prev.name : "My Drive");
  };

  const goHome = () => {
    setFolderStack([]);
    setCurrentFolderId(null);
    setCurrentFolderName("My Drive");
    if (isSearchMode) {
      setIsSearchMode(false);
      setSearchQuery("");
    }
  };

  // File preview helpers
  const renderFilePreview = (f) => {
    if (f.preview_url) {
      if (f.mime_type?.startsWith("image/")) {
        return (
          <img
            src={f.preview_url}
            alt={f.name}
            className="w-full h-full object-cover rounded-lg"
          />
        );
      } else if (f.mime_type === "application/pdf") {
        return (
          <div className="flex flex-col items-center justify-center h-full bg-red-500/20 text-red-300">
            <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-center px-1">PDF</span>
          </div>
        );
      }
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-500/20 text-slate-300">
        <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2-2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs text-center px-1">FILE</span>
      </div>
    );
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";
    return "📎";
  };

  return {
    // State
    user,
    files,
    folders,
    uploading,
    loading,
    file,
    storageUsed,
    openMenuId,
    openFolderMenuId,
    viewMode,
    showUploadModal,
    fileInputRef,
    folderModal,
    searchQuery,
    searching,
    isSearchMode,
    currentFolderId,
    folderStack,
    currentFolderName,

    // Setters
    setFile,
    setOpenMenuId,
    setOpenFolderMenuId,
    setViewMode,
    setShowUploadModal,
    setSearchQuery,
    setFolderModal,

    // Actions
    handleUpload,
    handleDelete,
    renameFile,
    shareFile,
    shareFolder,
    shareDrive,
    openCreateFolderModal,
    openRenameFolderModal,
    handleFolderModalSubmit,
    deleteFolder,
    moveFileToFolder,
    openFolder,
    goBack,
    goHome,
    refreshAll,
    performSearch,
    searchFilesAndFolders,
    signOut,

    // Helpers
    formatBytes,
    formatDate,
    renderFilePreview,
    getFileIcon,
  };
}
