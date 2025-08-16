import { User, Database, Share2, Upload } from "lucide-react";

export default function ProfileSection({ user, filesCount, storageUsed, shareDrive, onUpload }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      
      {/* Profile Card */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <div className="flex items-center space-x-4">
          <User className="w-10 h-10 text-blue-400" />
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-sm text-white/70">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20">
        <div className="flex items-center space-x-4">
          <Database className="w-10 h-10 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">{filesCount} Files</h2>
            <p className="text-sm text-white/70">{storageUsed} MB used</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 flex flex-col space-y-4">
        <button
          onClick={shareDrive}
          className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Drive
        </button>
        <label className="flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white cursor-pointer transition-colors">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
          <input
            type="file"
            onChange={(e) => e.target.files && onUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      </div>

    </div>
  );
}
