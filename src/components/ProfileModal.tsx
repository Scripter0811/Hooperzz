import { useState } from "react";
import { supabase, type Profile } from "../lib/supabase";

export default function ProfileModal({
  profile,
  currentUserId,
  onClose,
  onOpenPrivateChat,
}: {
  profile: Profile;
  currentUserId: string;
  onClose: () => void;
  onOpenPrivateChat: (userId: string, username: string) => void;
}) {
  const [requestMsg, setRequestMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isSelf = profile.id === currentUserId;

  async function sendChatRequest() {
    if (!requestMsg.trim()) return;
    setSending(true);
    setError("");
    const { error } = await supabase.from("coaching_requests").insert({
      player_id: currentUserId,
      coach_id: profile.id,
      message: requestMsg.trim(),
      status: "pending",
    });
    if (error) setError(error.message);
    else setSent(true);
    setSending(false);
  }

  const skillColors: Record<string, string> = {
    Beginner: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    Intermediate: "text-green-400 bg-green-500/10 border-green-500/30",
    Advanced: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    Elite: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-2xl font-black text-orange-400">
              {(profile.username || profile.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white text-lg font-bold flex items-center gap-2">
                {profile.username || "Hooper"}
                {profile.coach_badge && <span className="text-yellow-400 text-sm">🏅</span>}
              </div>
              <div className="text-gray-400 text-sm">{profile.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition text-xl leading-none">✕</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white font-bold">{profile.position || "—"}</div>
            <div className="text-gray-400 text-xs">Position</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white font-bold">{profile.age || "—"}</div>
            <div className="text-gray-400 text-xs">Age</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white font-bold text-xs">{profile.skill_level || "—"}</div>
            <div className="text-gray-400 text-xs">Level</div>
          </div>
        </div>

        {profile.skill_level && (
          <div className="mb-5">
            <span className={`text-xs font-semibold border px-3 py-1 rounded-full ${skillColors[profile.skill_level] || "text-gray-400 bg-white/5 border-white/10"}`}>
              {profile.skill_level} Player
            </span>
          </div>
        )}

        {isSelf ? (
          <div className="text-center text-gray-400 text-sm py-2">This is your profile.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Direct message */}
            <button
              onClick={() => { onOpenPrivateChat(profile.id, profile.username || profile.email); onClose(); }}
              className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-2.5 rounded-xl transition"
            >
              💬 Message Directly
            </button>

            {/* Request private chat */}
            {!sent ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-white text-sm font-semibold mb-2">Request Private Chat Session</div>
                <textarea
                  value={requestMsg}
                  onChange={e => setRequestMsg(e.target.value)}
                  rows={2}
                  placeholder="What do you want to work on?"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none mb-2"
                />
                {error && <div className="text-red-400 text-xs mb-2">{error}</div>}
                <button
                  onClick={sendChatRequest}
                  disabled={sending || !requestMsg.trim()}
                  className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition"
                >
                  {sending ? "Sending..." : "Send Request"}
                </button>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-green-400 font-semibold text-sm">✓ Request sent!</div>
                <div className="text-gray-400 text-xs mt-1">They'll be notified.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
