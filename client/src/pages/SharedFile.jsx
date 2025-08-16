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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-700 rounded-full mb-4" />
          <div>
            <span className="text-lg font-semibold text-gray-900">Loading</span>
            <span className="ml-2 text-blue-500 font-medium animate-pulse">file...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-md rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <div className="mb-3 text-lg text-red-500 font-semibold">File not found</div>
          <div className="mb-6 text-slate-600">{error}</div>
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 border border-gray-300 rounded hover:bg-blue-50 text-slate-700 transition"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <Cloud className="w-6 h-6 text-blue-500" />
            <span className="font-semibold text-slate-800 text-lg">Nestify</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
        </div>

        {/* Card */}
        <div className={`rounded-2xl shadow-lg border border-slate-100 p-7 bg-white mb-8`}>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Icon */}
            <div className={`flex items-center justify-center ${getAccentBg(file.mime_type)} rounded-xl w-24 h-24`}>
              {getFileIcon(file.mime_type)}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-3">
              <div className="text-xl font-bold text-slate-900 mb-1 break-words">{file.original_name}</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700">
                <div className="font-medium">Type:</div>
                <div className="text-right">{file.mime_type || "-"}</div>
                <div className="font-medium">Size:</div>
                <div className="text-right">{formatFileSize(file.size)}</div>
                <div className="font-medium">Uploaded:</div>
                <div className="text-right">{formatDate(file.created_at)}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href={downloadUrl}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                {isViewable && (
                  <a
                    href={inlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-blue-100 rounded text-blue-700 font-semibold transition"
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
          <div className="rounded-xl border border-slate-100 bg-white shadow p-4 mb-6">
            {file.mime_type?.startsWith("image/") && (
              <img src={inlineUrl} alt={file.original_name} className="w-full h-auto rounded" />
            )}
            {file.mime_type?.includes("pdf") && (
              <iframe
                src={inlineUrl}
                title={file.original_name}
                className="w-full h-96 rounded border"
              />
            )}
            {file.mime_type?.startsWith("text/") && (
              <iframe
                src={inlineUrl}
                title={file.original_name}
                className="w-full h-64 rounded border bg-gray-50"
              />
            )}
          </div>
        )}

        {/* Security Info */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-green-700 font-medium text-sm">Securely shared via Nestify</span>
        </div>
      </div>
    </div>
  );
}
