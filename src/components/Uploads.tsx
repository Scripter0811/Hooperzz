import { useEffect, useState } from "react";
import { supabase, type Upload } from "../lib/supabase";

export default function Uploads({ userId }: { userId: string }) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUploads();
  }, [userId]);

  async function fetchUploads() {
    const { data } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setUploads(data || []);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("videos").upload(fileName, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("videos").getPublicUrl(fileName);
    const videoUrl = urlData.publicUrl;

    const { error: dbError } = await supabase.from("uploads").insert({
      user_id: userId,
      video_url: videoUrl,
      title: title || file.name,
    });

    if (dbError) {
      setError(dbError.message);
    } else {
      setFile(null);
      setTitle("");
      fetchUploads();
    }
    setUploading(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-white text-3xl font-black mb-2">Film Room 🎥</h1>
      <p className="text-gray-400 mb-8">Upload your game videos for coach review.</p>

      {/* Upload Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-white text-lg font-bold mb-4">Upload a Video</h2>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              placeholder="e.g. Practice Highlights - May 2"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-1">Video File</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-orange-500/50 transition cursor-pointer"
              onClick={() => document.getElementById("fileInput")?.click()}>
              {file ? (
                <div>
                  <div className="text-orange-400 text-2xl mb-2">🎬</div>
                  <div className="text-white font-semibold">{file.name}</div>
                  <div className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              ) : (
                <div>
                  <div className="text-gray-400 text-3xl mb-2">📁</div>
                  <div className="text-gray-300 font-semibold">Click to select video</div>
                  <div className="text-gray-500 text-sm">MP4, MOV, AVI supported</div>
                </div>
              )}
            </div>
            <input
              id="fileInput"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !file}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition"
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>

      {/* Videos List */}
      <h2 className="text-white text-lg font-bold mb-4">Your Videos ({uploads.length})</h2>
      {uploads.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
          No videos yet. Upload your first one above.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {uploads.map(u => (
            <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <video
                src={u.video_url}
                controls
                className="w-full max-h-48 bg-black"
              />
              <div className="p-4">
                <div className="text-white font-semibold">{u.title || "Untitled"}</div>
                <div className="text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
