import { useEffect, useState } from "react";
import { supabase, type Note } from "../lib/supabase";

export default function Notes({ userId }: { userId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  async function fetchNotes() {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setNotes(data || []);
    setLoading(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await supabase.from("notes").insert({ user_id: userId, content });
    setContent("");
    fetchNotes();
  }

  async function deleteNote(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  async function saveEdit(id: string) {
    await supabase.from("notes").update({ content: editContent }).eq("id", id);
    setEditingId(null);
    fetchNotes();
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-white text-3xl font-black mb-2">Training Notes 📝</h1>
      <p className="text-gray-400 mb-8">Jot down coaching tips, game observations, and reminders.</p>

      {/* Add Note */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <form onSubmit={addNote} className="flex flex-col gap-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition resize-none"
            placeholder="Write a note... e.g. 'Work on weak hand pull-ups this week'"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="self-end bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition"
          >
            Add Note
          </button>
        </form>
      </div>

      {/* Notes List */}
      <h2 className="text-white text-lg font-bold mb-4">Your Notes ({notes.length})</h2>
      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center text-gray-400">
          No notes yet. Add your first one above.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map(note => (
            <div key={note.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              {editingId === note.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm px-3 py-1.5 rounded-lg hover:bg-white/10 transition">Cancel</button>
                    <button onClick={() => saveEdit(note.id)} className="bg-orange-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-orange-400 transition">Save</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-200 whitespace-pre-wrap mb-3">{note.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">{new Date(note.created_at).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                        className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/10 transition"
                      >Edit</button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded-lg hover:bg-red-500/10 transition"
                      >Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
