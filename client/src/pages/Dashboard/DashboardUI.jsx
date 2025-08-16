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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FolderModal from "./components/FolderModal";

export default function DashboardUI(props) {
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
              <div className="relative">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
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
                    {Math.round((storageUsed / (100 * 1024 * 1024)) * 100)}%
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

      {/* Upload Modal */}
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
