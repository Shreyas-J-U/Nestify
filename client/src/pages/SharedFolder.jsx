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
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getFilePreview = (file) => {
    const previewUrl = `${import.meta.env.VITE_API_URL}/share/folder/${token}/file/${file.id}/preview`;
    
    if (file.mime_type?.startsWith("image/")) {
      return (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    } else if (file.mime_type === "application/pdf") {
      return (
        <iframe
          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-0"
          title={file.name}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    } else if (file.mime_type?.startsWith("video/")) {
      return (
        <video
          src={previewUrl}
          className="w-full h-full object-cover"
          controls={false}
          muted
          preload="metadata"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    return null;
  };

  const openSubfolder = (subfolder) => {
    setCurrentPath(prev => [...prev, { id: currentFolderId, name: folder?.name || "Folder" }]);
    setCurrentFolderId(subfolder.id);
    setFolder(subfolder);
    setMobileMenuOpen(false);
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

  const downloadFile = (file) => {
    const downloadUrl = `${import.meta.env.VITE_API_URL}/share/folder/${token}/file/${file.id}/download`;
    window.open(downloadUrl, '_blank');
  };

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
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium text-center">Loading shared folder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
          <p className="text-slate-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl">
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-800 truncate">
                    {folder?.name || "Shared Folder"}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {permission === "read" ? "View Only" : "Full Access"}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <button
                onClick={copyShareLink}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden lg:inline">Share</span>
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden lg:inline">Visit Site</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={copyShareLink}
                  className="flex items-center space-x-2 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors w-full text-left"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
                
                <button
                  onClick={() => {
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full text-left"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Site</span>
                </button>
              </div>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center space-x-1 sm:space-x-2 mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 overflow-x-auto pb-2">
            <button
              onClick={goToRoot}
              className="hover:text-slate-800 transition-colors flex-shrink-0"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {currentPath.map((pathItem, index) => (
              <span key={index} className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <span>/</span>
                <span className="truncate max-w-[100px] sm:max-w-none">{pathItem.name}</span>
              </span>
            ))}
            {currentPath.length > 0 && (
              <>
                <span className="flex-shrink-0">/</span>
                <span className="font-medium text-slate-800 truncate max-w-[120px] sm:max-w-none">
                  {folder?.name}
                </span>
                <button
                  onClick={goBack}
                  className="ml-1 sm:ml-2 p-1 hover:bg-slate-100 rounded transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Files</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">{files.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mt-2 sm:mt-0 w-fit">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Folders</p>
                <p className="text-lg sm:text-2xl font-bold text-slate-800">{subfolders.length}</p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg mt-2 sm:mt-0 w-fit">
                <Folder className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Size</p>
                <p className="text-sm sm:text-2xl font-bold text-slate-800 leading-tight">
                  {formatBytes(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg mt-2 sm:mt-0 w-fit">
                <Cloud className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Subfolders */}
        {subfolders.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Folders</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {subfolders.map((subfolder) => (
                <div
                  key={subfolder.id}
                  className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                  onDoubleClick={() => openSubfolder(subfolder)}
                  onClick={() => openSubfolder(subfolder)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg mb-2 sm:mb-3 group-hover:bg-yellow-200 transition-colors">
                      <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 truncate w-full">
                      {subfolder.name}
                    </p>
                    {subfolder.created_at && (
                      <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                        {formatDate(subfolder.created_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">Files</h2>
          {files.length === 0 && subfolders.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-2">Empty Folder</h3>
              <p className="text-slate-600 text-sm sm:text-base px-4">This folder doesn't contain any files or subfolders.</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Cloud className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-slate-600 text-sm sm:text-base">No files in this folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg sm:rounded-xl border border-slate-200 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* File Preview */}
                  <div className="aspect-square bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                    {getFilePreview(file)}
                    <div 
                      className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl"
                      style={{ display: getFilePreview(file) ? 'none' : 'flex' }}
                    >
                      {getFileIcon(file.mime_type)}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-medium text-slate-800 truncate mb-2 text-sm sm:text-base">
                      {file.name}
                    </h3>
                    <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
                      <span>{formatBytes(file.size)}</span>
                      {file.updated_at && (
                        <span className="hidden sm:inline">{formatDate(file.updated_at)}</span>
                      )}
                    </div>

                    {/* File Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => previewFile(file)}
                        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => downloadFile(file)}
                        className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 p-2 bg-green-500 text-white rounded-lg hover:green-600 transition-colors text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-200">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Shared with {permission} permission</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
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
