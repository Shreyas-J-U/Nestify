import { Search, Share2, Eye, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export default function FilesSection({ files, onSearch, searching, shareFile, renameFile, deleteFile }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-2 w-full max-w-md">
          <Search className="w-5 h-5 text-white/70 mr-2" />
          <input
            type="text"
            placeholder="Search files..."
            onChange={(e) => onSearch(e.target.value)}
            className="bg-transparent outline-none text-white placeholder-white/50 w-full"
          />
          {searching && <span className="text-white/50 text-sm">Searching...</span>}
        </div>
      </div>

      {/* File Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.length === 0 ? (
          <p className="text-white/60 col-span-full text-center">No files found</p>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-all duration-300 hover:scale-105 flex flex-col"
            >
              <div className="flex-1 flex items-center justify-center mb-4">
                {f.preview_url ? (
                  <img src={f.preview_url} alt={f.name} className="max-h-40 rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center text-white">
                    No Preview
                  </div>
                )}
              </div>

              <div className="mt-2 text-center text-sm text-white truncate">{f.name}</div>

              <div className="flex justify-between items-center mt-1 px-1">
                <div className="flex space-x-2">
                  <button
                    onClick={() => shareFile(f)}
                    className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => window.open(f.preview_url || "#", "_blank")}
                    className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === f.id ? null : f.id)
                    }
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5 text-white" />
                  </button>
                  {openMenuId === f.id && (
                    <div className="absolute right-0 bottom-full mb-2 w-32 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-lg z-20">
                      <button
                        className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors"
                        onClick={() => deleteFile(f.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-white hover:bg-white/20 transition-colors"
                        onClick={() => {
                          const newName = prompt("Enter new name", f.name);
                          if (newName) renameFile(f.id, newName);
                          setOpenMenuId(null);
                        }}
                      >
                        Rename
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
