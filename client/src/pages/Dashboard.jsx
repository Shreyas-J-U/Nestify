import { useEffect, useState, useRef } from "react";
import {
  Cloud,
  Upload,
  Trash2,
  FileText,
  Folder,
  User,
  RefreshCw,
  Share2,
  Eye,
  MoreHorizontal,
  Search,
  ArrowLeft,
  Home,
  LogOut,
  HardDrive,
  Grid3X3,
  List,
  FolderPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function FolderModal({ open, onClose, onSubmit, initial = "", label }) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(initial);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initial]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{label}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value && value.trim()) {
              onSubmit(value.trim());
            }
          }}
        >
          <input
            ref={inputRef}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Folder name"
            maxLength={64}
            autoFocus
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={!value.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();
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
    mode: null, // "create" | "rename"
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

  // API Calls ------------------------------------------------------
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
    // eslint-disable-next-line
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

  // NEW: SHARE WITH TOAST
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

  // Folder modals for creation & rename
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
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/folders/${folderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  // File preview
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
            <FileText className="w-8 h-8 mb-2" />
            <span className="text-xs text-center px-1">PDF</span>
          </div>
        );
      }
    }
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-500/20 text-slate-300">
        <FileText className="w-8 h-8 mb-2" />
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

  if (!user) return null;

  if (loading && files.length === 0 && folders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Loading your drive...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        limit={4}
      />
      <FolderModal
        open={folderModal.open}
        onClose={() =>
          setFolderModal({
            open: false,
            mode: null,
            initial: "",
            folderId: null,
          })
        }
        onSubmit={handleFolderModalSubmit}
        initial={folderModal.initial}
        label={
          folderModal.mode === "create" ? "Create New Folder" : "Rename Folder"
        }
      />
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-30">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">CloudDrive</h1>
          </div>

          {/* User Profile */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload File</span>
            </button>
            <button
              onClick={openCreateFolderModal}
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              <span>New Folder</span>
            </button>
            <button
              onClick={shareDrive}
              className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Drive</span>
            </button>
          </nav>

          {/* Storage Info */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">
                Storage Usage
              </span>
              <HardDrive className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-3">
              {/* Progress bar container */}
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out relative"
                    style={{
                      width: `${Math.min(
                        (storageUsed / (100 * 1024 * 1024)) * 100,
                        100
                      )}%`, // 100MB limit
                    }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>

                {/* Percentage label on the bar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-700">
                    {Math.round((storageUsed / (100 * 1024 * 1024)) * 100)}%
                  </span>
                </div>
              </div>

              {/* Storage details */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  {formatBytes(storageUsed)} used
                </span>
                <span className="text-slate-500">of 100MB</span>
              </div>

              {/* Warning message for high usage */}
              {storageUsed / (100 * 1024 * 1024) > 0.8 && (
                <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Storage almost full</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200">
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2">
                {(currentFolderId || isSearchMode) && (
                  <button
                    onClick={goBack}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                )}
                {currentFolderId && !isSearchMode && (
                  <button
                    onClick={goHome}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Home className="w-4 h-4 text-slate-600" />
                  </button>
                )}
                <div className="flex items-center space-x-1 text-sm text-slate-600">
                  {isSearchMode ? (
                    <span>Search results for "{searchQuery}"</span>
                  ) : (
                    <>
                      {folderStack.map((folder, index) => (
                        <span key={index}>
                          {folder.name} <span className="mx-1">/</span>
                        </span>
                      ))}
                      <span className="font-medium text-slate-800">
                        {currentFolderName}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Search and Actions */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      searchFilesAndFolders(val);
                    }}
                    className="pl-10 pr-4 py-2 w-80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searching && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                  )}
                </div>
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : "hover:bg-slate-200"
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm"
                        : "hover:bg-slate-200"
                    }`}
                  >
                    <List className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                {/* Refresh */}
                <button
                  onClick={() => {
                    if (isSearchMode && searchQuery.trim()) {
                      performSearch(searchQuery);
                    } else {
                      refreshAll();
                    }
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Content Area */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Files
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {files.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Folders
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {folders.length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Folder className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Storage Used
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {formatBytes(storageUsed)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <HardDrive className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Folders
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="relative group bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                    onDoubleClick={() => openFolder(folder)}
                    onDrop={(e) => {
                      const fileId = e.dataTransfer.getData("fileId");
                      if (fileId) moveFileToFolder(fileId, folder.id);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 bg-yellow-100 rounded-lg mb-3">
                        <Folder className="w-8 h-8 text-yellow-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate w-full">
                        {folder.name}
                      </p>
                    </div>
                    {/* Folder Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFolderMenuId(
                            openFolderMenuId === folder.id ? null : folder.id
                          );
                        }}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                      </button>
                      {openFolderMenuId === folder.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                          <button
                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg"
                            onClick={() => {
                              openFolder(folder);
                              setOpenFolderMenuId(null);
                            }}
                          >
                            Open Folder
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              shareFolder(folder);
                              setOpenFolderMenuId(null);
                            }}
                          >
                            <Share2 className="w-4 h-4 inline mr-2" />
                            Share Folder
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              openRenameFolderModal(folder);
                              setOpenFolderMenuId(null);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                            onClick={() => {
                              deleteFolder(folder.id);
                              setOpenFolderMenuId(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Files Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Files</h2>
            {files.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  No files yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Upload your first file to get started
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Upload File
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="relative group bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("fileId", f.id);
                    }}
                  >
                    {/* File Preview */}
                    <div className="aspect-square p-4">
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        {renderFilePreview(f)}
                      </div>
                    </div>
                    {/* File Info */}
                    <div className="p-4 pt-0">
                      <p className="text-sm font-medium text-slate-800 truncate mb-1">
                        {f.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(f.size)}
                      </p>
                    </div>
                    {/* File Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === f.id ? null : f.id)
                        }
                        className="p-1 bg-white/80 hover:bg-white rounded-lg shadow-sm transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                      </button>
                      {openMenuId === f.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                          <button
                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg"
                            onClick={() =>
                              window.open(f.preview_url || "#", "_blank")
                            }
                          >
                            <Eye className="w-4 h-4 inline mr-2" />
                            Preview
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => shareFile(f)}
                          >
                            <Share2 className="w-4 h-4 inline mr-2" />
                            Share
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              setOpenMenuId(null);
                              // Open input modal for renaming
                              setTimeout(() => {
                                renameFile(
                                  f.id,
                                  prompt("Enter new name", f.name)
                                );
                              }, 0);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                            onClick={() => {
                              handleDelete(f.id);
                              setOpenMenuId(null);
                            }}
                          >
                            <Trash2 className="w-4 h-4 inline mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Quick Actions */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() =>
                            window.open(f.preview_url || "#", "_blank")
                          }
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => shareFile(f)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-3">Modified</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {files.map((f) => (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("fileId", f.id);
                    }}
                  >
                    <div className="col-span-6 flex items-center space-x-3">
                      <span className="text-lg">
                        {getFileIcon(f.mime_type)}
                      </span>
                      <span className="font-medium text-slate-800 truncate">
                        {f.name}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center text-slate-600">
                      {formatBytes(f.size)}
                    </div>
                    <div className="col-span-3 flex items-center text-slate-600">
                      {f.updated_at ? formatDate(f.updated_at) : "—"}
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === f.id ? null : f.id)
                        }
                        className="p-1 hover:bg-slate-200 rounded transition-colors relative"
                      >
                        <MoreHorizontal className="w-4 h-4 text-slate-600" />
                        {openMenuId === f.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                            <button
                              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg"
                              onClick={() =>
                                window.open(f.preview_url || "#", "_blank")
                              }
                            >
                              <Eye className="w-4 h-4 inline mr-2" />
                              Preview
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => shareFile(f)}
                            >
                              <Share2 className="w-4 h-4 inline mr-2" />
                              Share
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                              onClick={() => {
                                setOpenMenuId(null);
                                setTimeout(() => {
                                  renameFile(
                                    f.id,
                                    prompt("Enter new name", f.name)
                                  );
                                }, 0);
                              }}
                            >
                              Rename
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                              onClick={() => {
                                handleDelete(f.id);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 className="w-4 h-4 inline mr-2" />
                              Delete
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleUpload(null, e.target.files?.[0])}
      />
      {/* Upload Modal could be converted to a controlled modal in a similar way */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Upload File
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="hidden"
                id="upload-input"
              />
              <label
                htmlFor="upload-input"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Choose File
              </label>
            </div>
            {file && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800">
                  {file.name}
                </p>
                <p className="text-xs text-slate-600">
                  {formatBytes(file.size)}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpload()}
                disabled={!file || uploading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !file || uploading
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
