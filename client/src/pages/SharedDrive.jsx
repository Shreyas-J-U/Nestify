import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Cloud,
  FileText,
  Eye,
  Download,
  User,
  Shield,
  Calendar,
  FolderOpen,
  Image,
  Share2,
  ArrowLeft,
  Grid3X3,
  List,
  Search,
  AlertCircle,
  HardDrive,
  Video,
  Music,
  Archive,
  Code,
  MoreHorizontal,
} from "lucide-react";

export default function SharedDrive() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [permission, setPermission] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [showStats, setShowStats] = useState(true);
  const [openFileMenuId, setOpenFileMenuId] = useState(null);

  useEffect(() => {
    const fetchSharedDrive = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/share/drive/${token}`
        );
        const filesData = res.data.files || [];
        setFiles(filesData);
        setFilteredFiles(filesData);
        setPermission(res.data.permission || "read");
        setOwner(res.data.owner || null);
      } catch (err) {
        console.error("Error accessing shared drive:", err);
        setError(err.response?.data?.message || "Failed to access shared drive");
      } finally {
        setLoading(false);
      }
    };
    fetchSharedDrive();
  }, [token]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [searchQuery, files]);
  // Mobile stats hide
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 640) {
        setShowStats(window.scrollY < 40);
      } else {
        setShowStats(true);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 640) setShowStats(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const formatFileSize = (bytes) => {
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
      day: 'numeric'
    });
  };

  const getFileIcon = (mimeType, size = "w-8 h-8") => {
    if (mimeType?.startsWith("image/")) return <Image className={`${size} text-emerald-500`} />;
    if (mimeType?.includes("pdf")) return <FileText className={`${size} text-red-500`} />;
    if (mimeType?.startsWith("video/")) return <Video className={`${size} text-purple-500`} />;
    if (mimeType?.startsWith("audio/")) return <Music className={`${size} text-blue-500`} />;
    if (mimeType?.includes("zip") || mimeType?.includes("rar")) return <Archive className={`${size} text-orange-500`} />;
    if (
      mimeType?.includes("javascript") ||
      mimeType?.includes("html") ||
      mimeType?.includes("css")
    ) {
      return <Code className={`${size} text-green-500`} />;
    }
    return <FileText className={`${size} text-slate-500`} />;
  };

  const getFileTypeColor = (mimeType) => {
    if (mimeType?.startsWith("image/")) return "from-emerald-400 to-teal-500";
    if (mimeType?.includes("pdf")) return "from-red-400 to-rose-500";
    if (mimeType?.startsWith("video/")) return "from-purple-400 to-pink-500";
    if (mimeType?.startsWith("audio/")) return "from-blue-400 to-indigo-500";
    return "from-slate-400 to-slate-500";
  };

  const getFileEmoji = (mimeType) => {
    if (mimeType?.startsWith("image/")) return "🖼️";
    if (mimeType?.includes("pdf")) return "📄";
    if (mimeType?.startsWith("video/")) return "🎥";
    if (mimeType?.startsWith("audio/")) return "🎵";
    if (mimeType?.includes("zip")) return "📦";
    return "📎";
  };

  const renderFilePreview = (file) => {
    if (file.preview_url && file.mime_type?.startsWith("image/")) {
      return (
        <img
          src={file.preview_url}
          alt={file.name}
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-gradient-to-br ${getFileTypeColor(file.mime_type)} rounded-lg`}>
        <div className="text-white/90 text-center">
          {getFileIcon(file.mime_type, "w-12 h-12")}
          <span className="text-xs mt-2 px-2 font-medium text-white/80 truncate block max-w-full">
            {file.name?.split('.').pop()?.toUpperCase() || 'FILE'}
          </span>
        </div>
      </div>
    );
  };

  const handleDownload = async (file) => {
    if (!file.id) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/share/drive/${token}/download/${file.id}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">Loading shared drive...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }
  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
  const fileTypeStats = files.reduce((acc, file) => {
    const type = file.mime_type?.split('/')[0] || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Shared Drive</h1>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    {owner?.name || owner?.email || "Unknown"} • {permission} access
                  </p>
                </div>
              </div>
            </div>
            
            {/* View Controls & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 text-sm"
                />
              </div>
              <div className="flex items-center bg-slate-100 rounded-lg p-1 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-slate-200"
                    }`}
                >
                  <Grid3X3 className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                      viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-slate-200"
                    }`}
                >
                  <List className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats - Hide on mobile scroll */}
      <div
        className={`
          sticky top-0 z-10 transition-all duration-300 ease-in-out
          ${showStats ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"}
          sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto
        `}
      >
        <div className="bg-white/60 backdrop-blur-sm border-b border-white/30">
          <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Total Files</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-800">{files.length}</p>
                  </div>
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Total Size</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-800">{formatFileSize(totalSize)}</p>
                  </div>
                  <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Images</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-800">{fileTypeStats.image || 0}</p>
                  </div>
                  <Image className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                </div>
              </div>
              <div className="bg-white/60 rounded-xl p-3 sm:p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-600">Documents</p>
                    <p className="text-lg sm:text-xl font-bold text-slate-800">{fileTypeStats.application || 0}</p>
                  </div>
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2">
              {searchQuery ? "No files found" : "No files shared"}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 px-4">
              {searchQuery 
                ? `No files match "${searchQuery}"`
                : "This shared drive doesn't contain any files yet"
              }
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 relative"
              >
                {/* Mobile three-dot menu */}
                <div className="absolute top-2 right-2 z-30 sm:hidden">
                  <button
                    className="p-1 rounded-lg bg-white shadow border border-slate-200 hover:bg-slate-100 focus:outline-none"
                    onClick={e => {
                      e.stopPropagation();
                      setOpenFileMenuId(openFileMenuId === file.id ? null : file.id);
                    }}
                  >
                    <MoreHorizontal className="w-4 h-4 text-slate-600" />
                  </button>
                  {openFileMenuId === file.id && (
                    <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 z-50 min-w-[120px]">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                        onClick={() => {
                          window.open(file.preview_url || "#", "_blank");
                          setOpenFileMenuId(null);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2 inline" /> Preview
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-b-lg"
                        onClick={() => {
                          handleDownload(file);
                          setOpenFileMenuId(null);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2 inline" /> Download
                      </button>
                    </div>
                  )}
                </div>
                {/* Preview */}
                <div className="aspect-square p-2 sm:p-3 md:p-4">
                  <div className="w-full h-full relative">
                    {renderFilePreview(file)}
                    {/* Hover overlay on desktop/tablet only */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2 rounded-lg sm:flex">
                      <button
                        onClick={() => window.open(file.preview_url || "#", "_blank")}
                        className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Preview file"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 sm:p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* File info */}
                <div className="p-2 sm:p-3 md:p-4 pt-0">
                  <h3 className="font-medium text-slate-800 text-xs sm:text-sm truncate mb-1">{file.name}</h3>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50 overflow-x-auto">
            <div className="grid grid-cols-12 gap-4 p-3 sm:p-4 bg-white/50 border-b border-slate-200 text-xs sm:text-sm font-medium text-slate-600 min-w-[600px]">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-2">Actions</div>
            </div>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="grid grid-cols-12 gap-4 p-3 sm:p-4 border-b border-slate-100 hover:bg-white/50 transition-colors min-w-[600px]"
              >
                <div className="col-span-6 flex items-center space-x-2 sm:space-x-3">
                  <span className="text-lg sm:text-2xl">{getFileEmoji(file.mime_type)}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 text-xs sm:text-sm truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{file.mime_type}</p>
                  </div>
                </div>
                <div className="col-span-2 flex items-center text-slate-600 text-xs sm:text-sm">
                  {formatFileSize(file.size)}
                </div>
                <div className="col-span-2 flex items-center text-slate-600 text-xs sm:text-sm">
                  {formatDate(file.created_at)}
                </div>
                <div className="col-span-2 flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => window.open(file.preview_url || "#", "_blank")}
                    className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1.5 sm:p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
