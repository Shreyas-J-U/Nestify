import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Download,
  File,
  HardDrive,
  Eye,
  FileText,
  Image,
  FileType,
  Calendar,
  Cloud,
  Sparkles,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Video,
  Music,
  Archive,
  Code
} from "lucide-react";

export default function SharedFile() {
  const token = window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/share/${token}`);
        setFile(res.data.resource);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load shared file");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSharedFile();
  }, [token]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  const getFileIcon = (mimeType, size = "w-9 h-9") => {
    if (mimeType?.startsWith("image/")) return <Image className={`${size} text-blue-500`} />;
    if (mimeType?.startsWith("text/")) return <FileText className={`${size} text-orange-500`} />;
    if (mimeType?.includes("pdf")) return <FileType className={`${size} text-red-500`} />;
    if (mimeType?.startsWith("video/")) return <Video className={`${size} text-purple-500`} />;
    if (mimeType?.startsWith("audio/")) return <Music className={`${size} text-indigo-500`} />;
    if (mimeType?.includes("zip") || mimeType?.includes("rar")) return <Archive className={`${size} text-pink-500`} />;
    if (mimeType?.includes("javascript") || mimeType?.includes("html")) return <Code className={`${size} text-green-500`} />;
    return <File className={`${size} text-gray-400`} />;
  };

  const getAccentBg = (mimeType) => {
    if (mimeType?.startsWith("image/")) return "bg-blue-50";
    if (mimeType?.startsWith("text/")) return "bg-orange-50";
    if (mimeType?.includes("pdf")) return "bg-red-50";
    if (mimeType?.startsWith("video/")) return "bg-purple-50";
    if (mimeType?.startsWith("audio/")) return "bg-indigo-50";
    return "bg-gray-50";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="animate-spin w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-700 rounded-full mb-4" />
          <div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">Loading</span>
            <span className="ml-2 text-blue-500 font-medium animate-pulse">file...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-md rounded-2xl p-6 sm:p-8 text-center">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3" />
          <div className="mb-3 text-lg text-red-500 font-semibold">File not found</div>
          <div className="mb-6 text-slate-600 text-sm sm:text-base">{error}</div>
          <div className="flex flex-col sm:flex-row justify-center gap-2 mt-2">
            <button
              onClick={() => navigate("/")}
              className="px-4 sm:px-5 py-2 bg-blue-600 text-white text-sm sm:text-base rounded hover:bg-blue-700 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 sm:px-5 py-2 border border-gray-300 rounded hover:bg-blue-50 text-slate-700 text-sm sm:text-base transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!file) return null;

  const downloadUrl = `${import.meta.env.VITE_API_URL}/share/file/${token}/download`;
  const inlineUrl = `${import.meta.env.VITE_API_URL}/share/file/${token}/inline`;
  const isViewable =
    file.mime_type?.startsWith("image/") ||
    file.mime_type?.startsWith("text/") ||
    file.mime_type?.includes("pdf");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="max-w-xl mx-auto w-full px-4 sm:px-6">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-6 sm:mb-8 border-b border-slate-100 pb-4">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <span className="font-semibold text-slate-800 text-base sm:text-lg">Nestify</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:underline text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Home</span>
          </button>
        </div>

        {/* Card */}
        <div className={`rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-6 lg:p-7 bg-white mb-6 sm:mb-8`}>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Icon */}
            <div className={`flex items-center justify-center ${getAccentBg(file.mime_type)} rounded-xl w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto sm:mx-0 flex-shrink-0`}>
              {getFileIcon(file.mime_type, "w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9")}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 sm:gap-3">
              <div className="text-lg sm:text-xl font-bold text-slate-900 mb-1 break-words text-center sm:text-left">
                {file.original_name}
              </div>
              
              {/* Mobile: Vertical layout */}
              <div className="block sm:hidden space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="truncate ml-2">{file.mime_type || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Size:</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Uploaded:</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>

              {/* Desktop: Grid layout */}
              <div className="hidden sm:grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700">
                <div className="font-medium">Type:</div>
                <div className="text-right truncate">{file.mime_type || "-"}</div>
                <div className="font-medium">Size:</div>
                <div className="text-right">{formatFileSize(file.size)}</div>
                <div className="font-medium">Uploaded:</div>
                <div className="text-right">{formatDate(file.created_at)}</div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 w-full">
                <a
                  href={downloadUrl}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition text-sm sm:text-base"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                {isViewable && (
                  <a
                    href={inlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 bg-slate-100 hover:bg-blue-100 rounded text-blue-700 font-semibold transition text-sm sm:text-base"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inline Preview */}
        {isViewable && (
          <div className="rounded-lg sm:rounded-xl border border-slate-100 bg-white shadow p-3 sm:p-4 mb-4 sm:mb-6">
            {file.mime_type?.startsWith("image/") && (
              <img 
                src={inlineUrl} 
                alt={file.original_name} 
                className="w-full h-auto rounded max-h-[60vh] object-contain" 
              />
            )}
            {file.mime_type?.includes("pdf") && (
              <iframe
                src={inlineUrl}
                title={file.original_name}
                className="w-full h-64 sm:h-80 lg:h-96 rounded border"
              />
            )}
            {file.mime_type?.startsWith("text/") && (
              <iframe
                src={inlineUrl}
                title={file.original_name}
                className="w-full h-48 sm:h-64 rounded border bg-gray-50"
              />
            )}
          </div>
        )}

        {/* Security Info */}
        <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          <span className="text-green-700 font-medium text-xs sm:text-sm">Securely shared via Nestify</span>
        </div>
      </div>
    </div>
  );
}
