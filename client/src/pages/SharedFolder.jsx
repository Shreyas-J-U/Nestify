import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Cloud,
  Folder,
  FileText,
  Download,
  Eye,
  ArrowLeft,
  Home,
  Share2,
  Calendar,
  User,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

export default function SharedFolder() {
  const { token } = useParams();
  const navigate = useNavigate();

  // State
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("read");
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);

  useEffect(() => {
    fetchSharedFolder();
  }, [token, currentFolderId]);

  const fetchSharedFolder = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = currentFolderId 
        ? `${import.meta.env.VITE_API_URL}/share/folder/${token}/contents?folderId=${currentFolderId}`
        : `${import.meta.env.VITE_API_URL}/share/folder/${token}/contents`;

      const res = await axios.get(url);
      
      setFolder(res.data.folder);
      setFiles(res.data.files || []);
      setSubfolders(res.data.subfolders || []);
      setPermission(res.data.permission || "read");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to load shared folder";
      setError(errorMessage);
      
      if (err.response?.status === 404) {
        setError("This shared folder link is invalid or has been removed.");
      } else if (err.response?.status === 410) {
        setError("This shared folder link has expired.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType === "application/pdf") return "📄";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";
    if (mimeType?.includes("zip") || mimeType?.includes("rar")) return "📦";
    if (mimeType?.includes("word")) return "📝";
    if (mimeType?.includes("excel") || mimeType?.includes("sheet")) return "📊";
    if (mimeType?.includes("powerpoint") || mimeType?.includes("presentation")) return "📽️";
    return "📎";
  };

  const openSubfolder = (subfolder) => {
    setCurrentPath(prev => [...prev, { id: currentFolderId, name: folder?.name || "Folder" }]);
    setCurrentFolderId(subfolder.id);
    setFolder(subfolder);
  };

  const goBack = () => {
    if (currentPath.length > 0) {
      const previousPath = [...currentPath];
      const previous = previousPath.pop();
      setCurrentPath(previousPath);
      setCurrentFolderId(previous?.id || null);
    }
  };

  const goToRoot = () => {
    setCurrentPath([]);
    setCurrentFolderId(null);
  };

  // FIXED: Direct file download using new backend endpoint
  const downloadFile = (file) => {
    const downloadUrl = `${import.meta.env.VITE_API_URL}/share/folder/${token}/file/${file.id}/download`;
    window.open(downloadUrl, '_blank');
  };

  // FIXED: Direct file preview using new backend endpoint
  const previewFile = (file) => {
    const previewUrl = `${import.meta.env.VITE_API_URL}/share/folder/${token}/file/${file.id}/preview`;
    window.open(previewUrl, '_blank');
  };

  const copyShareLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/share/folder/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      alert("✅ Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy share link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading shared folder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Folder className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    {folder?.name || "Shared Folder"}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {permission === "read" ? "View Only" : "Full Access"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={copyShareLink}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Visit Site</span>
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mt-4 text-sm text-slate-600">
            <button
              onClick={goToRoot}
              className="hover:text-slate-800 transition-colors"
            >
              <Home className="w-4 h-4" />
            </button>
            {currentPath.map((pathItem, index) => (
              <span key={index} className="flex items-center space-x-2">
                <span>/</span>
                <span>{pathItem.name}</span>
              </span>
            ))}
            {currentPath.length > 0 && (
              <>
                <span>/</span>
                <span className="font-medium text-slate-800">{folder?.name}</span>
                <button
                  onClick={goBack}
                  className="ml-2 p-1 hover:bg-slate-100 rounded transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Files</p>
                <p className="text-2xl font-bold text-slate-800">{files.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Subfolders</p>
                <p className="text-2xl font-bold text-slate-800">{subfolders.length}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Folder className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Size</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatBytes(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Cloud className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Subfolders */}
        {subfolders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Folders</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subfolders.map((subfolder) => (
                <div
                  key={subfolder.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                  onDoubleClick={() => openSubfolder(subfolder)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-3 bg-yellow-100 rounded-lg mb-3 group-hover:bg-yellow-200 transition-colors">
                      <Folder className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate w-full">
                      {subfolder.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {subfolder.created_at && formatDate(subfolder.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Files</h2>
          {files.length === 0 && subfolders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Folder className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-medium text-slate-800 mb-2">Empty Folder</h3>
              <p className="text-slate-600">This folder doesn't contain any files or subfolders.</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <Cloud className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No files in this folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-slate-50 flex items-center justify-center p-8">
                    {file.mime_type?.startsWith("image/") && file.preview_url ? (
                      <img
                        src={file.preview_url}
                        alt={file.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-6xl">
                        {getFileIcon(file.mime_type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-slate-800 truncate mb-2">
                      {file.name}
                    </h3>
                    <div className="flex justify-between items-center text-sm text-slate-600 mb-4">
                      <span>{formatBytes(file.size)}</span>
                      {file.updated_at && (
                        <span>{formatDate(file.updated_at)}</span>
                      )}
                    </div>

                    {/* File Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => previewFile(file)}
                        className="flex-1 flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        className="flex-1 flex items-center justify-center space-x-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>Shared with {permission} permission</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>
                Accessed on {formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
