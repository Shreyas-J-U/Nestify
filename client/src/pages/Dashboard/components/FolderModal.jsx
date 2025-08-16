import { useEffect, useState, useRef } from "react";

export default function FolderModal({ open, onClose, onSubmit, initial = "", label }) {
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
