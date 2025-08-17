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
  Menu,
  X,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FolderModal from "./components/FolderModal";
import { useState } from "react";

export default function DashboardUI(props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // State for rename/delete dialogs
  const [renameDialog, setRenameDialog] = useState({
    open: false,
    type: null,
    target: null,
    value: "",
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null,
    target: null,
  });

  // State for mobile search modal
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const {
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
    setFile,
    setOpenMenuId,
    setOpenFolderMenuId,
    setViewMode,
    setShowUploadModal,
    setSearchQuery,
    setFolderModal,
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
    formatBytes,
    formatDate,
    renderFilePreview,
    getFileIcon,
  } = props;

  if (!user) return null;

  // Fixed loading condition
  if (loading && files.length === 0 && folders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16">
            <div className="absolute inset-0 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 text-base sm:text-lg font-medium text-center">
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
        className="!mt-16 sm:!mt-4"
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

      {/* Upload Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl mx-4 max-w-sm w-full text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-blue-200 border-b-transparent rounded-full animate-spin animate-reverse" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Uploading File
            </h3>
            <p className="text-slate-600 mb-4">
              Please wait while we upload your file...
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <Upload className="w-4 h-4 animate-bounce" />
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 sm:w-72 bg-white border-r border-slate-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:z-30`}
      >
        <div className="p-4 sm:p-6">
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                CloudDrive
              </h1>
            </div>
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* User Profile */}
          <div className="bg-slate-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                  {user.user_metadata?.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => {
                fileInputRef.current?.click();
                setSidebarOpen(false);
              }}
              disabled={uploading}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors text-sm sm:text-base ${
                uploading 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium">
                {uploading ? "Uploading..." : "Upload File"}
              </span>
            </button>
            <button
              onClick={() => {
                openCreateFolderModal();
                setSidebarOpen(false);
              }}
              disabled={uploading}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors text-sm sm:text-base ${
                uploading 
                  ? "text-slate-400 cursor-not-allowed" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FolderPlus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => {
                shareDrive();
                setSidebarOpen(false);
              }}
              disabled={uploading}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors text-sm sm:text-base ${
                uploading 
                  ? "text-slate-400 cursor-not-allowed" 
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Share Drive</span>
            </button>
          </nav>

          {/* Storage Info */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Storage Usage
              </span>
              <HardDrive className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out relative"
                    style={{
                      width: `${Math.min(
                        (storageUsed / (100 * 1024 * 1024)) * 100,
                        100
                      )}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-slate-700">
                    {Math.round(
                      (storageUsed / (100 * 1024 * 1024)) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  {formatBytes(storageUsed)} used
                </span>
                <span className="text-slate-500">of 100MB</span>
              </div>
              {storageUsed / (100 * 1024 * 1024) > 0.8 && (
                <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                  <svg
                    className="w-3 h-3 flex-shrink-0"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-slate-200">
          <button
            onClick={() => {
              signOut();
              setSidebarOpen(false);
            }}
            disabled={uploading}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl transition-colors text-sm sm:text-base ${
              uploading 
                ? "text-slate-400 cursor-not-allowed" 
                : "text-slate-600 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 xl:ml-72 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button + Breadcrumb */}
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <button
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                  onClick={() => setSidebarOpen(true)}
                  disabled={uploading}
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
                {/* Breadcrumb */}
                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 overflow-x-auto">
                  {(currentFolderId || isSearchMode) && (
                    <button
                      onClick={goBack}
                      disabled={uploading}
                      className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                        uploading ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-100"
                      }`}
                    >
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                    </button>
                  )}
                  {currentFolderId && !isSearchMode && (
                    <button
                      onClick={goHome}
                      disabled={uploading}
                      className={`hidden sm:block p-2 rounded-lg transition-colors flex-shrink-0 ${
                        uploading ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-100"
                      }`}
                    >
                      <Home className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-slate-600 min-w-0">
                    {isSearchMode ? (
                      <span className="truncate">Search: "{searchQuery}"</span>
                    ) : (
                      <>
                        <div className="hidden sm:flex items-center space-x-1">
                          {folderStack.map((folder, index) => (
                            <span key={index} className="flex items-center">
                              <span className="truncate max-w-24">{folder.name}</span>
                              <span className="mx-1">/</span>
                            </span>
                          ))}
                        </div>
                        <span className="font-medium text-slate-800 truncate">
                          {currentFolderName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {/* Search - Hidden on mobile, shown in expanded form on larger screens */}
                <div className="hidden sm:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search files and folders..."
                    value={searchQuery}
                    disabled={uploading}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      searchFilesAndFolders(val);
                    }}
                    className={`pl-10 pr-4 py-2 w-48 lg:w-80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      uploading ? "bg-slate-50 text-slate-400 cursor-not-allowed" : ""
                    }`}
                  />
                  {searching && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                  )}
                </div>

                {/* Mobile Search Button */}
                <button
                  className={`sm:hidden p-2 rounded-lg transition-colors ${
                    uploading ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-100"
                  }`}
                  onClick={() => setShowMobileSearch(true)}
                  disabled={uploading}
                >
                  <Search className="w-5 h-5 text-slate-600" />
                </button>

                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    disabled={uploading}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm"
                        : uploading ? "cursor-not-allowed" : "hover:bg-slate-200"
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    disabled={uploading}
                    className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white shadow-sm"
                        : uploading ? "cursor-not-allowed" : "hover:bg-slate-200"
                    }`}
                  >
                    <List className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
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
                  disabled={uploading}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    uploading ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-100"
                  }`}
                >
                  <RefreshCw className="w-4 h-4 sm:w-4 sm:h-4 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    Total Files
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                    {files.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    Total Folders
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                    {folders.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                  <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600">
                    Storage Used
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                    {formatBytes(storageUsed)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                  <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
                Folders
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`relative group bg-white rounded-xl p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all ${
                      uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                    onClick={() => !uploading && openFolder(folder)}
                    onDrop={(e) => {
                      if (!uploading) {
                        const fileId = e.dataTransfer.getData("fileId");
                        if (fileId) moveFileToFolder(fileId, folder.id);
                      }
                    }}
                    onDragOver={(e) => !uploading && e.preventDefault()}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg mb-2 sm:mb-3">
                        <Folder className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 truncate w-full">
                        {folder.name}
                      </p>
                    </div>
                    {/* Always Visible Triple Dot Menu */}
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!uploading) {
                            setOpenFolderMenuId(
                              openFolderMenuId === folder.id ? null : folder.id
                            );
                          }
                        }}
                        disabled={uploading}
                        className={`p-1 rounded-lg transition-colors bg-white/80 backdrop-blur-sm shadow-sm ${
                          uploading ? "cursor-not-allowed opacity-50" : "hover:bg-slate-100"
                        }`}
                      >
                        <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                      </button>
                      {openFolderMenuId === folder.id && !uploading && (
                        <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg"
                            onClick={() => {
                              openFolder(folder);
                              setOpenFolderMenuId(null);
                            }}
                          >
                            Open Folder
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              shareFolder(folder);
                              setOpenFolderMenuId(null);
                            }}
                          >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                            Share Folder
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              setRenameDialog({
                                open: true,
                                type: "folder",
                                target: folder,
                                value: folder.name,
                              });
                              setOpenFolderMenuId(null);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                            onClick={() => {
                              setDeleteDialog({
                                open: true,
                                type: "folder",
                                target: folder,
                              });
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
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
              Files
            </h2>
            {files.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-2">
                  No files yet
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 px-4">
                  Upload your first file to get started
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg transition-colors ${
                    uploading
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {files.map((f) => (
                  <div
                    key={f.id}
                    className={`relative group bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all ${
                      uploading ? "opacity-50" : ""
                    }`}
                    draggable={!uploading}
                    onDragStart={(e) => {
                      if (!uploading) {
                        e.dataTransfer.setData("fileId", f.id);
                      }
                    }}
                  >
                    {/* File Preview */}
                    <div className="aspect-square p-3 sm:p-4">
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        {renderFilePreview(f)}
                      </div>
                    </div>
                    {/* File Info */}
                    <div className="p-3 sm:p-4 pt-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-800 truncate mb-1">
                        {f.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(f.size)}
                      </p>
                    </div>
                    {/* Always Visible Triple Dot Menu */}
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                      <button
                        onClick={() => !uploading && setOpenMenuId(openMenuId === f.id ? null : f.id)}
                        disabled={uploading}
                        className={`p-1 rounded-lg shadow-sm transition-colors backdrop-blur-sm ${
                          uploading 
                            ? "bg-slate-200 cursor-not-allowed" 
                            : "bg-white/90 hover:bg-white"
                        }`}
                      >
                        <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
                      </button>
                      {openMenuId === f.id && !uploading && (
                        <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg"
                            onClick={() => window.open(f.preview_url || "#", "_blank")}
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                            Preview
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => shareFile(f)}
                          >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                            Share
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => {
                              setRenameDialog({
                                open: true,
                                type: "file",
                                target: f,
                                value: f.name,
                              });
                              setOpenMenuId(null);
                            }}
                          >
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                            onClick={() => {
                              setDeleteDialog({
                                open: true,
                                type: "file",
                                target: f,
                              });
                              setOpenMenuId(null);
                            }}
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View - Responsive table
              <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${uploading ? "opacity-50" : ""}`}>
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-3">Modified</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {files.map((f) => (
                  <div
                    key={f.id}
                    className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 border-b border-slate-100 transition-colors ${
                      uploading ? "cursor-not-allowed" : "hover:bg-slate-50"
                    }`}
                    draggable={!uploading}
                    onDragStart={(e) => {
                      if (!uploading) {
                        e.dataTransfer.setData("fileId", f.id);
                      }
                    }}
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg flex-shrink-0">{getFileIcon(f.mime_type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{f.name}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>{formatBytes(f.size)}</span>
                            <span>
                              {f.updated_at ? formatDate(f.updated_at) : "—"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => !uploading && setOpenMenuId(openMenuId === f.id ? null : f.id)}
                          disabled={uploading}
                          className={`p-1 rounded transition-colors relative flex-shrink-0 ${
                            uploading ? "cursor-not-allowed" : "hover:bg-slate-200"
                          }`}
                        >
                          <MoreHorizontal className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    {/* Desktop Layout */}
                    <div className="hidden sm:contents">
                      <div className="col-span-6 flex items-center space-x-3 min-w-0">
                        <span className="text-lg flex-shrink-0">{getFileIcon(f.mime_type)}</span>
                        <span className="font-medium text-slate-800 truncate">{f.name}</span>
                      </div>
                      <div className="col-span-2 flex items-center text-slate-600">
                        {formatBytes(f.size)}
                      </div>
                      <div className="col-span-3 flex items-center text-slate-600 min-w-0">
                        <span className="truncate">
                          {f.updated_at ? formatDate(f.updated_at) : "—"}
                        </span>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <button
                          onClick={() => !uploading && setOpenMenuId(openMenuId === f.id ? null : f.id)}
                          disabled={uploading}
                          className={`p-1 rounded transition-colors relative ${
                            uploading ? "cursor-not-allowed" : "hover:bg-slate-200"
                          }`}
                        >
                          <MoreHorizontal className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    {/* Context Menu */}
                    {openMenuId === f.id && !uploading && (
                      <div className="absolute right-4 mt-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors first:rounded-t-lg"
                          onClick={() => window.open(f.preview_url || "#", "_blank")}
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          Preview
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => shareFile(f)}
                        >
                          <Share2 className="w-4 h-4 inline mr-2" />
                          Share
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            setRenameDialog({
                              open: true,
                              type: "file",
                              target: f,
                              value: f.name,
                            });
                            setOpenMenuId(null);
                          }}
                        >
                          Rename
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg"
                          onClick={() => {
                            setDeleteDialog({
                              open: true,
                              type: "file",
                              target: f,
                            });
                            setOpenMenuId(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 inline mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
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
        disabled={uploading}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Upload File
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 sm:p-8 text-center">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-slate-600 mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="hidden"
                id="upload-input"
                disabled={uploading}
              />
              <label
                htmlFor="upload-input"
                className={`px-4 py-2 text-sm sm:text-base rounded-lg transition-colors cursor-pointer ${
                  uploading
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Choose File
              </label>
            </div>
            {file && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-600">{formatBytes(file.size)}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                  uploading
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpload()}
                disabled={!file || uploading}
                className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
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

      {/* RENAME MODAL */}
      {renameDialog.open && !uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Rename {renameDialog.type === "file" ? "File" : "Folder"}
            </h2>
            <input
              type="text"
              className="w-full p-3 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={renameDialog.value}
              autoFocus
              onChange={(e) =>
                setRenameDialog({ ...renameDialog, value: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameDialog.value.trim()) {
                  if (renameDialog.type === "file") {
                    renameFile(renameDialog.target.id, renameDialog.value.trim());
                  } else {
                    openRenameFolderModal({
                      ...renameDialog.target,
                      name: renameDialog.value.trim(),
                    });
                  }
                  setRenameDialog({ open: false, type: null, target: null, value: "" });
                }
                if (e.key === "Escape") {
                  setRenameDialog({ open: false, type: null, target: null, value: "" });
                }
              }}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setRenameDialog({
                    open: false,
                    type: null,
                    target: null,
                    value: "",
                  })
                }
                className="py-2 px-4 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (renameDialog.value.trim()) {
                    if (renameDialog.type === "file") {
                      renameFile(renameDialog.target.id, renameDialog.value.trim());
                    } else {
                      openRenameFolderModal({
                        ...renameDialog.target,
                        name: renameDialog.value.trim(),
                      });
                    }
                  }
                  setRenameDialog({ open: false, type: null, target: null, value: "" });
                }}
                className="py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                disabled={!renameDialog.value.trim()}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteDialog.open && !uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-slate-600">
              Are you sure you want to delete the{" "}
              <span className="font-medium text-red-600">
                {deleteDialog.type === "file" ? "file" : "folder"}
              </span>
              <br />
              <span className="font-semibold text-slate-800">{deleteDialog.target?.name}</span>?
              <br />
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setDeleteDialog({
                    open: false,
                    type: null,
                    target: null,
                  })
                }
                className="py-2 px-4 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteDialog.type === "file") {
                    handleDelete(deleteDialog.target.id);
                  } else {
                    deleteFolder(deleteDialog.target.id);
                  }
                  setDeleteDialog({ open: false, type: null, target: null });
                }}
                className="py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Search Modal */}
      {showMobileSearch && !uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Search Files & Folders
              </h3>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchQuery}
                autoFocus
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  searchFilesAndFolders(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setShowMobileSearch(false);
                  }
                  if (e.key === "Escape") {
                    setShowMobileSearch(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              {searching && (
                <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMobileSearch(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
